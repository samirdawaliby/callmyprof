/**
 * CallMyProf - Credits System API
 * Buy packs, reserve/debit/refund credits, manage balances
 */

import type { Env } from '../../shared/types';
import { jsonResponse, errorResponse } from '../../shared/utils';
import { sendEmail } from '../../shared/email';

// ============================================================================
// TYPES
// ============================================================================

const CREDIT_COSTS = {
  group: 1,
  individual: 3,
  urgent_individual: 4,
} as const;

// ============================================================================
// GET PACKS (public)
// ============================================================================

export async function getPacks(env: Env): Promise<Response> {
  const packs = await env.DB.prepare(
    `SELECT * FROM packs WHERE active = 1 ORDER BY ordre ASC`
  ).all();
  return jsonResponse({ packs: packs.results });
}

// ============================================================================
// GET STUDENT BALANCE
// ============================================================================

export async function getBalance(env: Env, studentId: string): Promise<Response> {
  const balance = await env.DB.prepare(
    `SELECT * FROM credit_balances WHERE student_id = ?`
  ).bind(studentId).first<any>();

  if (!balance) {
    return jsonResponse({
      student_id: studentId,
      total_credits: 0,
      reserved_credits: 0,
      available_credits: 0,
      lifetime_credits: 0,
      lifetime_spent: 0,
    });
  }

  // Also get active purchases with expiry info
  const purchases = await env.DB.prepare(
    `SELECT id, credits_remaining, expires_at, status
     FROM credit_purchases
     WHERE student_id = ? AND status = 'active' AND credits_remaining > 0
     ORDER BY expires_at ASC`
  ).bind(studentId).all();

  return jsonResponse({
    ...balance,
    active_purchases: purchases.results,
  });
}

// ============================================================================
// GET TRANSACTION HISTORY
// ============================================================================

export async function getTransactions(env: Env, studentId: string): Promise<Response> {
  const txns = await env.DB.prepare(
    `SELECT * FROM credit_transactions
     WHERE student_id = ?
     ORDER BY created_at DESC
     LIMIT 50`
  ).bind(studentId).all();
  return jsonResponse({ transactions: txns.results });
}

// ============================================================================
// PURCHASE PACK
// ============================================================================

