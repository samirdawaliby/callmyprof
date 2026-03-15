/**
 * Soutien Scolaire Caplogy - Page de connexion
 * Login page avec design Caplogy, animations, gradient background
 */

import { CSS_VARS, CSS_BASE, CSS_ANIMATIONS } from '../../shared/html-utils';
import { verifyPassword, createSession } from '../../shared/auth';
import { parseFormData, redirectResponse, htmlResponse } from '../../shared/utils';
import type { Env } from '../../shared/types';

// ============================================================================
// CSS LOGIN
// ============================================================================

const LOGIN_CSS = `
  /* ---- Animated gradient background ---- */
  body {
    background: linear-gradient(-45deg, #0d3865, #092847, #1a4f8a, #0d3865, #6dcbdd);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    25% { background-position: 100% 50%; }
    50% { background-position: 100% 0%; }
    75% { background-position: 0% 100%; }
    100% { background-position: 0% 50%; }
  }

  /* ---- Floating particles ---- */
  .particles {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.12;
    animation: floatParticle linear infinite;
  }

  @keyframes floatParticle {
    0% { transform: translateY(100vh) rotate(0deg); }
    100% { transform: translateY(-100px) rotate(720deg); }
  }

  /* ---- Floating icons ---- */
  .floating-icons {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .floating-icon {
    position: absolute;
    font-size: 30px;
    opacity: 0.08;
    animation: floatIcon linear infinite;
    filter: blur(0.5px);
  }

  @keyframes floatIcon {
    0% {
      transform: translateY(100vh) rotate(0deg) scale(0.8);
      opacity: 0;
    }
    10% { opacity: 0.08; }
    90% { opacity: 0.08; }
    100% {
      transform: translateY(-120px) rotate(360deg) scale(1.2);
      opacity: 0;
    }
  }

  /* ---- Login card ---- */
  .login-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    animation: cardAppear 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes cardAppear {
    0% {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .login-card {
    background: rgba(255, 255, 255, 0.97);
    border-radius: 20px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    backdrop-filter: blur(20px);
    position: relative;
  }

  /* ---- Gradient top border ---- */
  .login-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #6dcbdd, #0d3865, #6dcbdd);
    background-size: 200% 100%;
    animation: borderShimmer 3s ease-in-out infinite;
  }

  @keyframes borderShimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* ---- Card header ---- */
  .login-header {
    text-align: center;
    padding: 40px 40px 10px;
  }

  .login-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, #0d3865, #1a4f8a);
    font-size: 36px;
    margin-bottom: 18px;
    box-shadow: 0 8px 24px rgba(13, 56, 101, 0.25);
    animation: float 3s ease-in-out infinite;
    position: relative;
  }

  .login-logo::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 23px;
    background: linear-gradient(135deg, #6dcbdd, transparent, #6dcbdd);
    z-index: -1;
    opacity: 0.5;
    animation: spin 6s linear infinite;
  }

  .login-title {
    font-size: 24px;
    font-weight: 800;
    color: #0d3865;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }

  .login-subtitle {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .login-subtitle::before,
  .login-subtitle::after {
    content: '';
    width: 30px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #cbd5e1);
  }
  .login-subtitle::after {
    background: linear-gradient(90deg, #cbd5e1, transparent);
  }

  /* ---- Form ---- */
  .login-form {
    padding: 30px 40px 40px;
  }

  .field-group {
    margin-bottom: 22px;
    position: relative;
  }

  .field-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
    letter-spacing: -0.1px;
  }

  .field-input-wrap {
    position: relative;
  }

  .field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 16px;
    transition: color 0.2s ease;
    pointer-events: none;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  .field-input {
    width: 100%;
    padding: 13px 14px 13px 44px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: all 0.25s ease;
  }

  .field-input:hover {
    border-color: #cbd5e1;
    background: #fff;
  }

  .field-input:focus {
    border-color: #6dcbdd;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(109, 203, 221, 0.15);
  }

  .field-input:focus ~ .field-icon,
  .field-input:focus + .field-icon {
    color: #0d3865;
  }

  .field-input::placeholder {
    color: #94a3b8;
  }

  /* ---- Submit button ---- */
  .login-btn {
    width: 100%;
    padding: 15px 24px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #0d3865 0%, #1a4f8a 50%, #0d3865 100%);
    background-size: 200% auto;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
    margin-top: 28px;
    letter-spacing: 0.2px;
  }

  .login-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(109,203,221,0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  .login-btn:hover {
    background-position: right center;
    box-shadow: 0 8px 24px rgba(13, 56, 101, 0.35);
    transform: translateY(-2px);
  }

  .login-btn:hover::before {
    transform: translateX(100%);
  }

  .login-btn:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(13, 56, 101, 0.25);
  }

  .login-btn.loading {
    pointer-events: none;
    opacity: 0.85;
  }

  .login-btn .btn-spinner {
    display: none;
    width: 20px;
    height: 20px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  .login-btn.loading .btn-spinner { display: block; }
  .login-btn.loading .btn-text { display: none; }
  .login-btn.loading .btn-loading-text { display: inline; }
  .login-btn .btn-loading-text { display: none; }

  .login-btn .btn-arrow {
    transition: transform 0.3s ease;
    font-size: 18px;
  }
  .login-btn:hover .btn-arrow {
    transform: translateX(4px);
  }

  /* ---- Error message ---- */
  .login-error {
    background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
    border: 1px solid #fca5a5;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: shakeIn 0.5s ease both;
    font-size: 14px;
    color: #991b1b;
    font-weight: 500;
  }

  .login-error .error-icon {
    font-size: 18px;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes shakeIn {
    0% { opacity: 0; transform: translateX(-10px); }
    25% { transform: translateX(8px); }
    50% { transform: translateX(-6px); }
    75% { transform: translateX(3px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  /* ---- Footer ---- */
  .login-footer {
    text-align: center;
    padding: 0 40px 30px;
    font-size: 12px;
    color: #94a3b8;
  }

  .login-footer a {
    color: #6dcbdd;
    text-decoration: none;
    font-weight: 500;
  }
  .login-footer a:hover {
    color: #0d3865;
  }

  /* ---- Responsive ---- */
  @media (max-width: 480px) {
    .login-card {
      border-radius: 16px;
    }
    .login-header {
      padding: 30px 24px 8px;
    }
    .login-form {
      padding: 24px 24px 30px;
    }
    .login-footer {
      padding: 0 24px 24px;
    }
    .login-title {
      font-size: 20px;
    }
  }
`;

