/**
 * CallMyProf - Admin Lead Detail Page
 * View lead info, change status, schedule callbacks, convert to student
 */

import type { Env, Lead, Booking } from '../../shared/types';
import { htmlPage, escapeHtml, formatDate } from '../../shared/html-utils';
import { getLead } from '../api/leads';

// ============================================================================
// CSS
// ============================================================================

const PAGE_CSS = `
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--gray-500);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 20px;
    text-decoration: none;
    transition: color 0.2s;
  }
  .back-link:hover { color: var(--primary); }

  .lead-header {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 28px;
    border: 1px solid var(--gray-100);
    margin-bottom: 24px;
    animation: slideUp 0.4s ease both;
  }
  .lead-avatar {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: #fff;
    font-size: 24px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .lead-info h2 {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 4px;
  }
  .lead-info .lead-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--gray-500);
  }
  .lead-info .lead-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .lead-actions {
    margin-left: auto;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .lead-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
  @media (max-width: 900px) {
    .lead-grid { grid-template-columns: 1fr; }
    .lead-header { flex-direction: column; }
    .lead-actions { margin-left: 0; }
  }

  .detail-card {
    background: var(--white);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-100);
    overflow: hidden;
    animation: slideUp 0.5s ease both;
  }
  .detail-card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--gray-100);
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .detail-card-body {
    padding: 20px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--gray-50);
    font-size: 14px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label {
    color: var(--gray-500);
    font-weight: 500;
  }
  .info-value {
    color: var(--gray-900);
    font-weight: 600;
    text-align: right;
  }

  /* Status change buttons */
  .status-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .status-btn {
    width: 100%;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    border: 1.5px solid;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--white);
  }
  .status-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  .status-btn.btn-contacted { border-color: var(--warning); color: #92400e; }
  .status-btn.btn-contacted:hover { background: var(--warning-light); }
  .status-btn.btn-qualified { border-color: var(--purple); color: #5b21b6; }
  .status-btn.btn-qualified:hover { background: var(--purple-light); }
  .status-btn.btn-converted { border-color: var(--success); color: #065f46; }
  .status-btn.btn-converted:hover { background: var(--success-light); }
  .status-btn.btn-lost { border-color: var(--danger); color: #991b1b; }
  .status-btn.btn-lost:hover { background: var(--danger-light); }

  /* Callback form */
  .callback-form {
    margin-top: 16px;
    padding: 16px;
    background: var(--gray-50);
    border-radius: var(--radius-sm);
  }
  .callback-form label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 6px;
  }
  .callback-form input,
  .callback-form textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    margin-bottom: 12px;
    outline: none;
  }
  .callback-form input:focus,
  .callback-form textarea:focus {
    border-color: var(--primary);
  }
  .callback-form textarea {
    min-height: 80px;
    resize: vertical;
  }

  /* Status badges */
  .badge-new { background: var(--blue-light); color: #1e40af; border: 1px solid #93c5fd; }
  .badge-contacted { background: var(--warning-light); color: #92400e; border: 1px solid #fde68a; }
  .badge-qualified { background: var(--purple-light); color: #5b21b6; border: 1px solid #c4b5fd; }
  .badge-converted { background: var(--success-light); color: #065f46; border: 1px solid #a7f3d0; }
  .badge-lost { background: var(--danger-light); color: #991b1b; border: 1px solid #fca5a5; }

  /* Timeline */
  .timeline-empty {
    text-align: center;
    padding: 24px;
    color: var(--gray-400);
    font-size: 14px;
  }

  /* Video room card */
  .video-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .video-badge.daily { background: #eff6ff; color: #1e40af; border: 1px solid #93c5fd; }
  .video-badge.jitsi { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }

  .video-link-box {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
  }
  .video-link-box a {
    color: var(--primary);
    font-size: 12px;
    word-break: break-all;
    text-decoration: none;
  }
  .video-link-box a:hover { text-decoration: underline; }
  .video-link-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--gray-500);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(statut: string): string {
  const labels: Record<string, string> = {
    new: '&#127381; New',
    contacted: '&#128222; Contacted',
    qualified: '&#11088; Qualified',
    converted: '&#9989; Converted',
    lost: '&#10060; Lost',
  };
  return `<span class="badge badge-${statut}">${labels[statut] || statut}</span>`;
}

// ============================================================================
// RENDER
// ============================================================================

export async function renderLeadDetail(env: Env, leadId: string, userName?: string): Promise<string> {
  const lead = await getLead(env, leadId);

  if (!lead) {
    return htmlPage({
      title: 'Lead Not Found',
      activePage: 'leads',
      content: `
        <a href="/leads" class="back-link">&#8592; Back to Leads</a>
        <div class="empty-state">
          <span class="empty-icon">&#128533;</span>
          <div class="empty-title">Lead not found</div>
          <div class="empty-text">This lead may have been deleted.</div>
        </div>`,
      userName,
    });
  }

  const initials = ((lead.prenom?.[0] || '') + (lead.nom?.[0] || '')).toUpperCase();

  // Get domaine name if set
  let domaineName = '';
  if (lead.domaine_id) {
    const domaine = await env.DB.prepare('SELECT nom, nom_en FROM domaines WHERE id = ?').bind(lead.domaine_id).first<{ nom: string; nom_en?: string }>();
    domaineName = domaine?.nom_en || domaine?.nom || '';
  }

  // Get bookings for this lead (with video info)
  const bookings = await env.DB.prepare(
    'SELECT * FROM bookings WHERE lead_id = ? ORDER BY booking_date DESC, booking_time DESC'
  ).bind(leadId).all<Booking>();
  const leadBookings = bookings.results || [];

  const content = `
    <a href="/leads" class="back-link">&#8592; Back to Leads</a>

    <!-- Lead Header -->
    <div class="lead-header">
      <div class="lead-avatar">${initials}</div>
      <div class="lead-info">
        <h2>${escapeHtml(lead.prenom)} ${escapeHtml(lead.nom)}</h2>
        <div class="lead-meta">
          <span>&#9993; ${escapeHtml(lead.email)}</span>
          <span>&#128222; ${escapeHtml(lead.country_code)} ${escapeHtml(lead.telephone)}</span>
          <span>&#127760; ${escapeHtml(lead.country || 'N/A')}</span>
          <span>&#128483; ${escapeHtml(lead.preferred_language || lead.detected_locale || 'en')}</span>
        </div>
      </div>
      <div class="lead-actions">
        ${statusBadge(lead.statut)}
      </div>
    </div>

    <div class="lead-grid">
      <!-- Left Column -->
      <div>
        <!-- Contact Info -->
        <div class="detail-card" style="margin-bottom:20px">
          <div class="detail-card-header">&#128203; Lead Information</div>
          <div class="detail-card-body">
            <div class="info-row">
              <span class="info-label">Full Name</span>
              <span class="info-value">${escapeHtml(lead.prenom)} ${escapeHtml(lead.nom)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${escapeHtml(lead.email)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">${escapeHtml(lead.country_code)} ${escapeHtml(lead.telephone)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Country</span>
              <span class="info-value">${escapeHtml(lead.country || '-')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service Type</span>
              <span class="info-value">${escapeHtml(lead.service_type)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Subject</span>
              <span class="info-value">${escapeHtml(domaineName || lead.subject_description || '-')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Level</span>
              <span class="info-value">${escapeHtml(lead.level || '-')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Preferred Language</span>
              <span class="info-value">${escapeHtml(({'en':'English','fr':'Fran\u00e7ais','ar':'\u0639\u0631\u0628\u064a','es':'Espa\u00f1ol','de':'Deutsch'} as Record<string,string>)[lead.preferred_language || ''] || lead.preferred_language || '-')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Preferred Schedule</span>
              <span class="info-value">${escapeHtml(lead.preferred_schedule || '-')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created</span>
              <span class="info-value">${formatDate(lead.created_at)}</span>
            </div>
            ${lead.utm_source ? `
            <div class="info-row">
              <span class="info-label">UTM Source</span>
              <span class="info-value">${escapeHtml(lead.utm_source)}${lead.utm_medium ? ' / ' + escapeHtml(lead.utm_medium) : ''}${lead.utm_campaign ? ' / ' + escapeHtml(lead.utm_campaign) : ''}</span>
            </div>` : ''}
          </div>
        </div>

        <!-- Callback Notes -->
        <div class="detail-card">
          <div class="detail-card-header">&#128221; Callback Notes</div>
          <div class="detail-card-body">
            ${lead.callback_date ? `
              <div class="info-row">
                <span class="info-label">Callback Date</span>
                <span class="info-value">${formatDate(lead.callback_date)}</span>
              </div>` : ''}
            ${lead.callback_notes
              ? `<p style="font-size:14px;color:var(--gray-700);line-height:1.6;white-space:pre-wrap">${escapeHtml(lead.callback_notes)}</p>`
              : `<div class="timeline-empty">No callback notes yet. Schedule a callback from the sidebar.</div>`
            }
          </div>
        </div>
      </div>

      <!-- Right Column - Actions -->
      <div>
        <!-- Status Change -->
        <div class="detail-card" style="margin-bottom:20px">
          <div class="detail-card-header">&#9881; Change Status</div>
          <div class="detail-card-body">
            <div class="status-actions">
              ${lead.statut !== 'contacted' ? `<button class="status-btn btn-contacted" onclick="updateStatus('contacted')">&#128222; Mark as Contacted</button>` : ''}
              ${lead.statut !== 'qualified' ? `<button class="status-btn btn-qualified" onclick="updateStatus('qualified')">&#11088; Mark as Qualified</button>` : ''}
              ${lead.statut !== 'converted' ? `<button class="status-btn btn-converted" onclick="updateStatus('converted')">&#9989; Convert to Student</button>` : ''}
              ${lead.statut !== 'lost' ? `<button class="status-btn btn-lost" onclick="updateStatus('lost')">&#10060; Mark as Lost</button>` : ''}
            </div>
          </div>
        </div>

        <!-- Send Booking Email -->
        <div class="detail-card" style="margin-bottom:20px">
          <div class="detail-card-header">&#9993; Send Booking Email</div>
          <div class="detail-card-body">
            <p style="font-size:13px;color:var(--gray-600);margin-bottom:12px">
              Send an email to <strong>${escapeHtml(lead.email)}</strong> with a link to book a free consultation call.
            </p>
            <button class="btn btn-sm btn-primary" style="width:100%;background:linear-gradient(135deg,#DC2626,#ef4444);border:none" onclick="sendBookingEmail()" id="emailBtn">
              &#128232; Send Booking Invite
            </button>
            <div id="emailResult" style="margin-top:10px;display:none;padding:10px;border-radius:8px;font-size:13px;text-align:center"></div>
          </div>
        </div>

        <!-- Video Sessions -->
        ${leadBookings.length > 0 ? `
        <div class="detail-card" style="margin-bottom:20px">
          <div class="detail-card-header">&#127909; Video Sessions</div>
          <div class="detail-card-body">
            ${leadBookings.map(b => `
              <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--gray-100)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <strong style="font-size:14px">${escapeHtml(b.booking_date)} ${escapeHtml(b.booking_time)}</strong>
                  ${b.video_provider ? `<span class="video-badge ${b.video_provider}">${b.video_provider === 'daily' ? '&#127909; Daily.co' : '&#128249; Jitsi'}</span>` : ''}
                </div>
                ${b.video_host_url ? `
                  <div class="video-link-box">
                    <div class="video-link-label">&#128101; Admin / Tutor Link</div>
                    <a href="${escapeHtml(b.video_host_url)}" target="_blank">${escapeHtml(b.video_host_url).slice(0, 60)}...</a>
                  </div>
                ` : ''}
                ${b.video_room_url ? `
                  <div class="video-link-box" style="margin-top:6px">
                    <div class="video-link-label">&#127891; Student Link</div>
                    <a href="${escapeHtml(b.video_room_url)}" target="_blank">${escapeHtml(b.video_room_url).slice(0, 60)}...</a>
                  </div>
                ` : ''}
                ${!b.video_provider ? `<p style="color:var(--gray-400);font-size:13px;text-align:center;margin:8px 0 0">No video room created</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Schedule Callback -->
        <div class="detail-card">
          <div class="detail-card-header">&#128197; Schedule Callback</div>
          <div class="detail-card-body">
            <form class="callback-form" onsubmit="saveCallback(event)">
              <label>Callback Date</label>
              <input type="datetime-local" id="callback_date" value="${lead.callback_date ? lead.callback_date.replace(' ', 'T').slice(0, 16) : ''}">
              <label>Notes</label>
              <textarea id="callback_notes" placeholder="Add notes about this lead...">${escapeHtml(lead.callback_notes || '')}</textarea>
              <button type="submit" class="btn btn-sm btn-primary" style="width:100%">&#128190; Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <script>
      function sendBookingEmail() {
        var btn = document.getElementById('emailBtn');
        var result = document.getElementById('emailResult');
        btn.disabled = true;
        btn.textContent = 'Sending...';
        fetch('/api/leads/${lead.id}/send-booking', { method: 'POST' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          result.style.display = 'block';
          if (data.success) {
            result.style.background = '#f0fdf4';
            result.style.color = '#166534';
            result.innerHTML = '&#9989; Email sent! Booking link:<br><a href="' + data.bookingUrl + '" target="_blank" style="color:#DC2626;word-break:break-all">' + data.bookingUrl + '</a>';
            btn.textContent = '&#9989; Sent';
          } else {
            result.style.background = '#fef2f2';
            result.style.color = '#991b1b';
            result.textContent = data.error || 'Failed to send email';
            btn.disabled = false;
            btn.innerHTML = '&#128232; Retry';
          }
        })
        .catch(function() {
          result.style.display = 'block';
          result.style.background = '#fef2f2';
          result.style.color = '#991b1b';
          result.textContent = 'Network error';
          btn.disabled = false;
          btn.innerHTML = '&#128232; Retry';
        });
      }

      function updateStatus(newStatus) {
        if (!confirm('Change status to ' + newStatus + '?')) return;
        fetch('/api/leads/${lead.id}/status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: newStatus })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) {
            window.location.reload();
          } else {
            alert(data.error || 'Failed to update status');
          }
        });
      }

      function saveCallback(e) {
        e.preventDefault();
        var callbackDate = document.getElementById('callback_date').value;
        var notes = document.getElementById('callback_notes').value;
        fetch('/api/leads/${lead.id}/status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_date: callbackDate || null,
            callback_notes: notes || null
          })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) {
            window.location.reload();
          } else {
            alert(data.error || 'Failed to save');
          }
        });
      }
    </script>
  `;

  return htmlPage({
    title: `${lead.prenom} ${lead.nom} - Lead`,
    activePage: 'leads',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
