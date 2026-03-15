/**
 * Soutien Scolaire Caplogy - Page Admin: Cours & Planning
 * Listing des cours avec filtres, stats, table, pagination, animations
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { paginationHTML, formatDuree } from '../../shared/utils';
import { getCours } from '../api/cours';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--warning), var(--secondary), var(--primary));
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

  /* ---- Stats mini badges (pie chart style) ---- */
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
    transform: translateY(-2px) scale(1.03);
    box-shadow: var(--shadow-md);
  }
  .stats-mini .mini-badge .mini-count {
    font-weight: 800;
    font-size: 15px;
  }
  .stats-mini .mini-badge.blue .mini-count { color: var(--blue); }
  .stats-mini .mini-badge.green .mini-count { color: var(--success); }
  .stats-mini .mini-badge.orange .mini-count { color: var(--warning); }
  .stats-mini .mini-badge.red .mini-count { color: var(--danger); }
  .stats-mini .mini-badge.purple .mini-count { color: var(--purple); }
  .stats-mini .mini-badge.teal .mini-count { color: #0d9488; }

  /* ---- Pie-style type indicator ---- */
  .type-split {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 16px;
    border-radius: 20px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
    font-size: 12px;
    font-weight: 600;
    transition: all var(--transition-fast);
  }
  .type-split:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .type-split .pie-mini {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    position: relative;
    animation: bounceIn 0.6s ease both;
    animation-delay: 0.4s;
  }
  .type-split .split-label {
    color: var(--gray-600);
  }
  .type-split .split-value {
    font-weight: 800;
    font-size: 14px;
  }
  .type-split .split-value.blue { color: var(--blue); }
  .type-split .split-value.purple { color: var(--purple); }

  /* ---- Filter bar date inputs ---- */
  .filter-bar input[type="date"] {
    padding: 9px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    background: var(--gray-50);
    outline: none;
    transition: all var(--transition-fast);
    color: var(--gray-700);
  }
  .filter-bar input[type="date"]:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(109, 203, 221, 0.15);
  }

  /* ---- Heure badge ---- */
  .heure-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: var(--gray-700);
    font-size: 13px;
  }
  .heure-badge .clock-icon {
    animation: float 3s ease-in-out infinite;
    font-size: 14px;
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
  .btn-terminer {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .btn-terminer:hover {
    background: var(--success);
    color: var(--white);
  }
  .btn-annuler {
    background: var(--danger-light);
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
  .btn-annuler:hover {
    background: var(--danger);
    color: var(--white);
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

  @media (max-width: 1200px) {
    .table-wrapper { font-size: 13px; }
    .action-btns { flex-direction: column; gap: 3px; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statutBadge(statut: string): string {
  const labels: Record<string, string> = {
    planifie: 'Planifi\u00e9',
    confirme: 'Confirm\u00e9',
    en_cours: 'En cours',
    termine: 'Termin\u00e9',
    annule: 'Annul\u00e9',
  };
  const label = labels[statut] || statut;
  return `<span class="badge badge-${statut} badge-dot">${escapeHtml(label)}</span>`;
}

function typeBadge(type: string): string {
  const label = type === 'individuel' ? 'Individuel' : 'Collectif';
  return `<span class="badge badge-${type}">${escapeHtml(label)}</span>`;
}

function actionButtons(id: string, statut: string): string {
  const btns: string[] = [
    `<a href="/cours/${escapeHtml(id)}" class="btn btn-sm btn-voir">Voir</a>`,
  ];

  if (statut === 'confirme' || statut === 'en_cours') {
    btns.push(`<button class="btn btn-sm btn-terminer" onclick="terminerCours('${escapeHtml(id)}')">Terminer</button>`);
  }

  if (statut === 'planifie' || statut === 'confirme') {
    btns.push(`<button class="btn btn-sm btn-annuler" onclick="annulerCours('${escapeHtml(id)}')">Annuler</button>`);
  }

  return `<div class="action-btns">${btns.join('')}</div>`;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderCoursListe(env: Env, url: URL, userName?: string): Promise<string> {
  const data = await getCours(env, url);
  const { cours, total, page, limit, stats, formateurs, thematiques } = data;

  // Build current filter state
  const dateFrom = url.searchParams.get('date_from') || '';
  const dateTo = url.searchParams.get('date_to') || '';
  const formateurId = url.searchParams.get('formateur_id') || '';
  const thematiqueId = url.searchParams.get('thematique_id') || '';
  const typeCours = url.searchParams.get('type_cours') || '';
  const statutFilter = url.searchParams.get('statut') || '';
  const hasFilters = dateFrom || dateTo || formateurId || thematiqueId || typeCours || statutFilter;

  // Build base URL for pagination
  const filterParams = new URLSearchParams();
  if (dateFrom) filterParams.set('date_from', dateFrom);
  if (dateTo) filterParams.set('date_to', dateTo);
  if (formateurId) filterParams.set('formateur_id', formateurId);
  if (thematiqueId) filterParams.set('thematique_id', thematiqueId);
  if (typeCours) filterParams.set('type_cours', typeCours);
  if (statutFilter) filterParams.set('statut', statutFilter);
  const paginationBase = '/cours' + (filterParams.toString() ? '?' + filterParams.toString() : '');

  // Pie chart calculation for individuel/collectif
  const totalCours = stats.individuels + stats.collectifs;
  const pctIndiv = totalCours > 0 ? Math.round((stats.individuels / totalCours) * 100) : 50;
  const pctCollect = 100 - pctIndiv;

  // Formateur options
  const formateurOptions = formateurs.map(f =>
    `<option value="${escapeHtml(f.id)}" ${formateurId === f.id ? 'selected' : ''}>${escapeHtml(f.prenom)} ${escapeHtml(f.nom)} - ${escapeHtml(f.ville)}</option>`
  ).join('');

  // Thematique options
  const thematiqueOptions = thematiques.map(t =>
    `<option value="${escapeHtml(t.id)}" ${thematiqueId === t.id ? 'selected' : ''}>${escapeHtml(t.domaine_nom)} > ${escapeHtml(t.nom)}</option>`
  ).join('');

  // Table rows
  let tableRows = '';
  if (cours.length === 0) {
    tableRows = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-illustration">\ud83d\udcc5</div>
            <div class="empty-title">Aucun cours trouv\u00e9</div>
            <div class="empty-text">Modifiez vos filtres ou planifiez un nouveau cours</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    for (const c of cours) {
      tableRows += `
        <tr>
          <td>
            <div class="cell-main">${formatDateFr(c.date_cours)}</div>
          </td>
          <td>
            <div class="heure-badge">
              <span class="clock-icon">\u23f0</span>
              ${escapeHtml(c.heure_debut)} <span style="color:var(--gray-400);font-size:11px">(${formatDuree(c.duree_minutes)})</span>
            </div>
          </td>
          <td>
            <div class="cell-main">${escapeHtml(c.formateur_prenom || '')} ${escapeHtml(c.formateur_nom || '')}</div>
          </td>
          <td>
            <div class="cell-main">${escapeHtml(c.thematique_nom || '')}</div>
            <div class="cell-sub">${escapeHtml(c.domaine_icone || '')} ${escapeHtml(c.domaine_nom || '')}</div>
          </td>
          <td>${typeBadge(c.type_cours)}</td>
          <td class="text-center">
            <span style="font-weight:700;color:var(--gray-900)">${c.nb_eleves || 0}</span>
            <span style="color:var(--gray-400);font-size:11px">/ ${c.max_eleves}</span>
          </td>
          <td>${statutBadge(c.statut)}</td>
          <td>${actionButtons(c.id, c.statut)}</td>
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
          <span class="page-icon">\ud83d\udcc5</span>
          Cours & Planning
          <span class="count-badge">${stats.total_cours}</span>
        </h1>
        <div class="page-subtitle">Planifiez les cours, g\u00e9rez le calendrier et suivez les s\u00e9ances</div>
      </div>
      <div class="btn-group">
        <a href="/cours/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Planifier un cours
        </a>
      </div>
    </div>

    <!-- Stats mini -->
    <div class="stats-mini">
      <div class="mini-badge blue">
        <span>\ud83d\udcc6</span>
        <span class="mini-count">${stats.semaine}</span>
        <span>Cette semaine</span>
      </div>
      <div class="mini-badge green">
        <span>\ud83d\udcc5</span>
        <span class="mini-count">${stats.mois}</span>
        <span>Ce mois</span>
      </div>
      <div class="mini-badge ${stats.taux_annulation > 15 ? 'red' : 'orange'}">
        <span>\u274c</span>
        <span class="mini-count">${stats.taux_annulation}%</span>
        <span>Annulations</span>
      </div>
      <div class="type-split">
        <div class="pie-mini" style="background: conic-gradient(var(--blue) 0% ${pctIndiv}%, var(--purple) ${pctIndiv}% 100%)"></div>
        <div>
          <div class="split-label">Individuel <span class="split-value blue">${stats.individuels}</span></div>
          <div class="split-label">Collectif <span class="split-value purple">${stats.collectifs}</span></div>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <form class="filter-bar" id="filter-form" onsubmit="event.preventDefault();applyFilters()">
      <input type="date" id="date-from" value="${escapeHtml(dateFrom)}" title="Date de d\u00e9but">
      <input type="date" id="date-to" value="${escapeHtml(dateTo)}" title="Date de fin">
      <select class="filter-select" id="formateur-filter">
        <option value="">Tous les formateurs</option>
        ${formateurOptions}
      </select>
      <select class="filter-select" id="thematique-filter">
        <option value="">Toutes les th\u00e9matiques</option>
        ${thematiqueOptions}
      </select>
      <select class="filter-select" id="type-filter">
        <option value="">Tous les types</option>
        <option value="individuel" ${typeCours === 'individuel' ? 'selected' : ''}>Individuel</option>
        <option value="collectif" ${typeCours === 'collectif' ? 'selected' : ''}>Collectif</option>
      </select>
      <select class="filter-select" id="statut-filter">
        <option value="">Tous les statuts</option>
        <option value="planifie" ${statutFilter === 'planifie' ? 'selected' : ''}>Planifi\u00e9</option>
        <option value="confirme" ${statutFilter === 'confirme' ? 'selected' : ''}>Confirm\u00e9</option>
        <option value="en_cours" ${statutFilter === 'en_cours' ? 'selected' : ''}>En cours</option>
        <option value="termine" ${statutFilter === 'termine' ? 'selected' : ''}>Termin\u00e9</option>
        <option value="annule" ${statutFilter === 'annule' ? 'selected' : ''}>Annul\u00e9</option>
      </select>
      <button type="submit" class="btn btn-primary btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Filtrer
      </button>
      ${hasFilters ? '<a href="/cours" class="btn btn-outline btn-sm">Effacer</a>' : ''}
    </form>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Formateur</th>
            <th>Th\u00e9matique</th>
            <th>Type</th>
            <th class="text-center">Nb \u00e9l\u00e8ves</th>
            <th>Statut</th>
            <th style="width:180px">Actions</th>
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
        var df = document.getElementById('date-from').value;
        var dt = document.getElementById('date-to').value;
        var fm = document.getElementById('formateur-filter').value;
        var th = document.getElementById('thematique-filter').value;
        var tp = document.getElementById('type-filter').value;
        var st = document.getElementById('statut-filter').value;
        if (df) params.set('date_from', df);
        if (dt) params.set('date_to', dt);
        if (fm) params.set('formateur_id', fm);
        if (th) params.set('thematique_id', th);
        if (tp) params.set('type_cours', tp);
        if (st) params.set('statut', st);
        window.location.href = '/cours' + (params.toString() ? '?' + params.toString() : '');
      }

      async function terminerCours(id) {
        if (!confirm('Terminer ce cours ? Les heures seront d\\u00e9bit\\u00e9es des packages.')) return;
        try {
          var res = await fetch('/api/cours/' + id + '/terminer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ presences: [] })
          });
          if (res.ok) window.location.reload();
          else {
            var data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
          }
        } catch(e) { alert('Erreur de connexion'); }
      }

      async function annulerCours(id) {
        if (!confirm('Annuler ce cours ?')) return;
        try {
          var res = await fetch('/api/cours/' + id + '/statut', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut: 'annule' })
          });
          if (res.ok) window.location.reload();
          else {
            var data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
          }
        } catch(e) { alert('Erreur de connexion'); }
      }
    </script>
  `;

  return htmlPage({
    title: 'Cours & Planning',
    activePage: 'cours',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