// ============================================================================
// RENDER LOGIN PAGE
// ============================================================================

export function renderLoginPage(error?: string): string {
  const errorHtml = error
    ? `<div class="login-error">
        <span class="error-icon">&#9888;</span>
        <span>${error}</span>
      </div>`
    : '';

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const size = 4 + (i % 5) * 6;
    const left = (i * 5.3 + 7) % 100;
    const delay = (i * 1.7) % 12;
    const duration = 8 + (i % 7) * 3;
    const color = i % 2 === 0 ? '#6dcbdd' : '#ffffff';
    return `<div class="particle" style="width:${size}px;height:${size}px;left:${left}%;background:${color};animation-delay:${delay}s;animation-duration:${duration}s;"></div>`;
  }).join('\n    ');

  // Generate floating education icons
  const icons = ['&#128218;', '&#9999;', '&#127891;', '&#128300;', '&#128202;', '&#128640;', '&#128161;', '&#127793;', '&#9733;', '&#128187;', '&#127752;', '&#128290;'];
  const floatingIcons = icons.map((icon, i) => {
    const left = (i * 8.5 + 3) % 100;
    const delay = (i * 2.1 + 0.5) % 15;
    const duration = 12 + (i % 5) * 4;
    const size = 24 + (i % 3) * 10;
    return `<div class="floating-icon" style="left:${left}%;font-size:${size}px;animation-delay:${delay}s;animation-duration:${duration}s;">${icon}</div>`;
  }).join('\n    ');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion - Soutien Scolaire Caplogy</title>
  <link rel="icon" href="https://www.caplogy.com/logo_C.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    ${LOGIN_CSS}
  </style>
</head>
<body>
  <!-- Animated background particles -->
  <div class="particles">
    ${particles}
  </div>

  <!-- Floating education icons -->
  <div class="floating-icons">
    ${floatingIcons}
  </div>

  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">&#127891;</div>
        <h1 class="login-title">Soutien Scolaire Caplogy</h1>
        <p class="login-subtitle">Plateforme de gestion</p>
      </div>

      <form class="login-form" method="POST" action="/login" id="loginForm">
        ${errorHtml}

        <div class="field-group">
          <label class="field-label" for="email">Adresse email</label>
          <div class="field-input-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <input
              type="email"
              id="email"
              name="email"
              class="field-input"
              placeholder="admin@caplogy.com"
              required
              autocomplete="email"
              autofocus
            >
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="password">Mot de passe</label>
          <div class="field-input-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              type="password"
              id="password"
              name="password"
              class="field-input"
              placeholder="Entrez votre mot de passe"
              required
              autocomplete="current-password"
            >
          </div>
        </div>

        <button type="submit" class="login-btn" id="loginBtn">
          <span class="btn-spinner"></span>
          <span class="btn-text">Se connecter</span>
          <span class="btn-loading-text">Connexion en cours...</span>
          <span class="btn-arrow">&#8594;</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Caplogy &copy; ${new Date().getFullYear()} &mdash; Tous droits r&eacute;serv&eacute;s</p>
      </div>
    </div>
  </div>

  <script>
    // Loading state on submit
    document.getElementById('loginForm').addEventListener('submit', function() {
      var btn = document.getElementById('loginBtn');
      btn.classList.add('loading');
    });

    // Focus animation on inputs
    document.querySelectorAll('.field-input').forEach(function(input) {
      input.addEventListener('focus', function() {
        this.closest('.field-group').classList.add('focused');
      });
      input.addEventListener('blur', function() {
        this.closest('.field-group').classList.remove('focused');
      });
    });
  </script>
</body>
</html>`;
}

// ============================================================================
// HANDLE LOGIN POST
// ============================================================================

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const form = await parseFormData(request);
  const email = (form.email || '').trim().toLowerCase();
  const password = form.password || '';

  if (!email || !password) {
    return htmlResponse(renderLoginPage('Veuillez renseigner votre email et votre mot de passe.'));
  }

  // Lookup user in D1
  const user = await env.DB.prepare(
    'SELECT id, email, password_hash, role, nom, prenom FROM users WHERE email = ?'
  ).bind(email).first<{ id: string; email: string; password_hash: string; role: string; nom: string; prenom: string }>();

  if (!user) {
    return htmlResponse(renderLoginPage('Identifiants incorrects. V\u00e9rifiez votre email et mot de passe.'));
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return htmlResponse(renderLoginPage('Identifiants incorrects. V\u00e9rifiez votre email et mot de passe.'));
  }

  // Check role (only admin allowed for now)
  if (user.role !== 'admin') {
    return htmlResponse(renderLoginPage('Acc\u00e8s r\u00e9serv\u00e9 aux administrateurs.'));
  }

  // Create session
  const { cookie } = await createSession(env.DB, user.id);

  return redirectResponse('/dashboard', cookie);
}