export async function purchasePack(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as any;
  const { student_id, parent_id, pack_id, payment_gateway, payment_transaction_id } = body;

  if (!student_id || !pack_id) {
    return errorResponse('student_id and pack_id required');
  }

  // Get pack details
  const pack = await env.DB.prepare(
    `SELECT * FROM packs WHERE id = ? AND active = 1`
  ).bind(pack_id).first<any>();

  if (!pack) return errorResponse('Pack not found or inactive', 404);

  const purchaseId = crypto.randomUUID().replace(/-/g, '');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + pack.validity_days * 24 * 60 * 60 * 1000);

  // Extend existing credits if student has active purchases
  const existingActive = await env.DB.prepare(
    `SELECT id, expires_at FROM credit_purchases
     WHERE student_id = ? AND status = 'active' AND credits_remaining > 0`
  ).bind(student_id).all<any>();

  // Start transaction
  const stmts = [];

  // Extend old purchases by pack.validity_days
  for (const existing of existingActive.results) {
    const newExpiry = new Date(Math.max(
      new Date(existing.expires_at).getTime(),
      now.getTime()
    ) + pack.validity_days * 24 * 60 * 60 * 1000);

    stmts.push(
      env.DB.prepare(
        `UPDATE credit_purchases SET expires_at = ?, extended_count = extended_count + 1 WHERE id = ?`
      ).bind(newExpiry.toISOString(), existing.id)
    );
  }

  // Create new purchase
  stmts.push(
    env.DB.prepare(
      `INSERT INTO credit_purchases (id, student_id, parent_id, pack_id, credits_purchased, credits_remaining, amount_paid_cents, currency, payment_gateway, payment_transaction_id, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      purchaseId, student_id, parent_id || null, pack_id,
      pack.credits, pack.credits, pack.price_cents, pack.currency,
      payment_gateway || null, payment_transaction_id || null,
      expiresAt.toISOString()
    )
  );

  // Update balance
  stmts.push(
    env.DB.prepare(
      `INSERT INTO credit_balances (student_id, total_credits, available_credits, lifetime_credits, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(student_id) DO UPDATE SET
         total_credits = total_credits + ?,
         available_credits = available_credits + ?,
         lifetime_credits = lifetime_credits + ?,
         updated_at = datetime('now')`
    ).bind(
      student_id, pack.credits, pack.credits, pack.credits,
      pack.credits, pack.credits, pack.credits
    )
  );

  // Record transaction
  const currentBalance = await env.DB.prepare(
    `SELECT available_credits FROM credit_balances WHERE student_id = ?`
  ).bind(student_id).first<any>();
  const balanceAfter = (currentBalance?.available_credits || 0) + pack.credits;

  stmts.push(
    env.DB.prepare(
      `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, reference_type, reference_id, description)
       VALUES (?, ?, 'purchase', ?, ?, 'pack', ?, ?)`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      student_id, pack.credits, balanceAfter,
      pack_id, `Purchased ${pack.name} pack (${pack.credits} credits)`
    )
  );

  await env.DB.batch(stmts);

  return jsonResponse({
    success: true,
    purchase_id: purchaseId,
    credits_added: pack.credits,
    expires_at: expiresAt.toISOString(),
    new_balance: balanceAfter,
  });
}

// ============================================================================
// RESERVE CREDITS (when student enrolls in a session)
// ============================================================================

export async function reserveCredits(
  env: Env, studentId: string, sessionId: string, sessionType: string
): Promise<{ success: boolean; error?: string; enrollment_id?: string }> {
  const cost = sessionType === 'urgent_individual' ? CREDIT_COSTS.urgent_individual
    : sessionType === 'individual' ? CREDIT_COSTS.individual
    : CREDIT_COSTS.group;

  // Check available balance
  const balance = await env.DB.prepare(
    `SELECT available_credits FROM credit_balances WHERE student_id = ?`
  ).bind(studentId).first<any>();

  if (!balance || balance.available_credits < cost) {
    return { success: false, error: `Insufficient credits. Need ${cost}, have ${balance?.available_credits || 0}` };
  }

  const enrollmentId = crypto.randomUUID().replace(/-/g, '');
  const newAvailable = balance.available_credits - cost;

  await env.DB.batch([
    // Create enrollment
    env.DB.prepare(
      `INSERT INTO session_enrollments (id, session_id, student_id, credits_reserved, status)
       VALUES (?, ?, ?, ?, 'reserved')`
    ).bind(enrollmentId, sessionId, studentId, cost),

    // Update balance
    env.DB.prepare(
      `UPDATE credit_balances
       SET reserved_credits = reserved_credits + ?,
           available_credits = available_credits - ?,
           updated_at = datetime('now')
       WHERE student_id = ?`
    ).bind(cost, cost, studentId),

    // Transaction record
    env.DB.prepare(
      `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, reference_type, reference_id, description)
       VALUES (?, ?, 'reserve', ?, ?, 'session', ?, ?)`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      studentId, -cost, newAvailable,
      sessionId, `Reserved ${cost} credit(s) for ${sessionType} session`
    ),
  ]);

  return { success: true, enrollment_id: enrollmentId };
}

// ============================================================================
// DEBIT CREDITS (after session completed, student was present)
// ============================================================================

export async function debitCredits(
  env: Env, enrollmentId: string
): Promise<{ success: boolean; error?: string }> {
  const enrollment = await env.DB.prepare(
    `SELECT * FROM session_enrollments WHERE id = ? AND status IN ('reserved', 'confirmed')`
  ).bind(enrollmentId).first<any>();

  if (!enrollment) return { success: false, error: 'Enrollment not found or already processed' };

  // Debit from oldest active purchase first (FIFO)
  let remaining = enrollment.credits_reserved;
  const purchases = await env.DB.prepare(
    `SELECT id, credits_remaining FROM credit_purchases
     WHERE student_id = ? AND status = 'active' AND credits_remaining > 0
     ORDER BY expires_at ASC`
  ).bind(enrollment.student_id).all<any>();

  const stmts = [];
  for (const p of purchases.results) {
    if (remaining <= 0) break;
    const deduct = Math.min(remaining, p.credits_remaining);
    stmts.push(
      env.DB.prepare(
        `UPDATE credit_purchases SET credits_remaining = credits_remaining - ? WHERE id = ?`
      ).bind(deduct, p.id)
    );
    remaining -= deduct;
  }

  // Update enrollment status
  stmts.push(
    env.DB.prepare(
      `UPDATE session_enrollments SET status = 'attended', attended_at = datetime('now') WHERE id = ?`
    ).bind(enrollmentId)
  );

  // Update balance (move from reserved to spent)
  stmts.push(
    env.DB.prepare(
      `UPDATE credit_balances
       SET total_credits = total_credits - ?,
           reserved_credits = reserved_credits - ?,
           lifetime_spent = lifetime_spent + ?,
           updated_at = datetime('now')
       WHERE student_id = ?`
    ).bind(enrollment.credits_reserved, enrollment.credits_reserved, enrollment.credits_reserved, enrollment.student_id)
  );

  // Transaction
  const bal = await env.DB.prepare(
    `SELECT available_credits FROM credit_balances WHERE student_id = ?`
  ).bind(enrollment.student_id).first<any>();

  stmts.push(
    env.DB.prepare(
      `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, reference_type, reference_id, description)
       VALUES (?, ?, ?, ?, ?, 'enrollment', ?, ?)`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      enrollment.student_id,
      enrollment.credits_reserved === 1 ? 'debit_group' : enrollment.credits_reserved === 4 ? 'debit_urgent' : 'debit_individual',
      -enrollment.credits_reserved,
      bal?.available_credits || 0,
      enrollmentId,
      `Debited ${enrollment.credits_reserved} credit(s) - session attended`
    )
  );

  await env.DB.batch(stmts);
  return { success: true };
}

// ============================================================================
// RELEASE/REFUND CREDITS (cancellation, platform cancel, etc.)
// ============================================================================

export async function releaseCredits(
  env: Env, enrollmentId: string, reason: string, refundPercent: number = 100
): Promise<{ success: boolean; error?: string; credits_returned?: number }> {
  const enrollment = await env.DB.prepare(
    `SELECT * FROM session_enrollments WHERE id = ? AND status IN ('reserved', 'confirmed')`
  ).bind(enrollmentId).first<any>();

  if (!enrollment) return { success: false, error: 'Enrollment not found or already processed' };

  const creditsToReturn = Math.floor(enrollment.credits_reserved * refundPercent / 100);
  const creditsLost = enrollment.credits_reserved - creditsToReturn;

  const stmts = [];

  // Return credits to balance
  stmts.push(
    env.DB.prepare(
      `UPDATE credit_balances
       SET reserved_credits = reserved_credits - ?,
           total_credits = total_credits - ?,
           available_credits = available_credits + ?,
           updated_at = datetime('now')
       WHERE student_id = ?`
    ).bind(
      enrollment.credits_reserved,
      creditsLost,
      creditsToReturn,
      enrollment.student_id
    )
  );

  // Update enrollment
  stmts.push(
    env.DB.prepare(
      `UPDATE session_enrollments SET status = 'cancelled', cancelled_at = datetime('now'), cancel_reason = ? WHERE id = ?`
    ).bind(reason, enrollmentId)
  );

  // Transaction
  const bal = await env.DB.prepare(
    `SELECT available_credits FROM credit_balances WHERE student_id = ?`
  ).bind(enrollment.student_id).first<any>();

  if (creditsToReturn > 0) {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, 'refund_cancel', ?, ?, 'enrollment', ?, ?)`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        enrollment.student_id,
        creditsToReturn,
        (bal?.available_credits || 0) + creditsToReturn,
        enrollmentId,
        `Refunded ${creditsToReturn}/${enrollment.credits_reserved} credit(s) - ${reason}`
      )
    );
  }

  await env.DB.batch(stmts);
  return { success: true, credits_returned: creditsToReturn };
}

