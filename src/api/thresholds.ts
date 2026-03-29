/**
 * CallMyProf - Threshold Engine
 * Manages group session thresholds, confirmations, cancellations, conversions
 */

import type { Env } from '../../shared/types';
import { sendEmail } from '../../shared/email';
import { releaseCredits, compensateCredits } from './credits';

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 8;
const DEADLINE_HOUR = 18; // 18h00 J-1

// ============================================================================
// CHECK THRESHOLDS (called by cron every hour)
// ============================================================================

export async function checkThresholds(env: Env): Promise<{ confirmed: number; cancelled: number }> {
  let confirmed = 0;
  let cancelled = 0;

  // Find open group sessions that just reached the threshold
  const reachedThreshold = await env.DB.prepare(`
    SELECT ss.id, ss.tutor_id, ss.subject, ss.theme, ss.scheduled_at,
           COUNT(se.id) as enrolled_count
    FROM session_slots ss
    LEFT JOIN session_enrollments se ON se.session_id = ss.id AND se.status IN ('reserved')
    WHERE ss.status = 'open'
      AND ss.session_type = 'group'
    GROUP BY ss.id
    HAVING enrolled_count >= ?
  `).bind(MIN_PARTICIPANTS).all<any>();

  for (const session of reachedThreshold.results) {
    // Confirm the session
    await env.DB.prepare(
      `UPDATE session_slots SET status = 'confirmed' WHERE id = ?`
    ).bind(session.id).run();

    // Confirm all enrollments
    await env.DB.prepare(
      `UPDATE session_enrollments SET status = 'confirmed' WHERE session_id = ? AND status = 'reserved'`
    ).bind(session.id).run();

    // Notify enrolled students
    const enrollees = await env.DB.prepare(`
      SELECT u.email, u.prenom, u.preferred_language
      FROM session_enrollments se
      JOIN users u ON u.id = se.student_id
      WHERE se.session_id = ? AND se.status = 'confirmed'
    `).bind(session.id).all<any>();

    for (const student of enrollees.results) {
      try {
        await sendEmail(env, {
          to: student.email,
          subject: `Course confirmed: ${session.subject}`,
          html: `<p>Hi ${student.prenom},</p>
            <p>Great news! Your ${session.subject} ${session.theme ? '- ' + session.theme : ''} session has been confirmed with ${session.enrolled_count} participants.</p>
            <p>Date: ${new Date(session.scheduled_at).toLocaleString()}</p>
            <p>The video link will be sent 30 minutes before the session.</p>`,
        });
      } catch (e) { console.error('Email error:', e); }
    }

    confirmed++;
  }

  return { confirmed, cancelled };
}

// ============================================================================
// DEADLINE CHECK (called daily at 18h - J-1 verification)
// ============================================================================

export async function deadlineCheck(env: Env): Promise<{ processed: number }> {
  let processed = 0;

  // Find sessions happening tomorrow that are still 'open' (below threshold)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = tomorrow.toISOString().split('T')[0] + 'T00:00:00';
  const tomorrowEnd = tomorrow.toISOString().split('T')[0] + 'T23:59:59';

  const belowThreshold = await env.DB.prepare(`
    SELECT ss.id, ss.tutor_id, ss.subject, ss.theme, ss.scheduled_at, ss.credits_cost,
           COUNT(se.id) as enrolled_count
    FROM session_slots ss
    LEFT JOIN session_enrollments se ON se.session_id = ss.id AND se.status IN ('reserved', 'confirmed')
    WHERE ss.status = 'open'
      AND ss.session_type = 'group'
      AND ss.scheduled_at >= ? AND ss.scheduled_at <= ?
    GROUP BY ss.id
    HAVING enrolled_count < ?
  `).bind(tomorrowStart, tomorrowEnd, MIN_PARTICIPANTS).all<any>();

  for (const session of belowThreshold.results) {
    const enrollees = await env.DB.prepare(`
      SELECT se.id as enrollment_id, se.student_id, se.credits_reserved,
             u.email, u.prenom, u.preferred_language
      FROM session_enrollments se
      JOIN users u ON u.id = se.student_id
      WHERE se.session_id = ? AND se.status IN ('reserved', 'confirmed')
    `).bind(session.id).all<any>();

    if (session.enrolled_count === 0) {
      // Scenario D: 0 inscrits — suppression silencieuse
      await env.DB.prepare(
        `UPDATE session_slots SET status = 'cancelled' WHERE id = ?`
      ).bind(session.id).run();

    } else if (session.enrolled_count === 1) {
      // Scenario C: 1 inscrit — proposer conversion en individuel ou report
      const student = enrollees.results[0];
      try {
        await sendEmail(env, {
          to: student.email,
          subject: `Session update: ${session.subject} - Not enough participants`,
          html: `<p>Hi ${student.prenom},</p>
            <p>Unfortunately, the group session <strong>${session.subject}</strong> ${session.theme ? '(' + session.theme + ')' : ''} scheduled for tomorrow doesn't have enough participants (minimum ${MIN_PARTICIPANTS} required).</p>
            <p><strong>Your options:</strong></p>
            <ul>
              <li><strong>Convert to individual session</strong> — costs 3 credits instead of 1 (you'll be charged 2 additional credits)</li>
              <li><strong>Reschedule</strong> — your credit is returned, and you're enrolled in the next available session</li>
              <li><strong>Cancel</strong> — your credit is returned immediately</li>
            </ul>
            <p>If you don't respond, your credit will be automatically returned.</p>`,
        });
      } catch (e) { console.error('Email error:', e); }

      // Auto-cancel if no response by session time (handled by next cron run)
      // For now, mark session as pending_decision
      await env.DB.prepare(
        `UPDATE session_slots SET status = 'cancelled' WHERE id = ?`
      ).bind(session.id).run();

      // Refund the student
      await releaseCredits(env, student.enrollment_id, 'below_threshold_auto_cancel', 100);

    } else if (session.enrolled_count === 2) {
      // Scenario B: 2 inscrits — proposer duo (2 credits chacun) ou report/annulation
      for (const student of enrollees.results) {
        try {
          await sendEmail(env, {
            to: student.email,
            subject: `Session update: ${session.subject} - Only 2 participants`,
            html: `<p>Hi ${student.prenom},</p>
              <p>The group session <strong>${session.subject}</strong> tomorrow has only 2 participants.</p>
              <p><strong>Your options:</strong></p>
              <ul>
                <li><strong>Duo session</strong> — the class happens with 2 students at 2 credits each instead of 1</li>
                <li><strong>Reschedule</strong> — your credit is returned and transferred to the next session</li>
                <li><strong>Cancel</strong> — your credit is returned immediately</li>
              </ul>
              <p>If you don't respond, your credit will be automatically returned.</p>`,
          });
        } catch (e) { console.error('Email error:', e); }
      }

      // Auto-cancel and refund
      await env.DB.prepare(
        `UPDATE session_slots SET status = 'cancelled' WHERE id = ?`
      ).bind(session.id).run();

      for (const student of enrollees.results) {
        await releaseCredits(env, student.enrollment_id, 'below_threshold_auto_cancel', 100);
      }
    }

    processed++;
  }

  return { processed };
}

