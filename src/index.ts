/**
 * Soutien Scolaire Caplogy - Worker principal (router)
 * Architecture : Worker unique avec sidebar SSR (pattern Prospector v2)
 * Toutes les routes : publiques + admin avec authentification
 */

import { requireAuth, getSessionIdFromRequest, deleteSession, hashPassword } from '../shared/auth';
import { htmlResponse, jsonResponse, redirectResponse, errorResponse } from '../shared/utils';
import { htmlPage } from '../shared/html-utils';
import { detectLocale, langCookieHeader } from '../shared/i18n/index';
import type { Locale } from '../shared/i18n/index';
import { renderLoginPage, handleLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';
import { renderFormateursListe } from './pages/formateurs-liste';
import { renderFormateurDetail } from './pages/formateur-detail';
import { renderOnboarding } from './pages/onboarding';
import { updateFormateurStatus, updateFormateur } from './api/formateurs';
import { registerFormateur, updateOnboarding, uploadDocument, submitOnboarding, getOnboardingState, getCatalogueTree } from './api/onboarding';
import { renderFamillesListe } from './pages/familles-liste';
import { renderFamilleDetail } from './pages/famille-detail';
import { renderFamilleForm } from './pages/famille-form';
import { createFamille, createEnfant } from './api/familles';
import { renderCatalogue } from './pages/catalogue';
import { createDomaine, updateDomaine, deleteDomaine, createSousDomaine, updateSousDomaine, createThematique, updateThematique, toggleActif } from './api/catalogue';
import { renderCoursListe } from './pages/cours-liste';
import { renderCoursDetail } from './pages/cours-detail';
import { renderCoursForm } from './pages/cours-form';
import { createCours, updateCoursStatut, terminerCours } from './api/cours';
import { renderPackages } from './pages/packages';
import { createPackage, updatePackageType } from './api/packages';
import { renderAvis } from './pages/avis';
import { toggleAvisVisibility } from './api/avis';
import { renderLanding, renderThanksPage } from './pages/landing';
import { renderAboutPage } from './pages/about';
import { renderContactPage } from './pages/contact';
import { renderTermsPage } from './pages/terms';
import { renderPrivacyPage } from './pages/privacy';
import { renderFaqPage } from './pages/faq';
import { sendEmail, testEmail, sessionReminderEmail } from '../shared/email';
import { createLead, updateLeadStatus } from './api/leads';
import { renderLeadsListe } from './pages/leads-liste';
import { renderLeadDetail } from './pages/lead-detail';
import { renderCalendar } from './pages/calendar';
import { createSlot, updateSlot, deleteSlot } from './api/calendar';
import { renderGroupClassesListe } from './pages/group-classes-liste';
import { createGroupClass, updateGroupClassStatus } from './api/group-classes';
import { renderPayments as renderPaymentsPage } from './pages/payments';
import { createPayment, updatePaymentStatus } from './api/payments';
import { handleChat } from './api/chatbot';
import { verifyWhatsAppWebhook, handleWhatsAppWebhook } from './api/whatsapp';
import { renderStatistiques } from './pages/statistiques';
import { renderSessions } from './pages/sessions';
import { renderBookingPage, renderBookingExpired } from './pages/booking';
import { renderSessionPage, renderSessionExpired } from './pages/session';
import { renderStudentPortal, renderStudentAccessDenied } from './pages/student-portal';
import { generateStudentKey } from './api/student';
import { sendBookingInvite, submitBooking } from './api/booking';
import type { User } from '../shared/types';

// ============================================================================
// ENV (Worker entry point - must re-declare for export default)
// ============================================================================

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_SECRET?: string;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_ID?: string;
  RESEND_API_KEY?: string;
  DAILY_API_KEY?: string;
}

// ============================================================================
// PLACEHOLDER PAGE (for routes not yet implemented)
// ============================================================================

