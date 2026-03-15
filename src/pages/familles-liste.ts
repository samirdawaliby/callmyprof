/**
 * Soutien Scolaire Caplogy - Page Admin: Liste des Familles & Eleves
 * Listing avec filtres, stats, table, pagination, animations vivantes
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { getFamilles } from '../api/familles';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--success), var(--secondary), var(--success));
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
    background: linear-gradient(135deg, var(--success) 0%, #34d399 100%);
    color: var(--white);
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
  .stats-mini .mini-badge.blue .mini-count { color: var(--blue); }
  .stats-mini .mini-badge.purple .mini-count { color: var(--purple); }
  .stats-mini .mini-badge.teal .mini-count { color: var(--secondary); }

  /* ---- Famille avatar ---- */
  .famille-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    border: 2px solid #6ee7b7;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    animation: bounceIn 0.5s ease both;
  }
  .famille-avatar:hover {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  }

  /* ---- Children count pill ---- */
  .children-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--blue-light), #bfdbfe);
    color: #1e40af;
    border: 1px solid #93c5fd;
    transition: transform var(--transition-fast);
  }
  .children-pill:hover {
    transform: scale(1.08);
  }

  /* ---- Package count pill ---- */
  .package-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 700;
  }
  .package-pill.active {
    background: linear-gradient(135deg, var(--success-light), #a7f3d0);
    color: #065f46;
    border: 1px solid #6ee7b7;
  }
  .package-pill.none {
    background: var(--gray-100);
    color: var(--gray-500);
    border: 1px solid var(--gray-200);
  }

  /* ---- Money display ---- */
  .money-display {
    font-weight: 700;
    color: var(--gray-900);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .money-display .money-icon {
    font-size: 14px;
    animation: float 3s ease-in-out infinite;
  }

  /* ---- Empty state illustration ---- */
  .empty-illustration {
    width: 180px;
    height: 180px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #d1fae5, rgba(16,185,129,0.2));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72px;
    animation: float 4s ease-in-out infinite;
    box-shadow: 0 20px 60px rgba(16,185,129,0.2);
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

  /* ---- Clickable row ---- */
  tbody tr.clickable-row {
    cursor: pointer;
  }
  tbody tr.clickable-row:hover {
    background: rgba(16, 185, 129, 0.06);
  }

  /* ---- Action buttons ---- */
  .btn-voir {
    background: var(--white);
    color: var(--primary);
    border: 1px solid var(--primary);
  }
  .btn-voir:hover {
    background: var(--primary);
    color: var(--white);
  }

  /* ---- URSSAF badge ---- */
  .urssaf-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  .urssaf-badge.active {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .urssaf-badge.inactive {
    background: var(--gray-100);
    color: var(--gray-500);
    border: 1px solid var(--gray-200);
  }

  @media (max-width: 1200px) {
    .table-wrapper { font-size: 13px; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function familleAvatar(prenom: string, nom: string): string {
  const initials = ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
  return `<div class="famille-avatar" title="${escapeHtml(prenom)} ${escapeHtml(nom)}">${escapeHtml(initials)}</div>`;
}

function formatMoney(amount: number): string {
  if (amount === 0) return '<span style="color:var(--gray-400)">-</span>';
  return `<div class="money-display"><span class="money-icon">\u{1F4B6}</span>${amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\u{00A0}\u{20AC}</div>`;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderFamillesListe(env: Env, url: URL, userName?: string): Promise<string> {
  const data = await getFamilles(env, url);
  const { familles, total, page, limit, stats } = data;

  // Build current filter state for URL persistence
  const search = url.searchParams.get('search') || '';
  const villeFilter = url.searchParams.get('ville') || '';

  // Build base URL for pagination
  const paginationBase = '/familles?' +
    (search ? `search=${encodeURIComponent(search)}&` : '') +
    (villeFilter ? `ville=${encodeURIComponent(villeFilter)}&` : '');

  // Table rows
  let tableRows = '';
  if (familles.length === 0) {
    tableRows = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-illustration">\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}</div>
            <div class="empty-title">Aucune famille trouv\u{00E9}e</div>
            <div class="empty-text">Ajoutez une premi\u{00E8}re famille ou modifiez vos filtres de recherche</div>
            <a href="/familles/new" class="btn btn-success" style="margin-top:16px">
              \u{2795} Ajouter une famille
            </a>
          </div>
        </td>
      </tr>
    `;
  } else {
    for (const f of familles) {
      const packagePill = f.packages_actifs > 0
        ? `<span class="package-pill active">\u{1F4E6} ${f.packages_actifs}</span>`
        : `<span class="package-pill none">0</span>`;

      tableRows += `
        <tr class="clickable-row" onclick="window.location='/familles/${escapeHtml(f.id)}'">
          <td>${familleAvatar(f.prenom, f.nom)}</td>
          <td>
            <div class="cell-main">${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}</div>
            <div class="cell-sub">${escapeHtml(f.email)}</div>
          </td>
          <td>${escapeHtml(f.ville)}</td>
          <td class="text-center"><span class="children-pill">\u{1F466} ${f.nb_enfants}</span></td>
          <td class="text-center">${packagePill}</td>
          <td>${formatMoney(f.total_depense)}</td>
          <td>
            <a href="/familles/${escapeHtml(f.id)}" class="btn btn-sm btn-voir" onclick="event.stopPropagation()">Voir</a>
          </td>
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
          <span class="page-icon">\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}</span>
          Familles & \u{00C9}l\u{00E8}ves
          <span class="count-badge">${stats.total}</span>
        </h1>
        <div class="page-subtitle">G\u{00E9}rez les familles, les \u{00E9}l\u{00E8}ves et suivez leurs packages</div>
      </div>
      <div class="btn-group">
        <a href="/familles/new" class="btn btn-success">
          \u{2795} Ajouter une famille
        </a>
      </div>
    </div>

    <!-- Stats mini -->
    <div class="stats-mini">
      <div class="mini-badge green">
        <span>\u{1F3E0}</span>
        <span class="mini-count">${stats.total}</span>
        <span>Familles</span>
      </div>
      <div class="mini-badge blue">
        <span>\u{1F393}</span>
        <span class="mini-count">${stats.total_enfants}</span>
        <span>\u{00C9}l\u{00E8}ves</span>
      </div>
      <div class="mini-badge purple">
        <span>\u{1F4E6}</span>
        <span class="mini-count">${stats.packages_actifs}</span>
        <span>Packages actifs</span>
      </div>
      <div class="mini-badge teal">
        <span>\u{2705}</span>
        <span class="mini-count">${stats.urssaf_actifs}</span>
        <span>URSSAF</span>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <input type="text" class="search-input" id="search-input"
             placeholder="Rechercher par nom ou email\u{2026}"
             value="${escapeHtml(search)}"
             onkeydown="if(event.key==='Enter')applyFilters()">
      <input type="text" class="search-input" id="ville-input"
             placeholder="Ville\u{2026}" style="min-width:140px;flex:unset;width:180px"
             value="${escapeHtml(villeFilter)}"
             onkeydown="if(event.key==='Enter')applyFilters()">
      <button class="btn btn-primary btn-sm" onclick="applyFilters()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Filtrer
      </button>
      ${(search || villeFilter) ? `
        <a href="/familles" class="btn btn-outline btn-sm">Effacer</a>
      ` : ''}
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width:50px"></th>
            <th>Nom parent</th>
            <th>Ville</th>
            <th class="text-center">Enfants</th>
            <th class="text-center">Packages actifs</th>
            <th>Total d\u{00E9}pens\u{00E9}</th>
            <th style="width:80px">Actions</th>
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
        var search = document.getElementById('search-input').value.trim();
        var ville = document.getElementById('ville-input').value.trim();
        var params = new URLSearchParams();
        if (search) params.set('search', search);
        if (ville) params.set('ville', ville);
        window.location.href = '/familles' + (params.toString() ? '?' + params.toString() : '');
      }
    </script>
  `;

  return htmlPage({
    title: 'Familles & \u{00C9}l\u{00E8}ves',
    activePage: 'familles',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
