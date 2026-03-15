/**
 * Soutien Scolaire Caplogy - Dashboard administrateur
 * Stat cards, actions urgentes, derniers cours, derniers avis
 */

import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { formatPrix } from '../../shared/pricing';
import { formatNumber, formatDuree, starsHTML } from '../../shared/utils';
import type { Env, User } from '../../shared/types';

// ============================================================================
// CSS DASHBOARD
// ============================================================================

const DASHBOARD_CSS = `
  /* ---- Welcome header ---- */
  .welcome-banner {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--primary) 100%);
    background-size: 200% auto;
    animation: gradientMove 6s ease-in-out infinite;
    border-radius: var(--radius-lg);
    padding: 32px 36px;
    color: var(--white);
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(13, 56, 101, 0.25);
  }

  @keyframes gradientMove {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .welcome-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(109, 203, 221, 0.1);
    animation: float 6s ease-in-out infinite;
  }

  .welcome-banner::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: 10%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(109, 203, 221, 0.06);
    animation: float 8s ease-in-out infinite;
    animation-delay: 2s;
  }

  .welcome-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .welcome-text h1 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .welcome-text h1 .wave {
    display: inline-block;
    animation: wave 2.5s ease-in-out infinite;
    transform-origin: 70% 70%;
    font-size: 30px;
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(14deg); }
    20% { transform: rotate(-8deg); }
    30% { transform: rotate(14deg); }
    40% { transform: rotate(-4deg); }
    50% { transform: rotate(10deg); }
    60%, 100% { transform: rotate(0deg); }
  }

  .welcome-text p {
    font-size: 14px;
    opacity: 0.8;
    font-weight: 400;
  }

  .welcome-date {
    background: rgba(255,255,255,0.12);
    border-radius: var(--radius-sm);
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .welcome-date .date-icon {
    font-size: 18px;
    animation: pulse 2s ease-in-out infinite;
  }

  /* ---- Animated counter ---- */
  .counter-value {
    display: inline-block;
    transition: all 0.4s ease;
  }

  /* ---- Stat card detail ---- */
  .stat-detail {
    display: flex;
    gap: 16px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--gray-500);
  }

  .stat-detail-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stat-detail-item .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .stat-detail-item .dot.green { background: var(--success); }
  .stat-detail-item .dot.orange { background: var(--warning); }
  .stat-detail-item .dot.red { background: var(--danger); }
  .stat-detail-item .dot.blue { background: var(--blue); }

  /* ---- Dashboard grid sections ---- */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 28px;
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ---- Actions urgentes ---- */
  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .alert-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .alert-item:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-sm);
  }

  .alert-item.warning {
    background: var(--warning-light);
    border-color: #fde68a;
    color: #92400e;
  }
  .alert-item.warning:hover {
    background: #fef3c7;
    color: #92400e;
  }

  .alert-item.danger {
    background: var(--danger-light);
    border-color: #fca5a5;
    color: #991b1b;
  }
  .alert-item.danger:hover {
    background: #fee2e2;
    color: #991b1b;
  }

  .alert-item.info {
    background: var(--blue-light);
    border-color: #93c5fd;
    color: #1e40af;
  }
  .alert-item.info:hover {
    background: #dbeafe;
    color: #1e40af;
  }

  .alert-icon {
    font-size: 22px;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  .alert-content {
    flex: 1;
  }

  .alert-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .alert-desc {
    font-size: 12px;
    opacity: 0.8;
  }

  .alert-badge {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(0,0,0,0.08);
    flex-shrink: 0;
  }

  /* ---- Recent table mini ---- */
  .mini-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .mini-table th {
    padding: 10px 12px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-500);
    border-bottom: 2px solid var(--gray-100);
    white-space: nowrap;
  }

  .mini-table td {
    padding: 10px 12px;
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-50);
    vertical-align: middle;
  }

  .mini-table tbody tr {
    transition: background 0.15s ease;
  }

  .mini-table tbody tr:hover {
    background: rgba(109, 203, 221, 0.04);
  }

  .mini-table .cell-name {
    font-weight: 600;
    color: var(--gray-900);
  }

  /* ---- Avis cards ---- */
  .avis-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .avis-card {
    padding: 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-100);
    background: var(--gray-50);
    transition: all 0.2s ease;
  }

  .avis-card:hover {
    border-color: var(--secondary);
    box-shadow: var(--shadow-sm);
  }

  .avis-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .avis-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .avis-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--secondary), var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--white);
    font-weight: 700;
  }

  .avis-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--gray-900);
  }

  .avis-date {
    font-size: 11px;
    color: var(--gray-400);
  }

  .avis-comment {
    font-size: 13px;
    color: var(--gray-600);
    line-height: 1.5;
    font-style: italic;
  }

  .avis-comment::before { content: '\\201C'; font-size: 18px; color: var(--secondary); margin-right: 2px; }
  .avis-comment::after { content: '\\201D'; font-size: 18px; color: var(--secondary); margin-left: 2px; }

  /* ---- No data state ---- */
  .no-data {
    text-align: center;
    padding: 30px 16px;
    color: var(--gray-400);
    font-size: 14px;
  }

  .no-data .no-data-icon {
    font-size: 36px;
    display: block;
    margin-bottom: 8px;
    animation: float 3s ease-in-out infinite;
  }
`;

