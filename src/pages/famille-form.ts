/**
 * Soutien Scolaire Caplogy - Page Admin: Formulaire Nouvelle Famille
 * Formulaire parent + enfants dynamiques avec animations
 */

import type { Env } from '../../shared/types';
import { htmlPage } from '../../shared/html-utils';

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

  /* ---- Form container ---- */
  .form-container {
    max-width: 800px;
    margin: 0 auto;
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 36px 40px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--gray-100);
    animation: slideUp 0.5s ease both;
    position: relative;
    overflow: hidden;
  }
  .form-container::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--success), var(--secondary), var(--success));
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }

  .form-title {
    font-size: 24px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.5px;
  }
  .form-title .form-icon {
    font-size: 28px;
    animation: float 3s ease-in-out infinite;
  }
  .form-subtitle {
    font-size: 14px;
    color: var(--gray-500);
    margin-bottom: 28px;
    line-height: 1.5;
  }

  /* ---- Enfant block ---- */
  .enfant-block {
    background: var(--gray-50);
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: 20px 24px;
    margin-bottom: 16px;
    position: relative;
    animation: slideUp 0.4s ease both;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .enfant-block:hover {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(109, 203, 221, 0.08);
  }
  .enfant-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .enfant-block-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-800);
  }
  .enfant-block-title .enfant-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--blue), var(--primary-light));
    color: var(--white);
    font-size: 13px;
    font-weight: 700;
    animation: bounceIn 0.5s ease both;
  }
  .btn-remove-enfant {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    background: var(--danger-light);
    color: #991b1b;
    border: 1px solid #fca5a5;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .btn-remove-enfant:hover {
    background: var(--danger);
    color: var(--white);
    transform: scale(1.1) rotate(90deg);
  }

  /* ---- Add enfant button ---- */
  .btn-add-enfant {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border: 2px dashed var(--gray-300);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--gray-500);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    margin-bottom: 24px;
  }
  .btn-add-enfant:hover {
    border-color: var(--success);
    color: var(--success);
    background: rgba(16, 185, 129, 0.05);
    transform: translateY(-2px);
  }
  .btn-add-enfant .plus-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: var(--gray-100);
    transition: all var(--transition-fast);
  }
  .btn-add-enfant:hover .plus-icon {
    background: var(--success-light);
    animation: pulse 1s ease-in-out infinite;
  }

  /* ---- Submit area ---- */
  .submit-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 24px;
    border-top: 2px solid var(--gray-100);
    margin-top: 8px;
  }
  .submit-area .cancel-link {
    color: var(--gray-500);
    font-weight: 600;
    font-size: 14px;
  }
  .submit-area .cancel-link:hover {
    color: var(--danger);
  }

  /* ---- Success animation overlay ---- */
  .success-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 3000;
    background: rgba(255,255,255,0.95);
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }
  .success-overlay.show {
    display: flex;
    animation: fadeIn 0.3s ease both;
  }
  .success-overlay .success-icon {
    font-size: 80px;
    animation: bounceIn 0.6s ease both;
  }
  .success-overlay .success-text {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    animation: slideUp 0.5s ease both;
    animation-delay: 0.2s;
  }

  @media (max-width: 600px) {
    .form-container { padding: 20px; }
    .submit-area { flex-direction: column; }
  }
