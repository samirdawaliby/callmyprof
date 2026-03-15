/**
 * Soutien Scolaire Caplogy - Page Admin: Paiements Formateurs
 * Suivi des paiements mensuels aux formateurs avec animations lively
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { formatPrix } from '../../shared/pricing';
import { getPaiementsFormateurs } from '../api/factures';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--success), var(--secondary), var(--primary), var(--secondary), var(--success));
    background-size: 400% 100%;
    animation: shimmer 5s linear infinite;
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

  /* ---- Stat card value colors ---- */
  .stat-card .stat-value.text-success { color: var(--success); }
  .stat-card .stat-value.text-primary { color: var(--primary); }
  .stat-card .stat-value.text-warning { color: var(--warning); }

  /* ---- Formateur cell ---- */
  .formateur-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .formateur-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-light), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--white);
    flex-shrink: 0;
  }
  .formateur-name {
    font-weight: 600;
    color: var(--gray-900);
    font-size: 14px;
  }

  /* ---- Paiement statut badges fancy ---- */
  .badge-en_attente {
    background: linear-gradient(135deg, var(--warning-light), #fef3c7);
    color: #92400e;
    border: 1px solid #fde68a;
  }
  .badge-vire {
    background: linear-gradient(135deg, var(--success-light), #d1fae5);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .badge-echec {
    background: linear-gradient(135deg, var(--danger-light), #fee2e2);
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  /* ---- Staggered row animation ---- */
  tbody tr {
    animation: slideUp 0.4s ease both;
  }
  tbody tr:nth-child(1) { animation-delay: 0.05s; }
  tbody tr:nth-child(2) { animation-delay: 0.08s; }
  tbody tr:nth-child(3) { animation-delay: 0.11s; }
  tbody tr:nth-child(4) { animation-delay: 0.14s; }
  tbody tr:nth-child(5) { animation-delay: 0.17s; }
  tbody tr:nth-child(6) { animation-delay: 0.20s; }
  tbody tr:nth-child(7) { animation-delay: 0.23s; }
  tbody tr:nth-child(8) { animation-delay: 0.26s; }
  tbody tr:nth-child(9) { animation-delay: 0.29s; }
  tbody tr:nth-child(10) { animation-delay: 0.32s; }

  /* ---- Month selector ---- */
  .month-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  .month-nav .month-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--gray-200);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    color: var(--gray-600);
    transition: all var(--transition-fast);
  }
  .month-nav .month-btn:hover {
    background: var(--gray-50);
    border-color: var(--secondary);
    color: var(--primary);
    transform: scale(1.1);
  }
  .month-nav .month-label {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    min-width: 180px;
    text-align: center;
  }

  /* ---- Hover row ---- */
  tbody tr:hover {
    background: rgba(16, 185, 129, 0.06) !important;
  }

  /* ---- Action buttons small ---- */
  .table-actions .btn-sm {
    padding: 5px 12px;
    font-size: 12px;
  }

  /* ---- Print ---- */
  @media print {
    .sidebar, .sidebar-toggle, .sidebar-overlay, .filter-bar, .page-header .btn-group,
    .table-actions, .pagination-wrapper, .month-nav { display: none !important; }
    .main-content { margin-left: 0 !important; }
  }
`;

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderPaiementsFormateurs(env: Env, url: URL): Promise<string> {
  const data = await getPaiementsFormateurs(env, url);
  const userName = 'Admin';

  const now = new Date();
  const moisParam = url.searchParams.get('mois') || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  // Parse current month for navigation
  const [moisYear, moisMonth] = moisParam.split('-').map(Number);
  const prevDate = new Date(moisYear, moisMonth - 2, 1);
  const nextDate = new Date(moisYear, moisMonth, 1);
  const prevMois = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const nextMois = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const moisLabel = new Date(moisYear, moisMonth - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Build table rows
  const rows = data.paiements.map(p => {
    const initials = ((p.formateur_prenom || '')[0] || '') + ((p.formateur_nom || '')[0] || '');
    const statutBadge = `<span class="badge badge-dot badge-${p.statut}">${
      p.statut === 'en_attente' ? 'En attente'
      : p.statut === 'vire' ? 'Vir\u00E9'
      : '\u00C9chec'
    }</span>`;

    return `
      <tr>
        <td>
          <div class="formateur-cell">
            <div class="formateur-avatar">${escapeHtml(initials.toUpperCase())}</div>
            <div class="formateur-name">${escapeHtml(p.formateur_prenom)} ${escapeHtml(p.formateur_nom)}</div>
          </div>
        </td>
        <td class="text-center">${p.nb_heures}h</td>
        <td class="text-right" style="font-weight: 700; color: var(--gray-900);">${formatPrix(p.montant)}</td>
        <td class="text-center">${statutBadge}</td>
        <td>${p.date_virement ? formatDateFr(p.date_virement) : '-'}</td>
        <td>
          <div class="table-actions">
            ${p.statut === 'en_attente' ? `
              <button class="btn btn-sm btn-success" onclick="marquerVire('${escapeHtml(p.id)}')">
                &#9989; Marquer vir&eacute;
              </button>
            ` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');

  // Pagination
  const baseUrl = '/paiements-formateurs?mois=' + encodeURIComponent(moisParam);
  const pagination = paginationHTML(data.page, data.total, data.limit, baseUrl);

  const content = `
    <div class="page-header-accent"></div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>
          <span class="page-icon">&#128179;</span>
          Paiements Formateurs
          <span class="count-badge">${data.total}</span>
        </h1>
        <div class="page-subtitle">Suivi des versements mensuels aux intervenants</div>
      </div>
      <div class="btn-group">
        <a href="/factures" class="btn btn-outline">
          &#128176; Facturation
        </a>
        <button class="btn btn-primary" onclick="genererPaiements()">
          &#9889; G&eacute;n&eacute;rer paiements du mois
        </button>
        <button class="btn btn-outline" onclick="exportCSV()">
          &#128196; Export CSV
        </button>
      </div>
    </div>

    <!-- Month navigation -->
    <div class="filter-bar" style="justify-content: center;">
      <div class="month-nav">
        <a href="/paiements-formateurs?mois=${prevMois}" class="month-btn" title="Mois pr&eacute;c&eacute;dent">&laquo;</a>
        <div class="month-label">${escapeHtml(moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1))}</div>
        <a href="/paiements-formateurs?mois=${nextMois}" class="month-btn" title="Mois suivant">&raquo;</a>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="stat-icon">&#9203;</div>
        <div class="stat-value text-warning">${formatPrix(data.stats.total_du)}</div>
        <div class="stat-label">Total d&ucirc; (en attente)</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">&#9989;</div>
        <div class="stat-value text-success">${formatPrix(data.stats.total_vire)}</div>
        <div class="stat-label">Total vir&eacute;</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">&#128104;&#8205;&#127979;</div>
        <div class="stat-value text-primary">${data.stats.nb_formateurs}</div>
        <div class="stat-label">Formateurs concern&eacute;s</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">&#128276;</div>
        <div class="stat-value">${data.stats.nb_en_attente}</div>
        <div class="stat-label">Paiements en attente</div>
      </div>
    </div>

    <!-- Table -->
    ${data.paiements.length > 0 ? `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Formateur</th>
            <th class="text-center">Heures</th>
            <th class="text-right">Montant d&ucirc;</th>
            <th class="text-center">Statut</th>
            <th>Date virement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    ${pagination}
    ` : `
    <div class="empty-state">
      <span class="empty-icon">&#128179;</span>
      <div class="empty-title">Aucun paiement pour ce mois</div>
      <div class="empty-text">G&eacute;n&eacute;rez les paiements pour voir les montants dus aux formateurs.</div>
    </div>
    `}
  `;

  return htmlPage({
    title: 'Paiements Formateurs',
    activePage: 'factures',
    extraCss: PAGE_CSS,
    content,
    userName,
  }) + `
  <script>
    async function marquerVire(id) {
      if (!confirm('Confirmer le virement pour ce formateur ?')) return;
      try {
        const resp = await fetch('/api/paiements-formateurs/' + id + '/vire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}'
        });
        if (resp.ok) window.location.reload();
        else {
          const data = await resp.json();
          alert(data.error || 'Erreur');
        }
      } catch(e) { alert('Erreur reseau'); }
    }

    async function genererPaiements() {
      const mois = '${escapeHtml(moisParam)}';
      if (!confirm('Generer les paiements pour ' + mois + ' ?')) return;
      try {
        const resp = await fetch('/api/paiements-formateurs/generer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mois: mois })
        });
        const data = await resp.json();
        if (resp.ok) {
          alert('Paiements generes : ' + data.nb_paiements_crees + ' nouveau(x) pour ' + data.nb_formateurs + ' formateur(s)');
          window.location.reload();
        } else {
          alert(data.error || 'Erreur');
        }
      } catch(e) { alert('Erreur reseau'); }
    }

    function exportCSV() {
      // Build CSV from the current table
      const table = document.querySelector('table');
      if (!table) { alert('Aucune donnee a exporter'); return; }
      const rows = table.querySelectorAll('tr');
      let csv = '';
      rows.forEach(function(row, idx) {
        const cells = row.querySelectorAll('th, td');
        const values = [];
        cells.forEach(function(cell, i) {
          if (i < cells.length - 1) { // Skip actions column
            values.push('"' + cell.textContent.trim().replace(/"/g, '""') + '"');
          }
        });
        csv += values.join(';') + '\\n';
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'paiements-formateurs-${escapeHtml(moisParam)}.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  </script>`;
}
