/**
 * CallMyProf - Sessions Dashboard (admin)
 * Shows upcoming video sessions with join buttons, status, countdown
 */

import { htmlPage } from '../../shared/html-utils';
import type { Env } from '../../shared/types';

interface SessionRow {
  id: string;
  lead_id: string;
  booking_date: string;
  booking_time: string;
  video_provider: string;
  video_room_url: string;
  video_host_url: string;
  video_room_name: string;
  lead_prenom: string;
  lead_nom: string;
  lead_email: string;
  utm_source: string | null;
}

const SESSIONS_CSS = `
  .sessions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .sessions-header h1 {
    font-size: 26px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.5px;
  }
  .sessions-stats {
    display: flex;
    gap: 12px;
  }
  .stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }
  .stat-chip.upcoming { background: rgba(59,130,246,0.1); color: #3b82f6; }
  .stat-chip.today { background: rgba(220,38,38,0.1); color: #DC2626; }
  .stat-chip.past { background: rgba(100,116,139,0.1); color: #64748b; }

  .session-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border: 1px solid var(--gray-100);
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.2s ease;
    animation: slideUp 0.4s ease both;
  }
  .session-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }
  .session-card.is-today { border-left: 4px solid #DC2626; }
  .session-card.is-past { opacity: 0.6; }

  .session-card-inner {
    display: flex;
    align-items: center;
    padding: 20px 24px;
    gap: 20px;
  }
  .session-date-box {
    text-align: center;
    min-width: 64px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--gray-50);
  }
  .session-date-box.today { background: linear-gradient(135deg, #DC2626, #ef4444); color: #fff; }
  .session-date-day { font-size: 24px; font-weight: 800; line-height: 1; }
  .session-date-month { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
  .session-date-box.today .session-date-day,
  .session-date-box.today .session-date-month { color: #fff; }

  .session-details { flex: 1; }
  .session-student { font-size: 16px; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; }
  .session-meta { font-size: 13px; color: var(--gray-500); display: flex; gap: 16px; flex-wrap: wrap; }
  .session-meta span { display: inline-flex; align-items: center; gap: 4px; }

  .session-actions { display: flex; gap: 8px; align-items: center; }
  .btn-join {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }
  .btn-join-admin {
    background: linear-gradient(135deg, #DC2626, #ef4444);
    color: #fff;
  }
  .btn-join-admin:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.3); }
  .btn-join-student {
    background: var(--gray-100);
    color: var(--gray-700);
  }
  .btn-join-student:hover { background: var(--gray-200); }
  .btn-copy {
    background: none;
    border: 1px solid var(--gray-200);
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--gray-500);
    transition: all 0.2s;
  }
  .btn-copy:hover { border-color: var(--gray-400); color: var(--gray-700); }

  .provider-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .provider-daily { background: rgba(59,130,246,0.1); color: #3b82f6; }
  .provider-jitsi { background: rgba(34,197,94,0.1); color: #22c55e; }

  .utm-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
  }
  .utm-tiktok { background: rgba(0,0,0,0.08); color: #000; }
  .utm-instagram { background: rgba(225,48,108,0.1); color: #E1306C; }
  .utm-facebook { background: rgba(24,119,242,0.1); color: #1877F2; }
  .utm-google { background: rgba(66,133,244,0.1); color: #4285F4; }
  .utm-organic { background: rgba(34,197,94,0.1); color: #22c55e; }

  .countdown {
    font-size: 13px;
    font-weight: 700;
    color: #DC2626;
    font-variant-numeric: tabular-nums;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--gray-400);
  }
  .empty-state-icon { font-size: 56px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 18px; color: var(--gray-600); margin-bottom: 4px; }
  .empty-state p { font-size: 14px; }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 28px 0 12px;
    padding-left: 4px;
  }
`;

