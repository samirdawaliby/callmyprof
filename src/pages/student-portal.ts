/**
 * CallMyProf - Student Portal (public, magic-link authenticated)
 * URL: /student/:leadId?key=accessKey
 * Shows upcoming sessions, past sessions, profile info, support links
 */

interface StudentBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  video_provider: string;
  video_room_url: string;
  statut: string;
}

interface StudentData {
  leadId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  country_code: string;
  preferred_language: string;
  accessKey: string;
  upcomingSessions: StudentBooking[];
  pastSessions: StudentBooking[];
}

const PORTAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f4f5f7;
    color: #1e293b;
    min-height: 100vh;
  }
  .portal-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .portal-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    text-decoration: none;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .portal-logo-icon { font-size: 24px; }
  .portal-user {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #94a3b8;
    font-size: 14px;
  }
  .portal-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #DC2626, #ef4444);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
  }
  .portal-content {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px 16px 60px;
  }
  .welcome-card {
    background: linear-gradient(135deg, #DC2626 0%, #b91c1c 100%);
    border-radius: 16px;
    padding: 28px 24px;
    color: #fff;
    margin-bottom: 24px;
    animation: slideUp 0.4s ease both;
  }
  .welcome-card h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .welcome-card p { font-size: 14px; color: rgba(255,255,255,0.8); }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 24px 0 12px;
    padding-left: 4px;
  }

  .session-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
    padding: 18px 20px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    animation: slideUp 0.4s ease both;
    transition: all 0.2s;
  }
  .session-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }
  .session-card.past { opacity: 0.6; }

  .session-date-box {
    text-align: center;
    min-width: 56px;
    padding: 8px 10px;
    border-radius: 10px;
    background: #f8fafc;
  }
  .session-date-box.upcoming { background: linear-gradient(135deg, #DC2626, #ef4444); color: #fff; }
  .session-day { font-size: 22px; font-weight: 800; line-height: 1; }
  .session-month { font-size: 10px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
  .session-date-box.upcoming .session-day,
  .session-date-box.upcoming .session-month { color: #fff; }

  .session-info { flex: 1; }
  .session-time { font-size: 15px; font-weight: 700; color: #1e293b; }
  .session-meta { font-size: 12px; color: #94a3b8; margin-top: 2px; }

  .btn-join {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, #DC2626, #ef4444);
    color: #fff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.2s;
    border: none;
  }
  .btn-join:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.3); }

  .info-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
    padding: 20px;
    margin-bottom: 12px;
  }
  .info-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #64748b; }
  .info-value { font-weight: 600; color: #1e293b; }

  .support-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .support-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #475569;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
  }
  .support-link:hover { border-color: #DC2626; color: #DC2626; }
  .support-link.discord { border-color: #5865F2; color: #5865F2; }
  .support-link.discord:hover { background: #5865F2; color: #fff; }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #94a3b8;
  }
  .empty-state-icon { font-size: 48px; margin-bottom: 8px; }
  .empty-state p { font-size: 14px; }

  .countdown { font-size: 12px; color: #DC2626; font-weight: 700; font-variant-numeric: tabular-nums; }

  @media (max-width: 600px) {
    .portal-content { padding: 16px 12px 40px; }
    .welcome-card { padding: 20px 16px; }
    .welcome-card h1 { font-size: 18px; }
    .session-card { padding: 14px 16px; gap: 12px; }
    .btn-join { padding: 8px 14px; font-size: 12px; }
    .support-links { flex-direction: column; }
  }
`;

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function renderStudentPortal(data: StudentData): string {
  const initials = (data.prenom[0] || '') + (data.nom[0] || '');
  const lang = data.preferred_language || 'en';
  const isFr = lang === 'fr';
  const isAr = lang === 'ar';

  const welcomeText = isFr
    ? `Bienvenue sur votre espace personnel`
    : isAr ? '\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0641\u064a \u0645\u0633\u0627\u062d\u062a\u0643 \u0627\u0644\u0634\u062e\u0635\u064a\u0629' : 'Welcome to your personal dashboard';

  const upcomingLabel = isFr ? 'Sessions a venir' : isAr ? '\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0627\u0644\u0642\u0627\u062f\u0645\u0629' : 'Upcoming Sessions';
  const pastLabel = isFr ? 'Sessions passees' : isAr ? '\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0627\u0644\u0633\u0627\u0628\u0642\u0629' : 'Past Sessions';
  const profileLabel = isFr ? 'Mon profil' : isAr ? '\u0645\u0644\u0641\u064a \u0627\u0644\u0634\u062e\u0635\u064a' : 'My Profile';
  const supportLabel = isFr ? 'Besoin d\'aide ?' : isAr ? '\u0647\u0644 \u062a\u062d\u062a\u0627\u062c \u0645\u0633\u0627\u0639\u062f\u0629\u061f' : 'Need help?';
  const joinLabel = isFr ? 'Rejoindre' : isAr ? '\u0627\u0646\u0636\u0645' : 'Join';
  const noSessionsText = isFr
    ? 'Aucune session programmee pour le moment.'
    : isAr ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u062c\u0644\u0633\u0627\u062a \u0645\u062c\u062f\u0648\u0644\u0629 \u062d\u0627\u0644\u064a\u0627\u064b.' : 'No sessions scheduled yet.';

  function renderSessionCard(s: StudentBooking, type: 'upcoming' | 'past'): string {
    const d = new Date(s.booking_date + 'T00:00:00');
    const day = d.getDate();
    const month = months[d.getMonth()];
    const isUpcoming = type === 'upcoming';
    const sessionUrl = `https://callmyprof.com/session/${s.id}`;

    return `
      <div class="session-card ${!isUpcoming ? 'past' : ''}">
        <div class="session-date-box ${isUpcoming ? 'upcoming' : ''}">
          <div class="session-day">${day}</div>
          <div class="session-month">${month}</div>
        </div>
        <div class="session-info">
          <div class="session-time">&#128348; ${s.booking_time}</div>
          <div class="session-meta">
            ${s.booking_date}
            ${isUpcoming ? `<span class="countdown" data-date="${s.booking_date}" data-time="${s.booking_time}"></span>` : ''}
          </div>
        </div>
        ${isUpcoming ? `<a href="${sessionUrl}" class="btn-join">&#127909; ${joinLabel}</a>` : ''}
      </div>
    `;
  }

  const upcomingHtml = data.upcomingSessions.length > 0
    ? data.upcomingSessions.map(s => renderSessionCard(s, 'upcoming')).join('')
    : `<div class="empty-state"><div class="empty-state-icon">&#128197;</div><p>${noSessionsText}</p></div>`;

  const pastHtml = data.pastSessions.length > 0
    ? data.pastSessions.map(s => renderSessionCard(s, 'past')).join('')
    : '';

  const dir = isAr ? ' dir="rtl"' : '';

  return `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CallMyProf - My Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${PORTAL_CSS}</style>
</head>
<body>
  <div class="portal-header">
    <a href="https://callmyprof.com" class="portal-logo">
      <span class="portal-logo-icon">&#128222;</span>
      <span>CallMyProf</span>
    </a>
    <div class="portal-user">
      <span>${data.prenom}</span>
      <div class="portal-avatar">${initials.toUpperCase()}</div>
    </div>
  </div>

  <div class="portal-content">
    <div class="welcome-card">
      <h1>&#128075; ${isFr ? 'Bonjour' : isAr ? '\u0645\u0631\u062d\u0628\u0627' : 'Hi'} ${data.prenom}!</h1>
      <p>${welcomeText}</p>
    </div>

    <div class="section-title">&#127909; ${upcomingLabel}</div>
    ${upcomingHtml}

    ${data.pastSessions.length > 0 ? `
      <div class="section-title">&#9989; ${pastLabel}</div>
      ${pastHtml}
    ` : ''}

    <div class="section-title">&#128100; ${profileLabel}</div>
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">${isFr ? 'Nom' : isAr ? '\u0627\u0644\u0627\u0633\u0645' : 'Name'}</span>
        <span class="info-value">${data.prenom} ${data.nom}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${data.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${isFr ? 'Telephone' : isAr ? '\u0627\u0644\u0647\u0627\u062a\u0641' : 'Phone'}</span>
        <span class="info-value">${data.country_code} ${data.telephone}</span>
      </div>
    </div>

    <div class="section-title">&#128172; ${supportLabel}</div>
    <div class="support-links">
      <a href="mailto:contact@callmyprof.com" class="support-link">&#9993; Email</a>
      <a href="https://callmyprof.com/faq" class="support-link">&#10067; FAQ</a>
      <a href="https://discord.gg/callmyprof" class="support-link discord">&#128172; Discord</a>
    </div>
  </div>

  <script>
    function updateCountdowns() {
      document.querySelectorAll('.countdown').forEach(function(el) {
        var d = el.getAttribute('data-date');
        var t = el.getAttribute('data-time');
        var target = new Date(d + 'T' + t + ':00');
        var now = new Date();
        var diff = target - now;
        if (diff <= 0) {
          el.textContent = '${isFr ? 'Maintenant!' : isAr ? '\u0627\u0644\u0622\u0646!' : 'Now!'}';
          el.style.color = '#22c55e';
        } else if (diff < 3600000) {
          var m = Math.floor(diff / 60000);
          el.textContent = '${isFr ? 'Dans' : isAr ? '\u062e\u0644\u0627\u0644' : 'In'} ' + m + ' min';
        } else {
          var h = Math.floor(diff / 3600000);
          var m = Math.floor((diff % 3600000) / 60000);
          el.textContent = '${isFr ? 'Dans' : isAr ? '\u062e\u0644\u0627\u0644' : 'In'} ' + h + 'h ' + m + 'min';
        }
      });
    }
    updateCountdowns();
    setInterval(updateCountdowns, 30000);
  </script>
</body>
</html>`;
}

/**
 * Access denied page
 */
export function renderStudentAccessDenied(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CallMyProf - Access Denied</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>${PORTAL_CSS}</style>
</head>
<body>
  <div class="portal-header">
    <a href="https://callmyprof.com" class="portal-logo">
      <span class="portal-logo-icon">&#128222;</span>
      <span>CallMyProf</span>
    </a>
  </div>
  <div class="portal-content">
    <div style="text-align:center;padding:60px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">&#128274;</div>
      <h2 style="font-size:22px;margin-bottom:8px;color:#1e293b;">Access Denied</h2>
      <p style="font-size:15px;color:#94a3b8;max-width:400px;margin:0 auto 24px;line-height:1.6;">This link is invalid or has expired. Please use the link from your booking confirmation email.</p>
      <a href="https://callmyprof.com" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#DC2626,#ef4444);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">Back to CallMyProf</a>
    </div>
  </div>
</body>
</html>`;
}
