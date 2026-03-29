/**
 * Soutien Scolaire Caplogy - Page Admin: Formulaire de creation de cours
 * Selects dynamiques, cascade domaine > sous-domaine > thematique
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml } from '../../shared/html-utils';
import { getCoursFormData } from '../api/cours';

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

  /* ---- Form card ---- */
  .form-card {
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    overflow: hidden;
    animation: slideUp 0.5s ease both;
  }
  .form-card-header {
    padding: 20px 28px;
    border-bottom: 1px solid var(--gray-100);
    background: linear-gradient(135deg, var(--gray-50), var(--white));
  }
  .form-card-header h1 {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .form-card-body {
    padding: 28px;
  }

  /* ---- Type radio cards ---- */
  .type-radio-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .type-radio-card {
    position: relative;
    padding: 16px 20px;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
    animation: slideUp 0.4s ease both;
  }
  .type-radio-card:nth-child(1) { animation-delay: 0.1s; }
  .type-radio-card:nth-child(2) { animation-delay: 0.15s; }
  .type-radio-card:hover {
    border-color: var(--secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
  .type-radio-card.selected {
    border-color: var(--primary);
    background: rgba(13, 56, 101, 0.03);
    box-shadow: 0 0 0 3px rgba(13, 56, 101, 0.1);
  }
  .type-radio-card input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .type-radio-card .type-icon {
    font-size: 32px;
    margin-bottom: 8px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  .type-radio-card .type-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-900);
  }
  .type-radio-card .type-desc {
    font-size: 12px;
    color: var(--gray-500);
    margin-top: 4px;
  }

  /* ---- Duration select cards ---- */
  .duration-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .duration-chip {
    padding: 8px 16px;
    border: 2px solid var(--gray-200);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    background: var(--white);
    color: var(--gray-700);
  }
  .duration-chip:hover {
    border-color: var(--secondary);
    transform: translateY(-1px);
  }
  .duration-chip.selected {
    border-color: var(--primary);
    background: var(--primary);
    color: var(--white);
  }
  .duration-chip input[type="radio"] {
    display: none;
  }

  /* ---- Eleve select grid ---- */
  .eleves-select-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px;
  }
  .eleve-card-select {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    background: var(--white);
  }
  .eleve-card-select:hover {
    border-color: var(--secondary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  .eleve-card-select.selected {
    border-color: var(--primary);
    background: rgba(13, 56, 101, 0.03);
  }
  .eleve-card-select .eleve-check {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    accent-color: var(--primary);
  }
  .eleve-card-select .eleve-info .eleve-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--gray-900);
  }
  .eleve-card-select .eleve-info .eleve-meta {
    font-size: 11px;
    color: var(--gray-400);
  }
  .eleve-card-select .pkg-status {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
  }
  .pkg-status.has-pkg {
    background: var(--success-light);
    color: #065f46;
  }
  .pkg-status.no-pkg {
    background: var(--warning-light);
    color: #92400e;
  }

  /* ---- Cascade selects ---- */
  .cascade-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 768px) {
    .cascade-row { grid-template-columns: 1fr; }
    .type-radio-group { grid-template-columns: 1fr; }
  }

  /* ---- Submit area ---- */
  .submit-area {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 2px solid var(--gray-100);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    animation: slideUp 0.4s ease both;
    animation-delay: 0.3s;
  }
  .btn-submit-lg {
    padding: 14px 32px;
    font-size: 15px;
    border-radius: var(--radius-sm);
    font-weight: 700;
    position: relative;
    overflow: hidden;
  }
  .btn-submit-lg::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  .btn-submit-lg:hover::after {
    left: 100%;
  }