function placeholderPage(
  title: string,
  activePage: string,
  icon: string,
  description: string,
  user: User
): string {
  return htmlPage({
    title,
    activePage,
    extraCss: `
      .placeholder-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        text-align: center;
        animation: slideUp 0.5s ease both;
      }
      .placeholder-icon {
        font-size: 72px;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;
      }
      .placeholder-title {
        font-size: 28px;
        font-weight: 800;
        color: var(--gray-900);
        margin-bottom: 10px;
        letter-spacing: -0.5px;
      }
      .placeholder-desc {
        font-size: 16px;
        color: var(--gray-500);
        max-width: 480px;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .placeholder-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border-radius: 30px;
        background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
        color: var(--primary-dark);
        font-size: 13px;
        font-weight: 700;
        animation: pulse 2s ease-in-out infinite;
        box-shadow: 0 4px 12px rgba(109, 203, 221, 0.3);
      }
      .placeholder-decorations {
        position: relative;
        width: 200px;
        height: 100px;
        margin-bottom: 10px;
      }
      .deco-circle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.15;
      }
      .deco-circle:nth-child(1) {
        width: 100px; height: 100px;
        background: var(--secondary);
        top: 0; left: 20%;
        animation: float 4s ease-in-out infinite;
      }
      .deco-circle:nth-child(2) {
        width: 60px; height: 60px;
        background: var(--primary);
        top: 30px; right: 10%;
        animation: float 5s ease-in-out infinite;
        animation-delay: 1s;
      }
      .deco-circle:nth-child(3) {
        width: 40px; height: 40px;
        background: var(--warning);
        top: 10px; left: 5%;
        animation: float 3s ease-in-out infinite;
        animation-delay: 0.5s;
      }
    `,
    content: `
      <div class="placeholder-container">
        <div class="placeholder-decorations">
          <div class="deco-circle"></div>
          <div class="deco-circle"></div>
          <div class="deco-circle"></div>
        </div>
        <div class="placeholder-icon">${icon}</div>
        <h1 class="placeholder-title">${title}</h1>
        <p class="placeholder-desc">${description}</p>
        <span class="placeholder-badge">&#128679; En cours de d&eacute;veloppement</span>
      </div>
    `,
    userName: `${user.prenom} ${user.nom}`,
  });
}

// ============================================================================
// ROUTE HELPERS
// ============================================================================

/**
 * Extract an :id parameter from a path pattern like /formateurs/:id
 * Returns the id or null if no match
 */
function matchPath(pathname: string, pattern: string): string | null {
  // pattern examples: '/formateurs/:id', '/cours/:id/edit'
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  if (patternParts.length !== pathParts.length) return null;

  let id: string | null = null;
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === ':id') {
      id = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return id;
}

/**
 * Check if pathname starts with a prefix and return the rest
 */
