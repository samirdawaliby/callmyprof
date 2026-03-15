/**
 * CallMyProf - Admin Payments Page
 * Track payments, revenue stats, manage payment status
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDate } from '../../shared/html-utils';
import { paginationHTML } from '../../shared/utils';
import { listPayments, getPaymentStats } from '../api/payments';

// ============================================================================
// CSS
// ============================================================================

const PAGE_CSS = `
  .revenue-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  .rev-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 20px;
    border: 1px solid var(--gray-100);
    position: relative;
    overflow: hidden;
  }
  .rev-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }
  .rev-card.total::before { background: var(--primary); }
  .rev-card.month::before { background: var(--success); }
  .rev-card.pending::before { background: var(--warning); }
  .rev-card.count::before { background: var(--blue); }

  .rev-card .rev-amount {
    font-size: 26px;
    font-weight: 800;
    color: var(--gray-900);
  }
  .rev-card .rev-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-500);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-completed { background: var(--success-light); color: #065f46; border: 1px solid #a7f3d0; }
  .badge-pending { background: var(--warning-light); color: #92400e; border: 1px solid #fde68a; }
  .badge-failed { background: var(--danger-light); color: #991b1b; border: 1px solid #fca5a5; }
  .badge-refunded { background: var(--gray-100); color: var(--gray-500); border: 1px solid var(--gray-200); }

  .method-pill {
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
  .method-pill.stripe { background: #e8e0ff; color: #5b21b6; }
  .method-pill.paypal { background: #dbeafe; color: #1e40af; }
  .method-pill.cash { background: #d1fae5; color: #065f46; }

  @media (max-width: 768px) {
    .revenue-cards { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(statut: string): string {
  const labels: Record<string, string> = {
    completed: '&#9989; Completed',
    pending: '&#9200; Pending',
    failed: '&#10060; Failed',
    refunded: '&#128260; Refunded',
  };
  return `<span class="badge badge-${statut}">${labels[statut] || statut}</span>`;
}

function methodPill(method: string): string {
  const icons: Record<string, string> = {
    stripe: '&#128179;',
    paypal: '&#128176;',
    cash: '&#128181;',
    bank_transfer: '&#127974;',
  };
  return `<span class="method-pill ${method}">${icons[method] || ''} ${method}</span>`;
}

function formatAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
  return `${symbols[currency] || currency + ' '}${amount.toFixed(2)}`;
}

// ============================================================================
// RENDER
// ============================================================================

export async function renderPayments(env: Env, url: URL, userName?: string): Promise<string> {
  const search = url.searchParams.get('search')?.trim() || '';
  const filterStatut = url.searchParams.get('statut') || 'all';
  const filterMethod = url.searchParams.get('method') || 'all';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));

  const [{ payments, total }, stats] = await Promise.all([
    listPayments(env, { statut: filterStatut, method: filterMethod, search, page, limit: 20 }),
    getPaymentStats(env),
  ]);

  let tableRows = '';
  if (payments.length === 0) {
    tableRows = `
      <tr>
        <td colspan="7" class="empty-state">
          <span class="empty-icon">&#128176;</span>
          <div class="empty-title">No payments yet</div>
          <div class="empty-text">Payments will appear here when students pay for sessions.</div>
        </td>
      </tr>`;
  } else {
    for (const p of payments) {
      const clientName = p.parent_prenom ? `${escapeHtml(p.parent_prenom)} ${escapeHtml(p.parent_nom || '')}` : '<span style="color:var(--gray-400)">-</span>';
      tableRows += `
        <tr>
          <td style="font-weight:600;color:var(--gray-900)">${clientName}</td>
          <td style="font-weight:700;font-size:15px">${formatAmount(p.amount, p.currency)}</td>
          <td>${methodPill(p.method)}</td>
          <td>${escapeHtml(p.description || '-')}</td>
          <td>${statusBadge(p.statut)}</td>
          <td><span style="font-size:12px;color:var(--gray-400)">${formatDate(p.created_at)}</span></td>
          <td>
            <div class="table-actions">
              ${p.statut === 'pending' ? `<button class="btn btn-sm btn-outline" onclick="updatePayment('${p.id}', 'completed')">&#9989;</button>` : ''}
            </div>
          </td>
        </tr>`;
    }
  }

  const content = `
    <div class="page-header">
      <div>
        <h1><span class="page-icon">&#128176;</span> Payments</h1>
        <div class="page-subtitle">${stats.totalPayments} total payments</div>
      </div>
    </div>

    <!-- Revenue Cards -->
    <div class="revenue-cards">
      <div class="rev-card total">
        <div class="rev-amount">$${stats.totalRevenue.toFixed(2)}</div>
        <div class="rev-label">Total Revenue</div>
      </div>
      <div class="rev-card month">
        <div class="rev-amount">$${stats.monthRevenue.toFixed(2)}</div>
        <div class="rev-label">This Month</div>
      </div>
      <div class="rev-card pending">
        <div class="rev-amount">$${stats.pendingAmount.toFixed(2)}</div>
        <div class="rev-label">Pending</div>
      </div>
      <div class="rev-card count">
        <div class="rev-amount">${stats.totalPayments}</div>
        <div class="rev-label">Transactions</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <form class="filter-bar" method="GET" action="/payments">
      <input type="text" name="search" class="search-input" placeholder="Search by client, description..." value="${escapeHtml(search)}">
      <select name="statut" class="filter-select" onchange="this.form.submit()">
        <option value="all"${filterStatut === 'all' ? ' selected' : ''}>All statuses</option>
        <option value="completed"${filterStatut === 'completed' ? ' selected' : ''}>Completed</option>
        <option value="pending"${filterStatut === 'pending' ? ' selected' : ''}>Pending</option>
        <option value="failed"${filterStatut === 'failed' ? ' selected' : ''}>Failed</option>
        <option value="refunded"${filterStatut === 'refunded' ? ' selected' : ''}>Refunded</option>
      </select>
      <select name="method" class="filter-select" onchange="this.form.submit()">
        <option value="all"${filterMethod === 'all' ? ' selected' : ''}>All methods</option>
        <option value="stripe"${filterMethod === 'stripe' ? ' selected' : ''}>Stripe</option>
        <option value="paypal"${filterMethod === 'paypal' ? ' selected' : ''}>PayPal</option>
        <option value="cash"${filterMethod === 'cash' ? ' selected' : ''}>Cash</option>
        <option value="bank_transfer"${filterMethod === 'bank_transfer' ? ' selected' : ''}>Bank Transfer</option>
      </select>
      <button type="submit" class="btn btn-sm btn-outline">&#128269; Search</button>
    </form>

    <!-- Table -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    ${paginationHTML(page, total, 20, '/payments')}

    <script>
      function updatePayment(id, status) {
        if (!confirm('Mark payment as ' + status + '?')) return;
        fetch('/api/payments/' + id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: status })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) window.location.reload();
          else alert(data.error || 'Failed to update');
        });
      }
    </script>
  `;

  return htmlPage({
    title: 'Payments',
    activePage: 'payments',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
