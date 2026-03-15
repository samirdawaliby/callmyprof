/**
 * Soutien Scolaire Caplogy - Page Admin: Facturation
 * Listing des factures avec stats, filtres, table, pagination, animations lively
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { formatPrix } from '../../shared/pricing';
import { getFactures } from '../api/factures';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--success), var(--warning), var(--secondary), var(--primary));
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
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: var(--primary-dark);
    font-size: 13px;
    font-weight: 700;
    animation: bounceIn 0.6s ease both;
    animation-delay: 0.3s;
  }

  /* ---- Stat card overrides for facturation colors ---- */
  .stat-card .stat-value.euro {
    color: var(--primary);
  }
  .stat-card .stat-value.danger {
    color: var(--danger);
  }
  .stat-card .stat-value.success {
    color: var(--success);
  }

  /* ---- Animated money icon ---- */
  @keyframes coinFlip {
    0%, 100% { transform: rotateY(0deg) translateY(0); }
    25% { transform: rotateY(90deg) translateY(-4px); }
    50% { transform: rotateY(180deg) translateY(0); }
    75% { transform: rotateY(270deg) translateY(-4px); }
  }
  .coin-flip {
    display: inline-block;
    animation: coinFlip 3s ease-in-out infinite;
  }

  /* ---- Table amount column ---- */
  .amount-main {
    font-weight: 700;
    color: var(--gray-900);
    font-size: 14px;
  }
  .amount-credit {
    font-size: 12px;
    color: var(--success);
    font-weight: 600;
  }
  .amount-reste {
    font-size: 12px;
    color: var(--primary);
    font-weight: 600;
  }

  /* ---- Type badge fancy ---- */
  .badge-type-package {
    background: linear-gradient(135deg, var(--blue-light), #bfdbfe);
    color: #1e40af;
    border: 1px solid #93c5fd;
  }
  .badge-type-mensuelle {
    background: linear-gradient(135deg, var(--purple-light), #ddd6fe);
    color: #5b21b6;
    border: 1px solid #c4b5fd;
  }
  .badge-type-avoir {
    background: linear-gradient(135deg, var(--danger-light), #fecaca);
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

  /* ---- Generate modal ---- */
  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease both;
  }
  .modal-overlay.open {
    display: flex;
  }
  .modal-box {
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    padding: 32px;
    max-width: 500px;
    width: 90%;
    animation: slideUp 0.3s ease both;
  }
  .modal-box h2 {
    font-size: 20px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  /* ---- Hover row highlight ---- */
  tbody tr:hover {
    background: rgba(109, 203, 221, 0.08) !important;
  }

  /* ---- Print ---- */
  @media print {
    .sidebar, .sidebar-toggle, .sidebar-overlay, .filter-bar, .page-header .btn,
    .table-actions, .pagination-wrapper, .modal-overlay { display: none !important; }
    .main-content { margin-left: 0 !important; }
  }
`;

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderFacturesListe(env: Env, url: URL): Promise<string> {
  const data = await getFactures(env, url);
  const userName = 'Admin';

  const moisFilter = url.searchParams.get('mois') || '';
  const statutFilter = url.searchParams.get('statut') || '';
  const searchFilter = url.searchParams.get('q') || '';

  // Generate month options for last 12 months
  const now = new Date();
  const moisOptions: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    moisOptions.push(`<option value="${val}" ${moisFilter === val ? 'selected' : ''}>${escapeHtml(label)}</option>`);
  }

  // Build table rows
  const rows = data.factures.map(f => {
    const typeBadge = f.type === 'package'
      ? '<span class="badge badge-type-package">Package</span>'
      : f.type === 'mensuelle'
        ? '<span class="badge badge-type-mensuelle">Mensuelle</span>'
        : '<span class="badge badge-type-avoir">Avoir</span>';

    const statutBadge = `<span class="badge badge-dot badge-${f.statut}">${labelStatut(f.statut)}</span>`;

    const isAvoir = f.type === 'avoir';
    const montantSign = isAvoir ? '-' : '';

    return `
      <tr>
        <td>
          <div class="cell-main">
            <a href="/factures/${escapeHtml(f.id)}" style="color: var(--primary); font-weight: 700;">${escapeHtml(f.reference)}</a>
          </div>
          ${f.periode_mois ? `<div class="cell-sub">${escapeHtml(f.periode_mois)}</div>` : ''}
        </td>
        <td>${formatDateFr(f.date_emission)}</td>
        <td>
          <div class="cell-main">${escapeHtml(f.parent_prenom || '')} ${escapeHtml(f.parent_nom || '')}</div>
          <div class="cell-sub">${escapeHtml(f.parent_email || '')}</div>
        </td>
        <td class="text-center">${typeBadge}</td>
        <td class="text-right">
          <div class="amount-main">${montantSign}${formatPrix(Math.abs(f.montant_brut))}</div>
        </td>
        <td class="text-right">
          <div class="amount-credit">${f.credit_impot > 0 ? `-${formatPrix(Math.abs(f.credit_impot))}` : '-'}</div>
        </td>
        <td class="text-right">
          <div class="amount-reste">${montantSign}${formatPrix(Math.abs(f.reste_a_charge))}</div>
        </td>
        <td class="text-center">${statutBadge}</td>
        <td>
          <div class="table-actions">
            <a href="/factures/${escapeHtml(f.id)}" class="btn btn-sm btn-outline" title="Voir">Voir</a>
            ${f.statut === 'emise' ? `
              <button class="btn btn-sm btn-success" onclick="marquerPayee('${escapeHtml(f.id)}')" title="Marquer payee">Payee</button>
            ` : ''}
          </div>
        </td>
      </tr>`;
  }).join('');

  // Build base URL for pagination (preserving filters)
  const paginationParams: string[] = [];
  if (moisFilter) paginationParams.push(`mois=${encodeURIComponent(moisFilter)}`);
  if (statutFilter) paginationParams.push(`statut=${encodeURIComponent(statutFilter)}`);
  if (searchFilter) paginationParams.push(`q=${encodeURIComponent(searchFilter)}`);
  const baseUrl = '/factures' + (paginationParams.length > 0 ? '?' + paginationParams.join('&') : '');

  const pagination = paginationHTML(data.page, data.total, data.limit, baseUrl);

  const content = `
    <div class="page-header-accent"></div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>
          <span class="page-icon coin-flip">&#128176;</span>
          Facturation
          <span class="count-badge">${data.total}</span>
        </h1>
        <div class="page-subtitle">Factures, paiements, attestations fiscales</div>
      </div>
      <div class="btn-group">
        <a href="/paiements-formateurs" class="btn btn-outline">
          &#128179; Paiements formateurs
        </a>
        <button class="btn btn-primary" onclick="openGenererModal()">
          &#9889; G&eacute;n&eacute;rer facture mensuelle
        </button>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">&#128200;</div>
        <div class="stat-value euro">${formatPrix(data.stats.ca_mois)}</div>
        <div class="stat-label">CA du mois</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">&#128196;</div>
        <div class="stat-value">${data.stats.nb_factures_mois}</div>
        <div class="stat-label">Factures ce mois</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">&#9888;&#65039;</div>
        <div class="stat-value danger">${formatPrix(data.stats.total_impaye)}</div>
        <div class="stat-label">Total impay&eacute;</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">&#128178;</div>
        <div class="stat-value success">${formatPrix(data.stats.marge_mois)}</div>
        <div class="stat-label">Marge du mois</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input type="text" class="search-input" placeholder="Rechercher client ou ref&eacute;rence..."
        value="${escapeHtml(searchFilter)}" onkeydown="if(event.key==='Enter') applyFilters()" id="searchInput">
      <select class="filter-select" id="moisSelect" onchange="applyFilters()">
        <option value="">Tous les mois</option>
        ${moisOptions.join('\n')}
      </select>
      <select class="filter-select" id="statutSelect" onchange="applyFilters()">
        <option value="">Tous les statuts</option>
        <option value="brouillon" ${statutFilter === 'brouillon' ? 'selected' : ''}>Brouillon</option>
        <option value="emise" ${statutFilter === 'emise' ? 'selected' : ''}>&Eacute;mise</option>
        <option value="payee" ${statutFilter === 'payee' ? 'selected' : ''}>Pay&eacute;e</option>
        <option value="echec" ${statutFilter === 'echec' ? 'selected' : ''}>&Eacute;chec</option>
        <option value="avoir" ${statutFilter === 'avoir' ? 'selected' : ''}>Avoir</option>
      </select>
    </div>

    <!-- Table -->
    ${data.factures.length > 0 ? `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>R&eacute;f&eacute;rence</th>
            <th>Date</th>
            <th>Client</th>
            <th class="text-center">Type</th>
            <th class="text-right">Montant brut</th>
            <th class="text-right">Cr&eacute;dit imp&ocirc;t</th>
            <th class="text-right">Reste &agrave; charge</th>
            <th class="text-center">Statut</th>
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
      <span class="empty-icon">&#128196;</span>
      <div class="empty-title">Aucune facture</div>
      <div class="empty-text">Les factures appara&icirc;tront ici une fois g&eacute;n&eacute;r&eacute;es.</div>
    </div>
    `}

    <!-- Modal: Generer facture mensuelle -->
    <div class="modal-overlay" id="genererModal">
      <div class="modal-box">
        <h2>&#9889; G&eacute;n&eacute;rer une facture mensuelle</h2>
        <div class="form-group">
          <label class="form-label">Parent <span class="required">*</span></label>
          <select class="form-select" id="genParentId">
            <option value="">Chargement...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mois <span class="required">*</span></label>
          <input type="month" class="form-input" id="genMois" value="${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}">
        </div>
        <div class="form-hint">Tous les cours termin&eacute;s du mois pour ce parent seront inclus.</div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="closeGenererModal()">Annuler</button>
          <button class="btn btn-primary" onclick="genererFacture()" id="genBtn">&#9889; G&eacute;n&eacute;rer</button>
        </div>
      </div>
    </div>
  `;

  return htmlPage({
    title: 'Facturation',
    activePage: 'factures',
    extraCss: PAGE_CSS,
    content,
    userName,
  }) + `
  <script>
    function applyFilters() {
      const q = document.getElementById('searchInput').value.trim();
      const mois = document.getElementById('moisSelect').value;
      const statut = document.getElementById('statutSelect').value;
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (mois) params.set('mois', mois);
      if (statut) params.set('statut', statut);
      window.location.href = '/factures' + (params.toString() ? '?' + params.toString() : '');
    }

    async function marquerPayee(id) {
      if (!confirm('Marquer cette facture comme payee ?')) return;
      try {
        const resp = await fetch('/api/factures/' + id + '/statut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: 'payee' })
        });
        if (resp.ok) {
          window.location.reload();
        } else {
          const data = await resp.json();
          alert(data.error || 'Erreur');
        }
      } catch (e) {
        alert('Erreur reseau');
      }
    }

    function openGenererModal() {
      document.getElementById('genererModal').classList.add('open');
      loadParents();
    }

    function closeGenererModal() {
      document.getElementById('genererModal').classList.remove('open');
    }

    async function loadParents() {
      try {
        const resp = await fetch('/api/parents/list');
        if (resp.ok) {
          const data = await resp.json();
          const select = document.getElementById('genParentId');
          select.innerHTML = '<option value="">-- Choisir un parent --</option>';
          (data.parents || []).forEach(function(p) {
            select.innerHTML += '<option value="' + p.id + '">' + p.prenom + ' ' + p.nom + ' (' + p.email + ')</option>';
          });
        } else {
          document.getElementById('genParentId').innerHTML = '<option value="">Erreur de chargement</option>';
        }
      } catch(e) {
        document.getElementById('genParentId').innerHTML = '<option value="">Erreur reseau</option>';
      }
    }

    async function genererFacture() {
      const parentId = document.getElementById('genParentId').value;
      const mois = document.getElementById('genMois').value;
      if (!parentId || !mois) {
        alert('Veuillez remplir tous les champs');
        return;
      }
      const btn = document.getElementById('genBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Generation...';
      try {
        const resp = await fetch('/api/factures/generer-mensuelle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parent_id: parentId, mois: mois })
        });
        const data = await resp.json();
        if (resp.ok) {
          alert('Facture ' + data.reference + ' generee ! Montant: ' + data.montant_brut + ' EUR');
          window.location.href = '/factures/' + data.facture_id;
        } else {
          alert(data.error || 'Erreur');
          btn.disabled = false;
          btn.innerHTML = '&#9889; Generer';
        }
      } catch(e) {
        alert('Erreur reseau');
        btn.disabled = false;
        btn.innerHTML = '&#9889; Generer';
      }
    }

    // Close modal on overlay click
    document.getElementById('genererModal').addEventListener('click', function(e) {
      if (e.target === this) closeGenererModal();
    });
  </script>`;
}

// ============================================================================
// HELPERS
// ============================================================================

function labelStatut(statut: string): string {
  switch (statut) {
    case 'brouillon': return 'Brouillon';
    case 'emise': return '\u00C9mise';
    case 'payee': return 'Pay\u00E9e';
    case 'echec': return '\u00C9chec';
    case 'remboursee': return 'Rembours\u00E9e';
    case 'avoir': return 'Avoir';
    default: return statut;
  }
}