// ============================================================================
// DASHBOARD DATA QUERIES
// ============================================================================

interface DashboardData {
  totalFormateurs: number;
  formateursValides: number;
  formateursEnAttente: number;
  totalFamilles: number;
  totalEleves: number;
  coursDuMois: number;
  caDuMois: number;
  packagesActifs: number;
  facturesImpayees: number;
  packagesExpirantBientot: number;
  derniersCours: Array<{
    id: string;
    titre: string;
    date_cours: string;
    heure_debut: string;
    duree_minutes: number;
    type_cours: string;
    statut: string;
    formateur_nom: string;
    formateur_prenom: string;
  }>;
  derniersAvis: Array<{
    id: string;
    note: number;
    commentaire: string;
    created_at: string;
    eleve_prenom: string;
    formateur_prenom: string;
    formateur_nom: string;
  }>;
}

async function fetchDashboardData(db: D1Database): Promise<DashboardData> {
  // Current month boundaries
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const nextMonth = now.getMonth() === 11
    ? `${now.getFullYear() + 1}-01-01`
    : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`;

  // 30 days from now for expiring packages
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Run all queries in parallel using batch
  const results = await db.batch([
    // 0: Total formateurs
    db.prepare("SELECT COUNT(*) as c FROM formateurs"),
    // 1: Formateurs valides
    db.prepare("SELECT COUNT(*) as c FROM formateurs WHERE application_status = 'valide'"),
    // 2: Formateurs en attente
    db.prepare("SELECT COUNT(*) as c FROM formateurs WHERE application_status IN ('submitted', 'en_attente')"),
    // 3: Total familles (parents)
    db.prepare("SELECT COUNT(*) as c FROM parents"),
    // 4: Total eleves
    db.prepare("SELECT COUNT(*) as c FROM eleves"),
    // 5: Cours du mois
    db.prepare("SELECT COUNT(*) as c FROM cours WHERE date_cours >= ? AND date_cours < ?").bind(monthStart, nextMonth),
    // 6: CA du mois (from packages_achetes bought this month)
    db.prepare("SELECT COALESCE(SUM(montant_paye), 0) as total FROM packages_achetes WHERE date_achat >= ? AND date_achat < ?").bind(monthStart, nextMonth),
    // 7: Packages actifs
    db.prepare("SELECT COUNT(*) as c FROM packages_achetes WHERE statut = 'actif'"),
    // 8: Factures impayees
    db.prepare("SELECT COUNT(*) as c FROM factures WHERE statut IN ('emise', 'brouillon')"),
    // 9: Packages expirant dans 30 jours
    db.prepare("SELECT COUNT(*) as c FROM packages_achetes WHERE statut = 'actif' AND date_expiration <= ? AND date_expiration >= date('now')").bind(in30Days),
    // 10: Derniers 5 cours
    db.prepare(`
      SELECT c.id, c.titre, c.date_cours, c.heure_debut, c.duree_minutes, c.type_cours, c.statut,
             f.nom as formateur_nom, f.prenom as formateur_prenom
      FROM cours c
      LEFT JOIN formateurs f ON f.id = c.formateur_id
      ORDER BY c.date_cours DESC, c.heure_debut DESC
      LIMIT 5
    `),
    // 11: Derniers 3 avis
    db.prepare(`
      SELECT a.id, a.note, a.commentaire, a.created_at,
             e.prenom as eleve_prenom,
             f.prenom as formateur_prenom, f.nom as formateur_nom
      FROM avis a
      LEFT JOIN eleves e ON e.id = a.eleve_id
      LEFT JOIN formateurs f ON f.id = a.formateur_id
      WHERE a.visible = 1
      ORDER BY a.created_at DESC
      LIMIT 3
    `),
  ]);

  return {
    totalFormateurs: (results[0].results[0] as any)?.c ?? 0,
    formateursValides: (results[1].results[0] as any)?.c ?? 0,
    formateursEnAttente: (results[2].results[0] as any)?.c ?? 0,
    totalFamilles: (results[3].results[0] as any)?.c ?? 0,
    totalEleves: (results[4].results[0] as any)?.c ?? 0,
    coursDuMois: (results[5].results[0] as any)?.c ?? 0,
    caDuMois: (results[6].results[0] as any)?.total ?? 0,
    packagesActifs: (results[7].results[0] as any)?.c ?? 0,
    facturesImpayees: (results[8].results[0] as any)?.c ?? 0,
    packagesExpirantBientot: (results[9].results[0] as any)?.c ?? 0,
    derniersCours: (results[10].results ?? []) as DashboardData['derniersCours'],
    derniersAvis: (results[11].results ?? []) as DashboardData['derniersAvis'],
  };
}

// ============================================================================
// STATUS BADGE HELPER
// ============================================================================

function statutBadge(statut: string): string {
  const labels: Record<string, string> = {
    planifie: 'Planifi\u00e9',
    confirme: 'Confirm\u00e9',
    en_cours: 'En cours',
    termine: 'Termin\u00e9',
    annule: 'Annul\u00e9',
  };
  return `<span class="badge badge-${statut} badge-dot">${labels[statut] || statut}</span>`;
}

function typeBadge(type: string): string {
  const icon = type === 'individuel' ? '&#128100;' : '&#128101;';
  return `<span class="badge badge-${type}">${icon} ${type === 'individuel' ? 'Individuel' : 'Collectif'}</span>`;
}

// ============================================================================
// RENDER DASHBOARD
// ============================================================================

export async function renderDashboard(env: Env, user: User): Promise<string> {
  const data = await fetchDashboardData(env.DB);

  // Current date string formatted nicely
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('fr-FR', dateOptions);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Alerts
  const alerts: string[] = [];

  if (data.formateursEnAttente > 0) {
    alerts.push(`
      <a href="/formateurs?status=en_attente" class="alert-item warning">
        <span class="alert-icon">&#128221;</span>
        <div class="alert-content">
          <div class="alert-title">Formateurs en attente de validation</div>
          <div class="alert-desc">Des candidatures attendent votre examen</div>
        </div>
        <span class="alert-badge">${data.formateursEnAttente}</span>
      </a>
    `);
  }

  if (data.facturesImpayees > 0) {
    alerts.push(`
      <a href="/factures?statut=emise" class="alert-item danger">
        <span class="alert-icon">&#128176;</span>
        <div class="alert-content">
          <div class="alert-title">Factures impay&eacute;es</div>
          <div class="alert-desc">Factures en attente de paiement</div>
        </div>
        <span class="alert-badge">${data.facturesImpayees}</span>
      </a>
    `);
  }

  if (data.packagesExpirantBientot > 0) {
    alerts.push(`
      <a href="/packages?filter=expiring" class="alert-item info">
        <span class="alert-icon">&#9200;</span>
        <div class="alert-content">
          <div class="alert-title">Packages expirant bient&ocirc;t</div>
          <div class="alert-desc">Expirent dans les 30 prochains jours</div>
        </div>
        <span class="alert-badge">${data.packagesExpirantBientot}</span>
      </a>
    `);
  }

  const alertsSection = alerts.length > 0
    ? `<div class="alert-list">${alerts.join('')}</div>`
    : `<div class="no-data">
        <span class="no-data-icon">&#9989;</span>
        Aucune action urgente. Tout est en ordre !
      </div>`;

  // Recent cours table
  const coursRows = data.derniersCours.length > 0
    ? data.derniersCours.map(c => `
      <tr>
        <td>
          <a href="/cours/${escapeHtml(c.id)}" class="cell-name" style="color:var(--primary);text-decoration:none;font-weight:600;">
            ${escapeHtml(c.titre || 'Cours')}
          </a>
        </td>
        <td>${formatDateFr(c.date_cours)}<br><span style="font-size:11px;color:var(--gray-400);">${escapeHtml(c.heure_debut)} (${formatDuree(c.duree_minutes)})</span></td>
        <td>${escapeHtml(c.formateur_prenom)} ${escapeHtml(c.formateur_nom)}</td>
        <td>${typeBadge(c.type_cours)}</td>
        <td>${statutBadge(c.statut)}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="5">
        <div class="no-data">
          <span class="no-data-icon">&#128197;</span>
          Aucun cours enregistr&eacute;
        </div>
      </td></tr>`;

  // Recent avis
  const avisCards = data.derniersAvis.length > 0
    ? data.derniersAvis.map(a => {
      const initial = a.eleve_prenom ? a.eleve_prenom.charAt(0).toUpperCase() : '?';
      return `
        <div class="avis-card card">
          <div class="avis-header">
            <div class="avis-info">
              <div class="avis-avatar">${initial}</div>
              <div>
                <div class="avis-name">${escapeHtml(a.eleve_prenom)} &rarr; ${escapeHtml(a.formateur_prenom)} ${escapeHtml(a.formateur_nom)}</div>
                <div class="avis-date">${formatDateFr(a.created_at)}</div>
              </div>
            </div>
            <div>${starsHTML(a.note)}</div>
          </div>
          ${a.commentaire ? `<div class="avis-comment">${escapeHtml(a.commentaire)}</div>` : ''}
        </div>
      `;
    }).join('')
    : `<div class="no-data">
        <span class="no-data-icon">&#11088;</span>
        Aucun avis pour le moment
      </div>`;

  const content = `
    <!-- Welcome Banner -->
    <div class="welcome-banner animate-fadeIn">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>
            <span class="wave">&#128075;</span>
            Bonjour, ${escapeHtml(user.prenom)} !
          </h1>
          <p>Voici un aper&ccedil;u de votre activit&eacute; de soutien scolaire</p>
        </div>
        <div class="welcome-date">
          <span class="date-icon">&#128197;</span>
          ${capitalizedDate}
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">&#128104;&zwj;&#127979;</div>
        <div class="stat-value counter-value">${formatNumber(data.totalFormateurs)}</div>
        <div class="stat-label">Formateurs</div>
        <div class="stat-detail">
          <span class="stat-detail-item"><span class="dot green"></span>${data.formateursValides} valid&eacute;s</span>
          <span class="stat-detail-item"><span class="dot orange"></span>${data.formateursEnAttente} en attente</span>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">&#128104;&zwj;&#128105;&zwj;&#128103;&zwj;&#128102;</div>
        <div class="stat-value counter-value">${formatNumber(data.totalFamilles)}</div>
        <div class="stat-label">Familles</div>
      </div>

      <div class="stat-card teal">
        <div class="stat-icon">&#127891;</div>
        <div class="stat-value counter-value">${formatNumber(data.totalEleves)}</div>
        <div class="stat-label">&Eacute;l&egrave;ves</div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">&#128197;</div>
        <div class="stat-value counter-value">${formatNumber(data.coursDuMois)}</div>
        <div class="stat-label">Cours ce mois</div>
      </div>

      <div class="stat-card purple">
        <div class="stat-icon">&#128176;</div>
        <div class="stat-value counter-value">${formatPrix(data.caDuMois)}</div>
        <div class="stat-label">CA du mois</div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">&#128230;</div>
        <div class="stat-value counter-value">${formatNumber(data.packagesActifs)}</div>
        <div class="stat-label">Packages actifs</div>
      </div>
    </div>

    <!-- Dashboard Grid: Alerts + Avis -->
    <div class="dashboard-grid">
      <!-- Actions urgentes -->
      <div class="content-card" style="animation-delay:0.15s;">
        <div class="content-card-header">
          <h3>&#9888;&#65039; Actions urgentes</h3>
        </div>
        <div class="content-card-body">
          ${alertsSection}
        </div>
      </div>

      <!-- Derniers avis -->
      <div class="content-card" style="animation-delay:0.25s;">
        <div class="content-card-header">
          <h3>&#11088; Derniers avis</h3>
          <a href="/avis" class="btn btn-sm btn-outline">Voir tout</a>
        </div>
        <div class="content-card-body">
          <div class="avis-list">
            ${avisCards}
          </div>
        </div>
      </div>
    </div>

    <!-- Derniers cours -->
    <div class="content-card" style="margin-top:24px;animation-delay:0.35s;">
      <div class="content-card-header">
        <h3>&#128218; Derniers cours</h3>
        <a href="/cours" class="btn btn-sm btn-outline">Voir tout</a>
      </div>
      <div class="content-card-body" style="padding:0;">
        <div style="overflow-x:auto;">
          <table class="mini-table">
            <thead>
              <tr>
                <th>Cours</th>
                <th>Date</th>
                <th>Formateur</th>
                <th>Type</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${coursRows}
            </tbody>
          </table>
        </div>
      </div>
      <div class="content-card-footer">
        <a href="/cours/new" style="display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:13px;">
          &#10133; Planifier un nouveau cours
        </a>
      </div>
    </div>

    <!-- Counter animation script -->
    <script>
      // Animate counter values on page load
      document.addEventListener('DOMContentLoaded', function() {
        var counters = document.querySelectorAll('.counter-value');
        counters.forEach(function(el) {
          var text = el.textContent.trim();
          // Try to extract a number (remove spaces, EUR, etc.)
          var match = text.replace(/\\s/g, '').match(/^([\\d,\\.]+)/);
          if (!match) return;
          var target = parseFloat(match[1].replace(',', '.'));
          if (isNaN(target) || target === 0) return;

          var isPrice = text.includes('\\u20AC') || text.includes('EUR');
          var duration = 1200;
          var start = performance.now();

          function step(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(target * eased);

            if (isPrice) {
              el.textContent = current.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' \\u20AC';
            } else {
              el.textContent = current.toLocaleString('fr-FR');
            }

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              // Restore exact text
              el.textContent = text;
            }
          }

          el.textContent = isPrice ? '0,00 \\u20AC' : '0';
          requestAnimationFrame(step);
        });
      });
    </script>
  `;

  return htmlPage({
    title: 'Dashboard',
    activePage: 'dashboard',
    extraCss: DASHBOARD_CSS,
    content,
    userName: `${user.prenom} ${user.nom}`,
  });
}
