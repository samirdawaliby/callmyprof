/**
 * Soutien Scolaire Caplogy - Onboarding Formateur (Public)
 * Wizard 4 etapes : Infos perso, Competences, Documents, Validation
 * Standalone page (no sidebar), Caplogy design system
 */

import type { Env } from '../../shared/types';
import { CSS_VARS, CSS_BASE, CSS_ANIMATIONS, CSS_FORMS, escapeHtml } from '../../shared/html-utils';

// ============================================================================
// CSS ONBOARDING
// ============================================================================

const ONBOARDING_CSS = `
  /* ---- Page wrapper ---- */
  .onboarding-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 40%, #f0fdf4 100%);
    position: relative;
    overflow-x: hidden;
  }

  /* ---- Animated background shapes ---- */
  .bg-shape {
    position: fixed;
    border-radius: 50%;
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
  }
  .bg-shape-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    top: -150px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
  }
  .bg-shape-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, var(--secondary), #10b981);
    bottom: -80px;
    left: -50px;
    animation: float 6s ease-in-out infinite;
    animation-delay: 2s;
  }
  .bg-shape-3 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, var(--purple), var(--secondary));
    top: 40%;
    left: 10%;
    animation: float 10s ease-in-out infinite;
    animation-delay: 4s;
  }

  /* ---- Top header ---- */
  .onboarding-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    padding: 20px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 10;
    box-shadow: 0 4px 20px rgba(13,56,101,0.2);
  }
  .onboarding-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }
  .onboarding-logo img {
    height: 32px;
    border-radius: 6px;
  }
  .onboarding-logo span {
    color: var(--white);
    font-size: 17px;
    font-weight: 700;
  }
  .onboarding-header-text {
    color: rgba(255,255,255,0.7);
    font-size: 13px;
  }

  /* ---- Progress bar ---- */
  .progress-container {
    background: var(--white);
    padding: 24px 32px;
    box-shadow: var(--shadow-sm);
    position: relative;
    z-index: 10;
  }
  .progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    max-width: 700px;
    margin: 0 auto;
  }
  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    position: relative;
    z-index: 2;
  }
  .progress-step::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    width: 100%;
    height: 3px;
    background: var(--gray-200);
    z-index: -1;
  }
  .progress-step:last-child::before {
    display: none;
  }
  .progress-step.completed::before {
    background: linear-gradient(90deg, var(--success), var(--secondary));
  }
  .progress-step.active::before {
    background: linear-gradient(90deg, var(--secondary), var(--gray-200));
  }
  .step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    border: 3px solid var(--gray-200);
    background: var(--white);
    color: var(--gray-400);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .progress-step.active .step-circle {
    border-color: var(--secondary);
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    color: var(--primary-dark);
    box-shadow: 0 0 0 6px rgba(109,203,221,0.2);
    animation: pulse 2s ease-in-out infinite;
  }
  .progress-step.completed .step-circle {
    border-color: var(--success);
    background: var(--success);
    color: var(--white);
    box-shadow: 0 0 0 4px rgba(16,185,129,0.15);
  }
  .step-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-400);
    text-align: center;
    transition: color 0.3s ease;
  }
  .progress-step.active .step-label { color: var(--primary); }
  .progress-step.completed .step-label { color: var(--success); }

  /* ---- Main form container ---- */
  .form-container {
    max-width: 780px;
    margin: 32px auto;
    padding: 0 20px;
    position: relative;
    z-index: 10;
  }

  /* ---- Step panel ---- */
  .step-panel {
    display: none;
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 36px 40px;
    border: 1px solid var(--gray-100);
    position: relative;
    overflow: hidden;
  }
  .step-panel.active {
    display: block;
    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  .step-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
  }
  .step-title {
    font-size: 22px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.3px;
  }
  .step-subtitle {
    font-size: 14px;
    color: var(--gray-500);
    margin-bottom: 28px;
    line-height: 1.5;
  }

  /* ---- Photo upload preview ---- */
  .photo-upload-zone {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 3px dashed var(--gray-300);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--gray-50);
    margin: 0 auto 20px;
    overflow: hidden;
    position: relative;
  }
  .photo-upload-zone:hover {
    border-color: var(--secondary);
    background: rgba(109,203,221,0.05);
    transform: scale(1.05);
  }
  .photo-upload-zone.has-photo {
    border-style: solid;
    border-color: var(--secondary);
  }
  .photo-upload-zone img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo-upload-zone .photo-placeholder {
    text-align: center;
  }
  .photo-upload-zone .photo-placeholder .photo-icon {
    font-size: 32px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  .photo-upload-zone .photo-placeholder .photo-text {
    font-size: 11px;
    color: var(--gray-400);
    margin-top: 4px;
  }

  /* ---- Competence selector ---- */
  .domaine-accordion {
    margin-bottom: 12px;
    border: 1px solid var(--gray-100);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: all var(--transition-fast);
  }
  .domaine-accordion:hover {
    border-color: var(--gray-200);
    box-shadow: var(--shadow-sm);
  }
  .domaine-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--gray-50);
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-800);
    transition: background var(--transition-fast);
    user-select: none;
  }
  .domaine-header:hover {
    background: var(--gray-100);
  }
  .domaine-header .domaine-icon { font-size: 18px; }
  .domaine-header .domaine-arrow {
    margin-left: auto;
    transition: transform 0.3s ease;
    color: var(--gray-400);
  }
  .domaine-accordion.open .domaine-header .domaine-arrow {
    transform: rotate(180deg);
  }
  .domaine-body {
    display: none;
    padding: 12px 16px;
  }
  .domaine-accordion.open .domaine-body {
    display: block;
    animation: slideDown 0.3s ease both;
  }
  .sous-domaine-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 10px 0 6px;
  }
  .sous-domaine-title:first-child { margin-top: 0; }
  .thematique-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: var(--gray-700);
    transition: background var(--transition-fast);
  }
  .thematique-checkbox:hover {
    background: rgba(109,203,221,0.08);
  }
  .thematique-checkbox input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--primary);
    cursor: pointer;
  }
  .selected-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    background: var(--secondary-light);
    color: var(--primary-dark);
    margin-bottom: 16px;
    animation: bounceIn 0.4s ease both;
  }

  /* ---- Document upload cards ---- */
  .doc-upload-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) {
    .doc-upload-grid { grid-template-columns: 1fr; }
  }
  .doc-upload-card {
    border: 2px dashed var(--gray-200);
    border-radius: var(--radius-sm);
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--gray-50);
    position: relative;
    overflow: hidden;
  }
  .doc-upload-card:hover {
    border-color: var(--secondary);
    background: rgba(109,203,221,0.03);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
  .doc-upload-card.dragover {
    border-color: var(--secondary);
    background: rgba(109,203,221,0.1);
    transform: scale(1.02);
  }
  .doc-upload-card.uploaded {
    border-style: solid;
    border-color: var(--success);
    background: var(--success-light);
  }
  .doc-upload-card .doc-upload-icon {
    font-size: 28px;
    margin-bottom: 6px;
    display: block;
  }
  .doc-upload-card .doc-upload-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: 4px;
  }
  .doc-upload-card .doc-upload-hint {
    font-size: 11px;
    color: var(--gray-400);
  }
  .doc-upload-card .doc-upload-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--success);
    color: var(--white);
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    animation: bounceIn 0.5s ease both;
  }
  .doc-upload-card.uploaded .doc-upload-check {
    display: flex;
  }
  .doc-upload-card .doc-filename {
    font-size: 11px;
    color: var(--success);
    font-weight: 600;
    margin-top: 6px;
    display: none;
  }
  .doc-upload-card.uploaded .doc-filename {
    display: block;
  }

  /* ---- Signature canvas ---- */
  .signature-area {
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-sm);
    background: var(--white);
    position: relative;
    margin: 16px 0;
  }
  .signature-canvas {
    width: 100%;
    height: 160px;
    cursor: crosshair;
    display: block;
    border-radius: var(--radius-sm);
  }
  .signature-clear {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    font-size: 11px;
    border-radius: 6px;
    border: 1px solid var(--gray-200);
    background: var(--white);
    color: var(--gray-500);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .signature-clear:hover {
    border-color: var(--danger);
    color: var(--danger);
  }
  .signature-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
    color: var(--gray-300);
    pointer-events: none;
    font-style: italic;
  }

  /* ---- Review summary ---- */
  .review-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 600px) {
    .review-summary { grid-template-columns: 1fr; }
  }
  .review-box {
    background: var(--gray-50);
    border-radius: var(--radius-sm);
    padding: 16px;
    border: 1px solid var(--gray-100);
  }
  .review-box-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-600);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .review-box-content {
    font-size: 14px;
    color: var(--gray-800);
    line-height: 1.8;
  }
  .review-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 3px 0;
  }
  .review-item-label { color: var(--gray-500); }
  .review-item-value { color: var(--gray-900); font-weight: 600; }

  /* ---- Navigation buttons ---- */
  .step-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--gray-100);
  }
  .btn-prev {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--gray-200);
    background: var(--white);
    color: var(--gray-600);
    transition: all var(--transition-fast);
  }
  .btn-prev:hover {
    border-color: var(--gray-300);
    background: var(--gray-50);
    transform: translateX(-2px);
  }
  .btn-next {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: var(--white);
    transition: all var(--transition-fast);
    box-shadow: 0 4px 12px rgba(13,56,101,0.2);
  }
  .btn-next:hover {
    box-shadow: 0 6px 20px rgba(13,56,101,0.3);
    transform: translateY(-2px);
  }
  .btn-next:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .btn-submit {
    background: linear-gradient(135deg, var(--success) 0%, #34d399 100%);
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }
  .btn-submit:hover {
    box-shadow: 0 6px 20px rgba(16,185,129,0.4);
  }

  /* ---- Thank you page ---- */
  .thankyou-panel {
    display: none;
    text-align: center;
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 60px 40px;
    border: 1px solid var(--gray-100);
  }
  .thankyou-panel.active {
    display: block;
    animation: slideUp 0.5s ease both;
  }
  .thankyou-icon {
    font-size: 80px;
    display: block;
    margin-bottom: 20px;
    animation: bounceIn 0.8s ease both;
  }
  .thankyou-title {
    font-size: 28px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }
  .thankyou-text {
    font-size: 16px;
    color: var(--gray-500);
    line-height: 1.7;
    max-width: 500px;
    margin: 0 auto 30px;
  }
  .thankyou-confetti {
    font-size: 40px;
    animation: float 2s ease-in-out infinite;
    display: inline-block;
  }

  /* ---- CGV checkbox ---- */
  .cgv-label {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-200);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 14px;
    color: var(--gray-700);
    line-height: 1.6;
  }
  .cgv-label:hover {
    border-color: var(--secondary);
    background: rgba(109,203,221,0.03);
  }
  .cgv-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    accent-color: var(--primary);
    cursor: pointer;
    flex-shrink: 0;
  }

  /* ---- Auto-save indicator ---- */
  .autosave-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 100;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    pointer-events: none;
  }
  .autosave-indicator.show {
    opacity: 1;
    transform: translateY(0);
  }
  .autosave-indicator.saving {
    background: var(--warning-light);
    color: #92400e;
    border: 1px solid #fde68a;
  }
  .autosave-indicator.saved {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  @media (max-width: 600px) {
    .step-panel { padding: 24px 20px; }
    .step-title { font-size: 18px; }
    .onboarding-header { padding: 16px 20px; }
    .progress-container { padding: 16px 12px; }
    .step-label { font-size: 10px; }
    .step-circle { width: 34px; height: 34px; font-size: 14px; }
    .form-container { padding: 0 12px; margin: 20px auto; }
  }
`;

