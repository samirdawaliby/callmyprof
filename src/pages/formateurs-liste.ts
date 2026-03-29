/**
 * Soutien Scolaire Caplogy - Page Admin: Liste des Formateurs
 * Listing avec filtres, stats, table, pagination, animations
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML, starsHTML, truncate } from '../../shared/utils';
import { getFormateurs } from '../api/formateurs';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--primary));
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
    border-radius: 2px;
    margin-bottom: 20px;
  }

  /* ---- Count badge ---- */
  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 10px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: var(--primary-dark);
    font-size: 13px;
    font-weight: 700;
    animation: bounceIn 0.6s ease both;
    animation-delay: 0.3s;
  }

  /* ---- Stats mini badges ---- */
  .stats-mini {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    animation: slideUp 0.4s ease both;
    animation-delay: 0.1s;
  }
  .stats-mini .mini-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    background: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }
  .stats-mini .mini-badge:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .stats-mini .mini-badge .mini-count {
    font-weight: 800;
    font-size: 15px;
  }
  .stats-mini .mini-badge.green .mini-count { color: var(--success); }
  .stats-mini .mini-badge.orange .mini-count { color: var(--warning); }
  .stats-mini .mini-badge.red .mini-count { color: var(--danger); }
  .stats-mini .mini-badge.gray .mini-count { color: var(--gray-500); }
  .stats-mini .mini-badge.blue .mini-count { color: var(--blue); }

  /* ---- Thematique badges in table ---- */
  .thematique-badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    max-width: 200px;
  }
  .thematique-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    background: var(--blue-light);
    color: #1e40af;
    border: 1px solid #93c5fd;
    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .thematique-more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 20px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    background: var(--gray-100);
    color: var(--gray-500);
    border: 1px solid var(--gray-200);
  }

  /* ---- Photo column ---- */
  .formateur-photo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gray-100);
    background: linear-gradient(135deg, var(--secondary-light), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: var(--primary-dark);
    flex-shrink: 0;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }
  .formateur-photo:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 3px rgba(109, 203, 221, 0.3);
  }
  .formateur-photo img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  /* ---- Heures display ---- */
  .heures-display {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: var(--gray-700);
  }
  .heures-display .heures-icon {
    font-size: 14px;
    animation: float 3s ease-in-out infinite;
  }

  /* ---- Empty state illustration ---- */
  .empty-illustration {
    width: 180px;
    height: 180px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, var(--secondary-light), rgba(109,203,221,0.2));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72px;
    animation: float 4s ease-in-out infinite;
    box-shadow: 0 20px 60px rgba(109,203,221,0.2);
  }

  /* ---- Row entrance animation ---- */
  tbody tr {
    animation: slideUp 0.4s ease both;
  }
  tbody tr:nth-child(1) { animation-delay: 0.05s; }
  tbody tr:nth-child(2) { animation-delay: 0.08s; }
  tbody tr:nth-child(3) { animation-delay: 0.11s; }
  tbody tr:nth-child(4) { animation-delay: 0.14s; }
  tbody tr:nth-child(5) { animation-delay: 0.17s; }
  tbody tr:nth-child(6) { animation-delay: 0.2s; }
  tbody tr:nth-child(7) { animation-delay: 0.23s; }
  tbody tr:nth-child(8) { animation-delay: 0.26s; }
  tbody tr:nth-child(9) { animation-delay: 0.29s; }
  tbody tr:nth-child(10) { animation-delay: 0.32s; }

  /* ---- Export button ---- */
  .btn-export {
    background: var(--white);
    color: var(--gray-700);
    border: 1px solid var(--gray-200);
    position: relative;
    overflow: hidden;
  }
  .btn-export::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(109,203,221,0.1), transparent);
    transition: left 0.5s ease;
  }
  .btn-export:hover::after {
    left: 100%;
  }
  .btn-export:hover {
    border-color: var(--secondary);
    color: var(--primary);
  }

  /* ---- Action buttons row ---- */
  .action-btns {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap;
  }
  .action-btns .btn-sm {
    padding: 4px 10px;
    font-size: 11px;
    border-radius: 6px;
    white-space: nowrap;
  }
  .btn-voir {
    background: var(--white);
    color: var(--primary);
    border: 1px solid var(--primary);
  }
  .btn-voir:hover {
    background: var(--primary);
    color: var(--white);
  }
  .btn-valider {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .btn-valider:hover {
    background: var(--success);
    color: var(--white);
  }
  .btn-refuser {
    background: var(--danger-light);
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  .btn-refuser:hover {
    background: var(--danger);
    color: var(--white);
  }
  .btn-suspendre {
    background: var(--gray-100);
    color: var(--gray-600);
    border: 1px solid var(--gray-200);
  }
  .btn-suspendre:hover {
    background: var(--gray-400);
    color: var(--white);
  }

  @media (max-width: 1200px) {
    .table-wrapper { font-size: 13px; }
    .action-btns { flex-direction: column; gap: 3px; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    submitted: 'Soumis',
    en_attente: 'En attente',
    valide: 'Valid\u00e9',
    refuse: 'Refus\u00e9',
    suspendu: 'Suspendu',
  };
  const label = labels[status] || status;
  return `<span class="badge badge-${status} badge-dot">${escapeHtml(label)}</span>`;
}

function actionButtons(id: string, status: string): string {
  const btns: string[] = [
    `<a href="/formateurs/${escapeHtml(id)}" class="btn btn-sm btn-voir">Voir</a>`,
  ];

  if (status === 'en_attente' || status === 'submitted') {
    btns.push(`<button class="btn btn-sm btn-valider" onclick="changeStatus('${escapeHtml(id)}','valide')">Valider</button>`);
    btns.push(`<button class="btn btn-sm btn-refuser" onclick="changeStatus('${escapeHtml(id)}','refuse')">Refuser</button>`);
  }
  if (status === 'valide') {
    btns.push(`<button class="btn btn-sm btn-suspendre" onclick="changeStatus('${escapeHtml(id)}','suspendu')">Suspendre</button>`);
  }
  if (status === 'suspendu') {
    btns.push(`<button class="btn btn-sm btn-valider" onclick="changeStatus('${escapeHtml(id)}','valide')">R\u00e9activer</button>`);
  }
  if (status === 'refuse') {
    btns.push(`<button class="btn btn-sm btn-valider" onclick="changeStatus('${escapeHtml(id)}','en_attente')">R\u00e9examiner</button>`);
  }

  return `<div class="action-btns">${btns.join('')}</div>`;
}

function thematiqueBadges(thematiquesStr: string | undefined | null): string {
  if (!thematiquesStr) return '<span style="color:var(--gray-400);font-size:12px">Aucune</span>';
  const list = thematiquesStr.split(',').map(t => t.trim()).filter(Boolean);
  const shown = list.slice(0, 3);
  const rest = list.length - 3;

  let html = '<div class="thematique-badges">';
  for (const t of shown) {
    html += `<span class="thematique-badge" title="${escapeHtml(t)}">${escapeHtml(truncate(t, 15))}</span>`;
  }
  if (rest > 0) {
    html += `<span class="thematique-more" title="${escapeHtml(list.slice(3).join(', '))}">+${rest}</span>`;
  }
  html += '</div>';
  return html;
}

function photoAvatar(photoUrl: string | undefined | null, prenom: string, nom: string): string {
  if (photoUrl) {
    return `<div class="formateur-photo"><img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(prenom)}"></div>`;
  }
  const initials = ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
  return `<div class="formateur-photo">${escapeHtml(initials)}</div>`;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderFormateursListe(env: Env, url: URL, userName?: string): Promise<string> {
  const data = await getFormateurs(env, url);
  const { formateurs, total, page, limit, stats } = data;

  // Build current filter state for URL persistence
  const search = url.searchParams.get('search') || '';
  const statusFilter = url.searchParams.get('status') || '';
  const villeFilter = url.searchParams.get('ville') || '';

  // Build base URL for pagination
  const paginationBase = '/formateurs?' +
    (search ? `search=${encodeURIComponent(search)}&` : '') +
    (statusFilter ? `status=${encodeURIComponent(statusFilter)}&` : '') +
    (villeFilter ? `ville=${encodeURIComponent(villeFilter)}&` : '');

  // Table rows
  let tableRows = '';
  if (formateurs.length === 0) {
    tableRows = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-illustration">\ud83d\udc68\u200d\ud83c\udfeb</div>
            <div class="empty-title">Aucun formateur trouv\u00e9</div>
            <div class="empty-text">Modifiez vos filtres ou attendez de nouvelles candidatures</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    for (const f of formateurs) {
      tableRows += `
        <tr>
          <td>${photoAvatar(f.photo_url, f.prenom, f.nom)}</td>
          <td>
            <div class="cell-main">${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}</div>
            <div class="cell-sub">${escapeHtml(f.email)}</div>
          </td>
          <td>${escapeHtml(f.ville)}</td>
          <td>${thematiqueBadges(f.thematiques_list)}</td>
          <td>${statusBadge(f.application_status)}</td>
          <td>${starsHTML(Math.round(f.note_moyenne))}</td>
          <td>
            <div class="heures-display">
              <span class="heures-icon">\u23f1\ufe0f</span>
              ${f.nb_heures_total}h
            </div>
          </td>
          <td>${actionButtons(f.id, f.application_status)}</td>
        </tr>
      `;
    }
  }

  const content = `
    <div class="page-header-accent"></div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>
          <span class="page-icon">\ud83d\udc68\u200d\ud83c\udfeb</span>
          Formateurs
          <span class="count-badge">${stats.total}</span>
        </h1>
        <div class="page-subtitle">G\u00e9rez les formateurs, validez les candidatures et suivez leur activit\u00e9</div>
      </div>
      <div class="btn-group">
        <a href="/formateurs/export-csv" class="btn btn-export btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter CSV
        </a>
      </div>
    </div>

    <!-- Stats mini -->
    <div class="stats-mini">
      <div class="mini-badge blue">
        <span>\ud83d\udc65</span>
        <span class="mini-count">${stats.total}</span>
        <span>Total</span>
      </div>
      <div class="mini-badge green">
        <span>\u2705</span>
        <span class="mini-count">${stats.valides}</span>
        <span>Valid\u00e9s</span>
      </div>
      <div class="mini-badge orange">
        <span>\u23f3</span>
        <span class="mini-count">${stats.en_attente}</span>
        <span>En attente</span>
      </div>
      <div class="mini-badge red">
        <span>\u274c</span>
        <span class="mini-count">${stats.refuses}</span>
        <span>Refus\u00e9s</span>
      </div>
      <div class="mini-badge gray">
        <span>\u23f8\ufe0f</span>
        <span class="mini-count">${stats.suspendus}</span>
        <span>Suspendus</span>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <input type="text" class="search-input" id="search-input"
             placeholder="Rechercher par nom, pr\u00e9nom ou email\u2026"
             value="${escapeHtml(search)}"
             onkeydown="if(event.key==='Enter')applyFilters()">
      <select class="filter-select" id="status-filter" onchange="applyFilters()">
        <option value="">Tous les statuts</option>
        <option value="valide" ${statusFilter === 'valide' ? 'selected' : ''}>Valid\u00e9</option>
        <option value="en_attente" ${statusFilter === 'en_attente' ? 'selected' : ''}>En attente</option>
        <option value="refuse" ${statusFilter === 'refuse' ? 'selected' : ''}>Refus\u00e9</option>
        <option value="suspendu" ${statusFilter === 'suspendu' ? 'selected' : ''}>Suspendu</option>
        <option value="draft" ${statusFilter === 'draft' ? 'selected' : ''}>Brouillon</option>
      </select>
      <input type="text" class="search-input" id="ville-input"
             placeholder="Ville\u2026" style="min-width:140px;flex:unset;width:180px"
             value="${escapeHtml(villeFilter)}"
             onkeydown="if(event.key==='Enter')applyFilters()">
      <button class="btn btn-primary btn-sm" onclick="applyFilters()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Filtrer
      </button>
      ${(search || statusFilter || villeFilter) ? `
        <a href="/formateurs" class="btn btn-outline btn-sm">Effacer</a>
      ` : ''}
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width:50px">Photo</th>
            <th>Nom Pr\u00e9nom</th>
            <th>Ville</th>
            <th>Th\u00e9matiques</th>
            <th>Statut</th>
            <th>Note</th>
            <th>Heures</th>
            <th style="width:200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    ${paginationHTML(page, total, limit, paginationBase.replace(/&$/, ''))}

    <script>
      function applyFilters() {
        const search = document.getElementById('search-input').value.trim();
        const status = document.getElementById('status-filter').value;
        const ville = document.getElementById('ville-input').value.trim();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (ville) params.set('ville', ville);
        window.location.href = '/formateurs' + (params.toString() ? '?' + params.toString() : '');
      }

      async function changeStatus(id, status) {
        const labels = { valide: 'valider', refuse: 'refuser', suspendu: 'suspendre', en_attente: 'r\u00e9examiner' };
        if (!confirm('Voulez-vous vraiment ' + (labels[status] || status) + ' ce formateur ?')) return;

        try {
          const res = await fetch('/api/formateurs/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          if (res.ok) {
            window.location.reload();
          } else {
            const data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
          }
        } catch (e) {
          alert('Erreur de connexion');
        }
      }
    </script>
  `;

  return htmlPage({
    title: 'Formateurs',
    activePage: 'formateurs',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
