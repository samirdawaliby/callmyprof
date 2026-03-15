/**
 * CallMyProf - Calendar API
 * Manage tutor availability slots
 */

import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import type { Env, CalendarSlot } from '../../shared/types';

// ============================================================================
// LIST SLOTS (admin - by week or tutor)
// ============================================================================

export interface CalendarListResult {
  slots: CalendarSlot[];
  total: number;
}

export async function listSlots(
  env: Env,
  options: {
    formateur_id?: string;
    date_from?: string;
    date_to?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<CalendarListResult> {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.formateur_id) {
    conditions.push('cs.formateur_id = ?');
    params.push(options.formateur_id);
  }

  if (options.date_from) {
    conditions.push('cs.date_slot >= ?');
    params.push(options.date_from);
  }

  if (options.date_to) {
    conditions.push('cs.date_slot <= ?');
    params.push(options.date_to);
  }

  if (options.type && options.type !== 'all') {
    conditions.push('cs.type = ?');
    params.push(options.type);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM calendar_slots cs ${where}`
  ).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  const slots = await env.DB.prepare(`
    SELECT cs.*, f.prenom as formateur_prenom, f.nom as formateur_nom
    FROM calendar_slots cs
    LEFT JOIN formateurs f ON f.id = cs.formateur_id
    ${where}
    ORDER BY cs.date_slot ASC, cs.heure_debut ASC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all<CalendarSlot & { formateur_prenom?: string; formateur_nom?: string }>();

  return {
    slots: slots.results || [],
    total,
  };
}

// ============================================================================
// GET SLOT
// ============================================================================

export async function getSlot(env: Env, slotId: string): Promise<CalendarSlot | null> {
  const result = await env.DB.prepare(
    'SELECT * FROM calendar_slots WHERE id = ?'
  ).bind(slotId).first<CalendarSlot>();
  return result || null;
}

// ============================================================================
// CREATE SLOT (admin)
// ============================================================================

export async function createSlot(env: Env, request: Request): Promise<Response> {
  const data = await request.json() as Record<string, any>;

  const formateurId = (data.formateur_id || '').trim();
  const dateSlot = (data.date_slot || '').trim();
  const heureDebut = (data.heure_debut || '').trim();
  const heureFin = (data.heure_fin || '').trim();

  if (!formateurId || !dateSlot || !heureDebut || !heureFin) {
    return errorResponse('Tutor, date, start time and end time are required.');
  }

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(`
      INSERT INTO calendar_slots (
        id, formateur_id, date_slot, heure_debut, heure_fin,
        type, is_group_slot, max_students, current_students,
        recurring_rule, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(
      id,
      formateurId,
      dateSlot,
      heureDebut,
      heureFin,
      data.type || 'available',
      data.is_group_slot ? 1 : 0,
      data.max_students || 1,
      data.recurring_rule || null,
      now
    ).run();

    return jsonResponse({ success: true, id });
  } catch (error) {
    console.error('Error creating slot:', error);
    return errorResponse('Failed to create slot.', 500);
  }
}

// ============================================================================
// UPDATE SLOT (admin)
// ============================================================================

export async function updateSlot(env: Env, slotId: string, request: Request): Promise<Response> {
  const data = await request.json() as Record<string, any>;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.type) {
    updates.push('type = ?');
    values.push(data.type);
  }
  if (data.heure_debut) {
    updates.push('heure_debut = ?');
    values.push(data.heure_debut);
  }
  if (data.heure_fin) {
    updates.push('heure_fin = ?');
    values.push(data.heure_fin);
  }
  if (data.cours_id !== undefined) {
    updates.push('cours_id = ?');
    values.push(data.cours_id || null);
  }
  if (data.is_group_slot !== undefined) {
    updates.push('is_group_slot = ?');
    values.push(data.is_group_slot ? 1 : 0);
  }
  if (data.max_students !== undefined) {
    updates.push('max_students = ?');
    values.push(data.max_students);
  }

  if (updates.length === 0) {
    return errorResponse('No updates provided.');
  }

  values.push(slotId);

  try {
    await env.DB.prepare(
      `UPDATE calendar_slots SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating slot:', error);
    return errorResponse('Failed to update slot.', 500);
  }
}

// ============================================================================
// DELETE SLOT (admin)
// ============================================================================

export async function deleteSlot(env: Env, slotId: string): Promise<Response> {
  try {
    await env.DB.prepare('DELETE FROM calendar_slots WHERE id = ?').bind(slotId).run();
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return errorResponse('Failed to delete slot.', 500);
  }
}

// ============================================================================
// TUTOR AVAILABLE SLOTS (for booking)
// ============================================================================

export async function getAvailableSlots(
  env: Env,
  formateurId: string,
  dateFrom: string,
  dateTo: string
): Promise<CalendarSlot[]> {
  const result = await env.DB.prepare(`
    SELECT * FROM calendar_slots
    WHERE formateur_id = ? AND date_slot >= ? AND date_slot <= ? AND type = 'available'
    ORDER BY date_slot ASC, heure_debut ASC
  `).bind(formateurId, dateFrom, dateTo).all<CalendarSlot>();

  return result.results || [];
}