// ============================================================================
// COMPENSATE (give bonus credits - e.g. prof no-show)
// ============================================================================

export async function compensateCredits(
  env: Env, studentId: string, amount: number, reason: string
): Promise<{ success: boolean }> {
  const bal = await env.DB.prepare(
    `SELECT available_credits FROM credit_balances WHERE student_id = ?`
  ).bind(studentId).first<any>();

  const newBalance = (bal?.available_credits || 0) + amount;

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO credit_balances (student_id, total_credits, available_credits, lifetime_credits, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(student_id) DO UPDATE SET
         total_credits = total_credits + ?,
         available_credits = available_credits + ?,
         lifetime_credits = lifetime_credits + ?,
         updated_at = datetime('now')`
    ).bind(studentId, amount, amount, amount, amount, amount, amount),

    env.DB.prepare(
      `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, description)
       VALUES (?, ?, 'compensation', ?, ?, ?)`
    ).bind(
      crypto.randomUUID().replace(/-/g, ''),
      studentId, amount, newBalance, reason
    ),
  ]);

  return { success: true };
}

// ============================================================================
// EXPIRE CREDITS (called by cron)
// ============================================================================

export async function expireCredits(env: Env): Promise<{ expired_count: number }> {
  // Find expired active purchases
  const expired = await env.DB.prepare(
    `SELECT id, student_id, credits_remaining
     FROM credit_purchases
     WHERE status = 'active' AND expires_at < datetime('now') AND credits_remaining > 0`
  ).all<any>();

  if (expired.results.length === 0) return { expired_count: 0 };

  const stmts = [];
  for (const p of expired.results) {
    // Mark purchase expired
    stmts.push(
      env.DB.prepare(
        `UPDATE credit_purchases SET status = 'expired' WHERE id = ?`
      ).bind(p.id)
    );

    // Deduct from balance
    stmts.push(
      env.DB.prepare(
        `UPDATE credit_balances
         SET total_credits = MAX(0, total_credits - ?),
             available_credits = MAX(0, available_credits - ?),
             updated_at = datetime('now')
         WHERE student_id = ?`
      ).bind(p.credits_remaining, p.credits_remaining, p.student_id)
    );

    // Record transaction
    stmts.push(
      env.DB.prepare(
        `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, 'expire', ?, 0, 'purchase', ?, ?)`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        p.student_id, -p.credits_remaining,
        p.id, `${p.credits_remaining} credit(s) expired`
      )
    );
  }

  await env.DB.batch(stmts);
  return { expired_count: expired.results.length };
}

// ============================================================================
// ENROLL STUDENT IN SESSION (public API handler)
// ============================================================================

export async function enrollInSession(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as any;
  const { student_id, session_id, session_type } = body;

  if (!student_id || !session_id) {
    return errorResponse('student_id and session_id required');
  }

  // Check not already enrolled
  const existing = await env.DB.prepare(
    `SELECT id FROM session_enrollments WHERE session_id = ? AND student_id = ? AND status IN ('reserved', 'confirmed')`
  ).bind(session_id, student_id).first();

  if (existing) return errorResponse('Already enrolled in this session');

  const result = await reserveCredits(env, student_id, session_id, session_type || 'group');

  if (!result.success) {
    return errorResponse(result.error || 'Failed to reserve credits', 400);
  }

  return jsonResponse({
    success: true,
    enrollment_id: result.enrollment_id,
    credits_reserved: session_type === 'urgent_individual' ? 4 : session_type === 'individual' ? 3 : 1,
  });
}

// ============================================================================
// CANCEL ENROLLMENT (student cancels)
// ============================================================================

export async function cancelEnrollment(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as any;
  const { enrollment_id, reason } = body;

  if (!enrollment_id) return errorResponse('enrollment_id required');

  // Get enrollment + session to calculate refund
  const enrollment = await env.DB.prepare(
    `SELECT se.*, ss.scheduled_at
     FROM session_enrollments se
     LEFT JOIN session_slots ss ON ss.id = se.session_id
     WHERE se.id = ?`
  ).bind(enrollment_id).first<any>();

  if (!enrollment) return errorResponse('Enrollment not found', 404);

  // Calculate refund based on cancellation policy
  const sessionTime = new Date(enrollment.scheduled_at || Date.now());
  const now = new Date();
  const hoursBeforeSession = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercent = 100;
  let policyApplied = 'full_refund';

  if (hoursBeforeSession < 2) {
    refundPercent = 0;
    policyApplied = 'late_cancel_under_2h';
  } else if (hoursBeforeSession < 24) {
    refundPercent = 50;
    policyApplied = 'partial_refund_under_24h';
  }

  const result = await releaseCredits(env, enrollment_id, reason || policyApplied, refundPercent);

  if (!result.success) return errorResponse(result.error || 'Failed to cancel', 400);

  return jsonResponse({
    success: true,
    credits_returned: result.credits_returned,
    refund_percent: refundPercent,
    policy_applied: policyApplied,
  });
}

// ============================================================================
// CREDIT EXPIRY WARNINGS (called by cron)
// ============================================================================

export async function sendCreditExpiryWarnings(env: Env): Promise<void> {
  const warnings = [
    { type: 'expiry_30d' as const, days: 30, subject: 'Your credits expire in 30 days' },
    { type: 'expiry_7d' as const, days: 7, subject: 'Your credits expire in 7 days — act now!' },
    { type: 'expiry_1d' as const, days: 1, subject: 'Last day! Your credits expire tomorrow' },
  ];

  for (const w of warnings) {
    const targetDate = new Date(Date.now() + w.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const expiring = await env.DB.prepare(`
      SELECT cp.id as purchase_id, cp.student_id, cp.credits_remaining, cp.expires_at,
             u.email, u.prenom, u.preferred_language
      FROM credit_purchases cp
      JOIN users u ON u.id = cp.student_id
      WHERE cp.status = 'active'
        AND cp.credits_remaining > 0
        AND date(cp.expires_at) = ?
        AND cp.id NOT IN (
          SELECT cn.purchase_id FROM credit_notifications cn WHERE cn.type = ?
        )
    `).bind(targetDate, w.type).all<any>();

    for (const p of expiring.results) {
      try {
        await sendEmail(env, {
          to: p.email,
          subject: w.subject,
          html: `<p>Hi ${p.prenom},</p>
            <p>You have <strong>${p.credits_remaining} credit(s)</strong> expiring on <strong>${new Date(p.expires_at).toLocaleDateString()}</strong>.</p>
            ${w.days <= 7 ? '<p><strong>Buy a new pack to extend all your credits by 90 days!</strong></p>' : ''}
            <p><a href="https://callmyprof.com/#pricing" style="display:inline-block;padding:12px 24px;background:#DC2626;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Browse available sessions</a></p>`,
        });

        await env.DB.prepare(
          `INSERT INTO credit_notifications (id, purchase_id, type) VALUES (?, ?, ?)`
        ).bind(crypto.randomUUID().replace(/-/g, ''), p.purchase_id, w.type).run();
      } catch (e) {
        console.error(`Credit warning email error for ${p.email}:`, e);
      }
    }
  }
}
