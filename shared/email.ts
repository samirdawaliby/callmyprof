/**
 * CallMyProf - Email Service (Resend API)
 * Sends transactional emails via Resend (compatible with Cloudflare Workers)
 */

import type { Env } from './types';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Returns the appropriate sender email based on locale
 * FR → nepasrepondre@callmyprof.com
 * EN/AR → noreply@callmyprof.com
 */
export function getFromEmail(locale?: string): string {
  if (locale === 'fr') {
    return 'CallMyProf <nepasrepondre@callmyprof.com>';
  }
  return 'CallMyProf <noreply@callmyprof.com>';
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  locale?: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
}

export async function sendEmail(env: Env, options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(options.locale),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo || 'contact@callmyprof.com',
      }),
    });

    const data = await response.json() as ResendResponse;

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Network error sending email' };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const EMAIL_STYLES = `
  body { margin: 0; padding: 0; background: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 32px 40px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 24px; margin: 0; letter-spacing: -0.5px; }
  .header p { color: #94a3b8; font-size: 14px; margin: 8px 0 0; }
  .body { padding: 40px; }
  .body h2 { color: #1e293b; font-size: 20px; margin: 0 0 16px; }
  .body p { color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
  .cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #DC2626, #ef4444); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; margin: 16px 0; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
  .info-label { font-weight: 600; color: #1e293b; }
  .footer { padding: 24px 40px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
  .footer a { color: #DC2626; text-decoration: none; }
`;

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${EMAIL_STYLES}</style></head>
<body>
<div style="padding: 20px;">
  <div class="container">
    ${content}
  </div>
</div>
</body>
</html>`;
}

/**
 * Booking invitation email — sent to the student/parent
 */
export function bookingInviteEmail(data: {
  prenom: string;
  bookingUrl: string;
  lang: string;
}): { subject: string; html: string } {
  const isAr = data.lang === 'ar';
  const isFr = data.lang === 'fr';

  const subject = isFr
    ? 'CallMyProf - Prenez votre rendez-vous gratuit'
    : isAr
    ? 'CallMyProf - احجز موعدك المجاني'
    : 'CallMyProf - Book Your Free Consultation';

  const content = isFr ? `
    <div class="header">
      <h1>&#128222; CallMyProf</h1>
      <p>Votre rendez-vous gratuit vous attend</p>
    </div>
    <div class="body">
      <h2>Bonjour ${data.prenom} !</h2>
      <p>Merci pour votre int\u00e9r\u00eat pour CallMyProf. Nous serions ravis d'\u00e9changer avec vous pour comprendre vos besoins et vous trouver le professeur id\u00e9al.</p>
      <p>Choisissez un cr\u00e9neau qui vous convient pour un appel de 15 minutes :</p>
      <div style="text-align: center;">
        <a href="${data.bookingUrl}" class="cta-btn">&#128197; Choisir un cr\u00e9neau</a>
      </div>
      <div class="info-box">
        <p style="margin:0; font-size: 14px;"><strong>&#9201; Dur\u00e9e :</strong> 15 minutes<br>
        <strong>&#128172; Format :</strong> Appel t\u00e9l\u00e9phonique ou visio<br>
        <strong>&#128176; Co\u00fbt :</strong> Gratuit, sans engagement</p>
      </div>
      <p>Si aucun cr\u00e9neau ne vous convient, r\u00e9pondez simplement \u00e0 cet email et nous trouverons un moment ensemble.</p>
    </div>
    <div class="footer">
      <p>\u00a9 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : isAr ? `
    <div class="header">
      <h1>&#128222; CallMyProf</h1>
      <p>\u0645\u0648\u0639\u062f\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0628\u0627\u0646\u062a\u0638\u0627\u0631\u0643</p>
    </div>
    <div class="body" dir="rtl" style="text-align: right;">
      <h2>\u0645\u0631\u062d\u0628\u0627\u064b ${data.prenom}!</h2>
      <p>\u0634\u0643\u0631\u0627\u064b \u0644\u0627\u0647\u062a\u0645\u0627\u0645\u0643 \u0628\u0640 CallMyProf. \u0646\u0648\u062f \u0627\u0644\u062a\u062d\u062f\u062b \u0645\u0639\u0643 \u0644\u0641\u0647\u0645 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0643 \u0648\u0625\u064a\u062c\u0627\u062f \u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u0645\u062b\u0627\u0644\u064a.</p>
      <p>\u0627\u062e\u062a\u0631 \u0645\u0648\u0639\u062f\u0627\u064b \u0645\u0646\u0627\u0633\u0628\u0627\u064b \u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0645\u062f\u062a\u0647\u0627 15 \u062f\u0642\u064a\u0642\u0629:</p>
      <div style="text-align: center;">
        <a href="${data.bookingUrl}" class="cta-btn">&#128197; \u0627\u062e\u062a\u0631 \u0645\u0648\u0639\u062f\u0627\u064b</a>
      </div>
      <div class="info-box">
        <p style="margin:0; font-size: 14px;"><strong>&#9201; \u0627\u0644\u0645\u062f\u0629:</strong> 15 \u062f\u0642\u064a\u0642\u0629<br>
        <strong>&#128172; \u0627\u0644\u0634\u0643\u0644:</strong> \u0645\u0643\u0627\u0644\u0645\u0629 \u0647\u0627\u062a\u0641\u064a\u0629 \u0623\u0648 \u0641\u064a\u062f\u064a\u0648<br>
        <strong>&#128176; \u0627\u0644\u062a\u0643\u0644\u0641\u0629:</strong> \u0645\u062c\u0627\u0646\u064a\u060c \u0628\u062f\u0648\u0646 \u0627\u0644\u062a\u0632\u0627\u0645</p>
      </div>
    </div>
    <div class="footer">
      <p>\u00a9 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : `
    <div class="header">
      <h1>&#128222; CallMyProf</h1>
      <p>Your free consultation is waiting</p>
    </div>
    <div class="body">
      <h2>Hi ${data.prenom}!</h2>
      <p>Thank you for your interest in CallMyProf. We'd love to chat with you to understand your needs and find the perfect tutor.</p>
      <p>Pick a time slot that works for you for a quick 15-minute call:</p>
      <div style="text-align: center;">
        <a href="${data.bookingUrl}" class="cta-btn">&#128197; Choose a Time Slot</a>
      </div>
      <div class="info-box">
        <p style="margin:0; font-size: 14px;"><strong>&#9201; Duration:</strong> 15 minutes<br>
        <strong>&#128172; Format:</strong> Phone call or video<br>
        <strong>&#128176; Cost:</strong> Free, no commitment</p>
      </div>
      <p>If none of the available slots work for you, simply reply to this email and we'll find a time together.</p>
    </div>
    <div class="footer">
      <p>\u00a9 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  `;

  return { subject, html: emailLayout(content) };
}

/**
 * Booking confirmation email — sent after student books a slot
 */
export function bookingConfirmationEmail(data: {
  prenom: string;
  date: string;
  time: string;
  lang: string;
  videoUrl?: string;
  videoProvider?: string;
  portalUrl?: string;
}): { subject: string; html: string } {
  const isFr = data.lang === 'fr';
  const isAr = data.lang === 'ar';

  const subject = isFr
    ? 'CallMyProf - Rendez-vous confirm\u00e9 !'
    : isAr
    ? 'CallMyProf - \u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0639\u062f!'
    : 'CallMyProf - Appointment Confirmed!';

  // Video link section
  const videoSection = data.videoUrl ? (isFr ? `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.videoUrl}" class="cta-btn">&#127909; Rejoindre la visio</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;text-align:center">Ce lien sera actif 15 min avant le rendez-vous</p>
  ` : isAr ? `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.videoUrl}" class="cta-btn">&#127909; \u0627\u0646\u0636\u0645 \u0644\u0644\u0645\u0643\u0627\u0644\u0645\u0629</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;text-align:center">\u0633\u064a\u0643\u0648\u0646 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u062a\u0627\u062d\u0627\u064b \u0642\u0628\u0644 15 \u062f\u0642\u064a\u0642\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u0639\u062f</p>
  ` : `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.videoUrl}" class="cta-btn">&#127909; Join Video Call</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;text-align:center">This link will be active 15 min before your appointment</p>
  `) : '';

  // Portal link section
  const portalSection = data.portalUrl ? (isFr ? `
      <div style="margin: 20px 0; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center;">
        <p style="margin:0 0 8px; font-size:13px; color:#0369a1;">&#128100; Acc\u00e9dez \u00e0 votre espace personnel</p>
        <a href="${data.portalUrl}" style="color:#DC2626; font-weight:700; font-size:14px; text-decoration:none;">Mon Dashboard &rarr;</a>
      </div>
  ` : isAr ? `
      <div style="margin: 20px 0; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center;">
        <p style="margin:0 0 8px; font-size:13px; color:#0369a1;">&#128100; \u0627\u062f\u062e\u0644 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a</p>
        <a href="${data.portalUrl}" style="color:#DC2626; font-weight:700; font-size:14px; text-decoration:none;">My Dashboard &rarr;</a>
      </div>
  ` : `
      <div style="margin: 20px 0; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center;">
        <p style="margin:0 0 8px; font-size:13px; color:#0369a1;">&#128100; Access your personal dashboard</p>
        <a href="${data.portalUrl}" style="color:#DC2626; font-weight:700; font-size:14px; text-decoration:none;">My Dashboard &rarr;</a>
      </div>
  `) : '';

  const content = isFr ? `
    <div class="header">
      <h1>&#9989; Rendez-vous Confirm\u00e9</h1>
      <p>On a h\u00e2te de vous parler !</p>
    </div>
    <div class="body">
      <h2>Merci ${data.prenom} !</h2>
      <p>Votre rendez-vous est confirm\u00e9. Voici les d\u00e9tails :</p>
      <div class="info-box">
        <p style="margin:0; font-size: 16px; text-align: center;">
          <strong>&#128197; ${data.date}</strong><br>
          <strong>&#128348; ${data.time}</strong>
        </p>
      </div>
      ${videoSection}
      ${portalSection}
      <p>Si vous devez modifier le rendez-vous, r\u00e9pondez \u00e0 cet email.</p>
    </div>
    <div class="footer">
      <p>\u00a9 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : isAr ? `
    <div class="header">
      <h1>&#9989; \u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0639\u062f</h1>
      <p>\u0646\u062a\u0637\u0644\u0639 \u0644\u0644\u062a\u062d\u062f\u062b \u0645\u0639\u0643!</p>
    </div>
    <div class="body" dir="rtl" style="text-align: right;">
      <h2>\u0634\u0643\u0631\u0627\u064b ${data.prenom}!</h2>
      <p>\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0645\u0648\u0639\u062f\u0643. \u0625\u0644\u064a\u0643 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644:</p>
      <div class="info-box">
        <p style="margin:0; font-size: 16px; text-align: center;">
          <strong>&#128197; ${data.date}</strong><br>
          <strong>&#128348; ${data.time}</strong>
        </p>
      </div>
      ${videoSection}
      ${portalSection}
    </div>
    <div class="footer">
      <p>\u00a9 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : `
    <div class="header">
      <h1>&#9989; Appointment Confirmed</h1>
      <p>We can't wait to talk to you!</p>
    </div>
    <div class="body">
      <h2>Thank you ${data.prenom}!</h2>
      <p>Your appointment is confirmed. Here are the details:</p>
      <div class="info-box">
        <p style="margin:0; font-size: 16px; text-align: center;">
          <strong>&#128197; ${data.date}</strong><br>
          <strong>&#128348; ${data.time}</strong>
        </p>
      </div>
      ${videoSection}
      ${portalSection}
      <p>If you need to reschedule, simply reply to this email.</p>
    </div>
    <div class="footer">
      <p>\u00a9 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  `;

  return { subject, html: emailLayout(content) };
}

/**
 * Admin notification — when a new booking is made
 */
export function adminBookingNotifEmail(data: {
  leadPrenom: string;
  leadNom: string;
  leadEmail: string;
  leadPhone: string;
  date: string;
  time: string;
  videoHostUrl?: string;
  videoProvider?: string;
}): { subject: string; html: string } {
  const videoSection = data.videoHostUrl ? `
      <div style="margin: 16px 0; padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; text-align: center;">
        <p style="margin:0 0 8px; font-size:13px; color:#1e40af; font-weight:600">
          &#127909; Lien visio (${data.videoProvider === 'daily' ? 'Daily.co' : 'Jitsi Meet'}) :
        </p>
        <a href="${data.videoHostUrl}" style="color:#DC2626; font-size:12px; word-break:break-all">${data.videoHostUrl}</a>
      </div>
  ` : '';

  const content = `
    <div class="header">
      <h1>&#128276; Nouveau RDV !</h1>
      <p>Un lead a r\u00e9serv\u00e9 un cr\u00e9neau</p>
    </div>
    <div class="body">
      <h2>${data.leadPrenom} ${data.leadNom} a pris RDV</h2>
      <div class="info-box">
        <p style="margin:0;">
          <strong>&#128197; Date :</strong> ${data.date}<br>
          <strong>&#128348; Heure :</strong> ${data.time}<br>
          <strong>&#9993; Email :</strong> ${data.leadEmail}<br>
          <strong>&#128222; T\u00e9l :</strong> ${data.leadPhone}
        </p>
      </div>
      ${videoSection}
      <div style="text-align: center;">
        <a href="https://callmyprof.com/leads" class="cta-btn">Voir dans le CRM</a>
      </div>
    </div>
    <div class="footer">
      <p>CallMyProf Admin</p>
    </div>
  `;

  return {
    subject: `Nouveau RDV - ${data.leadPrenom} ${data.leadNom} (${data.date} ${data.time})`,
    html: emailLayout(content),
  };
}

/**
 * Lead confirmation email — sent to the visitor after form submission
 */
export function leadConfirmationEmail(data: {
  prenom: string;
  subject?: string;
  serviceType?: string;
  lang: string;
}): { subject: string; html: string } {
  const isFr = data.lang === 'fr';
  const isAr = data.lang === 'ar';

  const subject = isFr
    ? `${data.prenom}, votre demande a bien \u00e9t\u00e9 re\u00e7ue !`
    : isAr
    ? `${data.prenom}\u060c \u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0637\u0644\u0628\u0643!`
    : `${data.prenom}, we've received your request!`;

  const serviceLabel = data.serviceType === 'group'
    ? (isFr ? 'Cours collectif' : isAr ? '\u062f\u0631\u0648\u0633 \u062c\u0645\u0627\u0639\u064a\u0629' : 'Group class')
    : (isFr ? 'Cours individuel' : isAr ? '\u062f\u0631\u0648\u0633 \u0641\u0631\u062f\u064a\u0629' : 'Individual tutoring');

  const content = isFr ? `
    <div class="header">
      <h1>&#128222; CallMyProf</h1>
      <p>Votre demande a \u00e9t\u00e9 enregistr\u00e9e</p>
    </div>
    <div class="body">
      <h2>Merci ${data.prenom} !</h2>
      <p>Nous avons bien re\u00e7u votre demande et notre \u00e9quipe la traite en ce moment m\u00eame. <strong>Un conseiller vous contactera dans les 24 heures</strong> pour comprendre vos besoins et vous proposer le professeur id\u00e9al.</p>

      <div class="info-box">
        <p style="margin:0; font-size: 14px;">
          <strong>&#127891; Type :</strong> ${serviceLabel}<br>
          ${data.subject ? `<strong>&#128218; Mati\u00e8re :</strong> ${data.subject}<br>` : ''}
          <strong>&#9201; D\u00e9lai :</strong> R\u00e9ponse sous 24h
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #fef2f2, #fff1f2); border: 1px solid #fecaca; border-radius: 10px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin:0 0 8px; font-size: 18px; font-weight: 800; color: #DC2626;">Comment \u00e7a marche ?</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
          <tr>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#DC2626;color:#fff;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">1</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">Demande<br>re\u00e7ue &#9989;</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">2</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">On vous<br>rappelle</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">3</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">On vous<br>match</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">4</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">Cours<br>d\u00e9marre</p>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:14px; color:#94a3b8;">Une question en attendant ? R\u00e9pondez directement \u00e0 cet email ou contactez-nous sur WhatsApp.</p>
    </div>
    <div class="footer">
      <p style="margin-bottom:8px;">&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
      <p><a href="https://callmyprof.com/faq">FAQ</a> &bull; <a href="https://callmyprof.com/privacy">Confidentialit\u00e9</a></p>
    </div>
  ` : isAr ? `
    <div class="header">
      <h1>&#128222; CallMyProf</h1>
      <p>\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0637\u0644\u0628\u0643</p>
    </div>
    <div class="body" dir="rtl" style="text-align: right;">
      <h2>\u0634\u0643\u0631\u0627\u064b ${data.prenom}!</h2>
      <p>\u0644\u0642\u062f \u0627\u0633\u062a\u0644\u0645\u0646\u0627 \u0637\u0644\u0628\u0643 \u0648\u0641\u0631\u064a\u0642\u0646\u0627 \u064a\u0639\u0645\u0644 \u0639\u0644\u064a\u0647 \u0627\u0644\u0622\u0646. <strong>\u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0645\u0633\u062a\u0634\u0627\u0631 \u062e\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629</strong> \u0644\u0641\u0647\u0645 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0643 \u0648\u0627\u0642\u062a\u0631\u0627\u062d \u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u0645\u062b\u0627\u0644\u064a.</p>

      <div class="info-box">
        <p style="margin:0; font-size: 14px;">
          <strong>&#127891; \u0627\u0644\u0646\u0648\u0639:</strong> ${serviceLabel}<br>
          ${data.subject ? `<strong>&#128218; \u0627\u0644\u0645\u0627\u062f\u0629:</strong> ${data.subject}<br>` : ''}
          <strong>&#9201; \u0627\u0644\u0645\u0647\u0644\u0629:</strong> \u0631\u062f \u062e\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #fef2f2, #fff1f2); border: 1px solid #fecaca; border-radius: 10px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin:0 0 8px; font-size: 18px; font-weight: 800; color: #DC2626;">\u0643\u064a\u0641 \u064a\u0639\u0645\u0644\u061f</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;" dir="rtl">
          <tr>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#DC2626;color:#fff;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">1</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645<br>&#9989;</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">2</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">\u0646\u062a\u0635\u0644<br>\u0628\u0643</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">3</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">\u0646\u062e\u062a\u0627\u0631 \u0644\u0643<br>\u0645\u0639\u0644\u0645</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">4</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">\u062a\u0628\u062f\u0623<br>\u0627\u0644\u062f\u0631\u0648\u0633</p>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:14px; color:#94a3b8;">\u0644\u062f\u064a\u0643 \u0633\u0624\u0627\u0644\u061f \u0631\u062f \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064a\u062f \u0623\u0648 \u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0639\u0628\u0631 WhatsApp.</p>
    </div>
    <div class="footer">
      <p style="margin-bottom:8px;">&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
      <p><a href="https://callmyprof.com/faq">FAQ</a> &bull; <a href="https://callmyprof.com/privacy">Privacy</a></p>
    </div>
  ` : `
    <div class="header">
      <h1>&#128222; CallMyProf</h1>
      <p>Your request has been received</p>
    </div>
    <div class="body">
      <h2>Thank you ${data.prenom}!</h2>
      <p>We've received your request and our team is already working on it. <strong>A counselor will contact you within 24 hours</strong> to understand your needs and match you with the perfect tutor.</p>

      <div class="info-box">
        <p style="margin:0; font-size: 14px;">
          <strong>&#127891; Type:</strong> ${serviceLabel}<br>
          ${data.subject ? `<strong>&#128218; Subject:</strong> ${data.subject}<br>` : ''}
          <strong>&#9201; Response time:</strong> Within 24 hours
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #fef2f2, #fff1f2); border: 1px solid #fecaca; border-radius: 10px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin:0 0 8px; font-size: 18px; font-weight: 800; color: #DC2626;">How it works</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
          <tr>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#DC2626;color:#fff;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">1</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">Request<br>received &#9989;</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">2</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">We call<br>you back</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">3</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">We match<br>your tutor</p>
            </td>
            <td style="text-align:center; padding:8px; width:25%;">
              <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;color:#64748b;font-size:18px;font-weight:800;line-height:40px;margin:0 auto 6px;">4</div>
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.3;">Start<br>learning</p>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:14px; color:#94a3b8;">Have a question in the meantime? Just reply to this email or reach out on WhatsApp.</p>
    </div>
    <div class="footer">
      <p style="margin-bottom:8px;">&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
      <p><a href="https://callmyprof.com/faq">FAQ</a> &bull; <a href="https://callmyprof.com/privacy">Privacy</a></p>
    </div>
  `;

  return { subject, html: emailLayout(content) };
}

/**
 * Admin notification — when a new lead is created
 */
export function adminNewLeadEmail(data: {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  countryCode: string;
  subject?: string;
  serviceType?: string;
  locale: string;
}): { subject: string; html: string } {
  const content = `
    <div class="header" style="background: linear-gradient(135deg, #DC2626 0%, #b91c1c 100%);">
      <h1>&#128680; Nouveau Lead !</h1>
      <p>Un visiteur vient de remplir le formulaire</p>
    </div>
    <div class="body">
      <h2>${data.prenom} ${data.nom}</h2>
      <div class="info-box">
        <p style="margin:0; font-size: 15px; line-height: 2;">
          <strong>&#9993; Email :</strong> <a href="mailto:${data.email}" style="color:#DC2626">${data.email}</a><br>
          <strong>&#128222; T\u00e9l :</strong> <a href="tel:${data.countryCode}${data.telephone}" style="color:#DC2626">${data.countryCode} ${data.telephone}</a><br>
          ${data.subject ? `<strong>&#128218; Mati\u00e8re :</strong> ${data.subject}<br>` : ''}
          <strong>&#127891; Type :</strong> ${data.serviceType === 'group' ? 'Collectif' : 'Individuel'}<br>
          <strong>&#127760; Langue :</strong> ${data.locale === 'fr' ? 'Fran\u00e7ais' : data.locale === 'ar' ? 'Arabe' : 'Anglais'}<br>
          <strong>&#128197; Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Asia/Beirut' })}
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://callmyprof.com/leads" class="cta-btn">&#128203; Voir dans le CRM</a>
      </div>
      <p style="margin-top:24px; font-size:13px; color:#94a3b8; text-align:center;">Rappeler ce lead dans les 24h pour maximiser la conversion.</p>
    </div>
    <div class="footer">
      <p>CallMyProf Admin &bull; CRM Notification</p>
    </div>
  `;

  return {
    subject: `Nouveau lead : ${data.prenom} ${data.nom} - ${data.subject || 'Pas de mati\u00e8re'}`,
    html: emailLayout(content),
  };
}

/**
 * Session reminder email — sent 1h before the session
 */
export function sessionReminderEmail(data: {
  prenom: string;
  date: string;
  time: string;
  sessionUrl: string;
  lang: string;
}): { subject: string; html: string } {
  const isFr = data.lang === 'fr';
  const isAr = data.lang === 'ar';

  const subject = isFr
    ? `${data.prenom}, votre cours commence dans 1 heure !`
    : isAr
    ? `${data.prenom}\u060c \u062f\u0631\u0633\u0643 \u064a\u0628\u062f\u0623 \u062e\u0644\u0627\u0644 \u0633\u0627\u0639\u0629!`
    : `${data.prenom}, your session starts in 1 hour!`;

  const content = isFr ? `
    <div class="header" style="background: linear-gradient(135deg, #DC2626 0%, #b91c1c 100%);">
      <h1>&#9203; Rappel - Dans 1 heure</h1>
      <p>Votre session de cours est bient\u00f4t</p>
    </div>
    <div class="body">
      <h2>Bonjour ${data.prenom} !</h2>
      <p>Votre session de cours est pr\u00e9vue <strong>aujourd'hui \u00e0 ${data.time}</strong>. Pr\u00e9parez-vous !</p>
      <div class="info-box">
        <p style="margin:0; font-size: 16px; text-align: center;">
          <strong>&#128197; ${data.date}</strong> &bull; <strong>&#128348; ${data.time}</strong>
        </p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.sessionUrl}" class="cta-btn">&#127909; Rejoindre la session</a>
      </div>
      <p style="font-size:13px; color:#94a3b8; text-align:center;">Le lien sera actif 15 minutes avant le d\u00e9but.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : isAr ? `
    <div class="header" style="background: linear-gradient(135deg, #DC2626 0%, #b91c1c 100%);">
      <h1>&#9203; \u062a\u0630\u0643\u064a\u0631 - \u062e\u0644\u0627\u0644 \u0633\u0627\u0639\u0629</h1>
      <p>\u062f\u0631\u0633\u0643 \u0639\u0644\u0649 \u0648\u0634\u0643 \u0627\u0644\u0628\u062f\u0621</p>
    </div>
    <div class="body" dir="rtl" style="text-align: right;">
      <h2>\u0645\u0631\u062d\u0628\u0627\u064b ${data.prenom}!</h2>
      <p>\u062f\u0631\u0633\u0643 \u0645\u0642\u0631\u0631 <strong>\u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u0633\u0627\u0639\u0629 ${data.time}</strong>. \u0627\u0633\u062a\u0639\u062f!</p>
      <div class="info-box">
        <p style="margin:0; font-size: 16px; text-align: center;">
          <strong>&#128197; ${data.date}</strong> &bull; <strong>&#128348; ${data.time}</strong>
        </p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.sessionUrl}" class="cta-btn">&#127909; \u0627\u0646\u0636\u0645 \u0644\u0644\u062c\u0644\u0633\u0629</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : `
    <div class="header" style="background: linear-gradient(135deg, #DC2626 0%, #b91c1c 100%);">
      <h1>&#9203; Reminder - In 1 Hour</h1>
      <p>Your tutoring session is coming up</p>
    </div>
    <div class="body">
      <h2>Hi ${data.prenom}!</h2>
      <p>Your tutoring session is scheduled for <strong>today at ${data.time}</strong>. Get ready!</p>
      <div class="info-box">
        <p style="margin:0; font-size: 16px; text-align: center;">
          <strong>&#128197; ${data.date}</strong> &bull; <strong>&#128348; ${data.time}</strong>
        </p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.sessionUrl}" class="cta-btn">&#127909; Join Session</a>
      </div>
      <p style="font-size:13px; color:#94a3b8; text-align:center;">The link will be active 15 minutes before start.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  `;

  return { subject, html: emailLayout(content) };
}

/**
 * Test email template
 */
export function testEmail(locale: string): { subject: string; html: string } {
  const isFr = locale === 'fr';
  const isAr = locale === 'ar';

  const subject = isFr
    ? 'CallMyProf - Email de test'
    : isAr
    ? 'CallMyProf - بريد تجريبي'
    : 'CallMyProf - Test Email';

  const content = isFr ? `
    <div class="header">
      <h1>&#9989; Test r\u00e9ussi !</h1>
      <p>Votre configuration email fonctionne</p>
    </div>
    <div class="body">
      <h2>Bonjour !</h2>
      <p>Cet email confirme que l'envoi depuis <strong>nepasrepondre@callmyprof.com</strong> fonctionne correctement.</p>
      <div class="info-box">
        <p style="margin:0; font-size: 14px;">
          <strong>&#128232; Exp\u00e9diteur :</strong> nepasrepondre@callmyprof.com<br>
          <strong>&#127760; Locale :</strong> Fran\u00e7ais (fr)<br>
          <strong>&#128197; Date :</strong> ${new Date().toISOString()}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : isAr ? `
    <div class="header">
      <h1>&#9989; \u0646\u062c\u062d \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631!</h1>
      <p>\u0625\u0639\u062f\u0627\u062f \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u064a\u0639\u0645\u0644</p>
    </div>
    <div class="body" dir="rtl" style="text-align: right;">
      <h2>\u0645\u0631\u062d\u0628\u0627\u064b!</h2>
      <p>\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064a\u062f \u064a\u0624\u0643\u062f \u0623\u0646 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0645\u0646 <strong>noreply@callmyprof.com</strong> \u064a\u0639\u0645\u0644 \u0628\u0634\u0643\u0644 \u0635\u062d\u064a\u062d.</p>
      <div class="info-box">
        <p style="margin:0; font-size: 14px;">
          <strong>&#128232; \u0627\u0644\u0645\u0631\u0633\u0644:</strong> noreply@callmyprof.com<br>
          <strong>&#127760; \u0627\u0644\u0644\u063a\u0629:</strong> \u0627\u0644\u0639\u0631\u0628\u064a\u0629 (ar)<br>
          <strong>&#128197; \u0627\u0644\u062a\u0627\u0631\u064a\u062e:</strong> ${new Date().toISOString()}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  ` : `
    <div class="header">
      <h1>&#9989; Test Successful!</h1>
      <p>Your email configuration is working</p>
    </div>
    <div class="body">
      <h2>Hello!</h2>
      <p>This email confirms that sending from <strong>noreply@callmyprof.com</strong> is working correctly.</p>
      <div class="info-box">
        <p style="margin:0; font-size: 14px;">
          <strong>&#128232; Sender:</strong> noreply@callmyprof.com<br>
          <strong>&#127760; Locale:</strong> English (en)<br>
          <strong>&#128197; Date:</strong> ${new Date().toISOString()}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 CallMyProf &bull; <a href="https://callmyprof.com">callmyprof.com</a></p>
    </div>
  `;

  return { subject, html: emailLayout(content) };
}
