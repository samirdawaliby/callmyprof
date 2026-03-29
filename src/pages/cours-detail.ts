/**
 * Soutien Scolaire Caplogy - Page Admin: Detail d'un cours
 * Fiche complete : infos, eleves inscrits, presences, notes
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { formatDuree } from '../../shared/utils';
import { getCoursDetail } from '../api/cours';

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
    padding: 6px 14px;
    border-radius: 8px;
    transition: all var(--transition-fast);
    animation: slideInLeft 0.3s ease both;
  }
  .back-link:hover {
    color: var(--primary);
    background: var(--white);
    box-shadow: var(--shadow-sm);
    transform: translateX(-4px);
  }

  /* ---- Header card ---- */
  .cours-header {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 24px 28px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    margin-bottom: 24px;
    animation: slideUp 0.5s ease both;
    position: relative;
    overflow: hidden;
  }
  .cours-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--primary));
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }
  .cours-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }
  .cours-header-info h1 {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cours-header-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 14px;
    color: var(--gray-600);
  }
  .cours-header-meta .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cours-header-meta .meta-icon {
    font-size: 16px;
    animation: float 3s ease-in-out infinite;
  }
  .cours-header-badges {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* ---- Info grid ---- */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    animation: slideUp 0.5s ease both;
    animation-delay: 0.1s;
  }
  .info-card {
    background: var(--white);
    border-radius: var(--radius-sm);
    padding: 16px 20px;
    border: 1px solid var(--gray-100);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }
  .info-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .info-card .info-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-400);
    margin-bottom: 4px;
  }
  .info-card .info-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
  }
  .info-card .info-icon {
    font-size: 18px;
    margin-bottom: 6px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }

  /* ---- Eleves section ---- */
  .eleves-section {
    animation: slideUp 0.5s ease both;
    animation-delay: 0.15s;
  }
  .presence-check {
    width: 20px;
    height: 20px;
    accent-color: var(--success);
    cursor: pointer;
    transition: transform var(--transition-fast);
  }
  .presence-check:hover {
    transform: scale(1.2);
  }
  .progression-input {
    width: 100%;
    min-width: 150px;
    padding: 6px 10px;
    border: 1.5px solid var(--gray-200);
    border-radius: 6px;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    transition: all var(--transition-fast);
    outline: none;
  }
  .progression-input:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(109,203,221,0.15);
  }
  .profil-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  /* ---- Notes formateur ---- */
  .notes-section {
    animation: slideUp 0.5s ease both;
    animation-delay: 0.2s;
  }
  .notes-textarea {
    width: 100%;
    min-height: 120px;
    padding: 14px 16px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    resize: vertical;
    transition: all var(--transition-fast);
    outline: none;
  }
  .notes-textarea:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(109,203,221,0.15);
  }

  /* ---- Actions footer ---- */
  .actions-footer {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 2px solid var(--gray-100);
    animation: slideUp 0.5s ease both;
    animation-delay: 0.25s;
  }

  /* ---- Formateur card inline ---- */
  .formateur-inline {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .formateur-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--secondary-light), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: var(--primary-dark);
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }
  .formateur-avatar:hover { transform: scale(1.1); }
  .formateur-avatar img {
    width: 100%; height: 100%;
    border-radius: 50%; object-fit: cover;
  }

  @media (max-width: 768px) {
    .cours-header-row { flex-direction: column; }
    .info-grid { grid-template-columns: 1fr 1fr; }
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
  return `<span class="badge badge-${statut} badge-dot">${escapeHtml(labels[statut] || statut)}</span>`;
}

function typeBadge(type: string): string {
  return `<span class="badge badge-${type}">${type === 'individuel' ? 'Individuel' : 'Collectif'}</span>`;
}

function profilBadge(profil: string): string {
  if (profil === 'standard') return '';
  return `<span class="badge badge-${profil}">${profil.toUpperCase()}</span>`;
}

