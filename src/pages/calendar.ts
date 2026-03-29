/**
 * CallMyProf - Admin Calendar Page
 * Weekly view of tutor availability slots with slot management
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDate } from '../../shared/html-utils';
import { listSlots } from '../api/calendar';

// ============================================================================
// CSS
// ============================================================================

const PAGE_CSS = `
  .calendar-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .calendar-controls .week-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 6px 12px;
    border: 1px solid var(--gray-100);
  }
  .week-nav button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: var(--radius-sm);
    color: var(--gray-600);
    font-size: 16px;
    transition: all 0.2s;
  }
  .week-nav button:hover {
    background: var(--gray-100);
    color: var(--primary);
  }
  .week-nav .week-label {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
    min-width: 200px;
    text-align: center;
  }
  .calendar-controls .today-btn {
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--primary);
    background: var(--white);
    color: var(--primary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .calendar-controls .today-btn:hover {
    background: var(--primary);
    color: var(--white);
  }
  .calendar-controls .tutor-filter {
    margin-left: auto;
  }

  /* Calendar grid */
  .calendar-grid {
    display: grid;
    grid-template-columns: 60px repeat(7, 1fr);
    background: var(--white);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-100);
    overflow: hidden;
    animation: slideUp 0.4s ease both;
  }
  .calendar-header {
    background: var(--charcoal);
    color: var(--white);
    padding: 12px 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .calendar-header.today-col {
    background: var(--primary);
  }
  .calendar-header:first-child {
    background: var(--charcoal-dark);
  }
  .calendar-header .day-date {
    font-size: 18px;
    font-weight: 800;
    margin-top: 2px;
  }

  .time-label {
    padding: 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--gray-500);
    text-align: right;
    border-bottom: 1px solid var(--gray-50);
    border-right: 1px solid var(--gray-100);
    min-height: 60px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .calendar-cell {
    border-bottom: 1px solid var(--gray-50);
    border-right: 1px solid var(--gray-50);
    padding: 4px;
    min-height: 60px;
    position: relative;
    cursor: pointer;
    transition: background 0.15s;
  }
  .calendar-cell:hover {
    background: rgba(220, 38, 38, 0.03);
  }
  .calendar-cell.today-col {
    background: rgba(220, 38, 38, 0.02);
  }

  /* Slot cards inside cells */
  .slot-card {
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 2px;
    cursor: pointer;
    transition: all 0.15s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .slot-card:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .slot-card.available {
    background: var(--success-light);
    color: #065f46;
    border-left: 3px solid var(--success);
  }
  .slot-card.booked {
    background: var(--blue-light);
    color: #1e40af;
    border-left: 3px solid var(--blue);
  }
  .slot-card.blocked {
    background: var(--gray-100);
    color: var(--gray-500);
    border-left: 3px solid var(--gray-300);
  }

  /* Legend */
  .calendar-legend {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    font-size: 12px;
    color: var(--gray-500);
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }
  .legend-dot.available { background: var(--success-light); border: 1px solid var(--success); }
  .legend-dot.booked { background: var(--blue-light); border: 1px solid var(--blue); }
  .legend-dot.blocked { background: var(--gray-100); border: 1px solid var(--gray-300); }

  /* Add slot modal */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }
  .modal-overlay.active { display: flex; }
  .modal-box {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 28px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease both;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 20px;
  }
  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  /* Stats bar */
  .calendar-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  .cal-stat {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    border: 1px solid var(--gray-100);
    text-align: center;
  }
  .cal-stat .cal-stat-count {
    font-size: 24px;
    font-weight: 800;
    color: var(--gray-900);
  }
  .cal-stat .cal-stat-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-500);
    margin-top: 2px;
  }

  @media (max-width: 768px) {
    .calendar-grid { grid-template-columns: 50px repeat(7, 1fr); font-size: 11px; }
    .calendar-header { padding: 8px 4px; font-size: 10px; }
    .calendar-stats { grid-template-columns: 1fr; }
  }
