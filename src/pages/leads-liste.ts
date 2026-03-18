/**
 * CallMyProf - Admin Leads List Page
 * CRM-style lead management with filters, status pipeline, callbacks
 */

import type { Env, Lead } from '../../shared/types';
import { htmlPage, escapeHtml, formatDate } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { listLeads } from '../api/leads';

// ============================================================================
// CSS
// ============================================================================

const PAGE_CSS = `
  .leads-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  .lead-stat {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    border: 1px solid var(--gray-100);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .lead-stat:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .lead-stat.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(220,38,38,0.1);
  }
  .lead-stat::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }
  .lead-stat.stat-new::before { background: var(--blue); }
  .lead-stat.stat-contacted::before { background: var(--warning); }
  .lead-stat.stat-qualified::before { background: var(--purple); }
  .lead-stat.stat-converted::before { background: var(--success); }
  .lead-stat.stat-lost::before { background: var(--danger); }
  .lead-stat .stat-count {
    font-size: 28px;
    font-weight: 800;
    color: var(--gray-900);
    line-height: 1;
  }
  .lead-stat .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-500);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Status badges */
  .badge-new { background: var(--blue-light); color: #1e40af; border: 1px solid #93c5fd; }
  .badge-contacted { background: var(--warning-light); color: #92400e; border: 1px solid #fde68a; }
  .badge-qualified { background: var(--purple-light); color: #5b21b6; border: 1px solid #c4b5fd; }
  .badge-converted { background: var(--success-light); color: #065f46; border: 1px solid #a7f3d0; }
  .badge-lost { background: var(--danger-light); color: #991b1b; border: 1px solid #fca5a5; }

  /* Service type pills */
  .service-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: var(--gray-100);
    color: var(--gray-600);
  }

  /* Callback indicator */
  .callback-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }
  .callback-badge.overdue {
    background: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
  }

  @media (max-width: 768px) {
    .leads-stats { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 480px) {
    .leads-stats { grid-template-columns: 1fr 1fr; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(statut: string): string {
  const labels: Record<string, string> = {
    new: '&#127381; New',
    contacted: '&#128222; Contacted',
    qualified: '&#11088; Qualified',
    converted: '&#9989; Converted',
    lost: '&#10060; Lost',
  };
  return `<span class="badge badge-${statut} badge-dot">${labels[statut] || statut}</span>`;
}

function serviceIcon(type: string): string {
  const icons: Record<string, string> = {
    individual: '&#128100;',
    group: '&#128101;',
    online: '&#128187;',
  };
  return `<span class="service-pill">${icons[type] || ''} ${type}</span>`;
}

function utmBadge(source: string | null): string {
  if (!source) return '<span style="font-size:12px;padding:3px 10px;border-radius:12px;background:rgba(34,197,94,0.1);color:#22c55e;font-weight:700;">Organic</span>';
  const colors: Record<string, string> = {
    tiktok: 'background:rgba(0,0,0,0.08);color:#000',
    instagram: 'background:rgba(225,48,108,0.1);color:#E1306C',
    facebook: 'background:rgba(24,119,242,0.1);color:#1877F2',
    google: 'background:rgba(66,133,244,0.1);color:#4285F4',
  };
  const style = colors[source.toLowerCase()] || 'background:rgba(100,116,139,0.1);color:#64748b';
  return `<span style="font-size:12px;padding:3px 10px;border-radius:12px;${style};font-weight:700;">${source}</span>`;
}

// ============================================================================
// RENDER
// ============================================================================

export async function renderLeadsListe(env: Env, url: URL, userName?: string): Promise<string> {
  const search = url.searchParams.get('search')?.trim() || '';
  const filterStatut = url.searchParams.get('statut') || 'all';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));

  // Fetch leads
  const { leads, total } = await listLeads(env, {
    statut: filterStatut,
    search,
    page,
    limit: 20,
  });

  // Get stats per status
  const statsResult = await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN statut = 'new' THEN 1 ELSE 0 END) as cnt_new,
      SUM(CASE WHEN statut = 'contacted' THEN 1 ELSE 0 END) as cnt_contacted,
      SUM(CASE WHEN statut = 'qualified' THEN 1 ELSE 0 END) as cnt_qualified,
      SUM(CASE WHEN statut = 'converted' THEN 1 ELSE 0 END) as cnt_converted,
      SUM(CASE WHEN statut = 'lost' THEN 1 ELSE 0 END) as cnt_lost
    FROM leads
  `).first<Record<string, number>>();

  const stats = {
    total: statsResult?.total || 0,
    new: statsResult?.cnt_new || 0,
    contacted: statsResult?.cnt_contacted || 0,
    qualified: statsResult?.cnt_qualified || 0,
    converted: statsResult?.cnt_converted || 0,
    lost: statsResult?.cnt_lost || 0,
  };

  // Build filter URL base
  const filterBase = (statut: string) => {
    const params = new URLSearchParams();
    if (statut !== 'all') params.set('statut', statut);
    if (search) params.set('search', search);
    const qs = params.toString();
    return '/leads' + (qs ? '?' + qs : '');
  };

  // Pagination base (preserve filters)
  const paginationParams = new URLSearchParams();
  if (filterStatut !== 'all') paginationParams.set('statut', filterStatut);
  if (search) paginationParams.set('search', search);
  const paginationBase = '/leads' + (paginationParams.toString() ? '?' + paginationParams.toString() : '');

  // Build table rows
  let tableRows = '';
  if (leads.length === 0) {
    tableRows = `
      <tr>
        <td colspan="7" class="empty-state">
          <span class="empty-icon">&#128270;</span>
          <div class="empty-title">No leads found</div>
          <div class="empty-text">Leads from the CTA form will appear here.</div>
        </td>
      </tr>`;
  } else {
    const now = new Date();
    for (const lead of leads) {
      const initials = (lead.prenom?.[0] || '') + (lead.nom?.[0] || '');
      const callbackHtml = lead.callback_date
        ? (() => {
            const cbDate = new Date(lead.callback_date);
            const overdue = cbDate < now && lead.statut !== 'converted' && lead.statut !== 'lost';
            return `<span class="callback-badge${overdue ? ' overdue' : ''}">&#128197; ${formatDate(lead.callback_date)}</span>`;
          })()
        : '<span style="color:var(--gray-400)">-</span>';

      tableRows += `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar">${escapeHtml(initials.toUpperCase())}</div>
              <div class="user-info">
                <div class="user-name">${escapeHtml(lead.prenom)} ${escapeHtml(lead.nom)}</div>
                <div class="user-meta">${escapeHtml(lead.email)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(lead.telephone)}<br><span style="font-size:11px;color:var(--gray-400)">${escapeHtml(lead.country_code)}</span></td>
          <td>${serviceIcon(lead.service_type)}</td>
          <td>${statusBadge(lead.statut)}</td>
          <td>${utmBadge((lead as any).utm_source)}</td>
          <td>${callbackHtml}</td>
          <td><span style="font-size:12px;color:var(--gray-400)">${formatDate(lead.created_at)}</span></td>
          <td>
            <div class="table-actions">
              <a href="/leads/${lead.id}" class="btn btn-sm btn-outline">&#128065; View</a>
            </div>
          </td>
        </tr>`;
    }
  }

  const content = `
    <div class="page-header">
      <div>
        <h1><span class="page-icon">&#128222;</span> Lead Management</h1>
        <div class="page-subtitle">${stats.total} total leads</div>
      </div>
    </div>

    <!-- Pipeline Stats -->
    <div class="leads-stats">
      <a href="${filterBase('new')}" class="lead-stat stat-new${filterStatut === 'new' ? ' active' : ''}">
        <div class="stat-count">${stats.new}</div>
        <div class="stat-label">New</div>
      </a>
      <a href="${filterBase('contacted')}" class="lead-stat stat-contacted${filterStatut === 'contacted' ? ' active' : ''}">
        <div class="stat-count">${stats.contacted}</div>
        <div class="stat-label">Contacted</div>
      </a>
      <a href="${filterBase('qualified')}" class="lead-stat stat-qualified${filterStatut === 'qualified' ? ' active' : ''}">
        <div class="stat-count">${stats.qualified}</div>
        <div class="stat-label">Qualified</div>
      </a>
      <a href="${filterBase('converted')}" class="lead-stat stat-converted${filterStatut === 'converted' ? ' active' : ''}">
        <div class="stat-count">${stats.converted}</div>
        <div class="stat-label">Converted</div>
      </a>
      <a href="${filterBase('lost')}" class="lead-stat stat-lost${filterStatut === 'lost' ? ' active' : ''}">
        <div class="stat-count">${stats.lost}</div>
        <div class="stat-label">Lost</div>
      </a>
    </div>

    <!-- Filter Bar -->
    <form class="filter-bar" method="GET" action="/leads">
      <input type="text" name="search" class="search-input" placeholder="Search by name, email, phone..." value="${escapeHtml(search)}">
      <select name="statut" class="filter-select" onchange="this.form.submit()">
        <option value="all"${filterStatut === 'all' ? ' selected' : ''}>All statuses</option>
        <option value="new"${filterStatut === 'new' ? ' selected' : ''}>New</option>
        <option value="contacted"${filterStatut === 'contacted' ? ' selected' : ''}>Contacted</option>
        <option value="qualified"${filterStatut === 'qualified' ? ' selected' : ''}>Qualified</option>
        <option value="converted"${filterStatut === 'converted' ? ' selected' : ''}>Converted</option>
        <option value="lost"${filterStatut === 'lost' ? ' selected' : ''}>Lost</option>
      </select>
      <button type="submit" class="btn btn-sm btn-outline">&#128269; Search</button>
      ${filterStatut !== 'all' || search ? '<a href="/leads" class="btn btn-sm btn-outline">&#10060; Clear</a>' : ''}
    </form>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Service</th>
            <th>Status</th>
            <th>Source</th>
            <th>Callback</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    ${paginationHTML(page, total, 20, paginationBase)}
  `;

  return htmlPage({
    title: 'Leads',
    activePage: 'leads',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