function formateurAvatar(photoUrl: string | null, prenom: string, nom: string): string {
  if (photoUrl) {
    return `<div class="formateur-avatar"><img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(prenom)}"></div>`;
  }
  const initials = ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
  return `<div class="formateur-avatar">${escapeHtml(initials)}</div>`;
}

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderCoursDetail(env: Env, coursId: string, userName?: string): Promise<string> {
  const data = await getCoursDetail(env, coursId);

  if (!data) {
    return htmlPage({
      title: 'Cours introuvable',
      activePage: 'cours',
      content: `
        <a href="/cours" class="back-link">&larr; Retour aux cours</a>
        <div class="empty-state" style="padding:60px 24px">
          <div class="empty-icon" style="font-size:64px;animation:float 3s ease-in-out infinite">\ud83d\udd0d</div>
          <div class="empty-title">Cours introuvable</div>
          <div class="empty-text">Ce cours n'existe pas ou a \u00e9t\u00e9 supprim\u00e9.</div>
        </div>
      `,
      userName,
    });
  }

  const { cours, formateur, thematique, eleves } = data;
  const isTermine = cours.statut === 'termine';
  const isAnnule = cours.statut === 'annule';
  const canTerminer = !isTermine && !isAnnule;

  // Build eleves rows
  let elevesRows = '';
  if (eleves.length === 0) {
    elevesRows = `
      <tr>
        <td colspan="6">
          <div class="empty-state" style="padding:30px">
            <div class="empty-icon" style="font-size:36px">\ud83d\udc65</div>
            <div class="empty-title" style="font-size:14px">Aucun \u00e9l\u00e8ve inscrit</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    for (const el of eleves) {
      elevesRows += `
        <tr>
          <td>
            <div class="cell-main">${escapeHtml(el.eleve_prenom)} ${escapeHtml(el.eleve_nom || '')}</div>
            <div class="cell-sub">${escapeHtml(el.niveau || '-')} ${profilBadge(el.profil_specifique)}</div>
          </td>
          <td>
            <div class="cell-sub">${escapeHtml(el.parent_prenom || '')} ${escapeHtml(el.parent_nom || '')}</div>
          </td>
          <td>
            <div class="cell-sub">${escapeHtml(el.package_nom || 'Aucun')}</div>
          </td>
          <td class="text-center">
            <input type="checkbox" class="presence-check"
              data-eleve-id="${escapeHtml(el.eleve_id)}"
              ${el.present ? 'checked' : ''}
              ${isTermine ? 'disabled' : ''}>
          </td>
          <td>
            <input type="text" class="progression-input"
              data-eleve-id="${escapeHtml(el.eleve_id)}"
              placeholder="Notes de progression..."
              value="${escapeHtml(el.notes_progression || '')}"
              ${isTermine ? 'disabled' : ''}>
          </td>
        </tr>
      `;
    }
  }

  const content = `
    <a href="/cours" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      Retour aux cours
    </a>

    <!-- Header -->
    <div class="cours-header">
      <div class="cours-header-row">
        <div class="cours-header-info">
          <h1>
            <span>${escapeHtml(thematique.domaine_icone || '\ud83d\udcda')}</span>
            ${escapeHtml(cours.titre || thematique.nom)}
          </h1>
          <div class="cours-header-meta">
            <div class="meta-item">
              <span class="meta-icon">\ud83d\udcc5</span>
              ${formatDateFr(cours.date_cours)} \u00e0 ${escapeHtml(cours.heure_debut)}
            </div>
            <div class="meta-item">
              <span class="meta-icon">\u23f1\ufe0f</span>
              ${formatDuree(cours.duree_minutes)}
            </div>
            <div class="meta-item formateur-inline">
              ${formateurAvatar(formateur.photo_url, formateur.prenom, formateur.nom)}
              <div>
                <div style="font-weight:600;color:var(--gray-900)">${escapeHtml(formateur.prenom)} ${escapeHtml(formateur.nom)}</div>
                <div style="font-size:12px;color:var(--gray-400)">${escapeHtml(formateur.ville)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="cours-header-badges">
          ${typeBadge(cours.type_cours)}
          ${statutBadge(cours.statut)}
        </div>
      </div>
    </div>

    <!-- Info grid -->
    <div class="info-grid">
      <div class="info-card">
        <span class="info-icon">\u23f1\ufe0f</span>
        <div class="info-label">Dur\u00e9e</div>
        <div class="info-value">${formatDuree(cours.duree_minutes)}</div>
      </div>
      <div class="info-card">
        <span class="info-icon">\ud83d\udccd</span>
        <div class="info-label">Lieu</div>
        <div class="info-value">${escapeHtml(cours.lieu || 'Non pr\u00e9cis\u00e9')}</div>
      </div>
      <div class="info-card">
        <span class="info-icon">\ud83d\udc65</span>
        <div class="info-label">Max \u00e9l\u00e8ves</div>
        <div class="info-value">${cours.max_eleves}</div>
      </div>
      <div class="info-card">
        <span class="info-icon">\ud83d\udcdd</span>
        <div class="info-label">Description</div>
        <div class="info-value" style="font-size:13px;font-weight:500">${escapeHtml(cours.description || 'Aucune description')}</div>
      </div>
    </div>

    <!-- Eleves inscrits -->
    <div class="eleves-section">
      <div class="content-card">
        <div class="content-card-header">
          <h3>\ud83c\udf93 \u00c9l\u00e8ves inscrits (${eleves.length})</h3>
        </div>
        <div class="content-card-body" style="padding:0">
          <div class="table-wrapper" style="border:none;box-shadow:none;border-radius:0">
            <table>
              <thead>
                <tr>
                  <th>\u00c9l\u00e8ve</th>
                  <th>Parent</th>
                  <th>Package</th>
                  <th class="text-center">Pr\u00e9sent</th>
                  <th>Notes progression</th>
                </tr>
              </thead>
              <tbody>
                ${elevesRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes formateur -->
    <div class="notes-section" style="margin-top:24px">
      <div class="content-card">
        <div class="content-card-header">
          <h3>\ud83d\udcdd Notes du formateur</h3>
        </div>
        <div class="content-card-body">
          <textarea class="notes-textarea" id="notes-formateur"
            placeholder="Notes sur la s\u00e9ance, observations, recommandations..."
            ${isTermine ? 'disabled' : ''}>${escapeHtml(cours.notes_formateur || '')}</textarea>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions-footer">
      ${cours.statut === 'planifie' ? `
        <button class="btn btn-primary" onclick="changeStatut('confirme')">
          \u2705 Confirmer le cours
        </button>
      ` : ''}
      ${canTerminer ? `
        <button class="btn btn-success" onclick="terminerCours()">
          \u2705 Terminer & marquer pr\u00e9sences
        </button>
      ` : ''}
      ${canTerminer ? `
        <button class="btn btn-danger" onclick="changeStatut('annule')">
          \u274c Annuler le cours
        </button>
      ` : ''}
      ${isTermine ? `
        <span class="badge badge-termine badge-dot" style="padding:8px 16px;font-size:14px">Cours termin\u00e9</span>
      ` : ''}
      ${isAnnule ? `
        <span class="badge badge-annule badge-dot" style="padding:8px 16px;font-size:14px">Cours annul\u00e9</span>
      ` : ''}
    </div>

    <script>
      async function changeStatut(statut) {
        var labels = { confirme: 'confirmer', annule: 'annuler' };
        if (!confirm('Voulez-vous vraiment ' + (labels[statut] || statut) + ' ce cours ?')) return;
        try {
          var res = await fetch('/api/cours/${escapeHtml(coursId)}/statut', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut: statut })
          });
          if (res.ok) window.location.reload();
          else {
            var data = await res.json();
            alert('Erreur: ' + (data.error || 'Erreur inconnue'));
          }
        } catch(e) { alert('Erreur de connexion'); }
      }

      async function terminerCours() {
        if (!confirm('Terminer ce cours ? Les heures seront d\u00e9bit\u00e9es des packages pour les \u00e9l\u00e8ves pr\u00e9sents.')) return;

        var presences = [];
        document.querySelectorAll('.presence-check').forEach(function(cb) {
          var eleveId = cb.getAttribute('data-eleve-id');
          var present = cb.checked;
          var input = document.querySelector('.progression-input[data-eleve-id="' + eleveId + '"]');
          var notes = input ? input.value : '';
          presences.push({ eleve_id: eleveId, present: present, notes_progression: notes });
        });

        var notesFormateur = document.getElementById('notes-formateur').value;

        try {
          var res = await fetch('/api/cours/${escapeHtml(coursId)}/terminer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes_formateur: notesFormateur, presences: presences })
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
    title: `Cours - ${thematique.nom}`,
    activePage: 'cours',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