`;

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderCoursForm(env: Env, userName?: string): Promise<string> {
  const data = await getCoursFormData(env);
  const { formateurs, domaines, sous_domaines, thematiques, eleves } = data;

  // Build JSON for cascade selects
  const domainesJson = JSON.stringify(domaines);
  const sousDomainesJson = JSON.stringify(sous_domaines);
  const thematiquesJson = JSON.stringify(thematiques);

  // Formateur options
  const formateurOptions = formateurs.map((f: any) =>
    `<option value="${escapeHtml(f.id)}">${escapeHtml(f.prenom)} ${escapeHtml(f.nom)} - ${escapeHtml(f.ville)}</option>`
  ).join('');

  // Eleve cards
  const eleveCards = eleves.map((e: any) => `
    <label class="eleve-card-select" data-eleve-id="${escapeHtml(e.id)}">
      <input type="checkbox" class="eleve-check" name="eleve_ids" value="${escapeHtml(e.id)}">
      <div class="eleve-info">
        <div class="eleve-name">${escapeHtml(e.prenom)} ${escapeHtml(e.nom || '')}</div>
        <div class="eleve-meta">${escapeHtml(e.parent_prenom || '')} ${escapeHtml(e.parent_nom || '')} ${e.niveau ? '- ' + escapeHtml(e.niveau) : ''}</div>
      </div>
      <span class="pkg-status ${e.packages_actifs > 0 ? 'has-pkg' : 'no-pkg'}">
        ${e.packages_actifs > 0 ? e.packages_actifs + ' pkg' : 'Pas de pkg'}
      </span>
    </label>
  `).join('');

  const content = `
    <a href="/cours" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      Retour aux cours
    </a>

    <div class="form-card">
      <div class="form-card-header">
        <h1>
          <span style="animation:float 3s ease-in-out infinite">\ud83d\udcc5</span>
          Planifier un nouveau cours
        </h1>
      </div>
      <div class="form-card-body">
        <form id="cours-form" onsubmit="event.preventDefault();submitCours()">

          <!-- Formateur -->
          <div class="form-section-title">\ud83d\udc68\u200d\ud83c\udfeb Formateur</div>
          <div class="form-group">
            <label class="form-label">Formateur <span class="required">*</span></label>
            <select class="form-select" name="formateur_id" id="formateur-select" required>
              <option value="">-- S\u00e9lectionner un formateur --</option>
              ${formateurOptions}
            </select>
          </div>

          <!-- Thematique cascade -->
          <div class="form-section-title">\ud83d\udcda Th\u00e9matique</div>
          <div class="cascade-row">
            <div class="form-group">
              <label class="form-label">Domaine <span class="required">*</span></label>
              <select class="form-select" id="domaine-select" onchange="updateSousDomaines()">
                <option value="">-- Domaine --</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sous-domaine</label>
              <select class="form-select" id="sous-domaine-select" onchange="updateThematiques()" disabled>
                <option value="">-- Sous-domaine --</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Th\u00e9matique <span class="required">*</span></label>
              <select class="form-select" id="thematique-select" name="thematique_id" required disabled>
                <option value="">-- Th\u00e9matique --</option>
              </select>
            </div>
          </div>

          <!-- Type cours -->
          <div class="form-section-title">\ud83c\udfaf Type de cours</div>
          <div class="form-group">
            <div class="type-radio-group">
              <label class="type-radio-card selected" onclick="selectType('individuel')">
                <input type="radio" name="type_cours" value="individuel" checked>
                <span class="type-icon">\ud83d\udc64</span>
                <div class="type-label">Individuel</div>
                <div class="type-desc">1 \u00e9l\u00e8ve, cours personnalis\u00e9</div>
              </label>
              <label class="type-radio-card" onclick="selectType('collectif')">
                <input type="radio" name="type_cours" value="collectif">
                <span class="type-icon">\ud83d\udc65</span>
                <div class="type-label">Collectif</div>
                <div class="type-desc">Jusqu'\u00e0 6 \u00e9l\u00e8ves</div>
              </label>
            </div>
          </div>

          <!-- Date & Heure -->
          <div class="form-section-title">\ud83d\udcc6 Date & Horaire</div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date <span class="required">*</span></label>
              <input type="date" class="form-input" name="date_cours" required>
            </div>
            <div class="form-group">
              <label class="form-label">Heure de d\u00e9but <span class="required">*</span></label>
              <input type="time" class="form-input" name="heure_debut" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Dur\u00e9e</label>
            <div class="duration-grid">
              <label class="duration-chip" onclick="selectDuration(30)">
                <input type="radio" name="duree_minutes" value="30"> 30min
              </label>
              <label class="duration-chip" onclick="selectDuration(45)">
                <input type="radio" name="duree_minutes" value="45"> 45min
              </label>
              <label class="duration-chip selected" onclick="selectDuration(60)">
                <input type="radio" name="duree_minutes" value="60" checked> 1h
              </label>
              <label class="duration-chip" onclick="selectDuration(90)">
                <input type="radio" name="duree_minutes" value="90"> 1h30
              </label>
              <label class="duration-chip" onclick="selectDuration(120)">
                <input type="radio" name="duree_minutes" value="120"> 2h
              </label>
            </div>
          </div>

          <!-- Lieu -->
          <div class="form-group">
            <label class="form-label">Lieu</label>
            <input type="text" class="form-input" name="lieu" placeholder="Adresse, salle, visio...">
          </div>

          <!-- Eleves -->
          <div class="form-section-title">\ud83c\udf93 \u00c9l\u00e8ves</div>
          <div class="form-group">
            <label class="form-label">S\u00e9lectionner les \u00e9l\u00e8ves</label>
            <div class="form-hint" id="eleves-hint">Mode individuel : s\u00e9lectionnez 1 \u00e9l\u00e8ve</div>
            <div class="eleves-select-grid" id="eleves-grid">
              ${eleveCards}
            </div>
          </div>

          <!-- Submit -->
          <div class="submit-area">
            <a href="/cours" class="btn btn-outline">Annuler</a>
            <button type="submit" class="btn btn-primary btn-submit-lg" id="submit-btn">
              \ud83d\udcc5 Planifier le cours
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      // ---- Cascade data ----
      var domainesData = ${domainesJson};
      var sousDomainesData = ${sousDomainesJson};
      var thematiquesData = ${thematiquesJson};

      // Populate domaines
      (function() {
        var sel = document.getElementById('domaine-select');
        domainesData.forEach(function(d) {
          var opt = document.createElement('option');
          opt.value = d.id;
          opt.textContent = (d.icone || '') + ' ' + d.nom;
          sel.appendChild(opt);
        });
      })();

      function updateSousDomaines() {
        var domaineId = document.getElementById('domaine-select').value;
        var sdSel = document.getElementById('sous-domaine-select');
        var tSel = document.getElementById('thematique-select');
        sdSel.innerHTML = '<option value="">-- Sous-domaine --</option>';
        tSel.innerHTML = '<option value="">-- Th\\u00e9matique --</option>';
        sdSel.disabled = !domaineId;
        tSel.disabled = true;
        if (!domaineId) return;
        sousDomainesData.filter(function(sd) { return sd.domaine_id === domaineId; }).forEach(function(sd) {
          var opt = document.createElement('option');
          opt.value = sd.id;
          opt.textContent = sd.nom;
          sdSel.appendChild(opt);
        });
      }

      function updateThematiques() {
        var sdId = document.getElementById('sous-domaine-select').value;
        var tSel = document.getElementById('thematique-select');
        tSel.innerHTML = '<option value="">-- Th\\u00e9matique --</option>';
        tSel.disabled = !sdId;
        if (!sdId) return;
        thematiquesData.filter(function(t) { return t.sous_domaine_id === sdId; }).forEach(function(t) {
          var opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = t.nom;
          tSel.appendChild(opt);
        });
      }

      // ---- Type selection ----
      var currentType = 'individuel';
      function selectType(type) {
        currentType = type;
        document.querySelectorAll('.type-radio-card').forEach(function(c) { c.classList.remove('selected'); });
        var radio = document.querySelector('input[name="type_cours"][value="' + type + '"]');
        if (radio) {
          radio.checked = true;
          radio.closest('.type-radio-card').classList.add('selected');
        }
        var hint = document.getElementById('eleves-hint');
        hint.textContent = type === 'individuel'
          ? 'Mode individuel : s\\u00e9lectionnez 1 \\u00e9l\\u00e8ve'
          : 'Mode collectif : s\\u00e9lectionnez jusqu\\'\\u00e0 6 \\u00e9l\\u00e8ves';
      }

      // ---- Duration selection ----
      function selectDuration(val) {
        document.querySelectorAll('.duration-chip').forEach(function(c) { c.classList.remove('selected'); });
        var radio = document.querySelector('input[name="duree_minutes"][value="' + val + '"]');
        if (radio) {
          radio.checked = true;
          radio.closest('.duration-chip').classList.add('selected');
        }
      }

      // ---- Eleve selection ----
      document.querySelectorAll('.eleve-card-select').forEach(function(card) {
        card.addEventListener('click', function(e) {
          if (e.target.tagName === 'INPUT') return;
          var cb = card.querySelector('.eleve-check');
          if (currentType === 'individuel') {
            document.querySelectorAll('.eleve-check').forEach(function(c) {
              c.checked = false;
              c.closest('.eleve-card-select').classList.remove('selected');
            });
            cb.checked = true;
            card.classList.add('selected');
          } else {
            cb.checked = !cb.checked;
            card.classList.toggle('selected', cb.checked);
          }
        });
      });

      // ---- Submit ----
      async function submitCours() {
        var form = document.getElementById('cours-form');
        var btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Cr\\u00e9ation...';

        var eleve_ids = [];
        document.querySelectorAll('.eleve-check:checked').forEach(function(cb) {
          eleve_ids.push(cb.value);
        });

        var data = {
          formateur_id: form.querySelector('[name="formateur_id"]').value,
          thematique_id: form.querySelector('[name="thematique_id"]').value,
          type_cours: form.querySelector('[name="type_cours"]:checked').value,
          date_cours: form.querySelector('[name="date_cours"]').value,
          heure_debut: form.querySelector('[name="heure_debut"]').value,
          duree_minutes: parseInt(form.querySelector('[name="duree_minutes"]:checked').value),
          lieu: form.querySelector('[name="lieu"]').value,
          eleve_ids: eleve_ids
        };

        try {
          var res = await fetch('/api/cours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          var result = await res.json();
          if (res.ok) {
            window.location.href = '/cours/' + result.id;
          } else {
            alert('Erreur: ' + (result.error || 'Erreur inconnue'));
            btn.disabled = false;
            btn.innerHTML = '\\ud83d\\udcc5 Planifier le cours';
          }
        } catch(e) {
          alert('Erreur de connexion');
          btn.disabled = false;
          btn.innerHTML = '\\ud83d\\udcc5 Planifier le cours';
        }
      }
    </script>
  `;

  return htmlPage({
    title: 'Planifier un cours',
    activePage: 'cours',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