// ============================================================================
// RENDER ONBOARDING PAGE
// ============================================================================

export async function renderOnboarding(env: Env): Promise<string> {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devenir formateur - Soutien Scolaire Caplogy</title>
  <link rel="icon" href="https://www.caplogy.com/logo_C.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    ${CSS_FORMS}
    ${ONBOARDING_CSS}
  </style>
</head>
<body>
  <div class="onboarding-page">
    <!-- Background shapes -->
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>
    <div class="bg-shape bg-shape-3"></div>

    <!-- Header -->
    <div class="onboarding-header">
      <a href="/" class="onboarding-logo">
        <img src="https://www.caplogy.com/logo_C.png" alt="Caplogy">
        <span>Soutien Scolaire</span>
      </a>
      <span class="onboarding-header-text">Inscription formateur</span>
    </div>

    <!-- Progress bar -->
    <div class="progress-container">
      <div class="progress-steps">
        <div class="progress-step active" id="progress-1">
          <div class="step-circle">\ud83d\udc64</div>
          <span class="step-label">Informations</span>
        </div>
        <div class="progress-step" id="progress-2">
          <div class="step-circle">\ud83c\udf93</div>
          <span class="step-label">Comp\u00e9tences</span>
        </div>
        <div class="progress-step" id="progress-3">
          <div class="step-circle">\ud83d\udcc1</div>
          <span class="step-label">Documents</span>
        </div>
        <div class="progress-step" id="progress-4">
          <div class="step-circle">\u2705</div>
          <span class="step-label">Validation</span>
        </div>
      </div>
    </div>

    <!-- Form container -->
    <div class="form-container">

      <!-- ======== STEP 1: Personal Info ======== -->
      <div class="step-panel active" id="step-1">
        <div class="step-title">\ud83d\udc64 Vos informations personnelles</div>
        <div class="step-subtitle">Commencez par nous dire qui vous \u00eates. Ces informations seront visibles par les familles.</div>

        <!-- Photo upload -->
        <div class="photo-upload-zone" id="photo-zone" onclick="document.getElementById('photo-input').click()">
          <div class="photo-placeholder">
            <span class="photo-icon">\ud83d\udcf8</span>
            <span class="photo-text">Ajoutez une photo</span>
          </div>
        </div>
        <input type="file" id="photo-input" accept="image/*" style="display:none" onchange="previewPhoto(this)">

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pr\u00e9nom <span class="required">*</span></label>
            <input type="text" class="form-input" id="f-prenom" placeholder="Votre pr\u00e9nom" required>
          </div>
          <div class="form-group">
            <label class="form-label">Nom <span class="required">*</span></label>
            <input type="text" class="form-input" id="f-nom" placeholder="Votre nom" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <input type="email" class="form-input" id="f-email" placeholder="votre@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">T\u00e9l\u00e9phone</label>
            <input type="tel" class="form-input" id="f-tel" placeholder="06 00 00 00 00">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ville <span class="required">*</span></label>
            <input type="text" class="form-input" id="f-ville" placeholder="Votre ville" required>
          </div>
          <div class="form-group">
            <label class="form-label">Code postal</label>
            <input type="text" class="form-input" id="f-cp" placeholder="75000" maxlength="5">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Rayon d'action (km)</label>
          <input type="range" id="f-rayon" min="1" max="50" value="10" style="width:100%;accent-color:var(--primary)"
                 oninput="document.getElementById('rayon-val').textContent=this.value+' km'">
          <div class="form-hint">Vous vous d\u00e9placez dans un rayon de <strong id="rayon-val">10 km</strong></div>
        </div>

        <div class="step-nav">
          <div></div>
          <button class="btn-next" onclick="goToStep(2)">
            Suivant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <!-- ======== STEP 2: Competences ======== -->
      <div class="step-panel" id="step-2">
        <div class="step-title">\ud83c\udf93 Vos comp\u00e9tences</div>
        <div class="step-subtitle">S\u00e9lectionnez les mati\u00e8res et th\u00e9matiques que vous pouvez enseigner, puis d\u00e9finissez vos tarifs.</div>

        <div class="selected-count" id="selected-count">\ud83c\udfaf <span id="nb-selected">0</span> th\u00e9matique(s) s\u00e9lectionn\u00e9e(s)</div>

        <div id="catalogue-tree">
          <div style="text-align:center;padding:40px;color:var(--gray-400)">
            <div class="spinner"></div>
            <div style="margin-top:12px;font-size:13px">Chargement du catalogue...</div>
          </div>
        </div>

        <div class="form-section-title">\ud83d\udcb6 Tarifs & pr\u00e9f\u00e9rences</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tarif individuel (\u20ac/h)</label>
            <input type="number" class="form-input" id="f-tarif-ind" placeholder="30" min="10" max="200" step="1">
          </div>
          <div class="form-group">
            <label class="form-label">Tarif collectif (\u20ac/h)</label>
            <input type="number" class="form-input" id="f-tarif-col" placeholder="20" min="5" max="200" step="1">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Bio / Pr\u00e9sentation</label>
          <textarea class="form-textarea" id="f-bio" rows="4" placeholder="Pr\u00e9sentez-vous en quelques lignes. Votre exp\u00e9rience, votre approche p\u00e9dagogique, ce qui vous motive\u2026"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ann\u00e9es d'exp\u00e9rience</label>
            <input type="number" class="form-input" id="f-experience" placeholder="3" min="0" max="50">
          </div>
          <div class="form-group">
            <label class="form-label">Modes d'enseignement</label>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px">
              <label class="form-checkbox"><input type="checkbox" id="f-domicile" checked> \ud83c\udfe0 A domicile</label>
              <label class="form-checkbox"><input type="checkbox" id="f-collectif" checked> \ud83d\udc65 Cours collectifs</label>
              <label class="form-checkbox"><input type="checkbox" id="f-visio"> \ud83d\udcbb En visio</label>
            </div>
          </div>
        </div>

        <div class="step-nav">
          <button class="btn-prev" onclick="goToStep(1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Pr\u00e9c\u00e9dent
          </button>
          <button class="btn-next" onclick="goToStep(3)">
            Suivant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <!-- ======== STEP 3: Documents ======== -->
      <div class="step-panel" id="step-3">
        <div class="step-title">\ud83d\udcc1 Vos documents</div>
        <div class="step-subtitle">T\u00e9l\u00e9versez les documents n\u00e9cessaires \u00e0 la validation de votre dossier. Formats accept\u00e9s : PDF, JPG, PNG (max 10 Mo).</div>

        <div class="doc-upload-grid">
          <div class="doc-upload-card" data-doc="doc_identite_url" onclick="triggerDocUpload('doc_identite_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_identite_url')" ondragleave="docDragLeave(event)">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83c\udd94</span>
            <div class="doc-upload-label">Pi\u00e8ce d'identit\u00e9</div>
            <div class="doc-upload-hint">CNI, passeport ou titre de s\u00e9jour</div>
            <div class="doc-filename" id="fname-doc_identite_url"></div>
          </div>

          <div class="doc-upload-card" data-doc="doc_diplomes_url" onclick="triggerDocUpload('doc_diplomes_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_diplomes_url')" ondragleave="docDragLeave(event)">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83c\udf93</span>
            <div class="doc-upload-label">Dipl\u00f4mes</div>
            <div class="doc-upload-hint">Dernier dipl\u00f4me obtenu</div>
            <div class="doc-filename" id="fname-doc_diplomes_url"></div>
          </div>

          <div class="doc-upload-card" data-doc="doc_siret_url" onclick="triggerDocUpload('doc_siret_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_siret_url')" ondragleave="docDragLeave(event)">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83c\udfed</span>
            <div class="doc-upload-label">Extrait SIRET</div>
            <div class="doc-upload-hint">Avis de situation INSEE</div>
            <div class="doc-filename" id="fname-doc_siret_url"></div>
          </div>

          <div class="doc-upload-card" data-doc="doc_urssaf_url" onclick="triggerDocUpload('doc_urssaf_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_urssaf_url')" ondragleave="docDragLeave(event)">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83d\udcdc</span>
            <div class="doc-upload-label">Attestation URSSAF</div>
            <div class="doc-upload-hint">Attestation de vigilance</div>
            <div class="doc-filename" id="fname-doc_urssaf_url"></div>
          </div>

          <div class="doc-upload-card" data-doc="doc_casier_url" onclick="triggerDocUpload('doc_casier_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_casier_url')" ondragleave="docDragLeave(event)">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83d\udee1\ufe0f</span>
            <div class="doc-upload-label">Casier judiciaire (B3)</div>
            <div class="doc-upload-hint">Obligatoire pour le SAP</div>
            <div class="doc-filename" id="fname-doc_casier_url"></div>
          </div>

          <div class="doc-upload-card" data-doc="doc_rib_url" onclick="triggerDocUpload('doc_rib_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_rib_url')" ondragleave="docDragLeave(event)">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83c\udfe6</span>
            <div class="doc-upload-label">RIB</div>
            <div class="doc-upload-hint">Relev\u00e9 d'identit\u00e9 bancaire</div>
            <div class="doc-filename" id="fname-doc_rib_url"></div>
          </div>

          <div class="doc-upload-card" data-doc="doc_cv_url" onclick="triggerDocUpload('doc_cv_url')" ondragover="docDragOver(event)" ondrop="docDrop(event, 'doc_cv_url')" ondragleave="docDragLeave(event)" style="grid-column: span 2">
            <div class="doc-upload-check">\u2713</div>
            <span class="doc-upload-icon">\ud83d\udcdd</span>
            <div class="doc-upload-label">CV</div>
            <div class="doc-upload-hint">Votre curriculum vitae</div>
            <div class="doc-filename" id="fname-doc_cv_url"></div>
          </div>
        </div>
        <input type="file" id="doc-file-input" accept=".pdf,.jpg,.jpeg,.png" style="display:none">

        <div class="form-section-title">\ud83c\udfe6 Informations bancaires</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">IBAN</label>
            <input type="text" class="form-input" id="f-iban" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX">
            <div class="form-hint">Votre IBAN pour recevoir vos paiements</div>
          </div>
          <div class="form-group">
            <label class="form-label">SIRET</label>
            <input type="text" class="form-input" id="f-siret" placeholder="XXX XXX XXX XXXXX" maxlength="17">
            <div class="form-hint">Votre num\u00e9ro SIRET (14 chiffres)</div>
          </div>
        </div>

        <div class="step-nav">
          <button class="btn-prev" onclick="goToStep(2)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Pr\u00e9c\u00e9dent
          </button>
          <button class="btn-next" onclick="goToStep(4)">
            Suivant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <!-- ======== STEP 4: Review & Submit ======== -->
      <div class="step-panel" id="step-4">
        <div class="step-title">\u2705 V\u00e9rification & soumission</div>
        <div class="step-subtitle">V\u00e9rifiez vos informations avant de soumettre votre candidature. Vous pourrez les modifier plus tard.</div>

        <div class="review-summary" id="review-summary">
          <!-- Filled dynamically -->
        </div>

        <div class="form-section-title">\u270d\ufe0f Signature</div>
        <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px">Signez ci-dessous pour valider votre inscription :</p>
        <div class="signature-area">
          <canvas class="signature-canvas" id="signature-canvas"></canvas>
          <span class="signature-placeholder" id="sig-placeholder">Signez ici</span>
          <button class="signature-clear" onclick="clearSignature()">Effacer</button>
        </div>

        <label class="cgv-label" style="margin-top:20px">
          <input type="checkbox" id="f-cgv" onchange="checkSubmitReady()">
          J'accepte les <a href="/cgv" target="_blank" style="color:var(--primary);text-decoration:underline">Conditions G\u00e9n\u00e9rales de Vente</a> et la <a href="/confidentialite" target="_blank" style="color:var(--primary);text-decoration:underline">Politique de confidentialit\u00e9</a> de Caplogy. Je certifie que les informations fournies sont exactes.
        </label>

        <div class="step-nav">
          <button class="btn-prev" onclick="goToStep(3)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Pr\u00e9c\u00e9dent
          </button>
          <button class="btn-next btn-submit" id="btn-submit" onclick="submitOnboarding()" disabled>
            \ud83d\ude80 Soumettre ma candidature
          </button>
        </div>
      </div>

      <!-- ======== THANK YOU ======== -->
      <div class="thankyou-panel" id="step-thankyou">
        <span class="thankyou-confetti">\ud83c\udf89</span>
        <span class="thankyou-icon">\ud83c\udf1f</span>
        <div class="thankyou-title">Merci pour votre candidature !</div>
        <div class="thankyou-text">
          Votre dossier est en cours d'examen par notre \u00e9quipe.
          Vous recevrez un email de confirmation sous 48h.
          Bienvenue dans l'aventure Caplogy !
        </div>
        <span class="thankyou-confetti" style="animation-delay:1s">\ud83c\udf8a</span>
        <div style="margin-top:20px">
          <a href="/" class="btn-next" style="display:inline-flex;text-decoration:none">Retour \u00e0 l'accueil</a>
        </div>
      </div>

    </div><!-- /form-container -->

    <!-- Auto-save indicator -->
    <div class="autosave-indicator" id="autosave-indicator"></div>
  </div>

  <script>
    // ====== STATE ======
    let currentStep = 1;
    let formateurId = localStorage.getItem('onboarding_id') || null;
    let catalogueTree = [];
    let currentDocType = null;
    let signatureDrawn = false;

    // ====== INIT ======
    document.addEventListener('DOMContentLoaded', function() {
      loadCatalogue();
      restoreFromLocalStorage();
      initSignatureCanvas();
    });

    // ====== STEP NAVIGATION ======
    function goToStep(step) {
      // Validate current step before moving forward
      if (step > currentStep && !validateStep(currentStep)) return;

      // Save current step data
      saveStepData(currentStep);

      // Update UI
      document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('step-' + step).classList.add('active');

      // Update progress
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById('progress-' + i);
        el.classList.remove('active', 'completed');
        if (i < step) el.classList.add('completed');
        if (i === step) el.classList.add('active');
      }

      currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Build review if step 4
      if (step === 4) buildReview();
    }

    // ====== VALIDATION ======
    function validateStep(step) {
      if (step === 1) {
        const prenom = document.getElementById('f-prenom').value.trim();
        const nom = document.getElementById('f-nom').value.trim();
        const email = document.getElementById('f-email').value.trim();
        const ville = document.getElementById('f-ville').value.trim();

        if (!prenom || !nom || !email || !ville) {
          alert('Veuillez remplir tous les champs obligatoires (pr\u00e9nom, nom, email, ville)');
          return false;
        }
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
          alert('Veuillez entrer une adresse email valide');
          return false;
        }
        return true;
      }
      return true;
    }

    // ====== SAVE STEP DATA ======
    async function saveStepData(step) {
      showAutosave('saving');
      const data = gatherData();
      localStorage.setItem('onboarding_data', JSON.stringify(data));

      // Create formateur on server if not done yet
      if (!formateurId && step === 1) {
        try {
          const res = await fetch('/api/onboarding/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prenom: data.prenom,
              nom: data.nom,
              email: data.email,
              telephone: data.telephone,
              ville: data.ville,
              code_postal: data.code_postal,
              rayon_km: data.rayon_km
            })
          });
          if (res.ok) {
            const result = await res.json();
            formateurId = result.id;
            localStorage.setItem('onboarding_id', formateurId);
          }
        } catch (e) { console.error('Save error:', e); }
      }

      // Update on server if we have an ID
      if (formateurId) {
        try {
          await fetch('/api/onboarding/' + formateurId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step, ...data })
          });
        } catch (e) { console.error('Update error:', e); }
      }

      showAutosave('saved');
    }

    function gatherData() {
      const selectedThematiques = [];
      document.querySelectorAll('.thematique-cb:checked').forEach(cb => {
        selectedThematiques.push(cb.value);
      });

      return {
        prenom: document.getElementById('f-prenom').value.trim(),
        nom: document.getElementById('f-nom').value.trim(),
        email: document.getElementById('f-email').value.trim(),
        telephone: document.getElementById('f-tel').value.trim(),
        ville: document.getElementById('f-ville').value.trim(),
        code_postal: document.getElementById('f-cp').value.trim(),
        rayon_km: parseInt(document.getElementById('f-rayon').value) || 10,
        bio: document.getElementById('f-bio').value.trim(),
        experience_annees: parseInt(document.getElementById('f-experience').value) || 0,
        tarif_horaire_individuel: parseFloat(document.getElementById('f-tarif-ind').value) || null,
        tarif_horaire_collectif: parseFloat(document.getElementById('f-tarif-col').value) || null,
        accepte_domicile: document.getElementById('f-domicile').checked ? 1 : 0,
        accepte_collectif: document.getElementById('f-collectif').checked ? 1 : 0,
        accepte_visio: document.getElementById('f-visio').checked ? 1 : 0,
        thematiques: selectedThematiques,
        iban: document.getElementById('f-iban').value.trim(),
        siret: document.getElementById('f-siret').value.trim(),
      };
    }

    // ====== RESTORE FROM LOCAL STORAGE ======
    function restoreFromLocalStorage() {
      try {
        const saved = JSON.parse(localStorage.getItem('onboarding_data') || '{}');
        if (saved.prenom) document.getElementById('f-prenom').value = saved.prenom;
        if (saved.nom) document.getElementById('f-nom').value = saved.nom;
        if (saved.email) document.getElementById('f-email').value = saved.email;
        if (saved.telephone) document.getElementById('f-tel').value = saved.telephone;
        if (saved.ville) document.getElementById('f-ville').value = saved.ville;
        if (saved.code_postal) document.getElementById('f-cp').value = saved.code_postal;
        if (saved.rayon_km) {
          document.getElementById('f-rayon').value = saved.rayon_km;
          document.getElementById('rayon-val').textContent = saved.rayon_km + ' km';
        }
        if (saved.bio) document.getElementById('f-bio').value = saved.bio;
        if (saved.experience_annees) document.getElementById('f-experience').value = saved.experience_annees;
        if (saved.tarif_horaire_individuel) document.getElementById('f-tarif-ind').value = saved.tarif_horaire_individuel;
        if (saved.tarif_horaire_collectif) document.getElementById('f-tarif-col').value = saved.tarif_horaire_collectif;
        if (saved.accepte_domicile !== undefined) document.getElementById('f-domicile').checked = !!saved.accepte_domicile;
        if (saved.accepte_collectif !== undefined) document.getElementById('f-collectif').checked = !!saved.accepte_collectif;
        if (saved.accepte_visio !== undefined) document.getElementById('f-visio').checked = !!saved.accepte_visio;
        if (saved.iban) document.getElementById('f-iban').value = saved.iban;
        if (saved.siret) document.getElementById('f-siret').value = saved.siret;
        // Thematiques restored after catalogue loads
        window._savedThematiques = saved.thematiques || [];
      } catch (e) {}
    }

    // ====== CATALOGUE LOADING ======
    async function loadCatalogue() {
      try {
        const res = await fetch('/api/catalogue/domaines');
        const data = await res.json();
        catalogueTree = data.tree || [];
        renderCatalogue();
      } catch (e) {
        document.getElementById('catalogue-tree').innerHTML =
          '<div style="color:var(--danger);text-align:center;padding:20px">Erreur de chargement du catalogue</div>';
      }
    }

    function renderCatalogue() {
      let html = '';
      for (const domaine of catalogueTree) {
        let bodyHtml = '';
        for (const sd of domaine.sous_domaines) {
          if (sd.thematiques.length === 0) continue;
          bodyHtml += '<div class="sous-domaine-title">' + escapeH(sd.nom) + '</div>';
          for (const t of sd.thematiques) {
            bodyHtml += '<label class="thematique-checkbox">' +
              '<input type="checkbox" class="thematique-cb" value="' + escapeH(t.id) + '" onchange="updateThematiqueCount()">' +
              escapeH(t.nom) +
              '</label>';
          }
        }
        html += '<div class="domaine-accordion">' +
          '<div class="domaine-header" onclick="toggleDomaine(this)">' +
          '<span class="domaine-icon">' + (domaine.icone || '') + '</span>' +
          '<span>' + escapeH(domaine.nom) + '</span>' +
          '<span class="domaine-arrow">\\u25BC</span>' +
          '</div>' +
          '<div class="domaine-body">' + bodyHtml + '</div>' +
          '</div>';
      }
      document.getElementById('catalogue-tree').innerHTML = html;

      // Restore saved thematiques
      if (window._savedThematiques && window._savedThematiques.length > 0) {
        for (const id of window._savedThematiques) {
          const cb = document.querySelector('.thematique-cb[value="' + id + '"]');
          if (cb) cb.checked = true;
        }
        updateThematiqueCount();
      }
    }

    function toggleDomaine(header) {
      header.parentElement.classList.toggle('open');
    }

    function updateThematiqueCount() {
      const count = document.querySelectorAll('.thematique-cb:checked').length;
      document.getElementById('nb-selected').textContent = count;
    }

    function escapeH(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    // ====== PHOTO UPLOAD ======
    function previewPhoto(input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const zone = document.getElementById('photo-zone');
          zone.innerHTML = '<img src="' + e.target.result + '" alt="Photo">';
          zone.classList.add('has-photo');
        };
        reader.readAsDataURL(input.files[0]);

        // Upload to server
        if (formateurId) {
          uploadDocToServer(input.files[0], 'photo_url');
        }
      }
    }

    // ====== DOCUMENT UPLOAD ======
    function triggerDocUpload(docType) {
      currentDocType = docType;
      const input = document.getElementById('doc-file-input');
      input.onchange = function() {
        if (input.files && input.files[0]) {
          handleDocUpload(input.files[0], currentDocType);
        }
      };
      input.click();
    }

    function docDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('dragover');
    }

    function docDragLeave(e) {
      e.currentTarget.classList.remove('dragover');
    }

    function docDrop(e, docType) {
      e.preventDefault();
      e.currentTarget.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleDocUpload(e.dataTransfer.files[0], docType);
      }
    }

    function handleDocUpload(file, docType) {
      // Validate file
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Fichier trop volumineux (max 10 Mo)');
        return;
      }

      // Update UI
      const card = document.querySelector('[data-doc="' + docType + '"]');
      if (card) {
        card.classList.add('uploaded');
        const fnameEl = document.getElementById('fname-' + docType);
        if (fnameEl) fnameEl.textContent = file.name;
      }

      // Upload to server
      if (formateurId) {
        uploadDocToServer(file, docType);
      }
    }

    async function uploadDocToServer(file, docType) {
      if (!formateurId) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      try {
        await fetch('/api/onboarding/' + formateurId + '/documents', {
          method: 'POST',
          body: formData
        });
        showAutosave('saved');
      } catch (e) {
        console.error('Upload error:', e);
      }
    }

    // ====== SIGNATURE CANVAS ======
    function initSignatureCanvas() {
      const canvas = document.getElementById('signature-canvas');
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let lastX = 0;
      let lastY = 0;

      function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 160;
      }
      resize();
      window.addEventListener('resize', resize);

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      }

      function startDraw(e) {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
        document.getElementById('sig-placeholder').style.display = 'none';
        signatureDrawn = true;
        checkSubmitReady();
      }

      function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#0d3865';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
      }

      function stopDraw() {
        drawing = false;
      }

      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDraw);
      canvas.addEventListener('mouseleave', stopDraw);
      canvas.addEventListener('touchstart', startDraw);
      canvas.addEventListener('touchmove', draw);
      canvas.addEventListener('touchend', stopDraw);
    }

    function clearSignature() {
      const canvas = document.getElementById('signature-canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('sig-placeholder').style.display = '';
      signatureDrawn = false;
      checkSubmitReady();
    }

    function checkSubmitReady() {
      const cgv = document.getElementById('f-cgv').checked;
      document.getElementById('btn-submit').disabled = !(cgv && signatureDrawn);
    }

    // ====== REVIEW ======
    function buildReview() {
      const d = gatherData();
      const nbDocs = document.querySelectorAll('.doc-upload-card.uploaded').length;
      const html = \`
        <div class="review-box">
          <div class="review-box-title">\\ud83d\\udc64 Informations</div>
          <div class="review-box-content">
            <div class="review-item"><span class="review-item-label">Nom</span><span class="review-item-value">\${escapeH(d.prenom)} \${escapeH(d.nom)}</span></div>
            <div class="review-item"><span class="review-item-label">Email</span><span class="review-item-value">\${escapeH(d.email)}</span></div>
            <div class="review-item"><span class="review-item-label">T\\u00e9l\\u00e9phone</span><span class="review-item-value">\${escapeH(d.telephone || '-')}</span></div>
            <div class="review-item"><span class="review-item-label">Ville</span><span class="review-item-value">\${escapeH(d.ville)} \${d.code_postal ? '(' + escapeH(d.code_postal) + ')' : ''}</span></div>
            <div class="review-item"><span class="review-item-label">Rayon</span><span class="review-item-value">\${d.rayon_km} km</span></div>
          </div>
        </div>
        <div class="review-box">
          <div class="review-box-title">\\ud83c\\udf93 Comp\\u00e9tences</div>
          <div class="review-box-content">
            <div class="review-item"><span class="review-item-label">Th\\u00e9matiques</span><span class="review-item-value">\${d.thematiques.length} s\\u00e9lectionn\\u00e9e(s)</span></div>
            <div class="review-item"><span class="review-item-label">Tarif individuel</span><span class="review-item-value">\${d.tarif_horaire_individuel ? d.tarif_horaire_individuel + ' \\u20ac/h' : '-'}</span></div>
            <div class="review-item"><span class="review-item-label">Tarif collectif</span><span class="review-item-value">\${d.tarif_horaire_collectif ? d.tarif_horaire_collectif + ' \\u20ac/h' : '-'}</span></div>
            <div class="review-item"><span class="review-item-label">Exp\\u00e9rience</span><span class="review-item-value">\${d.experience_annees} an(s)</span></div>
          </div>
        </div>
        <div class="review-box">
          <div class="review-box-title">\\ud83d\\udcc1 Documents</div>
          <div class="review-box-content">
            <div class="review-item"><span class="review-item-label">T\\u00e9l\\u00e9vers\\u00e9s</span><span class="review-item-value">\${nbDocs}/7</span></div>
            <div class="review-item"><span class="review-item-label">SIRET</span><span class="review-item-value">\${escapeH(d.siret || '-')}</span></div>
            <div class="review-item"><span class="review-item-label">IBAN</span><span class="review-item-value">\${d.iban ? escapeH(d.iban.slice(0,4)) + ' \\u2022\\u2022\\u2022\\u2022 ' + escapeH(d.iban.slice(-4)) : '-'}</span></div>
          </div>
        </div>
        <div class="review-box">
          <div class="review-box-title">\\u2705 Validation</div>
          <div class="review-box-content" style="text-align:center;color:var(--gray-400)">
            <p style="margin-bottom:8px">Signez et acceptez les CGV pour finaliser</p>
            <span style="font-size:32px;animation:float 3s ease-in-out infinite;display:inline-block">\\u270d\\ufe0f</span>
          </div>
        </div>
      \`;
      document.getElementById('review-summary').innerHTML = html;
    }

    // ====== SUBMIT ======
    async function submitOnboarding() {
      if (!formateurId) {
        alert('Erreur: veuillez compl\\u00e9ter l\\'\\u00e9tape 1 d\\'abord');
        return;
      }

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Soumission en cours\\u2026';

      try {
        // Save step 4 data (CGV + signature)
        const canvas = document.getElementById('signature-canvas');
        const signatureData = canvas.toDataURL('image/png');

        // Upload signature
        const signatureBlob = await (await fetch(signatureData)).blob();
        const formData = new FormData();
        formData.append('file', signatureBlob, 'signature.png');
        formData.append('doc_type', 'signature_url');
        await fetch('/api/onboarding/' + formateurId + '/documents', {
          method: 'POST',
          body: formData
        });

        // Update step 4
        await fetch('/api/onboarding/' + formateurId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 4 })
        });

        // Submit
        const res = await fetch('/api/onboarding/' + formateurId + '/submit', {
          method: 'POST'
        });

        if (res.ok) {
          // Clear localStorage
          localStorage.removeItem('onboarding_data');
          localStorage.removeItem('onboarding_id');

          // Show thank you
          document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
          document.getElementById('step-thankyou').classList.add('active');

          // Update progress to all completed
          for (let i = 1; i <= 4; i++) {
            document.getElementById('progress-' + i).classList.add('completed');
            document.getElementById('progress-' + i).classList.remove('active');
          }
        } else {
          const data = await res.json();
          alert('Erreur: ' + (data.error || 'Erreur lors de la soumission'));
          btn.disabled = false;
          btn.innerHTML = '\\ud83d\\ude80 Soumettre ma candidature';
        }
      } catch (e) {
        alert('Erreur de connexion. Veuillez r\\u00e9essayer.');
        btn.disabled = false;
        btn.innerHTML = '\\ud83d\\ude80 Soumettre ma candidature';
      }
    }

    // ====== AUTOSAVE INDICATOR ======
    function showAutosave(state) {
      const el = document.getElementById('autosave-indicator');
      el.className = 'autosave-indicator show ' + state;
      el.textContent = state === 'saving' ? '\\u23f3 Sauvegarde\\u2026' : '\\u2705 Sauvegard\\u00e9';
      setTimeout(() => { el.classList.remove('show'); }, 2000);
    }
  </script>
</body>
</html>`;
}
