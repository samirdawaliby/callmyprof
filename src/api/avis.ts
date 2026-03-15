/**
 * Soutien Scolaire Caplogy - API Avis
 * CRUD et statistiques pour les avis
 */

import { jsonResponse, errorResponse } from '../../shared/utils';
import type { Env } from '../../shared/types';

// ============================================================================
// TYPES
// ============================================================================

export interface AvisRow {
  id: string;
  eleve_id: string;
  formateur_id: string;
  cours_id: string | null;
  note: number;
  commentaire: string | null;
  visible: number;
  created_at: string;
  eleve_prenom: string;
  eleve_nom: string | null;
  formateur_prenom: string;
  formateur_nom: string;
  cours_titre: string | null;
  cours_date: string | null;
}

export interface AvisStats {
  total: number;
  moyenne: number;
  distribution: { note: number; count: number }[];
}

// ============================================================================
// GET AVIS LIST (with filters + pagination)
// ============================================================================

export async function getAvis(
  env: Env,
  url: URL
): Promise<{ avis: AvisRow[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = 12;
  const offset = (page - 1) * limit;

  const formateurId = url.searchParams.get('formateur') || '';
  const noteMin = parseInt(url.searchParams.get('note_min') || '0');
  const search = url.searchParams.get('q') || '';

  let whereClause = '1=1';
  const params: any[] = [];

  if (formateurId) {
    whereClause += ' AND a.formateur_id = ?';
    params.push(formateurId);
  }

  if (noteMin >= 1 && noteMin <= 5) {
    whereClause += ' AND a.note >= ?';
    params.push(noteMin);
  }

  if (search) {
    whereClause += ' AND (a.commentaire LIKE ? OR e.prenom LIKE ? OR f.nom LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  // Count total
  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as cnt
    FROM avis a
    JOIN eleves e ON e.id = a.eleve_id
    JOIN formateurs f ON f.id = a.formateur_id
    WHERE ${whereClause}
  `).bind(...params).first<{ cnt: number }>();

  const total = countResult?.cnt || 0;

  // Fetch rows
  const rows = await env.DB.prepare(`
    SELECT
      a.id, a.eleve_id, a.formateur_id, a.cours_id,
      a.note, a.commentaire, a.visible, a.created_at,
      e.prenom as eleve_prenom, e.nom as eleve_nom,
      f.prenom as formateur_prenom, f.nom as formateur_nom,
      c.titre as cours_titre, c.date_cours as cours_date
    FROM avis a
    JOIN eleves e ON e.id = a.eleve_id
    JOIN formateurs f ON f.id = a.formateur_id
    LEFT JOIN cours c ON c.id = a.cours_id
    WHERE ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all<AvisRow>();

  return {
    avis: rows.results || [],
    total,
    page,
    limit,
  };
}

// ============================================================================
// TOGGLE AVIS VISIBILITY
// ============================================================================

export async function toggleAvisVisibility(env: Env, id: string): Promise<Response> {
  // Get current state
  const avis = await env.DB.prepare('SELECT id, visible FROM avis WHERE id = ?').bind(id).first<{ id: string; visible: number }>();
  if (!avis) {
    return errorResponse('Avis introuvable', 404);
  }

  const newVisible = avis.visible ? 0 : 1;
  await env.DB.prepare('UPDATE avis SET visible = ? WHERE id = ?').bind(newVisible, id).run();

  return jsonResponse({ success: true, visible: newVisible });
}

// ============================================================================
// GET AVIS STATS (rating distribution)
// ============================================================================

export async function getAvisStats(env: Env): Promise<AvisStats> {
  // Get average and total
  const summary = await env.DB.prepare(`
    SELECT COUNT(*) as total, COALESCE(AVG(note), 0) as moyenne FROM avis
  `).first<{ total: number; moyenne: number }>();

  // Get distribution
  const dist = await env.DB.prepare(`
    SELECT note, COUNT(*) as count FROM avis GROUP BY note ORDER BY note DESC
  `).all<{ note: number; count: number }>();

  // Build full distribution (1-5)
  const distMap = new Map((dist.results || []).map(r => [r.note, r.count]));
  const distribution = [5, 4, 3, 2, 1].map(n => ({
    note: n,
    count: distMap.get(n) || 0,
  }));

  return {
    total: summary?.total || 0,
    moyenne: Math.round((summary?.moyenne || 0) * 10) / 10,
    distribution,
  };
}

// ============================================================================
// GET FORMATEURS (for filter dropdown)
// ============================================================================

export async function getFormateursForFilter(env: Env): Promise<{ id: string; nom: string; prenom: string }[]> {
  const rows = await env.DB.prepare(`
    SELECT DISTINCT f.id, f.nom, f.prenom
    FROM formateurs f
    JOIN avis a ON a.formateur_id = f.id
    ORDER BY f.nom, f.prenom
  `).all<{ id: string; nom: string; prenom: string }>();
  return rows.results || [];
}
