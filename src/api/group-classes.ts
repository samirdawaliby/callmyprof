/**
 * CallMyProf - Group Classes API
 * CRUD for group classes + student inscriptions
 */

import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import type { Env, GroupClass } from '../../shared/types';

// ============================================================================
// LIST GROUP CLASSES
// ============================================================================

export interface GroupClassListResult {
  classes: (GroupClass & { formateur_prenom?: string; formateur_nom?: string; thematique_nom?: string })[];
  total: number;
}

export async function listGroupClasses(
  env: Env,
  options: {
    statut?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<GroupClassListResult> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.statut && options.statut !== 'all') {
    conditions.push('gc.statut = ?');
    params.push(options.statut);
  }

  if (options.search) {
    conditions.push('(gc.titre LIKE ? OR f.nom LIKE ? OR f.prenom LIKE ?)');
    const s = `%${options.search}%`;
    params.push(s, s, s);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM group_classes gc LEFT JOIN formateurs f ON f.id = gc.formateur_id ${where}`
  ).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  const classes = await env.DB.prepare(`
    SELECT gc.*, f.prenom as formateur_prenom, f.nom as formateur_nom,
           t.nom as thematique_nom
    FROM group_classes gc
    LEFT JOIN formateurs f ON f.id = gc.formateur_id
    LEFT JOIN thematiques t ON t.id = gc.thematique_id
    ${where}
    ORDER BY gc.date_debut DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  return {
    classes: (classes.results || []) as unknown as GroupClassListResult['classes'],
    total,
  };
}

// ============================================================================
// GET GROUP CLASS
// ============================================================================

export async function getGroupClass(env: Env, classId: string): Promise<(GroupClass & { formateur_prenom?: string; formateur_nom?: string }) | null> {
  const result = await env.DB.prepare(`
    SELECT gc.*, f.prenom as formateur_prenom, f.nom as formateur_nom
    FROM group_classes gc
    LEFT JOIN formateurs f ON f.id = gc.formateur_id
    WHERE gc.id = ?
  `).bind(classId).first();
  return (result as any) || null;
}

// ============================================================================
// CREATE GROUP CLASS
// ============================================================================

export async function createGroupClass(env: Env, request: Request): Promise<Response> {
  const data = await request.json() as Record<string, any>;

  const titre = (data.titre || '').trim();
  const formateurId = (data.formateur_id || '').trim();

  if (!titre) return errorResponse('Title is required.');
  if (!formateurId) return errorResponse('Tutor is required.');

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(`
      INSERT INTO group_classes (
        id, formateur_id, thematique_id, titre, description,
        date_debut, heure_debut, duree_minutes, recurrence, nb_seances,
        max_eleves, min_eleves, inscrits, prix_par_eleve, prix_par_seance,
        currency, statut, lieu, is_online, meeting_url, niveau, langue,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'ouvert', ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      formateurId,
      data.thematique_id || null,
      titre,
      data.description || null,
      data.date_debut || null,
      data.heure_debut || '09:00',
      data.duree_minutes || 60,
      data.recurrence || 'once',
      data.nb_seances || 1,
      data.max_eleves || 6,
      data.min_eleves || 2,
      data.prix_par_eleve || 8,
      data.prix_par_seance || null,
      data.currency || 'USD',
      data.lieu || null,
      data.is_online ? 1 : 0,
      data.meeting_url || null,
      data.niveau || null,
      data.langue || 'en',
      now
    ).run();

    return jsonResponse({ success: true, id });
  } catch (error) {
    console.error('Error creating group class:', error);
    return errorResponse('Failed to create group class.', 500);
  }
}

// ============================================================================
// UPDATE GROUP CLASS STATUS
// ============================================================================

export async function updateGroupClassStatus(env: Env, classId: string, request: Request): Promise<Response> {
  const data = await request.json() as Record<string, any>;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.statut) {
    const valid = ['ouvert', 'complet', 'en_cours', 'termine', 'annule'];
    if (!valid.includes(data.statut)) return errorResponse('Invalid status.');
    updates.push('statut = ?');
    values.push(data.statut);
  }

  if (data.titre !== undefined) { updates.push('titre = ?'); values.push(data.titre); }
  if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description || null); }
  if (data.max_eleves !== undefined) { updates.push('max_eleves = ?'); values.push(data.max_eleves); }
  if (data.prix_par_eleve !== undefined) { updates.push('prix_par_eleve = ?'); values.push(data.prix_par_eleve); }

  if (updates.length === 0) return errorResponse('No updates provided.');

  values.push(classId);

  try {
    await env.DB.prepare(
      `UPDATE group_classes SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating group class:', error);
    return errorResponse('Failed to update.', 500);
  }
}
