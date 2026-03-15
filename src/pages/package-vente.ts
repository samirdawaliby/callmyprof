/**
 * Soutien Scolaire Caplogy - Page Admin: Vente de package
 * Selection famille/eleve, type de package, thematiques, calcul prix
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml } from '../../shared/html-utils';
import { formatPrix } from '../../shared/pricing';
import { getPackageFormData } from '../api/packages';

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

  /* ---- Package selection cards ---- */
  .pkg-select-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
  }
  .pkg-select-card {
    position: relative;
    padding: 18px 20px;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: center;
    background: var(--white);
    animation: slideUp 0.5s ease both;
  }
  .pkg-select-card:nth-child(1) { animation-delay: 0.05s; }
  .pkg-select-card:nth-child(2) { animation-delay: 0.1s; }
  .pkg-select-card:nth-child(3) { animation-delay: 0.15s; }
  .pkg-select-card:nth-child(4) { animation-delay: 0.2s; }
  .pkg-select-card:nth-child(5) { animation-delay: 0.25s; }
  .pkg-select-card:hover {
    border-color: var(--secondary);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  .pkg-select-card.selected {
    border-color: var(--primary);
    background: rgba(13, 56, 101, 0.03);
    box-shadow: 0 0 0 3px rgba(13, 56, 101, 0.1);
  }
  .pkg-select-card input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0; height: 0;
  }
  .pkg-select-card .pkg-icon {
    font-size: 28px;
    margin-bottom: 6px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  .pkg-select-card .pkg-name {
    font-size: 16px;
    font-weight: 800;
    color: var(--gray-900);
  }
  .pkg-select-card .pkg-hours {
    font-size: 13px;
    color: var(--gray-500);
    margin-top: 2px;
  }
  .pkg-select-card .pkg-price {
    font-size: 22px;
    font-weight: 800;
    color: var(--primary);
    margin-top: 8px;
    letter-spacing: -0.5px;
  }
  .pkg-select-card .pkg-rate {
    font-size: 12px;
    color: var(--gray-400);
  }
  .pkg-select-card .pkg-tag-pop {
    position: absolute;
    top: -8px; right: 12px;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--warning), #fbbf24);
    color: var(--gray-900);
    animation: pulse 2s ease-in-out infinite;
  }
  .pkg-credit-info {
    font-size: 11px;
    margin-top: 6px;
    padding: 3px 8px;
    border-radius: 8px;
    display: inline-block;
  }
  .pkg-credit-info.eligible {
    background: var(--success-light);
    color: #065f46;
  }
  .pkg-credit-info.not-eligible {
    background: var(--gray-100);
    color: var(--gray-500);
  }

  /* ---- Price calculation display ---- */
  .price-display {
    background: linear-gradient(135deg, var(--gray-50), var(--white));
    border: 2px solid var(--gray-100);
    border-radius: var(--radius-md);
    padding: 24px;
    margin-top: 20px;
    animation: slideUp 0.5s ease both;
    animation-delay: 0.2s;
    transition: all var(--transition-normal);
  }
  .price-display.active {
    border-color: var(--secondary);
    box-shadow: 0 0 20px rgba(109, 203, 221, 0.15);
  }
  .price-display h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-700);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .price-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }
  .price-row .price-label {
    font-size: 14px;
    color: var(--gray-600);
  }
  .price-row .price-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
  }
  .price-row.credit .price-label {
    color: var(--success);
  }
  .price-row.credit .price-value {
    color: var(--success);
  }
  .price-row.total {
    border-top: 2px solid var(--gray-200);
    padding-top: 14px;
    margin-top: 6px;
  }
  .price-row.total .price-label {
    font-size: 16px;
    font-weight: 800;
    color: var(--gray-900);
  }
  .price-row.total .price-value {
    font-size: 24px;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -0.5px;
    animation: bounceIn 0.5s ease both;
  }
  .price-row .price-value.animated {
    animation: bounceIn 0.4s ease both;
  }

  /* ---- Thematique checkboxes ---- */
  .thematique-tree {
    max-height: 300px;
    overflow-y: auto;
    padding: 4px;
  }
  .thematique-domain {
    margin-bottom: 12px;
  }
  .thematique-domain-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-800);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .thematique-sd {
    margin-left: 20px;
    margin-bottom: 6px;
  }
  .thematique-sd-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 4px;
  }
  .thematique-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: 10px;
  }
  .thematique-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border: 1.5px solid var(--gray-200);
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
    background: var(--white);
    color: var(--gray-700);
  }
  .thematique-chip:hover {
    border-color: var(--secondary);
    transform: translateY(-1px);
  }
  .thematique-chip.selected {
    border-color: var(--primary);
    background: rgba(13, 56, 101, 0.05);
    color: var(--primary);
    font-weight: 600;
  }
  .thematique-chip input[type="checkbox"] { display: none; }

  /* ---- Expiration auto ---- */
  .expiration-display {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    background: var(--blue-light);
    color: #1e40af;
    font-size: 13px;
    font-weight: 600;
    animation: bounceIn 0.5s ease both;
    animation-delay: 0.3s;
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

  @media (max-width: 768px) {
    .pkg-select-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .pkg-select-grid { grid-template-columns: 1fr; }
  }
`;

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderPackageVente(env: Env, userName?: string): Promise<string> {
  const data = await getPackageFormData(env);
  const { eleves, package_types, domaines, sous_domaines, thematiques } = data;

  // Build JSON for JS
  const pkgTypesJson = JSON.stringify(package_types);

  // Eleve options grouped by parent
  const elevesByParent = new Map<string, any[]>();
  for (const e of eleves as any[]) {
    const parentKey = e.parent_id || 'sans-parent';
    if (!elevesByParent.has(parentKey)) elevesByParent.set(parentKey, []);
    elevesByParent.get(parentKey)!.push(e);
  }

  let eleveOptions = '<option value="">-- S\u00e9lectionner un \u00e9l\u00e8ve --</option>';
  for (const [_parentId, els] of elevesByParent) {
    const parentName = els[0].parent_prenom && els[0].parent_nom
      ? `${els[0].parent_prenom} ${els[0].parent_nom}`
      : 'Sans parent';
    eleveOptions += `<optgroup label="Famille ${escapeHtml(parentName)}">`;
    for (const e of els) {
      eleveOptions += `<option value="${escapeHtml(e.id)}">${escapeHtml(e.prenom)} ${escapeHtml(e.nom || '')} ${e.niveau ? '(' + escapeHtml(e.niveau) + ')' : ''}</option>`;
    }
    eleveOptions += '</optgroup>';
  }

  // Package type cards
  const pkgCards = (package_types as any[]).map((pt: any) => {
    const isEligible = pt.eligible_credit_impot === 1;
    const tag = pt.nom === 'Confort' ? '<div class="pkg-tag-pop">Populaire</div>'
      : pt.nom === 'Intensif' ? '<div class="pkg-tag-pop">Meilleur prix</div>' : '';
    const icon = pt.type_cours === 'collectif' ? '\ud83d\udc65' : '\ud83d\udce6';

    return `
      <label class="pkg-select-card" data-pkg-id="${escapeHtml(pt.id)}" onclick="selectPackage('${escapeHtml(pt.id)}')">
        ${tag}
        <input type="radio" name="package_type_id" value="${escapeHtml(pt.id)}">
        <span class="pkg-icon">${icon}</span>
        <div class="pkg-name">${escapeHtml(pt.nom)}</div>
        <div class="pkg-hours">${pt.nb_heures}h - ${escapeHtml(pt.type_cours)}</div>
        <div class="pkg-price">${formatPrix(pt.prix)}</div>
        <div class="pkg-rate">${formatPrix(pt.prix_par_heure)}/h</div>
        <div class="pkg-credit-info ${isEligible ? 'eligible' : 'not-eligible'}">
          ${isEligible ? '\u2705 Cr\u00e9dit imp\u00f4t 50%' : '\u2796 Non \u00e9ligible'}
        </div>
      </label>
    `;
  }).join('');

  // Thematique tree
  let thematiquesTree = '';
  for (const d of domaines as any[]) {
    const sds = (sous_domaines as any[]).filter((sd: any) => sd.domaine_id === d.id);
    if (sds.length === 0) continue;

    let sdHtml = '';
    for (const sd of sds) {
      const ths = (thematiques as any[]).filter((t: any) => t.sous_domaine_id === sd.id);
      if (ths.length === 0) continue;
      const chips = ths.map((t: any) => `
        <label class="thematique-chip" onclick="toggleThematique(this)">
          <input type="checkbox" name="thematiques" value="${escapeHtml(t.id)}">
          ${escapeHtml(t.nom)}
        </label>
      `).join('');
      sdHtml += `
        <div class="thematique-sd">
          <div class="thematique-sd-title">${escapeHtml(sd.nom)}</div>
          <div class="thematique-items">${chips}</div>
        </div>
      `;
    }

    thematiquesTree += `
      <div class="thematique-domain">
        <div class="thematique-domain-title">${escapeHtml(d.icone || '')} ${escapeHtml(d.nom)}</div>
        ${sdHtml}
      </div>
    `;
  }

  const content = `
    <a href="/packages" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      Retour aux packages
    </a>

    <div class="form-card">
      <div class="form-card-header">
        <h1>
          <span style="animation:float 3s ease-in-out infinite">\ud83d\uded2</span>
          Vendre un package
        </h1>
      </div>
      <div class="form-card-body">
        <form id="pkg-form" onsubmit="event.preventDefault();submitPackage()">

          <!-- Eleve -->
          <div class="form-section-title">\ud83c\udf93 \u00c9l\u00e8ve</div>
          <div class="form-group">
            <label class="form-label">\u00c9l\u00e8ve / Famille <span class="required">*</span></label>
            <select class="form-select" name="eleve_id" id="eleve-select" required>
              ${eleveOptions}
            </select>
          </div>

          <!-- Package type -->
          <div class="form-section-title">\ud83d\udce6 Type de package</div>
          <div class="form-group">
            <div class="pkg-select-grid">
              ${pkgCards}
            </div>
          </div>

          <!-- Thematiques -->
          <div class="form-section-title">\ud83d\udcda Th\u00e9matiques</div>
          <div class="form-group">
            <label class="form-label">S\u00e9lectionnez les th\u00e9matiques couvertes</label>
            <div class="thematique-tree">
              ${thematiquesTree}
            </div>
          </div>

          <!-- Price calculation -->
          <div class="price-display" id="price-display">
            <h3>\ud83e\uddee Calcul du prix</h3>
            <div class="price-rows">
              <div class="price-row">
                <span class="price-label">Prix brut</span>
                <span class="price-value" id="prix-brut">-</span>
              </div>
              <div class="price-row credit" id="credit-row" style="display:none">
                <span class="price-label">\u2705 Cr\u00e9dit d'imp\u00f4t (50%)</span>
                <span class="price-value" id="credit-impot">-</span>
              </div>
              <div class="price-row total">
                <span class="price-label">Reste \u00e0 charge</span>
                <span class="price-value" id="reste-charge">-</span>
              </div>
            </div>
            <div style="margin-top:12px" id="expiration-info"></div>
          </div>

          <!-- Submit -->
          <div class="submit-area">
            <a href="/packages" class="btn btn-outline">Annuler</a>
            <button type="submit" class="btn btn-primary btn-submit-lg" id="submit-btn" disabled>
              \ud83d\udce6 Cr\u00e9er le package
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      var pkgTypes = ${pkgTypesJson};
      var selectedPkgId = null;

      function selectPackage(id) {
        selectedPkgId = id;
        document.querySelectorAll('.pkg-select-card').forEach(function(c) { c.classList.remove('selected'); });
        var card = document.querySelector('.pkg-select-card[data-pkg-id="' + id + '"]');
        if (card) {
          card.classList.add('selected');
          card.querySelector('input[type="radio"]').checked = true;
        }
        updatePriceDisplay();
        document.getElementById('submit-btn').disabled = false;
      }

      function updatePriceDisplay() {
        var pkg = pkgTypes.find(function(p) { return p.id === selectedPkgId; });
        if (!pkg) return;

        var brut = pkg.prix;
        var eligible = pkg.eligible_credit_impot === 1;
        var credit = eligible ? Math.round(brut * 0.5 * 100) / 100 : 0;
        var reste = Math.round((brut - credit) * 100) / 100;

        var prixBrutEl = document.getElementById('prix-brut');
        var creditEl = document.getElementById('credit-impot');
        var resteEl = document.getElementById('reste-charge');
        var creditRow = document.getElementById('credit-row');
        var display = document.getElementById('price-display');

        prixBrutEl.textContent = brut.toLocaleString('fr-FR', {minimumFractionDigits:2}) + ' \\u20ac';
        prixBrutEl.classList.add('animated');
        setTimeout(function() { prixBrutEl.classList.remove('animated'); }, 500);

        if (eligible) {
          creditRow.style.display = 'flex';
          creditEl.textContent = '-' + credit.toLocaleString('fr-FR', {minimumFractionDigits:2}) + ' \\u20ac';
          creditEl.classList.add('animated');
          setTimeout(function() { creditEl.classList.remove('animated'); }, 500);
        } else {
          creditRow.style.display = 'none';
        }

        resteEl.textContent = reste.toLocaleString('fr-FR', {minimumFractionDigits:2}) + ' \\u20ac';
        resteEl.classList.add('animated');
        setTimeout(function() { resteEl.classList.remove('animated'); }, 500);

        display.classList.add('active');

        // Expiration
        var now = new Date();
        var exp = new Date(now);
        exp.setDate(exp.getDate() + pkg.duree_validite_jours);
        var expStr = exp.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        document.getElementById('expiration-info').innerHTML =
          '<div class="expiration-display">\\ud83d\\udcc5 Expiration automatique : ' + expStr + '</div>';
      }

      function toggleThematique(label) {
        var cb = label.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        label.classList.toggle('selected', cb.checked);
      }

      async function submitPackage() {
        var btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Cr\\u00e9ation...';

        var thematiques = [];
        document.querySelectorAll('input[name="thematiques"]:checked').forEach(function(cb) {
          thematiques.push(cb.value);
        });

        var payload = {
          eleve_id: document.getElementById('eleve-select').value,
          package_type_id: selectedPkgId,
          thematiques: thematiques
        };

        try {
          var res = await fetch('/api/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          var result = await res.json();
          if (res.ok) {
            alert('Package cr\\u00e9\\u00e9 avec succ\\u00e8s ! Facture ' + (result.facture_reference || '') + ' g\\u00e9n\\u00e9r\\u00e9e.');
            window.location.href = '/packages';
          } else {
            alert('Erreur: ' + (result.error || 'Erreur inconnue'));
            btn.disabled = false;
            btn.innerHTML = '\\ud83d\\udce6 Cr\\u00e9er le package';
          }
        } catch(e) {
          alert('Erreur de connexion');
          btn.disabled = false;
          btn.innerHTML = '\\ud83d\\udce6 Cr\\u00e9er le package';
        }
      }
    </script>
  `;

  return htmlPage({
    title: 'Vendre un package',
    activePage: 'packages',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
