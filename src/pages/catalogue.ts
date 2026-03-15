/**
 * Soutien Scolaire Caplogy - Page Admin: Catalogue des Thematiques
 * Arborescence interactive : Domaines > Sous-domaines > Thematiques
 * Accordion animé, recherche, toggle actif, modales d'ajout/édition
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml } from '../../shared/html-utils';
import { getCatalogueTree } from '../api/catalogue';
import type { CatalogueTreeNode } from '../api/catalogue';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Animated gradient header accent ---- */
  .page-header-accent {
    height: 4px;
    background: linear-gradient(90deg, var(--purple), var(--secondary), var(--purple));
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
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
    background: linear-gradient(135deg, var(--purple), #a78bfa);
    color: var(--white);
    font-size: 13px;
    font-weight: 700;
    animation: bounceIn 0.6s ease both;
    animation-delay: 0.3s;
  }

  /* ---- Stats mini badges ---- */
  .stats-mini {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
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
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .stats-mini .mini-badge .mini-count {
    font-weight: 800;
    font-size: 15px;
  }
  .stats-mini .mini-badge.purple .mini-count { color: var(--purple); }
  .stats-mini .mini-badge.blue .mini-count { color: var(--blue); }
  .stats-mini .mini-badge.teal .mini-count { color: var(--secondary); }
  .stats-mini .mini-badge.green .mini-count { color: var(--success); }

  /* ---- Search filter ---- */
  .catalogue-search {
    margin-bottom: 20px;
    animation: slideDown 0.3s ease both;
  }
  .catalogue-search .search-input {
    width: 100%;
    max-width: 400px;
    padding: 10px 14px 10px 38px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 14px;
    background: var(--white);
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 12px center;
    transition: all var(--transition-fast);
    outline: none;
  }
  .catalogue-search .search-input:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(109, 203, 221, 0.15);
  }

  /* ---- Domaine card ---- */
  .domaine-card {
    background: var(--white);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-100);
    box-shadow: var(--shadow-sm);
    margin-bottom: 12px;
    overflow: hidden;
    animation: slideUp 0.5s ease both;
    transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
  }
  .domaine-card:nth-child(1) { animation-delay: 0.05s; }
  .domaine-card:nth-child(2) { animation-delay: 0.1s; }
  .domaine-card:nth-child(3) { animation-delay: 0.15s; }
  .domaine-card:nth-child(4) { animation-delay: 0.2s; }
  .domaine-card:nth-child(5) { animation-delay: 0.25s; }
  .domaine-card:nth-child(6) { animation-delay: 0.3s; }
  .domaine-card:nth-child(7) { animation-delay: 0.35s; }
  .domaine-card:nth-child(8) { animation-delay: 0.4s; }
  .domaine-card.open {
    box-shadow: var(--shadow-md);
    border-color: var(--secondary);
  }
  .domaine-card.inactive {
    opacity: 0.5;
  }

  /* ---- Domaine header (accordion trigger) ---- */
  .domaine-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 24px;
    cursor: pointer;
    transition: background var(--transition-fast);
    user-select: none;
  }
  .domaine-header:hover {
    background: var(--gray-50);
  }
  .domaine-icon {
    font-size: 28px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--purple-light), #ede9fe);
    border: 1px solid #c4b5fd;
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }
  .domaine-card.open .domaine-icon {
    transform: scale(1.1);
    animation: pulse 2s ease-in-out 1;
  }
  .domaine-info {
    flex: 1;
    min-width: 0;
  }
  .domaine-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .domaine-meta {
    font-size: 12px;
    color: var(--gray-500);
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .domaine-meta .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .domaine-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .toggle-btn {
    position: relative;
    width: 40px;
    height: 22px;
    background: var(--gray-200);
    border: none;
    border-radius: 11px;
    cursor: pointer;
    transition: background var(--transition-fast);
  }
  .toggle-btn.active {
    background: var(--success);
  }
  .toggle-btn::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--white);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform var(--transition-fast);
  }
  .toggle-btn.active::after {
    transform: translateX(18px);
  }
  .chevron {
    font-size: 14px;
    color: var(--gray-400);
    transition: transform var(--transition-normal);
    flex-shrink: 0;
  }
  .domaine-card.open .chevron {
    transform: rotate(90deg);
  }

  /* ---- Domaine body (accordion content) ---- */
  .domaine-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--gray-50);
    border-top: 0 solid var(--gray-100);
  }
  .domaine-card.open .domaine-body {
    max-height: 3000px;
    border-top-width: 1px;
  }
  .domaine-body-inner {
    padding: 20px 24px;
  }

  /* ---- Sous-domaine section ---- */
  .sous-domaine-section {
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease both;
  }
  .sous-domaine-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--white);
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-200);
    margin-bottom: 10px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .sous-domaine-header:hover {
    border-color: var(--secondary);
    box-shadow: var(--shadow-sm);
  }
  .sous-domaine-icon {
    font-size: 18px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--blue-light);
    border: 1px solid #93c5fd;
    flex-shrink: 0;
  }
  .sous-domaine-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-800);
    flex: 1;
  }
  .sous-domaine-count {
    font-size: 11px;
    font-weight: 600;
    color: var(--gray-500);
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--gray-100);
  }
  .sous-domaine-section.inactive .sous-domaine-header {
    opacity: 0.5;
  }

  /* ---- Thematiques tags ---- */
  .thematiques-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 8px 4px;
  }
  .thematique-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    background: var(--white);
    border: 1px solid var(--gray-200);
    color: var(--gray-700);
    cursor: default;
    transition: all var(--transition-fast);
    animation: bounceIn 0.4s ease both;
  }
  .thematique-tag:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--secondary);
  }
  .thematique-tag.inactive {
    opacity: 0.4;
    text-decoration: line-through;
  }
  .thematique-tag .tag-formateurs {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--primary);
    color: var(--white);
    font-size: 10px;
    font-weight: 700;
  }
  .thematique-tag .tag-formateurs.zero {
    background: var(--gray-300);
  }
  .thematique-tag .tag-toggle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }
  .thematique-tag .tag-toggle.on {
    background: var(--success);
    color: var(--white);
  }
  .thematique-tag .tag-toggle.off {
    background: var(--gray-200);
    color: var(--gray-500);
  }
  .thematique-tag .tag-toggle:hover {
    transform: scale(1.2);
  }

  /* ---- Inline edit button ---- */
  .btn-inline-edit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--gray-200);
    background: var(--white);
    color: var(--gray-500);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }
  .btn-inline-edit:hover {
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
    transform: scale(1.1);
  }

  .btn-inline-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px dashed var(--gray-300);
    background: transparent;
    color: var(--gray-500);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .btn-inline-add:hover {
    border-color: var(--success);
    color: var(--success);
    background: rgba(16,185,129,0.05);
  }

  /* ---- Badge actif ---- */
  .badge-actif-indicator {
    display: inline-flex;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    flex-shrink: 0;
  }
  .badge-actif-indicator.off {
    background: var(--gray-300);
  }

  /* ---- Modal ---- */
  .modal-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0,0,0,0.5);
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  .modal-backdrop.show {
    display: flex;
  }
  .modal-content {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 32px;
    max-width: 480px;
    width: 90%;
    box-shadow: var(--shadow-xl);
    animation: slideUp 0.3s ease both;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  /* ---- Empty state ---- */
  .catalogue-empty {
    text-align: center;
    padding: 60px 24px;
    animation: fadeIn 0.5s ease both;
  }
  .catalogue-empty .empty-icon {
    font-size: 64px;
    display: block;
    animation: float 3s ease-in-out infinite;
    margin-bottom: 16px;
  }

  /* ---- Highlight match ---- */
  .highlight {
    background: linear-gradient(135deg, rgba(109,203,221,0.3), rgba(109,203,221,0.15));
    padding: 1px 4px;
    border-radius: 4px;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .domaine-header { padding: 14px 16px; gap: 10px; }
    .domaine-body-inner { padding: 16px; }
    .domaine-actions { gap: 4px; }
    .thematiques-container { gap: 6px; }
    .thematique-tag { padding: 5px 10px; font-size: 12px; }
  }
`;

// ============================================================================
// HELPERS
// ============================================================================

const DOMAINE_COLORS: Record<number, string> = {
  0: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
  1: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  2: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  3: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
  4: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  5: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  6: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
  7: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
};

function renderDomaineCard(node: CatalogueTreeNode, index: number): string {
  const d = node.domaine;
  const sdCount = node.sous_domaines.length;
  const tCount = node.sous_domaines.reduce((acc, sd) => acc + sd.thematiques.length, 0);
  const bgColor = DOMAINE_COLORS[index % 8];
  const inactiveClass = d.actif === 0 ? ' inactive' : '';

  let sousDomainesHTML = '';
  for (const sdNode of node.sous_domaines) {
    const sd = sdNode.sous_domaine;
    const sdInactive = sd.actif === 0 ? ' inactive' : '';

    let thematiquesHTML = '';
    for (const t of sdNode.thematiques) {
      const tInactive = t.actif === 0 ? ' inactive' : '';
      const fmtCount = t.nb_formateurs || 0;
      const fmtClass = fmtCount === 0 ? ' zero' : '';

      thematiquesHTML += `
        <span class="thematique-tag${tInactive}" data-thematique-name="${escapeHtml(t.nom.toLowerCase())}">
          ${escapeHtml(t.nom)}
          <span class="tag-formateurs${fmtClass}" title="${fmtCount} formateur${fmtCount !== 1 ? 's' : ''}">${fmtCount}</span>
          <button class="tag-toggle ${t.actif ? 'on' : 'off'}" onclick="event.stopPropagation();toggleActif('thematique','${escapeHtml(t.id)}')" title="${t.actif ? 'Actif' : 'Inactif'}">
            ${t.actif ? '\u{2713}' : '\u{2715}'}
          </button>
        </span>
      `;
    }

    sousDomainesHTML += `
      <div class="sous-domaine-section${sdInactive}" data-sd-name="${escapeHtml(sd.nom.toLowerCase())}">
        <div class="sous-domaine-header">
          <div class="sous-domaine-icon">${sd.icone ? escapeHtml(sd.icone) : '\u{1F4C1}'}</div>
          <span class="sous-domaine-name">${escapeHtml(sd.nom)}</span>
          <span class="sous-domaine-count">${sdNode.thematiques.length} th\u{00E9}m.</span>
          <span class="badge-actif-indicator${sd.actif ? '' : ' off'}" title="${sd.actif ? 'Actif' : 'Inactif'}"></span>
          <button class="toggle-btn${sd.actif ? ' active' : ''}" onclick="event.stopPropagation();toggleActif('sous-domaine','${escapeHtml(sd.id)}')" title="Activer/D\u{00E9}sactiver"></button>
          <button class="btn-inline-edit" onclick="event.stopPropagation();editItem('sous-domaine','${escapeHtml(sd.id)}','${escapeHtml(sd.nom)}')" title="Modifier">\u{270F}\u{FE0F}</button>
          <button class="btn-inline-add" onclick="event.stopPropagation();openAddModal('thematique','${escapeHtml(sd.id)}','${escapeHtml(sd.nom)}')" title="Ajouter une th\u{00E9}matique">+ Th\u{00E9}m.</button>
        </div>
        <div class="thematiques-container">
          ${thematiquesHTML || '<span style="font-size:12px;color:var(--gray-400);padding:8px">Aucune th\u{00E9}matique</span>'}
        </div>
      </div>
    `;
  }

  return `
    <div class="domaine-card${inactiveClass}" data-domaine-name="${escapeHtml(d.nom.toLowerCase())}">
      <div class="domaine-header" onclick="toggleDomaine(this)">
        <div class="domaine-icon" style="background:${bgColor}">
          ${d.icone ? escapeHtml(d.icone) : '\u{1F4DA}'}
        </div>
        <div class="domaine-info">
          <div class="domaine-name">
            ${escapeHtml(d.nom)}
            <span class="badge-actif-indicator${d.actif ? '' : ' off'}"></span>
          </div>
          <div class="domaine-meta">
            <span class="meta-item">\u{1F4C2} ${sdCount} sous-domaine${sdCount > 1 ? 's' : ''}</span>
            <span class="meta-item">\u{1F3F7}\u{FE0F} ${tCount} th\u{00E9}matique${tCount > 1 ? 's' : ''}</span>
            <span class="meta-item">\u{1F468}\u{200D}\u{1F3EB} ${d.nb_formateurs} formateur${d.nb_formateurs > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="domaine-actions" onclick="event.stopPropagation()">
          <button class="toggle-btn${d.actif ? ' active' : ''}" onclick="toggleActif('domaine','${escapeHtml(d.id)}')" title="Activer/D\u{00E9}sactiver"></button>
          <button class="btn-inline-edit" onclick="editItem('domaine','${escapeHtml(d.id)}','${escapeHtml(d.nom)}')" title="Modifier">\u{270F}\u{FE0F}</button>
          <button class="btn-inline-add" onclick="openAddModal('sous-domaine','${escapeHtml(d.id)}','${escapeHtml(d.nom)}')" title="Ajouter">+ S-D</button>
        </div>
        <span class="chevron">\u{25B6}</span>
      </div>
      <div class="domaine-body">
        <div class="domaine-body-inner">
          ${sousDomainesHTML || '<div style="text-align:center;padding:20px;color:var(--gray-400);font-size:13px">Aucun sous-domaine</div>'}
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderCatalogue(env: Env, userName?: string): Promise<string> {
  const data = await getCatalogueTree(env);
  const { tree, stats } = data;

  let domainesHTML = '';
  if (tree.length === 0) {
    domainesHTML = `
      <div class="catalogue-empty">
        <span class="empty-icon">\u{1F4DA}</span>
        <div style="font-size:18px;font-weight:700;color:var(--gray-700);margin-bottom:6px">Catalogue vide</div>
        <div style="font-size:14px;color:var(--gray-500);margin-bottom:20px">Commencez par ajouter un domaine d'enseignement</div>
        <button class="btn btn-success" onclick="openAddModal('domaine',null,null)">\u{2795} Ajouter un domaine</button>
      </div>
    `;
  } else {
    for (let i = 0; i < tree.length; i++) {
      domainesHTML += renderDomaineCard(tree[i], i);
    }
  }

  const content = `
    <div class="page-header-accent"></div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>
          <span class="page-icon">\u{1F4DA}</span>
          Catalogue des th\u{00E9}matiques
        </h1>
        <div class="page-subtitle">G\u{00E9}rez l'arborescence domaines, sous-domaines et th\u{00E9}matiques de cours</div>
      </div>
      <div class="btn-group">
        <button class="btn btn-success" onclick="openAddModal('domaine',null,null)">
          \u{2795} Ajouter un domaine
        </button>
        <button class="btn btn-outline btn-sm" onclick="expandAll()">
          \u{1F504} Tout d\u{00E9}plier
        </button>
      </div>
    </div>

    <!-- Stats mini -->
    <div class="stats-mini">
      <div class="mini-badge purple">
        <span>\u{1F4DA}</span>
        <span class="mini-count">${stats.nb_domaines}</span>
        <span>Domaines</span>
      </div>
      <div class="mini-badge blue">
        <span>\u{1F4C2}</span>
        <span class="mini-count">${stats.nb_sous_domaines}</span>
        <span>Sous-domaines</span>
      </div>
      <div class="mini-badge teal">
        <span>\u{1F3F7}\u{FE0F}</span>
        <span class="mini-count">${stats.nb_thematiques}</span>
        <span>Th\u{00E9}matiques</span>
      </div>
      <div class="mini-badge green">
        <span>\u{1F468}\u{200D}\u{1F3EB}</span>
        <span class="mini-count">${stats.nb_formateurs}</span>
        <span>Formateurs</span>
      </div>
    </div>

    <!-- Search -->
    <div class="catalogue-search">
      <input type="text" class="search-input" id="catalogue-search"
             placeholder="Rechercher une th\u{00E9}matique, sous-domaine ou domaine\u{2026}"
             oninput="filterCatalogue(this.value)">
    </div>

    <!-- Domaines tree -->
    <div id="domaines-tree">
      ${domainesHTML}
    </div>

    <!-- Add/Edit Modal -->
    <div id="catalogue-modal" class="modal-backdrop" onclick="if(event.target===this)closeModal()">
      <div class="modal-content">
        <h3 class="modal-title" id="modal-title">\u{2795} Ajouter</h3>
        <form id="catalogue-form" onsubmit="submitCatalogueForm(event)">
          <input type="hidden" id="modal-type" value="">
          <input type="hidden" id="modal-parent-id" value="">
          <input type="hidden" id="modal-edit-id" value="">
          <div class="form-group">
            <label class="form-label">Nom <span class="required">*</span></label>
            <input type="text" class="form-input" id="modal-nom" required placeholder="Nom...">
          </div>
          <div class="form-group" id="modal-icone-group">
            <label class="form-label">Ic\u{00F4}ne (emoji)</label>
            <input type="text" class="form-input" id="modal-icone" placeholder="\u{1F4DA}" maxlength="4">
            <div class="form-hint">Collez un emoji ou laissez vide pour l'ic\u{00F4}ne par d\u{00E9}faut</div>
          </div>
          <div class="form-group" id="modal-description-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="modal-description" placeholder="Description optionnelle..." rows="2"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" onclick="closeModal()">Annuler</button>
            <button type="submit" class="btn btn-success" id="modal-submit-btn">\u{2705} Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <script>
      // ---- Accordion ----
      function toggleDomaine(header) {
        var card = header.closest('.domaine-card');
        card.classList.toggle('open');
      }

      function expandAll() {
        document.querySelectorAll('.domaine-card').forEach(function(card) {
          card.classList.add('open');
        });
      }

      // ---- Search / filter ----
      function filterCatalogue(query) {
        query = query.toLowerCase().trim();
        var cards = document.querySelectorAll('.domaine-card');

        if (!query) {
          cards.forEach(function(card) {
            card.style.display = '';
            card.querySelectorAll('.sous-domaine-section').forEach(function(sd) { sd.style.display = ''; });
            card.querySelectorAll('.thematique-tag').forEach(function(t) { t.style.display = ''; });
          });
          return;
        }

        cards.forEach(function(card) {
          var domaineName = card.getAttribute('data-domaine-name') || '';
          var domaineMatch = domaineName.includes(query);
          var hasVisibleChild = false;

          card.querySelectorAll('.sous-domaine-section').forEach(function(sd) {
            var sdName = sd.getAttribute('data-sd-name') || '';
            var sdMatch = sdName.includes(query);
            var hasVisibleThematique = false;

            sd.querySelectorAll('.thematique-tag').forEach(function(t) {
              var tName = t.getAttribute('data-thematique-name') || '';
              if (tName.includes(query) || sdMatch || domaineMatch) {
                t.style.display = '';
                hasVisibleThematique = true;
              } else {
                t.style.display = 'none';
              }
            });

            if (sdMatch || hasVisibleThematique || domaineMatch) {
              sd.style.display = '';
              hasVisibleChild = true;
            } else {
              sd.style.display = 'none';
            }
          });

          if (domaineMatch || hasVisibleChild) {
            card.style.display = '';
            card.classList.add('open');
          } else {
            card.style.display = 'none';
          }
        });
      }

      // ---- Toggle actif ----
      async function toggleActif(type, id) {
        try {
          var res = await fetch('/api/catalogue/toggle/' + type + '/' + id, { method: 'POST' });
          if (res.ok) {
            window.location.reload();
          } else {
            var data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
          }
        } catch (e) {
          alert('Erreur de connexion');
        }
      }

      // ---- Modal ----
      function openAddModal(type, parentId, parentName) {
        document.getElementById('modal-type').value = type;
        document.getElementById('modal-parent-id').value = parentId || '';
        document.getElementById('modal-edit-id').value = '';
        document.getElementById('modal-nom').value = '';
        document.getElementById('modal-icone').value = '';
        document.getElementById('modal-description').value = '';

        var labels = {
          'domaine': '\\u2795 Nouveau domaine',
          'sous-domaine': '\\u2795 Nouveau sous-domaine' + (parentName ? ' dans ' + parentName : ''),
          'thematique': '\\u2795 Nouvelle th\\u00e9matique' + (parentName ? ' dans ' + parentName : '')
        };
        document.getElementById('modal-title').textContent = labels[type] || '\\u2795 Ajouter';

        var iconeGroup = document.getElementById('modal-icone-group');
        iconeGroup.style.display = (type === 'thematique') ? 'none' : '';

        document.getElementById('catalogue-modal').classList.add('show');
        document.getElementById('modal-nom').focus();
      }

      function editItem(type, id, currentName) {
        document.getElementById('modal-type').value = type;
        document.getElementById('modal-parent-id').value = '';
        document.getElementById('modal-edit-id').value = id;
        document.getElementById('modal-nom').value = currentName;
        document.getElementById('modal-icone').value = '';
        document.getElementById('modal-description').value = '';
        document.getElementById('modal-title').textContent = '\\u270f\\ufe0f Modifier ' + currentName;

        document.getElementById('catalogue-modal').classList.add('show');
        document.getElementById('modal-nom').focus();
      }

      function closeModal() {
        document.getElementById('catalogue-modal').classList.remove('show');
      }

      async function submitCatalogueForm(e) {
        e.preventDefault();
        var type = document.getElementById('modal-type').value;
        var parentId = document.getElementById('modal-parent-id').value;
        var editId = document.getElementById('modal-edit-id').value;
        var nom = document.getElementById('modal-nom').value.trim();
        var icone = document.getElementById('modal-icone').value.trim();
        var description = document.getElementById('modal-description').value.trim();

        if (!nom) { alert('Le nom est requis'); return; }

        var btn = document.getElementById('modal-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span>';

        try {
          var url, method, body;

          if (editId) {
            // Edit mode
            var tablePath = type === 'domaine' ? 'domaines' : (type === 'sous-domaine' ? 'sous-domaines' : 'thematiques');
            url = '/api/catalogue/' + tablePath + '/' + editId;
            method = 'PUT';
            body = { nom: nom };
            if (icone) body.icone = icone;
            if (description) body.description = description;
          } else {
            // Create mode
            if (type === 'domaine') {
              url = '/api/catalogue/domaines';
              body = { nom: nom, icone: icone || undefined, description: description || undefined };
            } else if (type === 'sous-domaine') {
              url = '/api/catalogue/sous-domaines';
              body = { domaine_id: parentId, nom: nom, icone: icone || undefined, description: description || undefined };
            } else {
              url = '/api/catalogue/thematiques';
              body = { sous_domaine_id: parentId, nom: nom, description: description || undefined };
            }
            method = 'POST';
          }

          var res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (res.ok) {
            window.location.reload();
          } else {
            var data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
            btn.disabled = false;
            btn.innerHTML = '\\u2705 Enregistrer';
          }
        } catch (err) {
          alert('Erreur de connexion');
          btn.disabled = false;
          btn.innerHTML = '\\u2705 Enregistrer';
        }
      }
    </script>
  `;

  return htmlPage({
    title: 'Catalogue',
    activePage: 'catalogue',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
