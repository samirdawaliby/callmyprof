/**
 * CallMyProf - Booking API
 * Handles booking creation and email sending for consultations
 */

import type { Env, Lead } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import { sendEmail, bookingInviteEmail, bookingConfirmationEmail, adminBookingNotifEmail } from '../../shared/email';
import { createVideoRoom } from './video';
import { getStudentPortalUrl } from './student';

const ADMIN_EMAIL = 'admin@callmyprof.com';

// ============================================================================
// SEND BOOKING INVITE EMAIL (admin triggers this)
// ============================================================================

export async function sendBookingInvite(env: Env, leadId: string): Promise<Response> {
  // Get lead info
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?')
    .bind(leadId).first<Lead>();

  if (!lead) {
    return errorResponse('Lead not found', 404);
  }

  // Generate a booking token (simple UUID-based token)
  const token = generateId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // valid 7 days

  // Save booking token
  await env.DB.prepare(`
    INSERT INTO booking_tokens (id, lead_id, token, expires_at, used)
    VALUES (?, ?, ?, ?, 0)
  `).bind(generateId(), leadId, token, expiresAt.toISOString()).run();

  // Build booking URL
  const bookingUrl = `https://callmyprof.com/book/${token}`;

  // Determine language for email
  const lang = lead.preferred_language || lead.detected_locale || 'en';

  // Generate and send email
  const email = bookingInviteEmail({
    prenom: lead.prenom,
    bookingUrl,
    lang,
  });

  const result = await sendEmail(env, {
    to: lead.email,
    subject: email.subject,
    html: email.html,
  });

  if (!result.success) {
    return errorResponse(result.error || 'Failed to send email', 500);
  }

  // Update lead status to 'contacted' if still 'new'
  if (lead.statut === 'new') {
    await env.DB.prepare(
      "UPDATE leads SET statut = 'contacted', updated_at = datetime('now') WHERE id = ?"
    ).bind(leadId).run();
  }

  // Log the email send
  await env.DB.prepare(`
    INSERT INTO lead_emails (id, lead_id, type, email_to, resend_id, sent_at)
    VALUES (?, ?, 'booking_invite', ?, ?, datetime('now'))
  `).bind(generateId(), leadId, lead.email, result.id || '').run();

  return jsonResponse({ success: true, message: 'Booking email sent', bookingUrl });
}

// ============================================================================
// SUBMIT BOOKING (public - student picks a slot)
// ============================================================================

export async function submitBooking(env: Env, request: Request): Promise<Response> {
  const data = await request.json() as { lead_id: string; date: string; time: string };

  if (!data.lead_id || !data.date || !data.time) {
    return errorResponse('Missing required fields');
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    return errorResponse('Invalid date format');
  }

  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(data.time)) {
    return errorResponse('Invalid time format');
  }

  // Look up lead by token (lead_id here is actually the booking token)
  const tokenRow = await env.DB.prepare(
    'SELECT * FROM booking_tokens WHERE token = ? AND used = 0 AND expires_at > datetime(\'now\')'
  ).bind(data.lead_id).first<{ id: string; lead_id: string; token: string }>();

  if (!tokenRow) {
    return errorResponse('Invalid or expired booking link', 400);
  }

  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?')
    .bind(tokenRow.lead_id).first<Lead>();

  if (!lead) {
    return errorResponse('Lead not found', 404);
  }

  // Create the booking
  const bookingId = generateId();

  // Create video room (Daily.co primary, Jitsi fallback)
  const videoRoom = await createVideoRoom(env, {
    bookingId,
    scheduledDate: data.date,
    scheduledTime: data.time,
    studentName: lead.prenom,
    durationMinutes: 60,
    maxParticipants: 2,
  });

  await env.DB.prepare(`
    INSERT INTO bookings (id, lead_id, booking_date, booking_time, statut, video_provider, video_room_url, video_host_url, video_room_name, created_at)
    VALUES (?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, datetime('now'))
  `).bind(
    bookingId, lead.id, data.date, data.time,
    videoRoom.provider, videoRoom.room_url, videoRoom.host_url || '', videoRoom.room_name
  ).run();

  // Mark token as used
  await env.DB.prepare('UPDATE booking_tokens SET used = 1 WHERE id = ?')
    .bind(tokenRow.id).run();

  // Update lead with callback date
  await env.DB.prepare(`
    UPDATE leads SET
      callback_date = ?,
      callback_notes = COALESCE(callback_notes, '') || '\n[Auto] RDV pris le ' || datetime('now') || ' pour le ' || ? || ' a ' || ?,
      statut = CASE WHEN statut = 'new' OR statut = 'contacted' THEN 'qualified' ELSE statut END,
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    data.date + 'T' + data.time + ':00',
    data.date,
    data.time,
    lead.id
  ).run();

  // Format date for emails
  const dateObj = new Date(data.date + 'T00:00:00');
  const lang = lead.preferred_language || lead.detected_locale || 'en';
  const dateFormatted = dateObj.toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar-LB' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Generate student portal URL
  const portalUrl = await getStudentPortalUrl(lead.id, lead.email);

  // Send confirmation email to student (with video link + portal link)
  const confirmEmail = bookingConfirmationEmail({
    prenom: lead.prenom,
    date: dateFormatted,
    time: data.time,
    lang,
    videoUrl: videoRoom.room_url,
    videoProvider: videoRoom.provider,
    portalUrl,
  });

  sendEmail(env, {
    to: lead.email,
    subject: confirmEmail.subject,
    html: confirmEmail.html,
    locale: lang,
  }).catch(err => console.error('Confirmation email error:', err));

  // Send notification to admin (with host video link)
  const adminEmail = adminBookingNotifEmail({
    leadPrenom: lead.prenom,
    leadNom: lead.nom,
    leadEmail: lead.email,
    leadPhone: `${lead.country_code} ${lead.telephone}`,
    date: dateFormatted,
    time: data.time,
    videoHostUrl: videoRoom.host_url,
    videoProvider: videoRoom.provider,
  });

  sendEmail(env, {
    to: ADMIN_EMAIL,
    subject: adminEmail.subject,
    html: adminEmail.html,
  }).catch(err => console.error('Admin notification error:', err));

  return jsonResponse({ success: true, bookingId, videoProvider: videoRoom.provider });
}
