/**
 * CallMyProf - Authentication & Sessions
 * PBKDF2 via Web Crypto API, sessions D1, httpOnly cookies
 */

import type { User, Env } from './types';

// ============================================================================
// PASSWORD HASHING (PBKDF2)
// ============================================================================

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

/**
 * Encode un ArrayBuffer en base64
 */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode un string base64 en ArrayBuffer
 */
function fromBase64(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash un mot de passe avec PBKDF2 (Web Crypto API)
 * Retourne "base64salt:base64hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  return `${toBase64(salt.buffer)}:${toBase64(hashBuffer)}`;
}

/**
 * Verifie un mot de passe contre un hash stocke "base64salt:base64hash"
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;

  const [saltB64, expectedHashB64] = parts;
  const salt = fromBase64(saltB64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  const computedHash = toBase64(hashBuffer);

  // Comparaison a temps constant pour eviter timing attacks
  if (computedHash.length !== expectedHashB64.length) return false;
  let result = 0;
  for (let i = 0; i < computedHash.length; i++) {
    result |= computedHash.charCodeAt(i) ^ expectedHashB64.charCodeAt(i);
  }
  return result === 0;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const SESSION_DURATION_HOURS = 24;
const COOKIE_NAME = 'cmp_session';

/**
 * Cree une session en D1 et retourne le sessionId + la chaine cookie Set-Cookie
 */
export async function createSession(
  db: D1Database,
  userId: string
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  await db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, userId, expiresAt).run();

  // Mettre a jour last_login
  await db.prepare(
    "UPDATE users SET last_login = datetime('now') WHERE id = ?"
  ).bind(userId).run();

  const cookie = `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION_HOURS * 3600}`;

  return { sessionId, cookie };
}

/**
 * Valide une session depuis le cookie de la requete.
 * Retourne l'utilisateur si la session est valide, null sinon.
 */
export async function validateSession(
  db: D1Database,
  request: Request
): Promise<{ user: User } | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  // Extraire le session ID du cookie
  const sessionId = parseCookieValue(cookieHeader, COOKIE_NAME);
  if (!sessionId) return null;

  // Verifier en D1
  const row = await db.prepare(`
    SELECT u.id, u.email, u.password_hash, u.role, u.nom, u.prenom,
           u.telephone, u.avatar_url, u.created_at, u.updated_at, u.last_login,
           s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).bind(sessionId).first<User & { expires_at: string }>();

  if (!row) return null;

  // Verifier expiration
  if (new Date(row.expires_at) < new Date()) {
    // Session expiree, la supprimer
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    return null;
  }

  // Retirer expires_at du resultat
  const { expires_at, ...user } = row;
  return { user: user as User };
}

/**
 * Supprime une session et retourne la chaine cookie expiree pour la deconnexion
 */
export async function deleteSession(
  db: D1Database,
  sessionId: string
): Promise<string> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();

  // Cookie expire immediatement
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/**
 * Middleware d'authentification.
 * Retourne l'utilisateur ou lance une Response redirect vers /login.
 */
export async function requireAuth(
  request: Request,
  env: Env
): Promise<User> {
  const session = await validateSession(env.DB, request);

  if (!session) {
    throw new Response(null, {
      status: 302,
      headers: { Location: '/login' },
    });
  }

  return session.user;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrait la valeur d'un cookie par son nom depuis le header Cookie
 */
function parseCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key.trim() === name) {
      return valueParts.join('=').trim();
    }
  }
  return null;
}

/**
 * Extrait le session ID depuis la requete (utile pour logout)
 */
export function getSessionIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  return parseCookieValue(cookieHeader, COOKIE_NAME);
}
