/**
 * Soutien Scolaire Caplogy - Page Admin: Detail Formateur
 * Profil complet avec tabs CSS, documents, cours, avis, paiements
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { starsHTML } from '../../shared/utils';
import { getFormateur } from '../api/formateurs';

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
    text-decoration: none;
    margin-bottom: 20px;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all var(--transition-fast);
    animation: slideInLeft 0.3s ease both;
  }
  .back-link:hover {
    background: var(--white);
    color: var(--primary);
    box-shadow: var(--shadow-sm);
  }

  /* ---- Profile header card ---- */
  .profile-header {
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    margin-bottom: 24px;
    animation: slideUp 0.5s ease both;
    position: relative;
  }
  .profile-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--secondary) 100%);
  }
  .profile-header-content {
    position: relative;
    padding: 60px 32px 28px;
    display: flex;
    align-items: flex-end;
    gap: 24px;
    flex-wrap: wrap;
  }
  .profile-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid var(--white);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(135deg, var(--secondary-light), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 800;
    color: var(--primary-dark);
    flex-shrink: 0;
    overflow: hidden;
    transition: transform var(--transition-normal);
  }
  .profile-photo:hover {
    transform: scale(1.05);
  }
  .profile-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .profile-info {
    flex: 1;
    min-width: 200px;
  }
  .profile-name {
    font-size: 24px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .profile-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
    flex-wrap: wrap;
    font-size: 14px;
    color: var(--gray-500);
  }
  .profile-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .profile-meta-item .meta-icon {
    font-size: 15px;
  }
  .profile-stats-row {
    display: flex;
    gap: 24px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .profile-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }
  .profile-stat-value {
    font-weight: 700;
    color: var(--gray-900);
  }
  .profile-stat-label {
    color: var(--gray-500);
  }

  /* ---- Tab navigation ---- */
  .tabs-nav {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--gray-100);
    margin-bottom: 24px;
    overflow-x: auto;
    animation: slideUp 0.4s ease both;
    animation-delay: 0.1s;
    background: var(--white);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    padding: 0 8px;
    box-shadow: var(--shadow-sm);
  }
  .tab-btn {
    padding: 14px 22px;
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-500);
    text-decoration: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
    cursor: pointer;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    transition: all var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .tab-btn:hover {
    color: var(--primary);
    background: rgba(13,56,101,0.03);
  }
  .tab-btn.active {
    color: var(--primary);
    border-bottom-color: var(--secondary);
  }
  .tab-btn .tab-icon {
    font-size: 15px;
  }

  /* ---- Tab panels ---- */
  .tab-panel {
    display: none;
    animation: fadeIn 0.3s ease both;
  }
  .tab-panel.active {
    display: block;
  }

  /* ---- Section within tab ---- */
  .detail-section {
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    padding: 24px;
    margin-bottom: 20px;
    animation: slideUp 0.4s ease both;
  }
  .detail-section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gray-100);
  }

  /* ---- Info grid ---- */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .info-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .info-value {
    font-size: 14px;
    color: var(--gray-900);
    font-weight: 500;
  }
  .info-value.masked {
    font-family: monospace;
    letter-spacing: 2px;
    color: var(--gray-500);
  }

  /* ---- Domaine tree ---- */
  .domaine-group {
    margin-bottom: 16px;
  }
  .domaine-group-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .thematique-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: var(--blue-light);
    color: #1e40af;
    border: 1px solid #93c5fd;
    margin: 3px;
    transition: transform var(--transition-fast);
  }
  .thematique-item:hover {
    transform: scale(1.05);
  }

  /* ---- Documents list ---- */
  .doc-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .doc-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-100);
    transition: all var(--transition-fast);
    background: var(--white);
  }
  .doc-item:hover {
    border-color: var(--secondary);
    box-shadow: var(--shadow-sm);
  }
  .doc-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .doc-icon.uploaded {
    background: var(--success-light);
  }
  .doc-icon.missing {
    background: var(--gray-100);
  }
  .doc-name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-700);
  }
  .doc-status {
    font-size: 12px;
    font-weight: 600;
  }
  .doc-status.uploaded {
    color: var(--success);
  }
  .doc-status.missing {
    color: var(--gray-400);
  }
  .doc-link {
    font-size: 12px;
    font-weight: 600;
    color: var(--primary);
    text-decoration: none;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--primary);
    transition: all var(--transition-fast);
  }
  .doc-link:hover {
    background: var(--primary);
    color: var(--white);
  }

  /* ---- Review card ---- */
  .review-card {
    padding: 16px;
    border: 1px solid var(--gray-100);
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
    transition: all var(--transition-fast);
  }
  .review-card:hover {
    border-color: var(--secondary);
    box-shadow: var(--shadow-sm);
  }
  .review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .review-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
  }
  .review-date {
    font-size: 12px;
    color: var(--gray-400);
  }
  .review-text {
    font-size: 14px;
    color: var(--gray-600);
    line-height: 1.6;
    font-style: italic;
  }

  /* ---- Admin action panel ---- */
  .admin-panel {
    background: linear-gradient(135deg, var(--gray-50), var(--white));
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: 24px;
    margin-top: 24px;
    animation: slideUp 0.5s ease both;
    animation-delay: 0.2s;
  }
  .admin-panel-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .admin-actions-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .validation-timeline {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--gray-200);
  }
  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 0;
    font-size: 13px;
  }
  .timeline-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 4px;
    flex-shrink: 0;
  }
  .timeline-dot.draft { background: var(--gray-300); }
  .timeline-dot.en_attente, .timeline-dot.submitted { background: var(--warning); }
  .timeline-dot.valide { background: var(--success); }
  .timeline-dot.refuse { background: var(--danger); }
  .timeline-dot.suspendu { background: var(--gray-500); }

  /* ---- Bio text ---- */
  .bio-text {
    font-size: 14px;
    line-height: 1.8;
    color: var(--gray-600);
    white-space: pre-line;
  }

  @media (max-width: 768px) {
    .profile-header-content { padding: 40px 20px 20px; flex-direction: column; align-items: center; text-align: center; }
    .profile-photo { width: 80px; height: 80px; font-size: 28px; }
    .profile-name { justify-content: center; font-size: 20px; }
    .profile-meta { justify-content: center; }
    .tabs-nav { padding: 0; }
    .tab-btn { padding: 12px 14px; font-size: 13px; }
    .info-grid { grid-template-columns: 1fr; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    submitted: 'Soumis',
    en_attente: 'En attente',
    valide: 'Valid\u00e9',
    refuse: 'Refus\u00e9',
    suspendu: 'Suspendu',
  };
  return `<span class="badge badge-${status} badge-dot">${escapeHtml(labels[status] || status)}</span>`;
}

