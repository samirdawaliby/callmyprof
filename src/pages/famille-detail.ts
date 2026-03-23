/**
 * Soutien Scolaire Caplogy - Page Admin: Detail Famille
 * Profil parent, enfants, packages, cours, factures
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { getFamille } from '../api/familles';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Back link ---- */
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-500);
    margin-bottom: 20px;
    transition: color var(--transition-fast);
    animation: slideInLeft 0.3s ease both;
  }
  .back-link:hover {
    color: var(--primary);
  }

  /* ---- Parent info card ---- */
  .parent-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 28px 32px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    margin-bottom: 24px;
    animation: slideUp 0.5s ease both;
    position: relative;
    overflow: hidden;
  }
  .parent-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--success), #34d399, var(--secondary));
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }
  .parent-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  .parent-avatar-large {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 800;
    color: var(--primary-dark);
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    border: 3px solid #6ee7b7;
    flex-shrink: 0;
    animation: bounceIn 0.6s ease both;
    transition: transform var(--transition-fast);
  }
  .parent-avatar-large:hover {
    transform: scale(1.08) rotate(3deg);
  }
  .parent-name {
    font-size: 24px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.5px;
  }
  .parent-email {
    font-size: 14px;
    color: var(--gray-500);
    margin-top: 2px;
  }
  .parent-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .info-item .info-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-400);
  }
  .info-item .info-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ---- URSSAF badge ---- */
  .urssaf-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
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

  /* ---- Section titles ---- */
  .section-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    letter-spacing: -0.3px;
  }
  .section-title .section-icon {
    font-size: 22px;
    animation: float 3s ease-in-out infinite;
  }
  .section-title .section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    border-radius: 12px;
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: 12px;
    font-weight: 700;
  }

  /* ---- Enfant cards grid ---- */
  .enfants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  .enfant-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    animation: slideUp 0.5s ease both;
    position: relative;
    overflow: hidden;
  }
  .enfant-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  .enfant-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--blue), var(--secondary));
  }
  .enfant-card:nth-child(1) { animation-delay: 0.05s; }
  .enfant-card:nth-child(2) { animation-delay: 0.1s; }
  .enfant-card:nth-child(3) { animation-delay: 0.15s; }
  .enfant-card:nth-child(4) { animation-delay: 0.2s; }

  .enfant-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .enfant-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: linear-gradient(135deg, var(--blue-light), #bfdbfe);
    border: 2px solid #93c5fd;
    transition: transform var(--transition-fast);
  }
  .enfant-avatar:hover {
    transform: scale(1.1) rotate(-5deg);
  }
  .enfant-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
  }
  .enfant-niveau {
    font-size: 12px;
    color: var(--gray-500);
    margin-top: 1px;
  }
  .enfant-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 10px;
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
    transition: transform var(--transition-fast);
  }
  .thematique-badge:hover {
    transform: scale(1.05);
  }

  /* ---- Profil specifique badges ---- */
  .profil-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  /* ---- Packages section ---- */
  .packages-section {
    margin-bottom: 28px;
    animation: slideUp 0.5s ease both;
    animation-delay: 0.2s;
  }

  /* ---- Progress bar ---- */
  .progress-bar-container {
    width: 100%;
    height: 8px;
    background: var(--gray-100);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(90deg, var(--success), #34d399);
    position: relative;
  }
  .progress-bar-fill.low {
    background: linear-gradient(90deg, var(--warning), #fbbf24);
  }
  .progress-bar-fill.critical {
    background: linear-gradient(90deg, var(--danger), #f87171);
  }
  .progress-bar-fill::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s linear infinite;
    background-size: 200% 100%;
  }
  .progress-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-600);
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
  }

  /* ---- Cours & factures sections ---- */
  .section-wrapper {
    margin-bottom: 28px;
    animation: slideUp 0.5s ease both;
  }
  .section-wrapper:nth-child(odd) { animation-delay: 0.25s; }
  .section-wrapper:nth-child(even) { animation-delay: 0.3s; }

  /* ---- Action bar at top ---- */
  .action-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    animation: slideDown 0.4s ease both;
    animation-delay: 0.15s;
  }

  /* ---- Matching button ---- */
  .btn-match {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 8px;
    background: var(--primary); color: #fff;
    font-size: 12px; font-weight: 600; border: none; cursor: pointer;
    transition: all 0.2s;
    margin-top: 10px;
  }
  .btn-match:hover { background: var(--primary-dark); transform: translateY(-1px); }

  /* ---- Matching modal ---- */
  .match-overlay {
    display: none; position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    align-items: center; justify-content: center;
  }
  .match-overlay.active { display: flex; }
  .match-modal {
    background: #fff; border-radius: 16px; width: 90%; max-width: 720px;
    max-height: 85vh; overflow-y: auto; padding: 28px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: slideUp 0.3s ease;
  }
  .match-modal-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
  }
  .match-modal-title { font-size: 18px; font-weight: 700; color: var(--gray-900); }
  .match-close {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: var(--gray-100); cursor: pointer; font-size: 18px; color: var(--gray-500);
    display: flex; align-items: center; justify-content: center;
  }
  .match-close:hover { background: var(--gray-200); }
  .match-loading { text-align: center; padding: 40px; color: var(--gray-500); }
  .match-card {
    border: 1px solid var(--gray-200); border-radius: 12px; padding: 16px;
    margin-bottom: 12px; transition: all 0.2s;
  }
  .match-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .match-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .match-avatar {
    width: 44px; height: 44px; border-radius: 50%; background: var(--gray-100);
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .match-score {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;
    background: var(--success-light, #dcfce7); color: var(--success, #16a34a);
  }
  .match-name { font-weight: 700; font-size: 15px; }
  .match-meta { font-size: 12px; color: var(--gray-500); }
  .match-reasons { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
  .match-reason {
    font-size: 11px; padding: 2px 8px; border-radius: 6px;
    background: var(--gray-50); color: var(--gray-600); border: 1px solid var(--gray-200);
  }
  .match-ai { font-size: 12px; color: var(--gray-600); font-style: italic; margin-top: 6px; padding: 8px; background: #f0f7ff; border-radius: 8px; }
  .match-actions { display: flex; gap: 8px; margin-top: 10px; }
  .match-actions a {
    font-size: 12px; padding: 5px 12px; border-radius: 6px; text-decoration: none;
    background: var(--primary); color: #fff; font-weight: 600;
  }
  .match-actions a:hover { background: var(--primary-dark); }
  .match-empty { text-align: center; padding: 30px; color: var(--gray-400); }

  @media (max-width: 768px) {
    .parent-header { flex-direction: column; text-align: center; }
    .parent-info-grid { grid-template-columns: 1fr 1fr; }
    .enfants-grid { grid-template-columns: 1fr; }
    .action-bar { justify-content: center; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function profilBadge(profil: string): string {
  const configs: Record<string, { label: string; cls: string; icon: string }> = {
    standard: { label: 'Standard', cls: 'badge-standard', icon: '\u{1F393}' },
    dys: { label: 'DYS', cls: 'badge-dys', icon: '\u{1F9E0}' },
    tdah: { label: 'TDAH', cls: 'badge-tdah', icon: '\u{26A1}' },
    hpi: { label: 'HPI', cls: 'badge-hpi', icon: '\u{1F4A1}' },
  };
  const cfg = configs[profil] || configs.standard;
  return `<span class="badge ${cfg.cls}">${cfg.icon} ${cfg.label}</span>`;
}

function statusBadge(status: string): string {
  const labels: Record<string, string> = {
    actif: 'Actif',
    expire: 'Expir\u{00E9}',
    epuise: '\u{00C9}puis\u{00E9}',
    rembourse: 'Rembours\u{00E9}',
  };
  const label = labels[status] || status;
  return `<span class="badge badge-${status} badge-dot">${escapeHtml(label)}</span>`;
}

function factureStatusBadge(status: string): string {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    emise: '\u{00C9}mise',
    payee: 'Pay\u{00E9}e',
    echec: '\u{00C9}chec',
    remboursee: 'Rembours\u{00E9}e',
    avoir: 'Avoir',
  };
  const label = labels[status] || status;
  return `<span class="badge badge-${status} badge-dot">${escapeHtml(label)}</span>`;
}

function coursStatusBadge(status: string): string {
  const labels: Record<string, string> = {
    planifie: 'Planifi\u{00E9}',
    confirme: 'Confirm\u{00E9}',
    en_cours: 'En cours',
    termine: 'Termin\u{00E9}',
    annule: 'Annul\u{00E9}',
  };
  const label = labels[status] || status;
  return `<span class="badge badge-${status} badge-dot">${escapeHtml(label)}</span>`;
}

function progressBar(used: number, total: number): string {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const remaining = total - used;
  const cls = pct >= 90 ? 'critical' : pct >= 70 ? 'low' : '';
  return `
    <div class="progress-bar-container">
      <div class="progress-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>
    <div class="progress-text">
      <span>${remaining.toFixed(1)}h restantes</span>
      <span>${pct}% utilis\u{00E9}</span>
    </div>
  `;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderFamilleDetail(env: Env, familleId: string, userName?: string): Promise<string> {
  const data = await getFamille(env, familleId);

  if (!data) {
    return htmlPage({
      title: 'Famille introuvable',
      activePage: 'familles',
      content: `
        <div class="empty-state" style="padding:80px 20px">
          <span class="empty-icon">\u{1F50D}</span>
          <div class="empty-title">Famille introuvable</div>
          <div class="empty-text">Cette famille n'existe pas ou a \u{00E9}t\u{00E9} supprim\u{00E9}e</div>
          <a href="/familles" class="btn btn-primary" style="margin-top:16px">\u{2190} Retour aux familles</a>
        </div>
      `,
      userName,
    });
  }

  const { parent, enfants, packages, cours, factures } = data;

  // ---- Enfants cards ----
  let enfantsHTML = '';
  if (enfants.length === 0) {
    enfantsHTML = `
      <div class="empty-state" style="padding:30px">
        <span class="empty-icon">\u{1F476}</span>
        <div class="empty-title">Aucun enfant enregistr\u{00E9}</div>
        <div class="empty-text">Ajoutez un enfant \u{00E0} cette famille</div>
      </div>
    `;
  } else {
    enfantsHTML = '<div class="enfants-grid">';
    for (const e of enfants) {
      const thematiques = e.thematiques_list
        ? e.thematiques_list.split(',').map(t => `<span class="thematique-badge">${escapeHtml(t.trim())}</span>`).join('')
        : '<span style="color:var(--gray-400);font-size:12px">Aucune th\u{00E9}matique</span>';

      enfantsHTML += `
        <div class="enfant-card">
          <div class="enfant-header">
            <div class="enfant-avatar">\u{1F9D1}\u{200D}\u{1F393}</div>
            <div>
              <div class="enfant-name">${escapeHtml(e.prenom)} ${escapeHtml(e.nom || '')}</div>
              <div class="enfant-niveau">${e.niveau ? escapeHtml(e.niveau) : 'Niveau non renseign\u{00E9}'}</div>
            </div>
          </div>
          <div style="margin-bottom:8px">${profilBadge(e.profil_specifique)}</div>
          <div class="enfant-badges">${thematiques}</div>
          <button class="btn-match" onclick="openMatching('${e.id}', '${escapeHtml(e.prenom)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Find matching tutor
          </button>
        </div>
      `;
    }
    enfantsHTML += '</div>';
  }

  // ---- Packages table ----
  let packagesHTML = '';
  if (packages.length === 0) {
    packagesHTML = `
      <div class="empty-state" style="padding:30px">
        <span class="empty-icon">\u{1F4E6}</span>
        <div class="empty-title">Aucun package</div>
        <div class="empty-text">Cette famille n'a pas encore de package actif</div>
      </div>
    `;
  } else {
    let rows = '';
    for (const p of packages) {
      rows += `
        <tr>
          <td>
            <div class="cell-main">${escapeHtml(p.package_nom)}</div>
            <div class="cell-sub">${escapeHtml(p.eleve_prenom)}</div>
          </td>
          <td><span class="badge badge-${p.type_cours}">${escapeHtml(p.type_cours)}</span></td>
          <td style="min-width:150px">${progressBar(p.heures_utilisees, p.heures_total)}</td>
          <td>${formatDateFr(p.date_expiration)}</td>
          <td>${statusBadge(p.statut)}</td>
          <td style="font-weight:700">${p.montant_paye.toLocaleString('fr-FR')}\u{00A0}\u{20AC}</td>
        </tr>
      `;
    }
    packagesHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Type</th>
              <th>Heures restantes</th>
              <th>Expiration</th>
              <th>Statut</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // ---- Cours table ----
  let coursHTML = '';
  if (cours.length === 0) {
    coursHTML = `
      <div class="empty-state" style="padding:30px">
        <span class="empty-icon">\u{1F4C5}</span>
        <div class="empty-title">Aucun cours</div>
        <div class="empty-text">Pas encore de cours planifi\u{00E9} pour cette famille</div>
      </div>
    `;
  } else {
    let rows = '';
    for (const c of cours) {
      rows += `
        <tr>
          <td>${formatDateFr(c.date_cours)}</td>
          <td>${escapeHtml(c.heure_debut || '-')}</td>
          <td><div class="cell-main">${escapeHtml(c.thematique_nom)}</div></td>
          <td>${escapeHtml(c.formateur_nom)}</td>
          <td>${escapeHtml(c.eleve_prenom)}</td>
          <td><span class="badge badge-${c.type_cours}">${escapeHtml(c.type_cours)}</span></td>
          <td>${coursStatusBadge(c.statut)}</td>
        </tr>
      `;
    }
    coursHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Th\u{00E9}matique</th>
              <th>Formateur</th>
              <th>\u{00C9}l\u{00E8}ve</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // ---- Factures table ----
  let facturesHTML = '';
  if (factures.length === 0) {
    facturesHTML = `
      <div class="empty-state" style="padding:30px">
        <span class="empty-icon">\u{1F4B0}</span>
        <div class="empty-title">Aucune facture</div>
        <div class="empty-text">Aucune facture \u{00E9}mise pour cette famille</div>
      </div>
    `;
  } else {
    let rows = '';
    for (const f of factures) {
      rows += `
        <tr>
          <td><div class="cell-main">${escapeHtml(f.reference)}</div></td>
          <td>${formatDateFr(f.date_emission)}</td>
          <td>${escapeHtml(f.type)}</td>
          <td style="font-weight:700">${f.montant_brut.toLocaleString('fr-FR')}\u{00A0}\u{20AC}</td>
          <td style="font-weight:700;color:var(--success)">${f.reste_a_charge.toLocaleString('fr-FR')}\u{00A0}\u{20AC}</td>
          <td>${factureStatusBadge(f.statut)}</td>
        </tr>
      `;
    }
    facturesHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>R\u{00E9}f\u{00E9}rence</th>
              <th>Date</th>
              <th>Type</th>
              <th>Montant brut</th>
              <th>Reste \u{00E0} charge</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  const content = `
    <a href="/familles" class="back-link">\u{2190} Retour aux familles</a>

    <!-- Parent info card -->
    <div class="parent-card">
      <div class="parent-header">
        <div class="parent-avatar-large">${escapeHtml(((parent.prenom?.[0] || '') + (parent.nom?.[0] || '')).toUpperCase())}</div>
        <div>
          <div class="parent-name">${escapeHtml(parent.prenom)} ${escapeHtml(parent.nom)}</div>
          <div class="parent-email">${escapeHtml(parent.email)}</div>
        </div>
      </div>
      <div class="parent-info-grid">
        <div class="info-item">
          <span class="info-label">T\u{00E9}l\u{00E9}phone</span>
          <span class="info-value">\u{1F4DE} ${parent.telephone ? escapeHtml(parent.telephone) : '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Adresse</span>
          <span class="info-value">\u{1F3E0} ${parent.adresse ? escapeHtml(parent.adresse) : '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ville</span>
          <span class="info-value">\u{1F4CD} ${escapeHtml(parent.ville)} ${escapeHtml(parent.code_postal)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Inscrit le</span>
          <span class="info-value">\u{1F4C5} ${formatDateFr(parent.created_at)}</span>
        </div>
      </div>
    </div>

    <!-- Action bar -->
    <div class="action-bar">
      <button class="btn btn-success" onclick="document.getElementById('add-enfant-modal').style.display='flex'">
        \u{1F476} Ajouter un enfant
      </button>
      <a href="/packages/new?famille=${escapeHtml(familleId)}" class="btn btn-primary">
        \u{1F4E6} Vendre un package
      </a>
    </div>

    <!-- Enfants section -->
    <div class="section-wrapper">
      <div class="section-title">
        <span class="section-icon">\u{1F9D1}\u{200D}\u{1F393}</span>
        Enfants
        <span class="section-count">${enfants.length}</span>
      </div>
      ${enfantsHTML}
    </div>

    <!-- Packages section -->
    <div class="section-wrapper packages-section">
      <div class="section-title">
        <span class="section-icon">\u{1F4E6}</span>
        Packages
        <span class="section-count">${packages.length}</span>
      </div>
      ${packagesHTML}
    </div>

    <!-- Cours section -->
    <div class="section-wrapper">
      <div class="section-title">
        <span class="section-icon">\u{1F4C5}</span>
        Cours r\u{00E9}cents
        <span class="section-count">${cours.length}</span>
      </div>
      ${coursHTML}
    </div>

    <!-- Factures section -->
    <div class="section-wrapper">
      <div class="section-title">
        <span class="section-icon">\u{1F4B0}</span>
        Factures
        <span class="section-count">${factures.length}</span>
      </div>
      ${facturesHTML}
    </div>

    <!-- Add enfant modal -->
    <div id="add-enfant-modal" style="display:none;position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;animation:fadeIn 0.2s ease">
      <div style="background:var(--white);border-radius:var(--radius-lg);padding:32px;max-width:480px;width:90%;box-shadow:var(--shadow-xl);animation:slideUp 0.3s ease both">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:20px;display:flex;align-items:center;gap:8px">
          \u{1F476} Ajouter un enfant
        </h3>
        <form id="add-enfant-form" onsubmit="submitEnfant(event)">
          <div class="form-group">
            <label class="form-label">Pr\u{00E9}nom <span class="required">*</span></label>
            <input type="text" class="form-input" name="prenom" required placeholder="Pr\u{00E9}nom de l'enfant">
          </div>
          <div class="form-group">
            <label class="form-label">Nom</label>
            <input type="text" class="form-input" name="nom" placeholder="Nom (optionnel)">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Niveau</label>
              <select class="form-select" name="niveau">
                <option value="">S\u{00E9}lectionner...</option>
                <option value="CP">CP</option>
                <option value="CE1">CE1</option>
                <option value="CE2">CE2</option>
                <option value="CM1">CM1</option>
                <option value="CM2">CM2</option>
                <option value="6eme">6\u{00E8}me</option>
                <option value="5eme">5\u{00E8}me</option>
                <option value="4eme">4\u{00E8}me</option>
                <option value="3eme">3\u{00E8}me</option>
                <option value="seconde">Seconde</option>
                <option value="premiere">Premi\u{00E8}re</option>
                <option value="terminale">Terminale</option>
                <option value="superieur">Sup\u{00E9}rieur</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Profil</label>
              <select class="form-select" name="profil_specifique">
                <option value="standard">Standard</option>
                <option value="dys">DYS</option>
                <option value="tdah">TDAH</option>
                <option value="hpi">HPI</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('add-enfant-modal').style.display='none'">Annuler</button>
            <button type="submit" class="btn btn-success" id="submit-enfant-btn">\u{2705} Ajouter</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Matching modal -->
    <div class="match-overlay" id="match-overlay" onclick="if(event.target===this)closeMatching()">
      <div class="match-modal">
        <div class="match-modal-header">
          <div class="match-modal-title" id="match-modal-title">Find matching tutor</div>
          <button class="match-close" onclick="closeMatching()">&times;</button>
        </div>
        <div id="match-results">
          <div class="match-loading">Searching for the best tutors...</div>
        </div>
      </div>
    </div>

    <script>
      async function openMatching(eleveId, eleveName) {
        document.getElementById('match-modal-title').textContent = 'Matching tutors for ' + eleveName;
        document.getElementById('match-overlay').classList.add('active');
        document.getElementById('match-results').innerHTML = '<div class="match-loading"><span class="spinner"></span> Analyzing profiles with AI...</div>';

        try {
          var res = await fetch('/api/matching/' + eleveId);
          var data = await res.json();

          if (!data.matches || data.matches.length === 0) {
            document.getElementById('match-results').innerHTML = '<div class="match-empty">' + (data.message || 'No matching tutors found') + '</div>';
            return;
          }

          var html = '';
          for (var i = 0; i < data.matches.length; i++) {
            var m = data.matches[i];
            var scoreColor = m.score >= 70 ? '#16a34a' : m.score >= 50 ? '#ca8a04' : '#dc2626';
            var scoreBg = m.score >= 70 ? '#dcfce7' : m.score >= 50 ? '#fef9c3' : '#fee2e2';

            var reasons = '';
            for (var r = 0; r < m.match_reasons.length; r++) {
              reasons += '<span class="match-reason">' + m.match_reasons[r] + '</span>';
            }

            var services = [];
            if (m.accepte_domicile) services.push('In-person');
            if (m.accepte_collectif) services.push('Group');
            if (m.accepte_visio) services.push('Online');

            html += '<div class="match-card">' +
              '<div class="match-card-header">' +
                '<div class="match-avatar">\\u{1F9D1}\\u200D\\u{1F3EB}</div>' +
                '<div style="flex:1">' +
                  '<div class="match-name">' + m.prenom + ' ' + m.nom + '</div>' +
                  '<div class="match-meta">' + m.ville + ' \\u2022 ' + m.experience_annees + 'y exp \\u2022 ' + services.join(', ') + '</div>' +
                '</div>' +
                '<div class="match-score" style="background:' + scoreBg + ';color:' + scoreColor + '">' + m.score + '%</div>' +
              '</div>' +
              '<div class="match-reasons">' + reasons + '</div>' +
              (m.note_moyenne > 0 ? '<div class="match-meta">\\u2B50 ' + m.note_moyenne.toFixed(1) + '/5 (' + m.nb_avis + ' reviews) \\u2022 ' + (m.tarif_individuel || '?') + ' ' + m.currency + '/h</div>' : '') +
              (m.ai_explanation ? '<div class="match-ai">\\u{1F916} ' + m.ai_explanation + '</div>' : '') +
              '<div class="match-actions">' +
                '<a href="/formateurs/' + m.formateur_id + '">View profile</a>' +
                '<a href="/cours/new?formateur=' + m.formateur_id + '" style="background:var(--success,#16a34a)">Create course</a>' +
              '</div>' +
            '</div>';
          }

          document.getElementById('match-results').innerHTML = '<div style="font-size:13px;color:var(--gray-500);margin-bottom:12px">' + data.total_candidates + ' candidates found, showing top ' + data.matches.length + '</div>' + html;
        } catch (err) {
          document.getElementById('match-results').innerHTML = '<div class="match-empty">Error: ' + err.message + '</div>';
        }
      }

      function closeMatching() {
        document.getElementById('match-overlay').classList.remove('active');
      }

      async function submitEnfant(e) {
        e.preventDefault();
        var form = document.getElementById('add-enfant-form');
        var btn = document.getElementById('submit-enfant-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Ajout...';

        var data = {
          prenom: form.prenom.value.trim(),
          nom: form.nom.value.trim() || undefined,
          niveau: form.niveau.value || undefined,
          profil_specifique: form.profil_specifique.value
        };

        try {
          var res = await fetch('/api/familles/${escapeHtml(familleId)}/enfants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            window.location.reload();
          } else {
            var err = await res.json();
            alert('Erreur: ' + (err.error || 'Erreur inconnue'));
            btn.disabled = false;
            btn.innerHTML = '\\u2705 Ajouter';
          }
        } catch (err) {
          alert('Erreur de connexion');
          btn.disabled = false;
          btn.innerHTML = '\\u2705 Ajouter';
        }
      }

      // Close modal on backdrop click
      document.getElementById('add-enfant-modal').addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
      });
    </script>
  `;

  return htmlPage({
    title: `${parent.prenom} ${parent.nom} - Famille`,
    activePage: 'familles',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
