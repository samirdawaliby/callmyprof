/**
 * Soutien Scolaire Caplogy - Page Avis & Evaluations
 * Liste, filtres, stats de distribution, toggle visibilite
 */

import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML, starsHTML } from '../../shared/utils';
import { getAvis, getAvisStats, getFormateursForFilter } from '../api/avis';
import type { Env } from '../../shared/types';

// ============================================================================
// CSS
// ============================================================================

const AVIS_CSS = `
  /* ---- Rating distribution ---- */
  .rating-overview {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 28px;
    margin-bottom: 28px;
    animation: slideUp 0.5s ease both;
  }

  @media (max-width: 768px) {
    .rating-overview { grid-template-columns: 1fr; }
  }

  .rating-summary {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 28px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
  }

  .rating-big-number {
    font-size: 56px;
    font-weight: 800;
    color: var(--gray-900);
    line-height: 1;
    letter-spacing: -2px;
    animation: bounceIn 0.6s ease both;
  }

  .rating-big-stars {
    font-size: 28px;
    margin: 10px 0 6px;
    letter-spacing: 3px;
    animation: fadeIn 0.8s ease both;
    animation-delay: 0.3s;
  }

  .rating-big-stars .stars { font-size: 28px; }

  .rating-total-label {
    font-size: 14px;
    color: var(--gray-500);
    font-weight: 500;
  }

  .rating-bars {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 24px 28px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }

  .rating-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInLeft 0.4s ease both;
  }
  .rating-bar-row:nth-child(1) { animation-delay: 0.1s; }
  .rating-bar-row:nth-child(2) { animation-delay: 0.15s; }
  .rating-bar-row:nth-child(3) { animation-delay: 0.2s; }
  .rating-bar-row:nth-child(4) { animation-delay: 0.25s; }
  .rating-bar-row:nth-child(5) { animation-delay: 0.3s; }

  .rating-bar-label {
    width: 70px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .rating-bar-label .star-icon {
    color: var(--warning);
    font-size: 14px;
  }

  .rating-bar-track {
    flex: 1;
    height: 22px;
    background: var(--gray-100);
    border-radius: 11px;
    overflow: hidden;
    position: relative;
  }

  .rating-bar-fill {
    height: 100%;
    border-radius: 11px;
    background: linear-gradient(90deg, var(--warning), #fbbf24);
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-width: 0;
  }

  @keyframes barGrow {
    from { width: 0; }
  }
  .rating-bar-fill { animation: barGrow 1s cubic-bezier(0.4, 0, 0.2, 1) both; }
  .rating-bar-row:nth-child(1) .rating-bar-fill { animation-delay: 0.3s; }
  .rating-bar-row:nth-child(2) .rating-bar-fill { animation-delay: 0.4s; }
  .rating-bar-row:nth-child(3) .rating-bar-fill { animation-delay: 0.5s; }
  .rating-bar-row:nth-child(4) .rating-bar-fill { animation-delay: 0.6s; }
  .rating-bar-row:nth-child(5) .rating-bar-fill { animation-delay: 0.7s; }

  .rating-bar-count {
    width: 50px;
    text-align: right;
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-600);
    flex-shrink: 0;
  }

  /* ---- Avis grid ---- */
  .avis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    .avis-grid { grid-template-columns: 1fr; }
  }

  .avis-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 22px 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    position: relative;
    overflow: hidden;
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    animation: slideUp 0.5s ease both;
  }
  .avis-card:nth-child(1) { animation-delay: 0.05s; }
  .avis-card:nth-child(2) { animation-delay: 0.1s; }
  .avis-card:nth-child(3) { animation-delay: 0.15s; }
  .avis-card:nth-child(4) { animation-delay: 0.2s; }
  .avis-card:nth-child(5) { animation-delay: 0.25s; }
  .avis-card:nth-child(6) { animation-delay: 0.3s; }
  .avis-card:nth-child(7) { animation-delay: 0.35s; }
  .avis-card:nth-child(8) { animation-delay: 0.4s; }
  .avis-card:nth-child(9) { animation-delay: 0.45s; }
  .avis-card:nth-child(10) { animation-delay: 0.5s; }
  .avis-card:nth-child(11) { animation-delay: 0.55s; }
  .avis-card:nth-child(12) { animation-delay: 0.6s; }

  .avis-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .avis-card.hidden-avis {
    opacity: 0.55;
    border-style: dashed;
  }

  .avis-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--warning), #fbbf24);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .avis-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .avis-stars {
    font-size: 22px;
    letter-spacing: 2px;
  }
  .avis-stars .stars { font-size: 22px; }

  .avis-visibility-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--gray-200);
    background: var(--white);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all var(--transition-fast);
  }
  .avis-visibility-btn:hover {
    background: var(--gray-50);
    border-color: var(--secondary);
    transform: scale(1.1);
  }

  .avis-comment {
    font-style: italic;
    color: var(--gray-700);
    font-size: 14px;
    line-height: 1.65;
    margin-bottom: 16px;
    position: relative;
    padding-left: 20px;
  }

  .avis-comment::before {
    content: '\\201C';
    position: absolute;
    left: 0;
    top: -4px;
    font-size: 28px;
    color: var(--secondary);
    font-style: normal;
    font-weight: 800;
    line-height: 1;
  }

  .avis-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: var(--gray-500);
    border-top: 1px solid var(--gray-100);
    padding-top: 12px;
  }

  .avis-meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .avis-meta-row .meta-icon {
    font-size: 13px;
    width: 18px;
    text-align: center;
    flex-shrink: 0;
  }

  .avis-meta-row strong {
    color: var(--gray-700);
    font-weight: 600;
  }

  /* ---- Star filter picker ---- */
  .star-filter {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .star-filter-btn {
    font-size: 20px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 2px;
    color: var(--gray-300);
    transition: all var(--transition-fast);
  }

  .star-filter-btn:hover,
  .star-filter-btn.active {
    color: var(--warning);
    transform: scale(1.15);
  }
`;

