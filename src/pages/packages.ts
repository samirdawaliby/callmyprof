/**
 * Soutien Scolaire Caplogy - Page Admin: Packages
 * Types de packages + packages vendus, stats, filtres, animations
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { formatPrix, formatTarifHoraire, labelTypeCours } from '../../shared/pricing';
import { getPackages } from '../api/packages';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--purple), var(--secondary), var(--primary));
    background-size: 300% 100%;
    animation: shimmer 4s linear infinite;
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

  /* ---- Package type cards grid ---- */
  .pkg-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  .pkg-type-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 20px 22px;
    border: 1px solid var(--gray-100);
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    animation: slideUp 0.5s ease both;
    transition: all var(--transition-normal);
  }
  .pkg-type-card:nth-child(1) { animation-delay: 0.05s; }
  .pkg-type-card:nth-child(2) { animation-delay: 0.1s; }
  .pkg-type-card:nth-child(3) { animation-delay: 0.15s; }
  .pkg-type-card:nth-child(4) { animation-delay: 0.2s; }
  .pkg-type-card:nth-child(5) { animation-delay: 0.25s; }
  .pkg-type-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  .pkg-type-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
  }
  .pkg-type-card.individuel::before {
    background: linear-gradient(90deg, var(--blue), var(--secondary));
  }
  .pkg-type-card.collectif::before {
    background: linear-gradient(90deg, var(--purple), #a78bfa);
  }
  .pkg-type-card.mixte::before {
    background: linear-gradient(90deg, var(--blue), var(--purple));
  }
  .pkg-type-card .pkg-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--warning), #fbbf24);
    color: var(--gray-900);
    animation: pulse 2s ease-in-out infinite;
  }
  .pkg-type-card .pkg-name {
    font-size: 18px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 4px;
    margin-top: 4px;
  }
  .pkg-type-card .pkg-type {
    font-size: 12px;
    color: var(--gray-500);
    margin-bottom: 12px;
  }
  .pkg-type-card .pkg-price {
    font-size: 28px;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -1px;
    line-height: 1;
  }
  .pkg-type-card .pkg-price-unit {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-400);
    margin-top: 2px;
  }
  .pkg-type-card .pkg-details {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: var(--gray-600);
  }
  .pkg-type-card .pkg-details .detail-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pkg-type-card .pkg-details .detail-icon {
    font-size: 14px;
    width: 20px;
    text-align: center;
  }
  .pkg-credit-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    margin-top: 10px;
    animation: bounceIn 0.5s ease both;
    animation-delay: 0.3s;
  }
  .pkg-credit-badge.eligible {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .pkg-credit-badge.not-eligible {
    background: var(--gray-100);
    color: var(--gray-500);
    border: 1px solid var(--gray-200);
  }

  /* ---- Section titles ---- */
  .section-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideInLeft 0.4s ease both;
  }
  .section-title .section-icon {
    font-size: 22px;
    animation: float 3s ease-in-out infinite;
  }

  /* ---- Progress bar for hours ---- */
  .hours-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 160px;
  }
  .progress-bar-wrapper {
    flex: 1;
    height: 8px;
    background: var(--gray-100);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .progress-bar-fill.low { background: linear-gradient(90deg, var(--success), #34d399); }
  .progress-bar-fill.medium { background: linear-gradient(90deg, var(--warning), #fbbf24); }
  .progress-bar-fill.high { background: linear-gradient(90deg, var(--danger), #f87171); }
  .progress-bar-fill::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s linear infinite;
    background-size: 200% 100%;
  }
  .hours-text {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    min-width: 50px;
    text-align: right;
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

  /* ---- Empty state illustration ---- */
  .empty-illustration {
    width: 180px;
    height: 180px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, var(--purple-light), rgba(139,92,246,0.15));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72px;
    animation: float 4s ease-in-out infinite;
    box-shadow: 0 20px 60px rgba(139,92,246,0.15);
  }

  @media (max-width: 768px) {
    .pkg-types-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .pkg-types-grid { grid-template-columns: 1fr; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statutBadge(statut: string): string {
  const labels: Record<string, string> = {
    actif: 'Actif',
    expire: 'Expir\u00e9',
    epuise: '\u00c9puis\u00e9',
    rembourse: 'Rembours\u00e9',
  };
  return `<span class="badge badge-${statut} badge-dot">${escapeHtml(labels[statut] || statut)}</span>`;
}

function hoursProgressBar(used: number, total: number): string {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const colorClass = pct < 50 ? 'low' : pct < 80 ? 'medium' : 'high';
  return `
    <div class="hours-progress">
      <div class="progress-bar-wrapper">
        <div class="progress-bar-fill ${colorClass}" style="width:${pct}%"></div>
      </div>
      <span class="hours-text">${used}/${total}h</span>
    </div>
  `;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderPackages(env: Env, url: URL, userName?: string): Promise<string> {
  const data = await getPackages(env, url);
  const { packages, total, page, limit, stats, package_types } = data;

  // Filters
  const search = url.searchParams.get('search')?.trim() || '';
  const statutFilter = url.searchParams.get('statut') || '';
  const typeFilter = url.searchParams.get('type') || '';
  const hasFilters = search || statutFilter || typeFilter;

  // Pagination base
  const filterParams = new URLSearchParams();
  if (search) filterParams.set('search', search);
  if (statutFilter) filterParams.set('statut', statutFilter);
  if (typeFilter) filterParams.set('type', typeFilter);
  const paginationBase = '/packages' + (filterParams.toString() ? '?' + filterParams.toString() : '');

  // Package type filter options
  const typeOptions = package_types.map(pt =>
    `<option value="${escapeHtml(pt.id)}" ${typeFilter === pt.id ? 'selected' : ''}>${escapeHtml(pt.nom)}</option>`
  ).join('');

  // Package type cards
  const typeCards = package_types.map(pt => {
    const isEligible = pt.eligible_credit_impot === 1;
    const creditBadge = isEligible
      ? `<div class="pkg-credit-badge eligible">\u2705 Cr\u00e9dit imp\u00f4t 50%</div>`
      : `<div class="pkg-credit-badge not-eligible">\u2796 Non \u00e9ligible</div>`;

    // Check for "popular" tag (Confort 10h)
    const tag = pt.nom === 'Confort' ? '<div class="pkg-tag">Populaire</div>' :
                pt.nom === 'Intensif' ? '<div class="pkg-tag">Meilleur prix</div>' : '';

    return `
      <div class="pkg-type-card ${pt.type_cours}">
        ${tag}
        <div class="pkg-name">${escapeHtml(pt.nom)}</div>
        <div class="pkg-type">${escapeHtml(labelTypeCours(pt.type_cours))} - ${pt.nb_heures}h</div>
        <div class="pkg-price">${formatPrix(pt.prix)}</div>
        <div class="pkg-price-unit">${formatTarifHoraire(pt.prix_par_heure)}</div>
        <div class="pkg-details">
          <div class="detail-row"><span class="detail-icon">\u23f0</span> ${pt.nb_heures} heures</div>
          <div class="detail-row"><span class="detail-icon">\ud83d\udcc5</span> Validit\u00e9 ${pt.duree_validite_jours}j</div>
          ${pt.max_eleves_collectif > 1 ? `<div class="detail-row"><span class="detail-icon">\ud83d\udc65</span> Max ${pt.max_eleves_collectif} \u00e9l\u00e8ves</div>` : ''}
        </div>
        ${creditBadge}
      </div>
    `;
  }).join('');

  // Table rows for sold packages
  let tableRows = '';
  if (packages.length === 0) {
    tableRows = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-illustration">\ud83d\udce6</div>
            <div class="empty-title">Aucun package trouv\u00e9</div>
            <div class="empty-text">Modifiez vos filtres ou vendez un nouveau package</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    for (const p of packages) {
      const restant = p.heures_total - p.heures_utilisees;
      tableRows += `
        <tr>
          <td>
            <div class="cell-main">${escapeHtml(p.eleve_prenom || '')} ${escapeHtml(p.eleve_nom || '')}</div>
            <div class="cell-sub">${escapeHtml(p.parent_prenom || '')} ${escapeHtml(p.parent_nom || '')}</div>
          </td>
          <td>
            <span class="badge badge-${p.package_type_cours || ''}" style="font-size:11px">${escapeHtml(p.package_nom || '')}</span>
          </td>
          <td>${hoursProgressBar(p.heures_utilisees, p.heures_total)}</td>
          <td>
            <div class="cell-main">${formatDateFr(p.date_expiration)}</div>
          </td>
          <td>${statutBadge(p.statut)}</td>
          <td class="text-right">
            <div class="cell-main">${formatPrix(p.montant_paye)}</div>
            ${p.credit_impot > 0 ? `<div class="cell-sub" style="color:var(--success)">-${formatPrix(p.credit_impot)} CI</div>` : ''}
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
          <span class="page-icon">\ud83d\udce6</span>
          Packages
          <span class="count-badge">${stats.total_actifs} actifs</span>
        </h1>
        <div class="page-subtitle">G\u00e9rez les types de packages et suivez les ventes</div>
      </div>
      <div class="btn-group">
        <a href="/packages/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Vendre un package
        </a>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">\ud83d\udce6</div>
        <div class="stat-value">${stats.total_actifs}</div>
        <div class="stat-label">Packages actifs</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">\u23f0</div>
        <div class="stat-value">${Math.round(stats.heures_consommees)}h</div>
        <div class="stat-label">Heures consomm\u00e9es</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">\u23f3</div>
        <div class="stat-value">${Math.round(stats.heures_restantes)}h</div>
        <div class="stat-label">Heures restantes</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">\ud83d\udcb0</div>
        <div class="stat-value">${formatPrix(stats.ca_total)}</div>
        <div class="stat-label">CA total</div>
      </div>
    </div>

    <!-- Section: Package types -->
    <div class="section-title">
      <span class="section-icon">\ud83c\udff7\ufe0f</span>
      Types de packages
    </div>
    <div class="pkg-types-grid">
      ${typeCards}
    </div>

    <!-- Section: Sold packages -->
    <div class="section-title" style="margin-top:16px">
      <span class="section-icon">\ud83d\udcca</span>
      Packages vendus
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <input type="text" class="search-input" id="search-input"
             placeholder="Rechercher un \u00e9l\u00e8ve ou parent\u2026"
             value="${escapeHtml(search)}"
             onkeydown="if(event.key==='Enter')applyFilters()">
      <select class="filter-select" id="statut-filter" onchange="applyFilters()">
        <option value="">Tous les statuts</option>
        <option value="actif" ${statutFilter === 'actif' ? 'selected' : ''}>Actif</option>
        <option value="expire" ${statutFilter === 'expire' ? 'selected' : ''}>Expir\u00e9</option>
        <option value="epuise" ${statutFilter === 'epuise' ? 'selected' : ''}>\u00c9puis\u00e9</option>
        <option value="rembourse" ${statutFilter === 'rembourse' ? 'selected' : ''}>Rembours\u00e9</option>
      </select>
      <select class="filter-select" id="type-filter" onchange="applyFilters()">
        <option value="">Tous les types</option>
        ${typeOptions}
      </select>
      <button class="btn btn-primary btn-sm" onclick="applyFilters()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Filtrer
      </button>
      ${hasFilters ? '<a href="/packages" class="btn btn-outline btn-sm">Effacer</a>' : ''}
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>\u00c9l\u00e8ve</th>
            <th>Package</th>
            <th>Heures</th>
            <th>Expiration</th>
            <th>Statut</th>
            <th class="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    ${paginationHTML(page, total, limit, paginationBase)}

    <script>
      function applyFilters() {
        var params = new URLSearchParams();
        var s = document.getElementById('search-input').value.trim();
        var st = document.getElementById('statut-filter').value;
        var tp = document.getElementById('type-filter').value;
        if (s) params.set('search', s);
        if (st) params.set('statut', st);
        if (tp) params.set('type', tp);
        window.location.href = '/packages' + (params.toString() ? '?' + params.toString() : '');
      }
    </script>
  `;

  return htmlPage({
    title: 'Packages',
    activePage: 'packages',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