function pathStartsWith(pathname: string, prefix: string): string | null {
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length);
  }
  return null;
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ==================================================================
      // PUBLIC ROUTES
      // ==================================================================

      // Health check
      if (path === '/health') {
        return jsonResponse({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'production',
        });
      }

      // Setup: create admin user (only if no users exist)
      if (path === '/setup' && method === 'GET') {
        const count = await env.DB.prepare('SELECT COUNT(*) as c FROM users').first<{ c: number }>();
        if (count && count.c > 0) {
          return jsonResponse({ error: 'Admin already exists. Access /login' }, 403);
        }
        const passwordHash = await hashPassword('admin123');
        const id = crypto.randomUUID().replace(/-/g, '');
        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash, role, nom, prenom) VALUES (?, ?, ?, 'admin', 'Admin', 'CallMyProf')"
        ).bind(id, 'admin@callmyprof.com', passwordHash).run();
        return jsonResponse({ success: true, message: 'Admin created. Login: admin@callmyprof.com / admin123. CHANGE PASSWORD IMMEDIATELY.' });
      }

      // Locale detection (used by public pages)
      const locale = detectLocale(request);
      const langParam = url.searchParams.get('lang');
      const langCookie = langParam ? langCookieHeader(langParam as Locale) : undefined;

      // Landing page (public marketing page)
      if (path === '/' && method === 'GET') {
        const html = await renderLanding(env, request);
        const headers: Record<string, string> = {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        };
        if (langCookie) headers['Set-Cookie'] = langCookie;
        return new Response(html, { status: 200, headers });
      }

      // Thank you page
      if (path === '/thanks' && method === 'GET') {
        return htmlResponse(renderThanksPage(locale));
      }

      // Static pages (about, contact, terms, privacy, faq)
      if (path === '/about' && method === 'GET') {
        return htmlResponse(renderAboutPage(locale));
      }
      if (path === '/contact' && method === 'GET') {
        return htmlResponse(renderContactPage(locale));
      }
      if (path === '/terms' && method === 'GET') {
        return htmlResponse(renderTermsPage(locale));
      }
      if (path === '/privacy' && method === 'GET') {
        return htmlResponse(renderPrivacyPage(locale));
      }
      if (path === '/faq' && method === 'GET') {
        return htmlResponse(renderFaqPage(locale));
      }

      // Lead creation (public CTA form)
      if (path === '/api/leads' && method === 'POST') {
        return createLead(env, request);
      }

      // Login page
      if (path === '/login' && method === 'GET') {
        return htmlResponse(renderLoginPage(undefined, locale));
      }

      // Login POST
      if (path === '/login' && method === 'POST') {
        return handleLogin(request, env);
      }

      // Logout
      if (path === '/logout' && method === 'GET') {
        const sessionId = getSessionIdFromRequest(request);
        let cookie = '';
        if (sessionId) {
          cookie = await deleteSession(env.DB, sessionId);
        }
        return redirectResponse('/login', cookie || undefined);
      }

      // Onboarding (public - formateur self-registration)
      if (path === '/onboarding' && method === 'GET') {
        const html = await renderOnboarding(env);
        return htmlResponse(html);
      }

      // Public chatbot API
      if (path === '/api/chat' && method === 'POST') {
        return handleChat(env, request);
      }

      // Public booking page (GET /book/:token)
      if (path.startsWith('/book/') && method === 'GET') {
        const token = path.split('/book/')[1];
        if (token) {
          // Look up token to get lead info
          const tokenRow = await env.DB.prepare(
            "SELECT bt.*, l.prenom, l.preferred_language, l.detected_locale FROM booking_tokens bt JOIN leads l ON l.id = bt.lead_id WHERE bt.token = ? AND bt.used = 0 AND bt.expires_at > datetime('now')"
          ).bind(token).first<{ lead_id: string; prenom: string; preferred_language: string; detected_locale: string }>();

          if (!tokenRow) {
            return new Response(renderBookingExpired(locale), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }

          const bookingLocale = (tokenRow.preferred_language || tokenRow.detected_locale || 'en') as 'en' | 'fr' | 'ar';
          return new Response(
            renderBookingPage(token, tokenRow.prenom, bookingLocale),
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      // Submit booking (public API)
      if (path === '/api/booking' && method === 'POST') {
        return submitBooking(env, request);
      }

      // Video session page (public - embedded iframe)
      // GET /session/:bookingId?t=token
      if (path.startsWith('/session/') && method === 'GET') {
        const bookingId = path.split('/session/')[1];
        if (bookingId) {
          const booking = await env.DB.prepare(
            "SELECT b.*, l.prenom FROM bookings b LEFT JOIN leads l ON l.id = b.lead_id WHERE b.id = ?"
          ).bind(bookingId).first<{ id: string; lead_id: string; booking_date: string; booking_time: string; video_provider: string; video_room_url: string; video_host_url: string; video_room_name: string; prenom: string }>();

          if (!booking || !booking.video_room_url) {
            return new Response(renderSessionExpired(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }

          const queryToken = url.searchParams.get('t') || undefined;
          const isHost = url.searchParams.get('role') === 'host';

          return new Response(
            renderSessionPage({
              bookingId: booking.id,
              provider: (booking.video_provider || 'jitsi') as 'daily' | 'jitsi',
              roomUrl: isHost && booking.video_host_url ? booking.video_host_url : booking.video_room_url,
              token: queryToken,
              studentName: booking.prenom,
              date: booking.booking_date,
              time: booking.booking_time,
            }),
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      // Demo session pages (for testing - no DB required)
      if (path === '/session-demo/daily' && method === 'GET') {
        return new Response(
          renderSessionPage({
            bookingId: 'demo-daily',
            provider: 'daily',
            roomUrl: 'https://callmyprof.daily.co/cmp-test-20260318',
            token: url.searchParams.get('t') || undefined,
            studentName: 'Demo Student',
            date: '2026-03-19',
            time: '14:00',
          }),
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      if (path === '/session-demo/jitsi' && method === 'GET') {
        return new Response(
          renderSessionPage({
            bookingId: 'demo-jitsi',
            provider: 'jitsi',
            roomUrl: 'https://meet.jit.si/callmyprof-demo-test-20260318',
            studentName: 'Demo Student',
            date: '2026-03-19',
            time: '14:00',
          }),
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // Student portal (public, magic-link authenticated)
      // GET /student/:leadId?key=xxx
      if (path.startsWith('/student/') && method === 'GET') {
        const leadId = path.split('/student/')[1];
        if (leadId) {
          const lead = await env.DB.prepare(
            "SELECT id, prenom, nom, email, telephone, country_code, preferred_language, detected_locale FROM leads WHERE id = ?"
          ).bind(leadId).first<{ id: string; prenom: string; nom: string; email: string; telephone: string; country_code: string; preferred_language: string; detected_locale: string }>();

          if (!lead) {
            return new Response(renderStudentAccessDenied(), { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }

          const expectedKey = await generateStudentKey(lead.id, lead.email);
          const providedKey = url.searchParams.get('key') || '';

          if (providedKey !== expectedKey) {
            return new Response(renderStudentAccessDenied(), { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }

          const now = new Date().toISOString().split('T')[0];
          const bookings = await env.DB.prepare(
            "SELECT id, booking_date, booking_time, video_provider, video_room_url, statut FROM bookings WHERE lead_id = ? ORDER BY booking_date ASC, booking_time ASC"
          ).bind(leadId).all<{ id: string; booking_date: string; booking_time: string; video_provider: string; video_room_url: string; statut: string }>();

          const allBookings = bookings.results || [];
          const upcoming = allBookings.filter(b => b.booking_date >= now);
          const past = allBookings.filter(b => b.booking_date < now).reverse();

          return new Response(
            renderStudentPortal({
              leadId: lead.id,
              prenom: lead.prenom,
              nom: lead.nom,
              email: lead.email,
              telephone: lead.telephone,
              country_code: lead.country_code,
              preferred_language: lead.preferred_language || lead.detected_locale || 'en',
              accessKey: expectedKey,
              upcomingSessions: upcoming,
              pastSessions: past,
            }),
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      // WhatsApp webhook verification
      if (path === '/api/webhooks/whatsapp' && method === 'GET') {
        return verifyWhatsAppWebhook(url);
      }

      // WhatsApp incoming message webhook
      if (path === '/api/webhooks/whatsapp' && method === 'POST') {
        return handleWhatsAppWebhook(env, request);
      }

      // Public catalogue API (for onboarding dropdowns)
      if (path === '/api/catalogue/domaines' && method === 'GET') {
        return getCatalogueTree(env);
      }

      // Onboarding API: register (POST /api/onboarding/register)
      if (path === '/api/onboarding/register' && method === 'POST') {
        return registerFormateur(env, request);
      }

      // Onboarding API: get state (GET /api/onboarding/:id)
      {
        const onboardingGetId = matchPath(path, '/api/onboarding/:id');
        if (onboardingGetId && method === 'GET') {
          return getOnboardingState(env, onboardingGetId);
        }
      }

      // Onboarding API: update step (PUT /api/onboarding/:id)
      {
        const onboardingPutId = matchPath(path, '/api/onboarding/:id');
        if (onboardingPutId && method === 'PUT') {
          return updateOnboarding(env, onboardingPutId, request);
        }
      }

      // Onboarding API: upload document (POST /api/onboarding/:id/documents)
      {
        const onboardingDocId = matchPath(path, '/api/onboarding/:id/documents');
        if (onboardingDocId && method === 'POST') {
          return uploadDocument(env, onboardingDocId, request);
        }
      }

      // Onboarding API: submit (POST /api/onboarding/:id/submit)
      {
        const onboardingSubmitId = matchPath(path, '/api/onboarding/:id/submit');
        if (onboardingSubmitId && method === 'POST') {
          return submitOnboarding(env, onboardingSubmitId);
        }
      }

      // ==================================================================
      // AUTHENTICATED ROUTES - All require auth
      // ==================================================================

      let user: User;
      try {
        user = await requireAuth(request, env);
      } catch (response) {
        // requireAuth throws a Response (redirect to /login)
        if (response instanceof Response) {
          return response;
        }
        return redirectResponse('/login');
      }

      const userName = `${user.prenom} ${user.nom}`;

      // ---- Test Email (admin only) ----
      // Usage: POST /api/test-email { "to": "email@example.com", "lang": "fr" }
      if (path === '/api/test-email' && method === 'POST') {
        const body = await request.json() as { to?: string; lang?: string };
        const to = body.to || user.email;
        const lang = body.lang || 'en';
        const template = testEmail(lang);
        const result = await sendEmail(env, {
          to,
          subject: template.subject,
          html: template.html,
          locale: lang,
        });
        return jsonResponse(result);
      }

      // ---- Dashboard ----
      if (path === '/dashboard' && method === 'GET') {
        const html = await renderDashboard(env, user);
        return htmlResponse(html);
      }

      // ---- Formateurs list ----
      if (path === '/formateurs' && method === 'GET') {
        const html = await renderFormateursListe(env, url, userName);
        return htmlResponse(html);
      }

      // Formateur detail page
      {
        const fmtDetailId = matchPath(path, '/formateurs/:id');
        if (fmtDetailId && method === 'GET') {
          const html = await renderFormateurDetail(env, fmtDetailId, userName);
          return htmlResponse(html);
        }
      }

      // Formateur status change API (PUT /api/formateurs/:id/status)
      {
        const fmtStatusId = matchPath(path, '/api/formateurs/:id/status');
        if (fmtStatusId && method === 'PUT') {
          return updateFormateurStatus(env, fmtStatusId, request);
        }
      }

      // Formateur update API (PUT /api/formateurs/:id)
      {
        const fmtUpdateId = matchPath(path, '/api/formateurs/:id');
        if (fmtUpdateId && method === 'PUT') {
          return updateFormateur(env, fmtUpdateId, request);
        }
      }

      // ---- Familles ----
      if (path === '/familles' && method === 'GET') {
        const html = await renderFamillesListe(env, url, userName);
        return htmlResponse(html);
      }

      if (path === '/familles/new' && method === 'GET') {
        const html = await renderFamilleForm(env, userName);
        return htmlResponse(html);
      }

      if (path === '/api/familles' && method === 'POST') {
        return createFamille(env, request);
      }

      // Famille enfant creation API (POST /api/familles/:id/enfants)
      {
        const enfantFamilleId = matchPath(path, '/api/familles/:id/enfants');
        if (enfantFamilleId && method === 'POST') {
          return createEnfant(env, enfantFamilleId, request);
        }
      }

      // Famille detail
      {
        const familleId = matchPath(path, '/familles/:id');
        if (familleId && method === 'GET') {
          const html = await renderFamilleDetail(env, familleId, userName);
          return htmlResponse(html);
        }
      }

      // ---- Leads (admin) ----
      if (path === '/leads' && method === 'GET') {
        const html = await renderLeadsListe(env, url, userName);
        return htmlResponse(html);
      }

      // Lead detail page
      {
        const leadDetailId = matchPath(path, '/leads/:id');
        if (leadDetailId && method === 'GET') {
          const html = await renderLeadDetail(env, leadDetailId, userName);
          return htmlResponse(html);
        }
      }

      // Lead status update API (PUT /api/leads/:id/status)
      {
        const leadStatusId = matchPath(path, '/api/leads/:id/status');
        if (leadStatusId && method === 'PUT') {
          return updateLeadStatus(env, leadStatusId, request);
        }
      }

      // Send booking email to lead (POST /api/leads/:id/send-booking)
      {
        const sendBookingId = matchPath(path, '/api/leads/:id/send-booking');
        if (sendBookingId && method === 'POST') {
          return sendBookingInvite(env, sendBookingId);
        }
      }

      // ---- Sessions (video) ----
      if (path === '/sessions' && method === 'GET') {
        const html = await renderSessions(env, userName);
        return htmlResponse(html);
      }

      // ---- Calendar ----
      if (path === '/calendar' && method === 'GET') {
        const html = await renderCalendar(env, url, userName);
        return htmlResponse(html);
      }

      // Calendar API: create slot
      if (path === '/api/calendar/slots' && method === 'POST') {
        return createSlot(env, request);
      }

      // Calendar API: update slot (PUT /api/calendar/slots/:id)
      {
        const slotUpdateId = matchPath(path, '/api/calendar/slots/:id');
        if (slotUpdateId && method === 'PUT') {
          return updateSlot(env, slotUpdateId, request);
        }
        if (slotUpdateId && method === 'DELETE') {
          return deleteSlot(env, slotUpdateId);
        }
      }

      // ---- Group Classes ----
      if (path === '/group-classes' && method === 'GET') {
        const html = await renderGroupClassesListe(env, url, userName);
        return htmlResponse(html);
      }

      // Group class API: create
      if (path === '/api/group-classes' && method === 'POST') {
        return createGroupClass(env, request);
      }

      // Group class API: update (PUT /api/group-classes/:id)
      {
        const gcUpdateId = matchPath(path, '/api/group-classes/:id');
        if (gcUpdateId && method === 'PUT') {
          return updateGroupClassStatus(env, gcUpdateId, request);
        }
      }

      // ---- Payments ----
      if (path === '/payments' && method === 'GET') {
        const html = await renderPaymentsPage(env, url, userName);
        return htmlResponse(html);
      }

      // Payment API: create
      if (path === '/api/payments' && method === 'POST') {
        return createPayment(env, request);
      }

      // Payment API: update status (PUT /api/payments/:id)
      {
        const paymentUpdateId = matchPath(path, '/api/payments/:id');
        if (paymentUpdateId && method === 'PUT') {
          return updatePaymentStatus(env, paymentUpdateId, request);
        }
      }

      // ---- Catalogue ----
      if (path === '/catalogue' && method === 'GET') {
        const html = await renderCatalogue(env, userName);
        return htmlResponse(html);
      }

      // Catalogue API: create domaine
      if (path === '/api/catalogue/domaines' && method === 'POST') {
        return createDomaine(env, request);
      }

      // Catalogue API: update domaine (PUT /api/catalogue/domaines/:id)
      {
        const domaineUpdateId = matchPath(path, '/api/catalogue/domaines/:id');
        if (domaineUpdateId && method === 'PUT') {
          return updateDomaine(env, domaineUpdateId, request);
        }
      }

      // Catalogue API: create sous-domaine
      if (path === '/api/catalogue/sous-domaines' && method === 'POST') {
        return createSousDomaine(env, request);
      }

      // Catalogue API: update sous-domaine (PUT /api/catalogue/sous-domaines/:id)
      {
        const sdUpdateId = matchPath(path, '/api/catalogue/sous-domaines/:id');
        if (sdUpdateId && method === 'PUT') {
          return updateSousDomaine(env, sdUpdateId, request);
        }
      }

      // Catalogue API: create thematique
      if (path === '/api/catalogue/thematiques' && method === 'POST') {
        return createThematique(env, request);
      }

      // Catalogue API: update thematique (PUT /api/catalogue/thematiques/:id)
      {
        const thUpdateId = matchPath(path, '/api/catalogue/thematiques/:id');
        if (thUpdateId && method === 'PUT') {
          return updateThematique(env, thUpdateId, request);
        }
      }

      // Catalogue API: toggle actif (POST /api/catalogue/toggle/:type/:id)
      {
        const toggleMatch = path.match(/^\/api\/catalogue\/toggle\/([^/]+)\/([^/]+)$/);
        if (toggleMatch && method === 'POST') {
          return toggleActif(env, toggleMatch[1], toggleMatch[2]);
        }
      }

      // ---- Cours ----
      if (path === '/cours' && method === 'GET') {
        const html = await renderCoursListe(env, url, userName);
        return htmlResponse(html);
      }

      if (path === '/cours/new' && method === 'GET') {
        const html = await renderCoursForm(env, userName);
        return htmlResponse(html);
      }

      if (path === '/api/cours' && method === 'POST') {
        return createCours(env, request);
      }

      // Cours statut change API (POST /api/cours/:id/statut)
      {
        const coursStatutId = matchPath(path, '/api/cours/:id/statut');
        if (coursStatutId && method === 'POST') {
          return updateCoursStatut(env, coursStatutId, request);
        }
      }

      // Cours terminer API (POST /api/cours/:id/terminer)
      {
        const coursTerminerId = matchPath(path, '/api/cours/:id/terminer');
        if (coursTerminerId && method === 'POST') {
          return terminerCours(env, coursTerminerId, request);
        }
      }

      // Cours detail (must be AFTER /cours/new and /api/cours routes)
      {
        const coursId = matchPath(path, '/cours/:id');
        if (coursId && method === 'GET') {
          const html = await renderCoursDetail(env, coursId, userName);
          return htmlResponse(html);
        }
      }

      // ---- Packages ----
      if (path === '/packages' && method === 'GET') {
        const html = await renderPackages(env, url, userName);
        return htmlResponse(html);
      }

      if (path === '/api/packages' && method === 'POST') {
        return createPackage(env, request);
      }

      // Package type update API (POST /api/packages/types/:id)
      {
        const pkgTypeUpdateId = matchPath(path, '/api/packages/types/:id');
        if (pkgTypeUpdateId && method === 'POST') {
          return updatePackageType(env, pkgTypeUpdateId, request);
        }
      }

      // ---- Avis ----
      if (path === '/avis' && method === 'GET') {
        const html = await renderAvis(env, url);
        return htmlResponse(html);
      }

      // Avis toggle visibility API (POST /api/avis/:id/toggle)
      {
        const avisToggleId = matchPath(path, '/api/avis/:id/toggle');
        if (avisToggleId && method === 'POST') {
          return toggleAvisVisibility(env, avisToggleId);
        }
      }

      // ---- Statistiques ----
      if (path === '/statistiques' && method === 'GET') {
        const html = await renderStatistiques(env, url);
        return htmlResponse(html);
      }

      // ==================================================================
      // 404 - Not Found
      // ==================================================================

      return htmlResponse(htmlPage({
        title: 'Page introuvable',
        activePage: '',
        extraCss: `
          .not-found {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            text-align: center;
            animation: slideUp 0.5s ease both;
          }
          .not-found-code {
            font-size: 120px;
            font-weight: 800;
            color: var(--gray-200);
            line-height: 1;
            letter-spacing: -5px;
            animation: pulse 3s ease-in-out infinite;
          }
          .not-found-icon {
            font-size: 64px;
            margin: 16px 0;
            animation: float 3s ease-in-out infinite;
          }
          .not-found-title {
            font-size: 22px;
            font-weight: 700;
            color: var(--gray-700);
            margin-bottom: 8px;
          }
          .not-found-desc {
            font-size: 15px;
            color: var(--gray-500);
            margin-bottom: 24px;
          }
        `,
        content: `
          <div class="not-found">
            <div class="not-found-code">404</div>
            <div class="not-found-icon">&#128270;</div>
            <h2 class="not-found-title">Page introuvable</h2>
            <p class="not-found-desc">La page que vous cherchez n'existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;e.</p>
            <a href="/dashboard" class="btn btn-primary btn-lg">
              &#127968; Retour au Dashboard
            </a>
          </div>
        `,
        userName,
      }), 404);

    } catch (error) {
      // ==================================================================
      // 500 - Internal Server Error
      // ==================================================================
      console.error('Unhandled error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';

      return htmlResponse(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .error-box {
      text-align: center;
      max-width: 500px;
      animation: slideUp 0.5s ease both;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .error-icon { font-size: 72px; margin-bottom: 20px; display: block; }
    @keyframes f { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .error-icon { animation: f 3s ease-in-out infinite; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    p { font-size: 15px; color: #64748b; margin-bottom: 24px; line-height: 1.6; }
    a {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; border-radius: 10px;
      background: linear-gradient(135deg, #0d3865, #1a4f8a);
      color: #fff; text-decoration: none; font-weight: 600;
      transition: all 0.2s ease;
    }
    a:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,56,101,0.3); }
  </style>
</head>
<body>
  <div class="error-box">
    <span class="error-icon">&#9888;&#65039;</span>
    <h1>Oups, une erreur est survenue</h1>
    <p>Quelque chose ne s'est pas pass&eacute; comme pr&eacute;vu. Veuillez r&eacute;essayer ou contacter le support.</p>
    <a href="/dashboard">&#127968; Retour au Dashboard</a>
  </div>
</body>
</html>`, 500);
    }
  },

  // ============================================================================
  // CRON: Session reminders (every 15 minutes)
  // Sends email reminders for sessions starting in ~1 hour
  // ============================================================================
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];

    // Find bookings today where time is ~1h from now (within 15min window)
    const bookings = await env.DB.prepare(`
      SELECT b.id, b.booking_date, b.booking_time, b.reminder_sent,
             l.prenom, l.email, l.preferred_language, l.detected_locale
      FROM bookings b
      JOIN leads l ON l.id = b.lead_id
      WHERE b.booking_date = ?
        AND b.reminder_sent IS NULL
        AND l.email IS NOT NULL
    `).bind(todayStr).all<{
      id: string; booking_date: string; booking_time: string; reminder_sent: string | null;
      prenom: string; email: string; preferred_language: string; detected_locale: string;
    }>();

    for (const booking of (bookings.results || [])) {
      const sessionTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
      const diffMs = sessionTime.getTime() - now.getTime();

      // Send reminder if session is 45-75 min away
      if (diffMs > 45 * 60 * 1000 && diffMs < 75 * 60 * 1000) {
        const lang = booking.preferred_language || booking.detected_locale || 'en';
        const sessionUrl = `https://callmyprof.com/session/${booking.id}`;
        const reminder = sessionReminderEmail({
          prenom: booking.prenom,
          date: booking.booking_date,
          time: booking.booking_time,
          sessionUrl,
          lang,
        });

        await sendEmail(env, {
          to: booking.email,
          subject: reminder.subject,
          html: reminder.html,
          locale: lang,
        });

        // Mark as sent
        await env.DB.prepare(
          "UPDATE bookings SET reminder_sent = datetime('now') WHERE id = ?"
        ).bind(booking.id).run();

        console.log(`Reminder sent for booking ${booking.id} to ${booking.email}`);
      }
    }
  },
};