// ============================================================================
// RENDER
// ============================================================================

export async function renderAvis(env: Env, url: URL): Promise<string> {
  const [data, stats, formateurs] = await Promise.all([
    getAvis(env, url),
    getAvisStats(env),
    getFormateursForFilter(env),
  ]);

  const { avis, total, page, limit } = data;

  const formateurId = url.searchParams.get('formateur') || '';
  const noteMin = url.searchParams.get('note_min') || '';
  const search = url.searchParams.get('q') || '';

  // Build filter base URL (without page)
  const filterParams = new URLSearchParams();
  if (formateurId) filterParams.set('formateur', formateurId);
  if (noteMin) filterParams.set('note_min', noteMin);
  if (search) filterParams.set('q', search);
  const baseUrl = '/avis' + (filterParams.toString() ? '?' + filterParams.toString() : '');

  // Stars for average
  const avgFloor = Math.floor(stats.moyenne);
  const maxBarCount = Math.max(...stats.distribution.map(d => d.count), 1);

  // Rating distribution bars
  const barsHtml = stats.distribution.map(d => {
    const pct = stats.total > 0 ? Math.round((d.count / stats.total) * 100) : 0;
    return `
      <div class="rating-bar-row">
        <span class="rating-bar-label">
          <span class="star-icon">${'\u2605'}</span> ${d.note}
        </span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="rating-bar-count">${d.count}</span>
      </div>`;
  }).join('');

  // Formateur options
  const formateurOptions = formateurs.map(f =>
    `<option value="${escapeHtml(f.id)}" ${f.id === formateurId ? 'selected' : ''}>${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}</option>`
  ).join('');

  // Star filter buttons
  const starFilterHtml = [0, 1, 2, 3, 4, 5].map(n => {
    if (n === 0) {
      return `<button class="star-filter-btn ${noteMin === '' || noteMin === '0' ? 'active' : ''}" onclick="setNoteFilter(0)" title="Toutes les notes">Tous</button>`;
    }
    return `<button class="star-filter-btn ${noteMin === String(n) ? 'active' : ''}" onclick="setNoteFilter(${n})" title="${n} etoiles et plus">${'\u2605'}</button>`;
  }).join('');

  // Avis cards
  const cardsHtml = avis.length > 0
    ? avis.map(a => {
      const hiddenClass = a.visible ? '' : ' hidden-avis';
      const eyeIcon = a.visible ? '\u{1F441}' : '\u{1F6AB}';
      const eleveName = `${escapeHtml(a.eleve_prenom)}${a.eleve_nom ? ' ' + escapeHtml(a.eleve_nom) : ''}`;
      const formateurName = `${escapeHtml(a.formateur_prenom)} ${escapeHtml(a.formateur_nom)}`;
      const coursRef = a.cours_titre ? escapeHtml(a.cours_titre) : (a.cours_date ? formatDateFr(a.cours_date) : '');
      const comment = a.commentaire ? escapeHtml(a.commentaire) : '<span style="color: var(--gray-400);">Pas de commentaire</span>';

      return `
        <div class="avis-card${hiddenClass}" id="avis-${escapeHtml(a.id)}">
          <div class="avis-card-header">
            <div class="avis-stars">${starsHTML(a.note)}</div>
            <button class="avis-visibility-btn" onclick="toggleVisibility('${escapeHtml(a.id)}')" title="${a.visible ? 'Masquer' : 'Rendre visible'}">
              ${eyeIcon}
            </button>
          </div>
          <div class="avis-comment">${comment}</div>
          <div class="avis-meta">
            <div class="avis-meta-row">
              <span class="meta-icon">\u{1F393}</span>
              <strong>${eleveName}</strong>
            </div>
            <div class="avis-meta-row">
              <span class="meta-icon">\u{1F468}\u{200D}\u{1F3EB}</span>
              ${formateurName}
            </div>
            ${coursRef ? `<div class="avis-meta-row"><span class="meta-icon">\u{1F4D6}</span> ${coursRef}</div>` : ''}
            <div class="avis-meta-row">
              <span class="meta-icon">\u{1F4C5}</span>
              ${formatDateFr(a.created_at)}
            </div>
          </div>
        </div>`;
    }).join('')
    : `
      <div class="empty-state" style="grid-column: 1/-1;">
        <span class="empty-icon">\u{2B50}</span>
        <div class="empty-title">Aucun avis trouv&eacute;</div>
        <div class="empty-text">Les avis appara&icirc;tront ici une fois les premiers cours termin&eacute;s.</div>
      </div>`;

  const pagination = paginationHTML(page, total, limit, baseUrl);

  const content = `
    <div class="page-header">
      <div>
        <h1><span class="page-icon">\u{2B50}</span> Avis & &Eacute;valuations</h1>
        <div class="page-subtitle">${total} avis au total &middot; Note moyenne : ${stats.moyenne}/5</div>
      </div>
    </div>

    <!-- Rating overview -->
    <div class="rating-overview">
      <div class="rating-summary">
        <div class="rating-big-number">${stats.moyenne}</div>
        <div class="rating-big-stars">${starsHTML(avgFloor)}</div>
        <div class="rating-total-label">${total} avis</div>
      </div>
      <div class="rating-bars">
        ${barsHtml}
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <select class="filter-select" id="formateur-filter" onchange="applyFilters()">
        <option value="">Tous les formateurs</option>
        ${formateurOptions}
      </select>
      <div class="star-filter" id="star-filter">
        ${starFilterHtml}
      </div>
      <input type="text" class="search-input" id="search-input" placeholder="Rechercher un avis..." value="${escapeHtml(search)}" onkeydown="if(event.key==='Enter')applyFilters()">
      <button class="btn btn-outline btn-sm" onclick="applyFilters()">
        \u{1F50D} Filtrer
      </button>
      ${(formateurId || noteMin || search) ? `<a href="/avis" class="btn btn-outline btn-sm">\u{2716} R&eacute;initialiser</a>` : ''}
    </div>

    <!-- Avis grid -->
    <div class="avis-grid">
      ${cardsHtml}
    </div>

    ${pagination}

    <script>
      let currentNoteMin = ${noteMin ? parseInt(noteMin) : 0};

      function setNoteFilter(n) {
        currentNoteMin = n;
        document.querySelectorAll('.star-filter-btn').forEach((btn, i) => {
          btn.classList.toggle('active', i === n);
        });
      }

      function applyFilters() {
        const params = new URLSearchParams();
        const f = document.getElementById('formateur-filter').value;
        const q = document.getElementById('search-input').value.trim();
        if (f) params.set('formateur', f);
        if (currentNoteMin > 0) params.set('note_min', String(currentNoteMin));
        if (q) params.set('q', q);
        window.location.href = '/avis' + (params.toString() ? '?' + params.toString() : '');
      }

      async function toggleVisibility(id) {
        try {
          const res = await fetch('/api/avis/' + id + '/toggle', { method: 'POST' });
          if (res.ok) {
            window.location.reload();
          } else {
            alert('Erreur lors de la mise a jour');
          }
        } catch (e) {
          alert('Erreur reseau');
        }
      }
    </script>
  `;

  return htmlPage({
    title: 'Avis & Evaluations',
    activePage: 'avis',
    extraCss: AVIS_CSS,
    content,
    userName: 'Admin',
  });
}