`;

// ============================================================================
// RENDER
// ============================================================================

export async function renderCalendar(env: Env, url: URL, userName?: string): Promise<string> {
  // Parse week offset from query
  const weekOffset = parseInt(url.searchParams.get('week') || '0');
  const filterTutor = url.searchParams.get('tutor') || '';

  // Calculate week boundaries
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  const dateFrom = startOfWeek.toISOString().slice(0, 10);
  const dateTo = endOfWeek.toISOString().slice(0, 10);

  // Fetch slots for this week
  const { slots } = await listSlots(env, {
    formateur_id: filterTutor || undefined,
    date_from: dateFrom,
    date_to: dateTo,
    limit: 500,
  });

  // Get list of tutors for filter dropdown
  const tutors = await env.DB.prepare(
    "SELECT id, prenom, nom FROM formateurs WHERE application_status = 'valide' ORDER BY prenom ASC"
  ).all<{ id: string; prenom: string; nom: string }>();

  // Slot stats
  const available = slots.filter(s => s.type === 'available').length;
  const booked = slots.filter(s => s.type === 'booked').length;
  const blocked = slots.filter(s => s.type === 'blocked').length;

  // Build day columns
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const isToday = dateStr === today;
    days.push({ dateStr, dayName, dayNum, isToday });
  }

  // Group slots by date + hour
  const slotsByDateHour = new Map<string, typeof slots>();
  for (const slot of slots) {
    const hour = slot.heure_debut.slice(0, 2);
    const key = `${slot.date_slot}-${hour}`;
    if (!slotsByDateHour.has(key)) slotsByDateHour.set(key, []);
    slotsByDateHour.get(key)!.push(slot);
  }

  // Time range: 8am to 9pm
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  // Build grid
  const headerCells = `<div class="calendar-header"></div>` +
    days.map(d => `<div class="calendar-header${d.isToday ? ' today-col' : ''}">${d.dayName}<div class="day-date">${d.dayNum}</div></div>`).join('');

  let gridRows = '';
  for (const hour of hours) {
    const hh = String(hour).padStart(2, '0');
    gridRows += `<div class="time-label">${hh}:00</div>`;
    for (const day of days) {
      const key = `${day.dateStr}-${hh}`;
      const cellSlots = slotsByDateHour.get(key) || [];
      const slotsHtml = cellSlots.map(s => {
        const tutorName = (s as any).formateur_prenom ? `${(s as any).formateur_prenom} ${((s as any).formateur_nom || '').charAt(0)}.` : '';
        return `<div class="slot-card ${s.type}" title="${escapeHtml(tutorName)} ${escapeHtml(s.heure_debut)}-${escapeHtml(s.heure_fin)}">${escapeHtml(s.heure_debut.slice(0,5))}-${escapeHtml(s.heure_fin.slice(0,5))} ${escapeHtml(tutorName)}</div>`;
      }).join('');
      gridRows += `<div class="calendar-cell${day.isToday ? ' today-col' : ''}" onclick="openAddSlot('${day.dateStr}', '${hh}:00')">${slotsHtml}</div>`;
    }
  }

  // Week label
  const weekLabel = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Tutor filter options
  const tutorOptions = (tutors.results || []).map(t =>
    `<option value="${escapeHtml(t.id)}"${t.id === filterTutor ? ' selected' : ''}>${escapeHtml(t.prenom)} ${escapeHtml(t.nom)}</option>`
  ).join('');

  const content = `
    <div class="page-header">
      <div>
        <h1><span class="page-icon">&#128197;</span> Calendar</h1>
        <div class="page-subtitle">Manage tutor availability and bookings</div>
      </div>
      <div>
        <button class="btn btn-sm btn-primary" onclick="openAddSlot('${today}', '09:00')">&#10133; Add Slot</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="calendar-stats">
      <div class="cal-stat">
        <div class="cal-stat-count" style="color:var(--success)">${available}</div>
        <div class="cal-stat-label">Available</div>
      </div>
      <div class="cal-stat">
        <div class="cal-stat-count" style="color:var(--blue)">${booked}</div>
        <div class="cal-stat-label">Booked</div>
      </div>
      <div class="cal-stat">
        <div class="cal-stat-count" style="color:var(--gray-400)">${blocked}</div>
        <div class="cal-stat-label">Blocked</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="calendar-controls">
      <div class="week-nav">
        <button onclick="navigateWeek(${weekOffset - 1})">&#9664;</button>
        <span class="week-label">${weekLabel}</span>
        <button onclick="navigateWeek(${weekOffset + 1})">&#9654;</button>
      </div>
      <button class="today-btn" onclick="navigateWeek(0)">Today</button>
      <div class="tutor-filter">
        <select class="filter-select" onchange="filterByTutor(this.value)">
          <option value="">All tutors</option>
          ${tutorOptions}
        </select>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      ${headerCells}
      ${gridRows}
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-item"><div class="legend-dot available"></div> Available</div>
      <div class="legend-item"><div class="legend-dot booked"></div> Booked</div>
      <div class="legend-item"><div class="legend-dot blocked"></div> Blocked</div>
    </div>

    <!-- Add Slot Modal -->
    <div class="modal-overlay" id="slot-modal">
      <div class="modal-box">
        <div class="modal-title">&#10133; Add Availability Slot</div>
        <div class="form-group">
          <label class="form-label">Tutor <span class="required">*</span></label>
          <select class="form-input" id="slot-tutor">
            <option value="">Select a tutor</option>
            ${tutorOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date <span class="required">*</span></label>
          <input type="date" class="form-input" id="slot-date">
        </div>
        <div style="display:flex;gap:12px">
          <div class="form-group" style="flex:1">
            <label class="form-label">Start <span class="required">*</span></label>
            <input type="time" class="form-input" id="slot-start">
          </div>
          <div class="form-group" style="flex:1">
            <label class="form-label">End <span class="required">*</span></label>
            <input type="time" class="form-input" id="slot-end">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="form-input" id="slot-type">
            <option value="available">Available</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-sm btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-sm btn-primary" onclick="saveSlot()">&#128190; Save</button>
        </div>
      </div>
    </div>

    <script>
      function navigateWeek(offset) {
        var params = new URLSearchParams(window.location.search);
        if (offset === 0) { params.delete('week'); } else { params.set('week', offset); }
        window.location.href = '/calendar' + (params.toString() ? '?' + params.toString() : '');
      }

      function filterByTutor(id) {
        var params = new URLSearchParams(window.location.search);
        if (id) { params.set('tutor', id); } else { params.delete('tutor'); }
        params.delete('week');
        window.location.href = '/calendar' + (params.toString() ? '?' + params.toString() : '');
      }

      function openAddSlot(date, time) {
        document.getElementById('slot-date').value = date;
        document.getElementById('slot-start').value = time;
        var endHour = parseInt(time.split(':')[0]) + 1;
        document.getElementById('slot-end').value = String(endHour).padStart(2, '0') + ':00';
        document.getElementById('slot-modal').classList.add('active');
      }

      function closeModal() {
        document.getElementById('slot-modal').classList.remove('active');
      }

      function saveSlot() {
        var tutor = document.getElementById('slot-tutor').value;
        var date = document.getElementById('slot-date').value;
        var start = document.getElementById('slot-start').value;
        var end = document.getElementById('slot-end').value;
        var type = document.getElementById('slot-type').value;

        if (!tutor || !date || !start || !end) {
          alert('Please fill in all required fields');
          return;
        }

        fetch('/api/calendar/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formateur_id: tutor,
            date_slot: date,
            heure_debut: start,
            heure_fin: end,
            type: type
          })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) {
            closeModal();
            window.location.reload();
          } else {
            alert(data.error || 'Failed to create slot');
          }
        });
      }

      // Close modal on backdrop click
      document.getElementById('slot-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
      });
    </script>
  `;

  return htmlPage({
    title: 'Calendar',
    activePage: 'calendar',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
