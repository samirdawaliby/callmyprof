/**
 * CallMyProf - Public Booking Page
 * Students pick a time slot for a free consultation call
 * Route: /book/:token
 */

import type { Env } from '../../shared/types';
import type { Locale } from '../../shared/i18n/index';
import { t } from '../../shared/i18n/index';

// ============================================================================
// STYLES
// ============================================================================

const BOOKING_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .booking-container {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 25px 80px rgba(0,0,0,0.3);
    max-width: 520px;
    width: 100%;
    overflow: hidden;
    animation: slideUp 0.6s ease both;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .booking-header {
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    padding: 32px;
    text-align: center;
    color: #fff;
  }
  .booking-header h1 { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
  .booking-header p { color: #94a3b8; font-size: 14px; }
  .booking-body { padding: 32px; }
  .booking-body h2 { font-size: 18px; color: #1e293b; margin-bottom: 6px; }
  .booking-body .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }

  .info-banner {
    display: flex; gap: 16px; padding: 16px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; margin-bottom: 24px; font-size: 13px; color: #166534;
  }
  .info-banner .info-icon { font-size: 24px; flex-shrink: 0; }

  /* Date selector */
  .date-selector { margin-bottom: 20px; }
  .date-selector label { font-size: 13px; font-weight: 700; color: #374151; display: block; margin-bottom: 8px; }
  .date-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
  }
  .date-btn {
    padding: 10px 8px; border: 2px solid #e2e8f0; border-radius: 10px;
    background: #fff; cursor: pointer; text-align: center;
    transition: all 0.2s ease; font-family: inherit;
  }
  .date-btn:hover { border-color: #DC2626; background: #fef2f2; }
  .date-btn.selected { border-color: #DC2626; background: #DC2626; color: #fff; }
  .date-btn .day-name { font-size: 11px; font-weight: 600; text-transform: uppercase; opacity: 0.7; }
  .date-btn .day-num { font-size: 18px; font-weight: 800; line-height: 1.3; }
  .date-btn .day-month { font-size: 11px; opacity: 0.7; }

  /* Time selector */
  .time-selector { margin-bottom: 24px; display: none; }
  .time-selector.visible { display: block; }
  .time-selector label { font-size: 13px; font-weight: 700; color: #374151; display: block; margin-bottom: 8px; }
  .time-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .time-btn {
    padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;
    background: #fff; cursor: pointer; font-size: 15px; font-weight: 700;
    font-family: inherit; transition: all 0.2s ease; text-align: center;
  }
  .time-btn:hover { border-color: #DC2626; background: #fef2f2; }
  .time-btn.selected { border-color: #DC2626; background: #DC2626; color: #fff; }

  /* Submit */
  .submit-btn {
    width: 100%; padding: 16px; background: linear-gradient(135deg, #DC2626, #ef4444);
    color: #fff; border: none; border-radius: 12px; font-size: 16px;
    font-weight: 700; cursor: pointer; transition: all 0.2s ease;
    font-family: inherit; display: none;
  }
  .submit-btn.visible { display: block; }
  .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(220,38,38,0.3); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Success */
  .success-screen {
    text-align: center; padding: 40px 32px;
    animation: slideUp 0.5s ease both;
  }
  .success-icon { font-size: 64px; margin-bottom: 16px; display: block; }
  .success-screen h2 { font-size: 22px; color: #166534; margin-bottom: 8px; }
  .success-screen p { color: #64748b; font-size: 15px; line-height: 1.6; }
  .success-details {
    background: #f8fafc; border-radius: 10px; padding: 20px;
    margin: 20px 0; text-align: center;
  }
  .success-details .big-date { font-size: 20px; font-weight: 800; color: #1e293b; }
  .success-details .big-time { font-size: 18px; font-weight: 700; color: #DC2626; margin-top: 4px; }

  .booking-footer {
    padding: 16px 32px; background: #f8fafc;
    text-align: center; border-top: 1px solid #e2e8f0;
  }
  .booking-footer p { color: #94a3b8; font-size: 12px; }
  .booking-footer a { color: #DC2626; text-decoration: none; }

  /* Error state */
  .error-screen { text-align: center; padding: 40px; }
  .error-screen h2 { color: #DC2626; }

  @media (max-width: 500px) {
    .date-grid { grid-template-columns: repeat(3, 1fr); }
    .time-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ============================================================================
// GENERATE AVAILABLE DATES (next 7 business days)
// ============================================================================

function generateDates(): Array<{ date: string; dayName: string; dayNum: number; month: string }> {
  const dates: Array<{ date: string; dayName: string; dayNum: number; month: string }> = [];
  const dayNames: Record<string, string[]> = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  };
  const monthNames: Record<string, string[]> = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    fr: ['Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Ao\u00fb', 'Sep', 'Oct', 'Nov', 'D\u00e9c'],
  };

  const now = new Date();
  let daysAdded = 0;
  let offset = 1; // start from tomorrow

  while (daysAdded < 7) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const day = d.getDay();
    // Skip Sunday (0)
    if (day !== 0) {
      dates.push({
        date: d.toISOString().split('T')[0],
        dayName: (dayNames['fr'] || dayNames['en'])[day],
        dayNum: d.getDate(),
        month: (monthNames['fr'] || monthNames['en'])[d.getMonth()],
      });
      daysAdded++;
    }
    offset++;
  }

  return dates;
}

// Available time slots
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

// ============================================================================
// RENDER BOOKING PAGE
// ============================================================================

export function renderBookingPage(leadId: string, prenom: string, locale: Locale): string {
  const dates = generateDates();

  const dateButtons = dates.map(d => `
    <button type="button" class="date-btn" data-date="${d.date}" onclick="selectDate(this)">
      <div class="day-name">${d.dayName}</div>
      <div class="day-num">${d.dayNum}</div>
      <div class="day-month">${d.month}</div>
    </button>
  `).join('');

  const timeButtons = TIME_SLOTS.map(t => `
    <button type="button" class="time-btn" data-time="${t}" onclick="selectTime(this)">
      ${t}
    </button>
  `).join('');

  const isFr = locale === 'fr';
  const isAr = locale === 'ar';

  const texts = {
    title: isFr ? 'R\u00e9servez votre appel' : isAr ? '\u0627\u062d\u062c\u0632 \u0645\u0643\u0627\u0644\u0645\u062a\u0643' : 'Book Your Call',
    subtitle: isFr ? 'Consultation gratuite de 15 min' : isAr ? '\u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 15 \u062f\u0642\u064a\u0642\u0629' : 'Free 15-min consultation',
    hello: isFr ? `Bonjour ${prenom} !` : isAr ? `\u0645\u0631\u062d\u0628\u0627\u064b ${prenom}!` : `Hi ${prenom}!`,
    desc: isFr ? 'Choisissez un jour et un horaire pour votre appel gratuit.' : isAr ? '\u0627\u062e\u062a\u0631 \u064a\u0648\u0645\u0627\u064b \u0648\u0648\u0642\u062a\u0627\u064b \u0644\u0645\u0643\u0627\u0644\u0645\u062a\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629.' : 'Pick a day and time for your free call.',
    banner: isFr ? '15 min \u2022 Gratuit \u2022 Sans engagement' : isAr ? '15 \u062f\u0642\u064a\u0642\u0629 \u2022 \u0645\u062c\u0627\u0646\u064a \u2022 \u0628\u062f\u0648\u0646 \u0627\u0644\u062a\u0632\u0627\u0645' : '15 min \u2022 Free \u2022 No commitment',
    chooseDay: isFr ? 'Choisissez un jour' : isAr ? '\u0627\u062e\u062a\u0631 \u064a\u0648\u0645\u0627\u064b' : 'Choose a Day',
    chooseTime: isFr ? 'Choisissez un horaire' : isAr ? '\u0627\u062e\u062a\u0631 \u0648\u0642\u062a\u0627\u064b' : 'Choose a Time',
    confirm: isFr ? 'Confirmer le rendez-vous' : isAr ? '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0639\u062f' : 'Confirm Appointment',
    confirming: isFr ? 'Confirmation...' : isAr ? '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0623\u0643\u064a\u062f...' : 'Confirming...',
    successTitle: isFr ? 'Rendez-vous confirm\u00e9 !' : isAr ? '\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0639\u062f!' : 'Appointment Confirmed!',
    successMsg: isFr ? 'Nous vous appellerons au cr\u00e9neau choisi. V\u00e9rifiez votre email pour la confirmation.' : isAr ? '\u0633\u0646\u062a\u0635\u0644 \u0628\u0643 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062d\u062f\u062f. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a.' : 'We\'ll call you at the scheduled time. Check your email for confirmation.',
  };

  const dir = isAr ? ' dir="rtl"' : '';

  return `<!DOCTYPE html>
<html lang="${locale}"${dir}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${texts.title} - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${BOOKING_CSS}</style>
</head>
<body>
  <div class="booking-container" id="bookingContainer">
    <div class="booking-header">
      <h1>&#128222; CallMyProf</h1>
      <p>${texts.subtitle}</p>
    </div>

    <div class="booking-body" id="bookingForm">
      <h2>${texts.hello}</h2>
      <p class="subtitle">${texts.desc}</p>

      <div class="info-banner">
        <span class="info-icon">&#9201;</span>
        <span>${texts.banner}</span>
      </div>

      <div class="date-selector">
        <label>&#128197; ${texts.chooseDay}</label>
        <div class="date-grid">${dateButtons}</div>
      </div>

      <div class="time-selector" id="timeSection">
        <label>&#128348; ${texts.chooseTime}</label>
        <div class="time-grid">${timeButtons}</div>
      </div>

      <button class="submit-btn" id="submitBtn" onclick="submitBooking()" disabled>
        <span id="btnText">&#9989; ${texts.confirm}</span>
        <span id="btnLoading" style="display:none">${texts.confirming}</span>
      </button>
    </div>

    <div id="successScreen" style="display:none">
      <div class="success-screen">
        <span class="success-icon">&#127881;</span>
        <h2>${texts.successTitle}</h2>
        <p>${texts.successMsg}</p>
        <div class="success-details">
          <div class="big-date" id="successDate"></div>
          <div class="big-time" id="successTime"></div>
        </div>
      </div>
    </div>

    <div class="booking-footer">
      <p>&copy; 2026 <a href="https://callmyprof.com">CallMyProf</a></p>
    </div>
  </div>

  <script>
    var selectedDate = null;
    var selectedTime = null;
    var leadId = '${leadId}';

    function selectDate(btn) {
      document.querySelectorAll('.date-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedDate = btn.getAttribute('data-date');
      document.getElementById('timeSection').classList.add('visible');
      // Reset time
      selectedTime = null;
      document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('selected'); });
      updateSubmit();
    }

    function selectTime(btn) {
      document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedTime = btn.getAttribute('data-time');
      updateSubmit();
    }

    function updateSubmit() {
      var btn = document.getElementById('submitBtn');
      if (selectedDate && selectedTime) {
        btn.style.display = 'block';
        btn.classList.add('visible');
        btn.disabled = false;
      }
    }

    function submitBooking() {
      var btn = document.getElementById('submitBtn');
      btn.disabled = true;
      document.getElementById('btnText').style.display = 'none';
      document.getElementById('btnLoading').style.display = 'inline';

      fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, date: selectedDate, time: selectedTime })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          // Format date for display
          var d = new Date(selectedDate + 'T00:00:00');
          var opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          document.getElementById('successDate').textContent = d.toLocaleDateString('${locale === 'ar' ? 'ar-LB' : locale === 'fr' ? 'fr-FR' : 'en-US'}', opts);
          document.getElementById('successTime').textContent = selectedTime;
          document.getElementById('bookingForm').style.display = 'none';
          document.getElementById('successScreen').style.display = 'block';
        } else {
          alert(data.error || 'An error occurred. Please try again.');
          btn.disabled = false;
          document.getElementById('btnText').style.display = 'inline';
          document.getElementById('btnLoading').style.display = 'none';
        }
      })
      .catch(function() {
        alert('Network error. Please try again.');
        btn.disabled = false;
        document.getElementById('btnText').style.display = 'inline';
        document.getElementById('btnLoading').style.display = 'none';
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Render error/expired booking page
 */
export function renderBookingExpired(locale: Locale): string {
  const isFr = locale === 'fr';
  const isAr = locale === 'ar';
  const msg = isFr ? 'Ce lien de r\u00e9servation n\'est plus valide.' : isAr ? '\u0631\u0627\u0628\u0637 \u0627\u0644\u062d\u062c\u0632 \u0644\u0645 \u064a\u0639\u062f \u0635\u0627\u0644\u062d\u0627\u064b.' : 'This booking link is no longer valid.';
  const cta = isFr ? 'Retour au site' : isAr ? '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u0648\u0642\u0639' : 'Back to website';

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CallMyProf</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>${BOOKING_CSS}</style></head>
<body>
<div class="booking-container">
  <div class="booking-header"><h1>CallMyProf</h1></div>
  <div class="error-screen">
    <span style="font-size:64px;display:block;margin-bottom:16px">&#128533;</span>
    <h2>${msg}</h2>
    <p style="margin-top:20px"><a href="https://callmyprof.com" class="submit-btn visible" style="display:inline-block;width:auto">${cta}</a></p>
  </div>
</div>
</body></html>`;
}