export async function renderSessions(env: Env, userName: string): Promise<string> {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const results = await env.DB.prepare(`
    SELECT b.id, b.lead_id, b.booking_date, b.booking_time,
           b.video_provider, b.video_room_url, b.video_host_url, b.video_room_name,
           l.prenom as lead_prenom, l.nom as lead_nom, l.email as lead_email, l.utm_source
    FROM bookings b
    LEFT JOIN leads l ON l.id = b.lead_id
    ORDER BY b.booking_date ASC, b.booking_time ASC
  `).all<SessionRow>();

  const sessions = results.results || [];
  const todaySessions = sessions.filter(s => s.booking_date === now);
  const upcomingSessions = sessions.filter(s => s.booking_date > now);
  const pastSessions = sessions.filter(s => s.booking_date < now).reverse().slice(0, 10);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function renderCard(s: SessionRow, type: 'today' | 'upcoming' | 'past'): string {
    const d = new Date(s.booking_date + 'T00:00:00');
    const day = d.getDate();
    const month = months[d.getMonth()];
    const isToday = type === 'today';
    const isPast = type === 'past';
    const providerClass = s.video_provider === 'daily' ? 'provider-daily' : 'provider-jitsi';
    const providerLabel = s.video_provider === 'daily' ? 'Daily.co' : 'Jitsi';

    const utmBadge = s.utm_source
      ? `<span class="utm-badge utm-${s.utm_source.toLowerCase()}">${s.utm_source}</span>`
      : `<span class="utm-badge utm-organic">Organic</span>`;

    const sessionUrl = `https://callmyprof.com/session/${s.id}`;
    const hostUrl = `${sessionUrl}?role=host`;

    return `
      <div class="session-card ${isToday ? 'is-today' : ''} ${isPast ? 'is-past' : ''}">
        <div class="session-card-inner">
          <div class="session-date-box ${isToday ? 'today' : ''}">
            <div class="session-date-day">${day}</div>
            <div class="session-date-month">${month}</div>
          </div>
          <div class="session-details">
            <div class="session-student">
              ${s.lead_prenom || 'Student'} ${s.lead_nom || ''}
              ${utmBadge}
            </div>
            <div class="session-meta">
              <span>&#128348; ${s.booking_time}</span>
              <span class="provider-badge ${providerClass}">${providerLabel}</span>
              ${s.lead_email ? `<span>&#9993; ${s.lead_email}</span>` : ''}
              ${isToday ? '<span class="countdown" data-date="' + s.booking_date + '" data-time="' + s.booking_time + '"></span>' : ''}
            </div>
          </div>
          <div class="session-actions">
            ${!isPast ? `
              <a href="${hostUrl}" target="_blank" class="btn-join btn-join-admin">&#127909; Rejoindre</a>
              <button class="btn-copy" onclick="navigator.clipboard.writeText('${sessionUrl}');this.textContent='Copie!';setTimeout(()=>this.textContent='&#128203; Lien etudiant',1500)" title="Copier le lien etudiant">&#128203; Lien etudiant</button>
            ` : `
              <span style="font-size:13px;color:var(--gray-400);">Terminee</span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  const todayHtml = todaySessions.length > 0
    ? todaySessions.map(s => renderCard(s, 'today')).join('')
    : '';

  const upcomingHtml = upcomingSessions.length > 0
    ? upcomingSessions.map(s => renderCard(s, 'upcoming')).join('')
    : '';

  const pastHtml = pastSessions.length > 0
    ? pastSessions.map(s => renderCard(s, 'past')).join('')
    : '';

  const emptyHtml = sessions.length === 0 ? `
    <div class="empty-state">
      <div class="empty-state-icon">&#127909;</div>
      <h3>Aucune session video</h3>
      <p>Les sessions apparaitront ici quand un etudiant reservera un creneau via le booking.</p>
    </div>
  ` : '';

  const content = `
    <div class="sessions-header">
      <h1>&#127909; Sessions Video</h1>
      <div class="sessions-stats">
        <span class="stat-chip today">&#128308; ${todaySessions.length} aujourd'hui</span>
        <span class="stat-chip upcoming">&#128197; ${upcomingSessions.length} a venir</span>
        <span class="stat-chip past">&#9989; ${pastSessions.length} passees</span>
      </div>
    </div>

    ${emptyHtml}

    ${todaySessions.length > 0 ? `<div class="section-title">&#128308; Aujourd'hui</div>${todayHtml}` : ''}
    ${upcomingSessions.length > 0 ? `<div class="section-title">&#128197; A venir</div>${upcomingHtml}` : ''}
    ${pastSessions.length > 0 ? `<div class="section-title">&#9989; Passees</div>${pastHtml}` : ''}

    <script>
      // Countdown timers for today's sessions
      function updateCountdowns() {
        document.querySelectorAll('.countdown').forEach(function(el) {
          var d = el.getAttribute('data-date');
          var t = el.getAttribute('data-time');
          var target = new Date(d + 'T' + t + ':00');
          var now = new Date();
          var diff = target - now;
          if (diff <= 0) {
            el.textContent = 'En cours!';
            el.style.color = '#22c55e';
          } else {
            var h = Math.floor(diff / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            el.textContent = 'Dans ' + h + 'h ' + m + 'min';
          }
        });
      }
      updateCountdowns();
      setInterval(updateCountdowns, 30000);
    </script>
  `;

  return htmlPage({
    title: 'Sessions Video',
    activePage: 'sessions',
    extraCss: SESSIONS_CSS,
    content,
    userName,
  });
}
