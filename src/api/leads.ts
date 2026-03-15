/**
 * CallMyProf - Leads API
 * Public lead creation + admin CRUD
 */

import { generateId } from '../../shared/utils';
import { jsonResponse, errorResponse } from '../../shared/utils';
import type { Env, Lead } from '../../shared/types';

// ============================================================================
// CREATE LEAD (public - from CTA form)
// ============================================================================

export async function createLead(env: Env, request: Request): Promise<Response> {
  let data: Record<string, string>;

  const contentType = request.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    data = await request.json() as Record<string, string>;
  } else {
    const formData = await request.formData();
    data = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') data[key] = value;
    }
  }

  const nom = (data.nom || '').trim();
  const prenom = (data.prenom || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const telephone = (data.telephone || '').trim();
  const countryCode = (data.country_code || '+1').trim();

  // Validation
  if (!prenom || !nom) {
    return errorResponse('Name is required.');
  }
  if (!email || !email.includes('@')) {
    return errorResponse('Valid email is required.');
  }
  if (!telephone) {
    return errorResponse('Phone number is required.');
  }

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(`
      INSERT INTO leads (
        id, nom, prenom, email, telephone, country_code,
        domaine_id, subject_description, level, preferred_schedule,
        service_type, statut, country, detected_locale,
        utm_source, utm_medium, utm_campaign,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      nom,
      prenom,
      email,
      telephone,
      countryCode,
      data.domaine_id || null,
      data.subject_description || null,
      data.level || null,
      data.preferred_schedule || null,
      data.service_type || 'individual',
      data.country || null,
      data.detected_locale || 'en',
      data.utm_source || null,
      data.utm_medium || null,
      data.utm_campaign || null,
      now,
      now
    ).run();

    return jsonResponse({ success: true, id });
  } catch (error) {
    console.error('Error creating lead:', error);
    return errorResponse('Failed to create lead. Please try again.', 500);
  }
}

// ============================================================================
// UPDATE LEAD STATUS (admin)
// ============================================================================

export async function updateLeadStatus(env: Env, leadId: string, request: Request): Promise<Response> {
  const data = await request.json() as { statut?: string; callback_date?: string; callback_notes?: string };

  const updates: string[] = [];
  const values: any[] = [];

  if (data.statut) {
    const validStatuts = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (!validStatuts.includes(data.statut)) {
      return errorResponse('Invalid status.');
    }
    updates.push('statut = ?');
    values.push(data.statut);
  }

  if (data.callback_date !== undefined) {
    updates.push('callback_date = ?');
    values.push(data.callback_date || null);
  }

  if (data.callback_notes !== undefined) {
    updates.push('callback_notes = ?');
    values.push(data.callback_notes || null);
  }

  if (updates.length === 0) {
    return errorResponse('No updates provided.');
  }

  updates.push("updated_at = datetime('now')");
  values.push(leadId);

  try {
    await env.DB.prepare(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating lead:', error);
    return errorResponse('Failed to update lead.', 500);
  }
}

// ============================================================================
// GET LEAD (admin)
// ============================================================================

export async function getLead(env: Env, leadId: string): Promise<Lead | null> {
  const result = await env.DB.prepare(
    'SELECT * FROM leads WHERE id = ?'
  ).bind(leadId).first<Lead>();
  return result || null;
}

// ============================================================================
// LIST LEADS (admin)
// ============================================================================

export interface LeadListResult {
  leads: Lead[];
  total: number;
}

export async function listLeads(
  env: Env,
  options: {
    statut?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<LeadListResult> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.statut && options.statut !== 'all') {
    conditions.push('statut = ?');
    params.push(options.statut);
  }

  if (options.search) {
    conditions.push('(nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR telephone LIKE ?)');
    const search = `%${options.search}%`;
    params.push(search, search, search, search);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count
  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM leads ${where}`
  ).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  // Fetch
  const leads = await env.DB.prepare(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all<Lead>();

  return {
    leads: leads.results || [],
    total,
  };
}
