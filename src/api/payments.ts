/**
 * CallMyProf - Payments API
 * Manage payments, tutor payouts, Stripe/PayPal integration stubs
 */

import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import type { Env, Payment } from '../../shared/types';

// ============================================================================
// LIST PAYMENTS
// ============================================================================

export interface PaymentListResult {
  payments: (Payment & { parent_prenom?: string; parent_nom?: string })[];
  total: number;
}

export async function listPayments(
  env: Env,
  options: {
    statut?: string;
    method?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<PaymentListResult> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];

  if (options.statut && options.statut !== 'all') {
    conditions.push('p.statut = ?');
    params.push(options.statut);
  }

  if (options.method && options.method !== 'all') {
    conditions.push('p.method = ?');
    params.push(options.method);
  }

  if (options.search) {
    conditions.push('(pa.nom LIKE ? OR pa.prenom LIKE ? OR p.description LIKE ?)');
    const s = `%${options.search}%`;
    params.push(s, s, s);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM payments p LEFT JOIN parents pa ON pa.id = p.parent_id ${where}`
  ).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  const payments = await env.DB.prepare(`
    SELECT p.*, pa.prenom as parent_prenom, pa.nom as parent_nom
    FROM payments p
    LEFT JOIN parents pa ON pa.id = p.parent_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all();

  return {
    payments: (payments.results || []) as unknown as PaymentListResult['payments'],
    total,
  };
}

// ============================================================================
// CREATE PAYMENT (manual entry)
// ============================================================================

export async function createPayment(env: Env, request: Request): Promise<Response> {
  const data = await request.json() as Record<string, any>;

  const amount = parseFloat(data.amount);
  if (!amount || amount <= 0) return errorResponse('Valid amount is required.');

  const id = generateId();
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(`
      INSERT INTO payments (
        id, parent_id, lead_id, amount, currency, description,
        method, statut, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.parent_id || null,
      data.lead_id || null,
      amount,
      data.currency || 'USD',
      data.description || null,
      data.method || 'cash',
      data.statut || 'pending',
      now
    ).run();

    return jsonResponse({ success: true, id });
  } catch (error) {
    console.error('Error creating payment:', error);
    return errorResponse('Failed to create payment.', 500);
  }
}

// ============================================================================
// UPDATE PAYMENT STATUS
// ============================================================================

export async function updatePaymentStatus(env: Env, paymentId: string, request: Request): Promise<Response> {
  const data = await request.json() as { statut?: string };

  if (!data.statut) return errorResponse('Status is required.');

  const valid = ['pending', 'completed', 'failed', 'refunded'];
  if (!valid.includes(data.statut)) return errorResponse('Invalid status.');

  try {
    await env.DB.prepare(
      'UPDATE payments SET statut = ? WHERE id = ?'
    ).bind(data.statut, paymentId).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating payment:', error);
    return errorResponse('Failed to update payment.', 500);
  }
}

// ============================================================================
// PAYMENT STATS
// ============================================================================

export async function getPaymentStats(env: Env): Promise<{
  totalRevenue: number;
  monthRevenue: number;
  pendingAmount: number;
  totalPayments: number;
}> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const results = await env.DB.batch([
    env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE statut = 'completed'"),
    env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE statut = 'completed' AND created_at >= ?").bind(monthStart),
    env.DB.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE statut = 'pending'"),
    env.DB.prepare("SELECT COUNT(*) as c FROM payments"),
  ]);

  return {
    totalRevenue: (results[0].results[0] as any)?.total ?? 0,
    monthRevenue: (results[1].results[0] as any)?.total ?? 0,
    pendingAmount: (results[2].results[0] as any)?.total ?? 0,
    totalPayments: (results[3].results[0] as any)?.c ?? 0,
  };
}
