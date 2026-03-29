/**
 * CallMyProf - Admin Group Classes List Page
 * View all group classes with filters, stats, creation
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDate } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { listGroupClasses } from '../api/group-classes';

// ============================================================================
// CSS
// ============================================================================

const PAGE_CSS = `
  .gc-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  .gc-stat {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    border: 1px solid var(--gray-100);
    text-align: center;
  }
  .gc-stat .gc-stat-count {
    font-size: 24px;
    font-weight: 800;
    color: var(--gray-900);
  }
  .gc-stat .gc-stat-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-500);
    margin-top: 2px;
    text-transform: uppercase;
  }

  .badge-ouvert { background: var(--success-light); color: #065f46; border: 1px solid #a7f3d0; }
  .badge-complet { background: var(--blue-light); color: #1e40af; border: 1px solid #93c5fd; }
  .badge-en_cours { background: var(--warning-light); color: #92400e; border: 1px solid #fde68a; }
  .badge-termine { background: var(--gray-100); color: var(--gray-500); border: 1px solid var(--gray-200); }
  .badge-annule { background: var(--danger-light); color: #991b1b; border: 1px solid #fca5a5; }

  .enrollment-bar {
    width: 100%;
    height: 6px;
    background: var(--gray-100);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 4px;
  }
  .enrollment-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }
  .enrollment-fill.low { background: var(--warning); }
  .enrollment-fill.mid { background: var(--blue); }
  .enrollment-fill.full { background: var(--success); }

  @media (max-width: 768px) {
    .gc-stats { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(statut: string): string {
  const labels: Record<string, string> = {
    ouvert: '&#9989; Open',
    complet: '&#128308; Full',
    en_cours: '&#9654; In Progress',
    termine: '&#9899; Completed',
    annule: '&#10060; Cancelled',
  };
  return `<span class="badge badge-${statut}">${labels[statut] || statut}</span>`;
}

// ============================================================================
// RENDER
// ============================================================================

export async function renderGroupClassesListe(env: Env, url: URL, userName?: string): Promise<string> {
  const search = url.searchParams.get('search')?.trim() || '';
  const filterStatut = url.searchParams.get('statut') || 'all';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));

  const { classes, total } = await listGroupClasses(env, {
    statut: filterStatut,
    search,
    page,
    limit: 20,
  });

  // Stats
  const statsResult = await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN statut = 'ouvert' THEN 1 ELSE 0 END) as cnt_open,
      SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as cnt_active,
      SUM(CASE WHEN statut = 'complet' THEN 1 ELSE 0 END) as cnt_full,
      SUM(inscrits) as total_enrolled
    FROM group_classes
  `).first<Record<string, number>>();

  const stats = {
    total: statsResult?.total || 0,
    open: statsResult?.cnt_open || 0,
    active: statsResult?.cnt_active || 0,
    full: statsResult?.cnt_full || 0,
    enrolled: statsResult?.total_enrolled || 0,
  };

  // Build table rows
  let tableRows = '';
  if (classes.length === 0) {
    tableRows = `
      <tr>
        <td colspan="8" class="empty-state">
          <span class="empty-icon">&#128218;</span>
          <div class="empty-title">No group classes</div>
          <div class="empty-text">Create your first group class to get started.</div>
        </td>
      </tr>`;
  } else {
    for (const gc of classes) {
      const pct = gc.max_eleves > 0 ? Math.round((gc.inscrits / gc.max_eleves) * 100) : 0;
      const fillClass = pct >= 100 ? 'full' : pct >= 50 ? 'mid' : 'low';

      tableRows += `
        <tr>
          <td>
            <a href="/group-classes/${gc.id}" style="color:var(--primary);font-weight:600;text-decoration:none">
              ${escapeHtml(gc.titre)}
            </a>
            ${gc.thematique_nom ? `<br><span style="font-size:11px;color:var(--gray-400)">${escapeHtml(gc.thematique_nom)}</span>` : ''}
          </td>
          <td>${escapeHtml(gc.formateur_prenom || '')} ${escapeHtml(gc.formateur_nom || '')}</td>
          <td>${escapeHtml(gc.date_debut || '-')}<br><span style="font-size:11px;color:var(--gray-400)">${escapeHtml(gc.heure_debut)}</span></td>
          <td>${gc.duree_minutes}min</td>
          <td>
            <span style="font-size:13px;font-weight:600">${gc.inscrits}/${gc.max_eleves}</span>
            <div class="enrollment-bar"><div class="enrollment-fill ${fillClass}" style="width:${pct}%"></div></div>
          </td>
          <td><span style="font-weight:700">$${gc.prix_par_eleve}</span>/student</td>
          <td>${statusBadge(gc.statut)}</td>
          <td>
            <div class="table-actions">
              <a href="/group-classes/${gc.id}" class="btn btn-sm btn-outline">&#128065; View</a>
            </div>
          </td>
        </tr>`;
    }
  }

  const content = `
    <div class="page-header">
      <div>
        <h1><span class="page-icon">&#128101;</span> Group Classes</h1>
        <div class="page-subtitle">${stats.total} group classes, ${stats.enrolled} total enrollments</div>
      </div>
      <div>
        <button class="btn btn-sm btn-primary" onclick="window.location.href='/group-classes/new'">&#10133; New Class</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="gc-stats">
      <div class="gc-stat">
        <div class="gc-stat-count" style="color:var(--success)">${stats.open}</div>
        <div class="gc-stat-label">Open</div>
      </div>
      <div class="gc-stat">
        <div class="gc-stat-count" style="color:var(--warning)">${stats.active}</div>
        <div class="gc-stat-label">In Progress</div>
      </div>
      <div class="gc-stat">
        <div class="gc-stat-count" style="color:var(--blue)">${stats.full}</div>
        <div class="gc-stat-label">Full</div>
      </div>
      <div class="gc-stat">
        <div class="gc-stat-count">${stats.enrolled}</div>
        <div class="gc-stat-label">Enrolled</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <form class="filter-bar" method="GET" action="/group-classes">
      <input type="text" name="search" class="search-input" placeholder="Search by title, tutor..." value="${escapeHtml(search)}">
      <select name="statut" class="filter-select" onchange="this.form.submit()">
        <option value="all"${filterStatut === 'all' ? ' selected' : ''}>All statuses</option>
        <option value="ouvert"${filterStatut === 'ouvert' ? ' selected' : ''}>Open</option>
        <option value="complet"${filterStatut === 'complet' ? ' selected' : ''}>Full</option>
        <option value="en_cours"${filterStatut === 'en_cours' ? ' selected' : ''}>In Progress</option>
        <option value="termine"${filterStatut === 'termine' ? ' selected' : ''}>Completed</option>
        <option value="annule"${filterStatut === 'annule' ? ' selected' : ''}>Cancelled</option>
      </select>
      <button type="submit" class="btn btn-sm btn-outline">&#128269; Search</button>
      ${filterStatut !== 'all' || search ? '<a href="/group-classes" class="btn btn-sm btn-outline">&#10060; Clear</a>' : ''}
    </form>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Tutor</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Enrollment</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    ${paginationHTML(page, total, 20, '/group-classes')}
  `;

  return htmlPage({
    title: 'Group Classes',
    activePage: 'group-classes',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