`;

// ============================================================================
// RENDER PAGE
// ============================================================================

export async function renderFamilleForm(env: Env, userName?: string): Promise<string> {
  const content = `
    <a href="/familles" class="back-link">\u{2190} Retour aux familles</a>

    <div class="form-container">
      <div class="form-title">
        <span class="form-icon">\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}</span>
        Nouvelle Famille
      </div>
      <div class="form-subtitle">
        Enregistrez une nouvelle famille avec les informations du parent et de ses enfants.
        Tous les champs marqu\u{00E9}s d'un <span style="color:var(--danger)">*</span> sont obligatoires.
      </div>

      <form id="famille-form" onsubmit="submitFamille(event)">
        <!-- Parent section -->
        <div class="form-section-title">\u{1F464} Informations du parent</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pr\u{00E9}nom <span class="required">*</span></label>
            <input type="text" class="form-input" name="prenom" required placeholder="Pr\u{00E9}nom">
          </div>
          <div class="form-group">
            <label class="form-label">Nom <span class="required">*</span></label>
            <input type="text" class="form-input" name="nom" required placeholder="Nom de famille">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <input type="email" class="form-input" name="email" required placeholder="email@exemple.com">
          </div>
          <div class="form-group">
            <label class="form-label">T\u{00E9}l\u{00E9}phone</label>
            <input type="tel" class="form-input" name="telephone" placeholder="06 12 34 56 78">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Adresse</label>
          <input type="text" class="form-input" name="adresse" placeholder="12 rue de la Paix">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ville <span class="required">*</span></label>
            <input type="text" class="form-input" name="ville" required placeholder="Paris">
          </div>
          <div class="form-group">
            <label class="form-label">Code postal <span class="required">*</span></label>
            <input type="text" class="form-input" name="code_postal" required placeholder="75001" maxlength="5" pattern="[0-9]{5}">
          </div>
        </div>

        <!-- Enfants section -->
        <div class="form-section-title">\u{1F9D1}\u{200D}\u{1F393} Enfants</div>

        <div id="enfants-container">
          <!-- Enfant 1 (cannot be removed) -->
          <div class="enfant-block" data-enfant-index="0">
            <div class="enfant-block-header">
              <div class="enfant-block-title">
                <span class="enfant-num">1</span>
                Enfant n\u{00B0}1
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Pr\u{00E9}nom <span class="required">*</span></label>
              <input type="text" class="form-input" name="enfant_prenom_0" required placeholder="Pr\u{00E9}nom de l'enfant">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Niveau scolaire</label>
                <select class="form-select" name="enfant_niveau_0">
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
                <label class="form-label">Profil sp\u{00E9}cifique</label>
                <select class="form-select" name="enfant_profil_0">
                  <option value="standard">Standard</option>
                  <option value="dys">DYS (dyslexie, dyscalculie...)</option>
                  <option value="tdah">TDAH</option>
                  <option value="hpi">HPI (haut potentiel)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button type="button" class="btn-add-enfant" onclick="addEnfant()">
          <span class="plus-icon">+</span>
          Ajouter un enfant
        </button>

        <!-- Submit -->
        <div class="submit-area">
          <a href="/familles" class="cancel-link">Annuler</a>
          <button type="submit" class="btn btn-success btn-lg" id="submit-btn">
            \u{2705} Enregistrer la famille
          </button>
        </div>
      </form>
    </div>

    <!-- Success overlay -->
    <div id="success-overlay" class="success-overlay">
      <div class="success-icon">\u{1F389}</div>
      <div class="success-text">Famille cr\u{00E9}\u{00E9}e avec succ\u{00E8}s !</div>
      <div class="spinner" style="margin-top:8px"></div>
    </div>

    <script>
      var enfantCount = 1;

      function addEnfant() {
        var idx = enfantCount;
        enfantCount++;

        var block = document.createElement('div');
        block.className = 'enfant-block';
        block.setAttribute('data-enfant-index', idx);
        block.innerHTML = \`
          <div class="enfant-block-header">
            <div class="enfant-block-title">
              <span class="enfant-num">\${idx + 1}</span>
              Enfant n\\u00b0\${idx + 1}
            </div>
            <button type="button" class="btn-remove-enfant" onclick="removeEnfant(this)" title="Supprimer">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">Pr\\u00e9nom <span class="required">*</span></label>
            <input type="text" class="form-input" name="enfant_prenom_\${idx}" required placeholder="Pr\\u00e9nom de l'enfant">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Niveau scolaire</label>
              <select class="form-select" name="enfant_niveau_\${idx}">
                <option value="">S\\u00e9lectionner...</option>
                <option value="CP">CP</option>
                <option value="CE1">CE1</option>
                <option value="CE2">CE2</option>
                <option value="CM1">CM1</option>
                <option value="CM2">CM2</option>
                <option value="6eme">6\\u00e8me</option>
                <option value="5eme">5\\u00e8me</option>
                <option value="4eme">4\\u00e8me</option>
                <option value="3eme">3\\u00e8me</option>
                <option value="seconde">Seconde</option>
                <option value="premiere">Premi\\u00e8re</option>
                <option value="terminale">Terminale</option>
                <option value="superieur">Sup\\u00e9rieur</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Profil sp\\u00e9cifique</label>
              <select class="form-select" name="enfant_profil_\${idx}">
                <option value="standard">Standard</option>
                <option value="dys">DYS (dyslexie, dyscalculie...)</option>
                <option value="tdah">TDAH</option>
                <option value="hpi">HPI (haut potentiel)</option>
              </select>
            </div>
          </div>
        \`;

        document.getElementById('enfants-container').appendChild(block);
        block.querySelector('input').focus();
      }

      function removeEnfant(btn) {
        var block = btn.closest('.enfant-block');
        block.style.animation = 'slideDown 0.3s ease reverse both';
        setTimeout(function() {
          block.remove();
          renumberEnfants();
        }, 300);
      }

      function renumberEnfants() {
        var blocks = document.querySelectorAll('.enfant-block');
        blocks.forEach(function(block, i) {
          var num = block.querySelector('.enfant-num');
          if (num) num.textContent = (i + 1).toString();
          var title = block.querySelector('.enfant-block-title');
          if (title) {
            var textNodes = title.childNodes;
            for (var j = 0; j < textNodes.length; j++) {
              if (textNodes[j].nodeType === 3 && textNodes[j].textContent.trim().startsWith('Enfant')) {
                textNodes[j].textContent = ' Enfant n\\u00b0' + (i + 1);
              }
            }
          }
        });
      }

      async function submitFamille(e) {
        e.preventDefault();
        var form = document.getElementById('famille-form');
        var btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Enregistrement...';

        // Collect enfants
        var enfantBlocks = document.querySelectorAll('.enfant-block');
        var enfants = [];
        enfantBlocks.forEach(function(block) {
          var idx = block.getAttribute('data-enfant-index');
          var prenom = form.querySelector('[name="enfant_prenom_' + idx + '"]');
          var niveau = form.querySelector('[name="enfant_niveau_' + idx + '"]');
          var profil = form.querySelector('[name="enfant_profil_' + idx + '"]');
          if (prenom && prenom.value.trim()) {
            enfants.push({
              prenom: prenom.value.trim(),
              niveau: niveau ? niveau.value : '',
              profil_specifique: profil ? profil.value : 'standard'
            });
          }
        });

        if (enfants.length === 0) {
          alert('Veuillez ajouter au moins un enfant');
          btn.disabled = false;
          btn.innerHTML = '\\u2705 Enregistrer la famille';
          return;
        }

        var data = {
          prenom: form.prenom.value.trim(),
          nom: form.nom.value.trim(),
          email: form.email.value.trim(),
          telephone: form.telephone.value.trim() || undefined,
          adresse: form.adresse.value.trim() || undefined,
          ville: form.ville.value.trim(),
          code_postal: form.code_postal.value.trim(),
          enfants: enfants
        };

        try {
          var res = await fetch('/api/familles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          var result = await res.json();

          if (res.ok && result.success) {
            // Show success overlay then redirect
            document.getElementById('success-overlay').classList.add('show');
            setTimeout(function() {
              window.location.href = '/familles/' + result.parentId;
            }, 1500);
          } else {
            alert('Erreur: ' + (result.error || 'Erreur inconnue'));
            btn.disabled = false;
            btn.innerHTML = '\\u2705 Enregistrer la famille';
          }
        } catch (err) {
          alert('Erreur de connexion');
          btn.disabled = false;
          btn.innerHTML = '\\u2705 Enregistrer la famille';
        }
      }
    </script>
  `;

  return htmlPage({
    title: 'Nouvelle Famille',
    activePage: 'familles',
    extraCss: PAGE_CSS,
    content,
    userName,
  });
}