// ============================================================================
// MARK ATTENDANCE (called every 15 min - detect no-shows)
// ============================================================================

export async function markNoShows(env: Env): Promise<{ no_shows: number }> {
  // Find sessions that started 10+ minutes ago with unattended enrollments
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const noShows = await env.DB.prepare(`
    SELECT se.id as enrollment_id, se.student_id, se.credits_reserved
    FROM session_enrollments se
    JOIN session_slots ss ON ss.id = se.session_id
    WHERE se.status = 'confirmed'
      AND ss.status = 'confirmed'
      AND ss.scheduled_at < ?
      AND se.attended_at IS NULL
  `).bind(cutoff).all<any>();

  for (const enrollment of noShows.results) {
    // Mark as absent — credits lost (no refund)
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE session_enrollments SET status = 'absent' WHERE id = ?`
      ).bind(enrollment.enrollment_id),

      env.DB.prepare(
        `UPDATE credit_balances
         SET total_credits = MAX(0, total_credits - ?),
             reserved_credits = MAX(0, reserved_credits - ?),
             lifetime_spent = lifetime_spent + ?,
             updated_at = datetime('now')
         WHERE student_id = ?`
      ).bind(enrollment.credits_reserved, enrollment.credits_reserved, enrollment.credits_reserved, enrollment.student_id),

      env.DB.prepare(
        `INSERT INTO credit_transactions (id, student_id, type, amount, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, 'debit_group', ?, 0, 'enrollment', ?, 'No-show — credits forfeited')`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        enrollment.student_id, -enrollment.credits_reserved,
        enrollment.enrollment_id
      ),
    ]);
  }

  return { no_shows: noShows.results.length };
}

// ============================================================================
// HANDLE TUTOR NO-SHOW (admin triggered or auto-detected)
// ============================================================================

export async function handleTutorNoShow(env: Env, sessionId: string): Promise<Response> {
  const enrollees = await env.DB.prepare(`
    SELECT se.id as enrollment_id, se.student_id, se.credits_reserved
    FROM session_enrollments se
    WHERE se.session_id = ? AND se.status IN ('reserved', 'confirmed')
  `).bind(sessionId).all<any>();

  // Cancel session
  await env.DB.prepare(
    `UPDATE session_slots SET status = 'cancelled' WHERE id = ?`
  ).bind(sessionId).run();

  // Refund all students + 1 credit compensation
  for (const e of enrollees.results) {
    await releaseCredits(env, e.enrollment_id, 'tutor_no_show', 100);
    await compensateCredits(env, e.student_id, 1, 'Compensation: tutor no-show (+1 credit)');
  }

  return new Response(JSON.stringify({
    success: true,
    students_refunded: enrollees.results.length,
    compensation_per_student: 1,
  }), { headers: { 'Content-Type': 'application/json' } });
}