function maskIban(iban: string | undefined | null): string {
  if (!iban) return '-';
  if (iban.length < 8) return iban;
  return iban.slice(0, 4) + ' \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ' + iban.slice(-4);
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderFormateurDetail(env: Env, formateurId: string, userName?: string): Promise<string> {
  const data = await getFormateur(env, formateurId);

  if (!data) {
    return htmlPage({
      title: 'Formateur introuvable',
      activePage: 'formateurs',
      content: `
        <a href="/formateurs" class="back-link">\u2190 Retour aux formateurs</a>
        <div class="empty-state">
          <span class="empty-icon">\ud83d\udd0d</span>
          <div class="empty-title">Formateur introuvable</div>
          <div class="empty-text">Ce formateur n'existe pas ou a \u00e9t\u00e9 supprim\u00e9</div>
        </div>
      `,
      userName,
    });
  }

  const { formateur: f, thematiques, documents, cours, avis, paiements, validation_history } = data;
  const initials = ((f.prenom?.[0] || '') + (f.nom?.[0] || '')).toUpperCase();

  // ---- Build thematiques by domaine ----
  const domaineGroups = new Map<string, { icone: string; nom: string; items: typeof thematiques }>();
  for (const t of thematiques) {
    if (!domaineGroups.has(t.domaine_nom)) {
      domaineGroups.set(t.domaine_nom, { icone: t.domaine_icone, nom: t.domaine_nom, items: [] });
    }
    domaineGroups.get(t.domaine_nom)!.items.push(t);
  }

  let thematiquesHtml = '';
  if (domaineGroups.size === 0) {
    thematiquesHtml = '<div style="color:var(--gray-400);font-size:14px">Aucune th\u00e9matique s\u00e9lectionn\u00e9e</div>';
  } else {
    for (const [, group] of domaineGroups) {
      thematiquesHtml += `
        <div class="domaine-group">
          <div class="domaine-group-title">${escapeHtml(group.icone)} ${escapeHtml(group.nom)}</div>
          <div>
            ${group.items.map(t =>
              `<span class="thematique-item" title="${escapeHtml(t.sous_domaine_nom)}">${escapeHtml(t.thematique_nom)}</span>`
            ).join('')}
          </div>
        </div>
      `;
    }
  }

  // ---- Build documents list ----
  const docsHtml = documents.map(doc => `
    <div class="doc-item">
      <div class="doc-icon ${doc.uploaded ? 'uploaded' : 'missing'}">
        ${doc.uploaded ? '\u2705' : '\ud83d\udcc4'}
      </div>
      <div class="doc-name">${escapeHtml(doc.label)}</div>
      <span class="doc-status ${doc.uploaded ? 'uploaded' : 'missing'}">
        ${doc.uploaded ? 'T\u00e9l\u00e9vers\u00e9' : 'Manquant'}
      </span>
      ${doc.uploaded && doc.url ? `<a href="/api/formateurs/${escapeHtml(f.id)}/documents/${escapeHtml(doc.key)}" class="doc-link" target="_blank">Voir</a>` : ''}
    </div>
  `).join('');

  // ---- Build cours table ----
  let coursHtml = '';
  if (cours.length === 0) {
    coursHtml = '<div style="color:var(--gray-400);font-size:14px;text-align:center;padding:24px">Aucun cours enregistr\u00e9</div>';
  } else {
    coursHtml = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Th\u00e9matique</th>
              <th>Type</th>
              <th>\u00c9l\u00e8ves</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${cours.map(c => `
              <tr>
                <td>${formatDateFr(c.date_cours)}</td>
                <td>${escapeHtml(c.heure_debut)}</td>
                <td class="cell-main">${escapeHtml(c.thematique_nom)}</td>
                <td><span class="badge badge-${c.type_cours}">${escapeHtml(c.type_cours)}</span></td>
                <td class="text-center">${c.nb_eleves}</td>
                <td><span class="badge badge-${c.statut}">${escapeHtml(c.statut)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ---- Build avis ----
  let avisHtml = '';
  if (avis.length === 0) {
    avisHtml = '<div style="color:var(--gray-400);font-size:14px;text-align:center;padding:24px">Aucun avis pour le moment</div>';
  } else {
    avisHtml = avis.map(a => `
      <div class="review-card">
        <div class="review-header">
          <div>
            <span class="review-author">${escapeHtml(a.eleve_prenom)} ${escapeHtml(a.eleve_nom || '')}</span>
            ${starsHTML(a.note)}
          </div>
          <span class="review-date">${formatDateFr(a.created_at)}</span>
        </div>
        ${a.commentaire ? `<div class="review-text">\u201c${escapeHtml(a.commentaire)}\u201d</div>` : ''}
      </div>
    `).join('');
  }

  // ---- Build paiements table ----
  let paiementsHtml = '';
  if (paiements.length === 0) {
    paiementsHtml = '<div style="color:var(--gray-400);font-size:14px;text-align:center;padding:24px">Aucun paiement enregistr\u00e9</div>';
  } else {
    paiementsHtml = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Montant</th>
              <th>Heures</th>
              <th>Statut</th>
              <th>Date virement</th>
            </tr>
          </thead>
          <tbody>
            ${paiements.map(p => `
              <tr>
                <td class="cell-main">${escapeHtml(p.mois)}</td>
                <td>${p.montant.toFixed(2)} \u20ac</td>
                <td>${p.nb_heures}h</td>
                <td><span class="badge badge-${p.statut}">${escapeHtml(p.statut)}</span></td>
                <td>${p.date_virement ? formatDateFr(p.date_virement) : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ---- Validation timeline ----
  const timelineHtml = validation_history.map(h => `
    <div class="timeline-item">
      <div class="timeline-dot ${h.status}"></div>
      <div>
        <strong>${escapeHtml(h.status)}</strong>
        <span style="color:var(--gray-400);margin-left:8px">${formatDateFr(h.date)}</span>
        ${h.by ? `<span style="color:var(--gray-400);margin-left:4px">par ${escapeHtml(h.by)}</span>` : ''}
      </div>
    </div>
  `).join('');

  const content = `
    <a href="/formateurs" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Retour aux formateurs
    </a>

    <!-- Profile header -->
    <div class="profile-header">
      <div class="profile-header-content">
        <div class="profile-photo">
          ${f.photo_url ? `<img src="${escapeHtml(f.photo_url)}" alt="${escapeHtml(f.prenom)}">` : escapeHtml(initials)}
        </div>
        <div class="profile-info">
          <div class="profile-name">
            ${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}
            ${statusBadge(f.application_status)}
          </div>
          <div class="profile-meta">
            <span class="profile-meta-item">
              <span class="meta-icon">\ud83d\udccd</span>
              ${escapeHtml(f.ville)}${f.code_postal ? ` (${escapeHtml(f.code_postal)})` : ''}
            </span>
            <span class="profile-meta-item">
              <span class="meta-icon">\ud83d\udcc5</span>
              Membre depuis ${formatDateFr(f.created_at)}
            </span>
            <span class="profile-meta-item">
              <span class="meta-icon">\ud83d\udce7</span>
              ${escapeHtml(f.email)}
            </span>
          </div>
          <div class="profile-stats-row">
            <div class="profile-stat">
              ${starsHTML(Math.round(f.note_moyenne))}
              <span class="profile-stat-value">${f.note_moyenne.toFixed(1)}</span>
              <span class="profile-stat-label">(${f.nb_avis} avis)</span>
            </div>
            <div class="profile-stat">
              <span>\u23f1\ufe0f</span>
              <span class="profile-stat-value">${f.nb_heures_total}h</span>
              <span class="profile-stat-label">total</span>
            </div>
            <div class="profile-stat">
              <span>\ud83d\udcb6</span>
              <span class="profile-stat-value">${f.tarif_horaire_individuel ? f.tarif_horaire_individuel + '\u20ac/h' : '-'}</span>
              <span class="profile-stat-label">individuel</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs navigation -->
    <div class="tabs-nav">
      <button class="tab-btn active" onclick="switchTab('infos')">
        <span class="tab-icon">\ud83d\udcdd</span> Infos
      </button>
      <button class="tab-btn" onclick="switchTab('competences')">
        <span class="tab-icon">\ud83c\udf93</span> Comp\u00e9tences
      </button>
      <button class="tab-btn" onclick="switchTab('documents')">
        <span class="tab-icon">\ud83d\udcc1</span> Documents
        <span style="font-size:11px;color:var(--gray-400)">(${documents.filter(d => d.uploaded).length}/${documents.length})</span>
      </button>
      <button class="tab-btn" onclick="switchTab('cours')">
        <span class="tab-icon">\ud83d\udcc5</span> Cours
      </button>
      <button class="tab-btn" onclick="switchTab('avis')">
        <span class="tab-icon">\u2b50</span> Avis
        <span style="font-size:11px;color:var(--gray-400)">(${avis.length})</span>
      </button>
      <button class="tab-btn" onclick="switchTab('paiements')">
        <span class="tab-icon">\ud83d\udcb0</span> Paiements
      </button>
    </div>

    <!-- TAB: Infos -->
    <div class="tab-panel active" id="tab-infos">
      <div class="detail-section">
        <div class="detail-section-title">\ud83d\udc64 Informations personnelles</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">${escapeHtml(f.email)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">T\u00e9l\u00e9phone</span>
            <span class="info-value">${escapeHtml(f.telephone || '-')}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Ville</span>
            <span class="info-value">${escapeHtml(f.ville)} ${f.code_postal ? `(${escapeHtml(f.code_postal)})` : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Rayon d'action</span>
            <span class="info-value">${f.rayon_km} km</span>
          </div>
          <div class="info-item">
            <span class="info-label">SIRET</span>
            <span class="info-value">${escapeHtml(f.siret || '-')}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IBAN</span>
            <span class="info-value masked">${maskIban(f.iban)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Exp\u00e9rience</span>
            <span class="info-value">${f.experience_annees} an${f.experience_annees > 1 ? 's' : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Accepte</span>
            <span class="info-value">
              ${f.accepte_domicile ? '\ud83c\udfe0 Domicile' : ''}
              ${f.accepte_collectif ? '\ud83d\udc65 Collectif' : ''}
              ${f.accepte_visio ? '\ud83d\udcbb Visio' : ''}
              ${!f.accepte_domicile && !f.accepte_collectif && !f.accepte_visio ? '-' : ''}
            </span>
          </div>
        </div>
      </div>

      ${f.bio ? `
      <div class="detail-section">
        <div class="detail-section-title">\ud83d\udcac Bio</div>
        <div class="bio-text">${escapeHtml(f.bio)}</div>
      </div>
      ` : ''}
    </div>

    <!-- TAB: Competences -->
    <div class="tab-panel" id="tab-competences">
      <div class="detail-section">
        <div class="detail-section-title">\ud83c\udf93 Domaines & Th\u00e9matiques</div>
        ${thematiquesHtml}
      </div>
      <div class="detail-section">
        <div class="detail-section-title">\ud83d\udcb6 Tarifs</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Tarif individuel</span>
            <span class="info-value">${f.tarif_horaire_individuel ? f.tarif_horaire_individuel.toFixed(2) + ' \u20ac/h' : 'Non d\u00e9fini'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tarif collectif</span>
            <span class="info-value">${f.tarif_horaire_collectif ? f.tarif_horaire_collectif.toFixed(2) + ' \u20ac/h' : 'Non d\u00e9fini'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: Documents -->
    <div class="tab-panel" id="tab-documents">
      <div class="detail-section">
        <div class="detail-section-title">
          \ud83d\udcc1 Documents justificatifs
          <span style="margin-left:auto;font-size:12px;font-weight:600;color:${documents.filter(d => d.uploaded).length === documents.length ? 'var(--success)' : 'var(--warning)'}">
            ${documents.filter(d => d.uploaded).length}/${documents.length} t\u00e9l\u00e9vers\u00e9s
          </span>
        </div>
        <div class="doc-list">
          ${docsHtml}
        </div>
      </div>
    </div>

    <!-- TAB: Cours -->
    <div class="tab-panel" id="tab-cours">
      <div class="detail-section">
        <div class="detail-section-title">\ud83d\udcc5 Cours r\u00e9cents</div>
        ${coursHtml}
      </div>
    </div>

    <!-- TAB: Avis -->
    <div class="tab-panel" id="tab-avis">
      <div class="detail-section">
        <div class="detail-section-title">\u2b50 Avis des \u00e9l\u00e8ves</div>
        ${avisHtml}
      </div>
    </div>

    <!-- TAB: Paiements -->
    <div class="tab-panel" id="tab-paiements">
      <div class="detail-section">
        <div class="detail-section-title">\ud83d\udcb0 Historique des paiements</div>
        ${paiementsHtml}
      </div>
    </div>

    <!-- Admin actions panel -->
    <div class="admin-panel">
      <div class="admin-panel-title">\ud83d\udee1\ufe0f Actions administrateur</div>
      <div class="admin-actions-row">
        ${f.application_status === 'en_attente' || f.application_status === 'submitted' ? `
          <button class="btn btn-success btn-sm" onclick="changeStatus('valide')">
            \u2705 Valider le formateur
          </button>
          <button class="btn btn-danger btn-sm" onclick="changeStatus('refuse')">
            \u274c Refuser
          </button>
        ` : ''}
        ${f.application_status === 'valide' ? `
          <button class="btn btn-warning btn-sm" onclick="changeStatus('suspendu')">
            \u23f8\ufe0f Suspendre
          </button>
        ` : ''}
        ${f.application_status === 'suspendu' ? `
          <button class="btn btn-success btn-sm" onclick="changeStatus('valide')">
            \u25b6\ufe0f R\u00e9activer
          </button>
        ` : ''}
        ${f.application_status === 'refuse' ? `
          <button class="btn btn-primary btn-sm" onclick="changeStatus('en_attente')">
            \ud83d\udd04 R\u00e9examiner
          </button>
        ` : ''}
      </div>

      <div style="margin-bottom:16px">
        <label class="form-label">\ud83d\udcdd Notes administrateur</label>
        <textarea class="form-textarea" id="admin-notes" rows="3" placeholder="Notes internes sur ce formateur\u2026">${escapeHtml(f.admin_notes || '')}</textarea>
        <button class="btn btn-outline btn-sm" style="margin-top:8px" onclick="saveNotes()">
          Sauvegarder les notes
        </button>
      </div>

      ${validation_history.length > 0 ? `
        <div class="validation-timeline">
          <div style="font-size:13px;font-weight:700;color:var(--gray-600);margin-bottom:8px">\ud83d\udcdc Historique de validation</div>
          ${timelineHtml}
        </div>
      ` : ''}
    </div>

    <script>
      function switchTab(tabId) {
        // Deactivate all
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        // Activate target
        document.getElementById('tab-' + tabId).classList.add('active');
        event.currentTarget.classList.add('active');
      }

      async function changeStatus(status) {
        const labels = { valide: 'valider', refuse: 'refuser', suspendu: 'suspendre', en_attente: 'r\u00e9examiner' };
        if (!confirm('Voulez-vous vraiment ' + (labels[status] || status) + ' ce formateur ?')) return;

        try {
          const res = await fetch('/api/formateurs/${escapeHtml(f.id)}/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          if (res.ok) {
            window.location.reload();
          } else {
            const data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
          }
        } catch (e) {
          alert('Erreur de connexion');
        }
      }

      async function saveNotes() {
        const notes = document.getElementById('admin-notes').value;
        try {
          const res = await fetch('/api/formateurs/${escapeHtml(f.id)}', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_notes: notes })
          });
          if (res.ok) {
            alert('Notes sauvegard\u00e9es');
          } else {
            alert('Erreur lors de la sauvegarde');
          }
        } catch (e) {
          alert('Erreur de connexion');
        }
      }
    </script>
  `;

  return htmlPage({
    title: `${f.prenom} ${f.nom}`,
    activePage: 'formateurs',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
