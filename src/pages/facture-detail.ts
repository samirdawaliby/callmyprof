/**
 * Soutien Scolaire Caplogy - Page Admin: Detail Facture
 * Affichage complet d'une facture SAP-compliant avec actions admin
 */

import type { Env } from '../../shared/types';
import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { formatPrix } from '../../shared/pricing';
import { getFacture } from '../api/factures';

// ============================================================================
// CSS SPECIFIQUE
// ============================================================================

const PAGE_CSS = `
  /* ---- Invoice container ---- */
  .invoice-wrapper {
    max-width: 900px;
    margin: 0 auto;
    animation: slideUp 0.5s ease both;
  }

  /* ---- Breadcrumb ---- */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--gray-400);
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease both;
  }
  .breadcrumb a {
    color: var(--gray-500);
    text-decoration: none;
    transition: color var(--transition-fast);
  }
  .breadcrumb a:hover {
    color: var(--primary);
  }
  .breadcrumb .separator {
    color: var(--gray-300);
  }
  .breadcrumb .current {
    color: var(--gray-700);
    font-weight: 600;
  }

  /* ---- Invoice header ---- */
  .invoice-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: var(--white);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: 36px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    animation: slideDown 0.4s ease both;
    position: relative;
    overflow: hidden;
  }
  .invoice-header::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(109, 203, 221, 0.08);
    animation: float 6s ease-in-out infinite;
  }
  .invoice-header .company-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .invoice-header .company-details {
    font-size: 13px;
    opacity: 0.7;
    line-height: 1.6;
  }
  .invoice-header .sap-badge {
    margin-top: 10px;
    font-size: 12px;
    padding: 6px 14px;
    background: rgba(255,255,255,0.12);
    border-radius: 6px;
    display: inline-block;
  }
  .invoice-header .ref-block {
    text-align: right;
    position: relative;
    z-index: 1;
  }
  .invoice-header .ref-type {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -1px;
  }
  .invoice-header .ref-number {
    font-size: 18px;
    font-weight: 600;
    margin-top: 4px;
    color: var(--secondary);
  }

  /* ---- Invoice body ---- */
  .invoice-body {
    background: var(--white);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  /* ---- Info row ---- */
  .info-row {
    padding: 30px 40px;
    display: flex;
    justify-content: space-between;
    gap: 30px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--gray-100);
    animation: fadeIn 0.4s ease both;
    animation-delay: 0.15s;
  }
  .info-block .info-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--gray-400);
    margin-bottom: 8px;
  }
  .info-block .info-name {
    font-weight: 700;
    font-size: 16px;
    color: var(--gray-900);
  }
  .info-block .info-detail {
    font-size: 13px;
    color: var(--gray-500);
    margin-top: 4px;
  }

  /* ---- Lines table ---- */
  .invoice-lines {
    padding: 0 40px;
    animation: fadeIn 0.4s ease both;
    animation-delay: 0.2s;
  }
  .invoice-lines table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .invoice-lines thead tr {
    background: var(--gray-50);
  }
  .invoice-lines thead th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-600);
    border-bottom: 2px solid var(--gray-200);
  }
  .invoice-lines tbody td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-700);
  }
  .invoice-lines .line-desc {
    font-weight: 600;
    color: var(--gray-900);
  }
  .invoice-lines .line-meta {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 3px;
  }

  /* ---- Totals ---- */
  .invoice-totals {
    padding: 24px 40px;
    display: flex;
    justify-content: flex-end;
    animation: fadeIn 0.4s ease both;
    animation-delay: 0.25s;
  }
  .totals-box {
    width: 340px;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 14px;
    color: var(--gray-600);
    border-bottom: 1px solid var(--gray-100);
  }
  .total-row .total-amount {
    font-weight: 600;
  }
  .total-row.credit {
    color: var(--success);
  }
  .total-row.final {
    border-top: 3px solid var(--primary);
    border-bottom: none;
    margin-top: 4px;
    padding: 14px 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--primary);
  }
  .total-row.final .total-amount {
    font-weight: 800;
  }

  /* ---- Legal mentions ---- */
  .invoice-legal {
    padding: 24px 40px 36px;
    border-top: 1px solid var(--gray-100);
    margin-top: 12px;
    font-size: 12px;
    color: var(--gray-400);
    line-height: 1.8;
    animation: fadeIn 0.4s ease both;
    animation-delay: 0.3s;
  }
  .invoice-legal .legal-title {
    font-weight: 700;
    color: var(--gray-500);
    margin-bottom: 6px;
  }
  .credit-info-box {
    margin-top: 8px;
    padding: 10px 14px;
    background: var(--success-light);
    border-radius: 6px;
    color: #065f46;
    font-size: 12px;
  }

  /* ---- Avoir banner ---- */
  .avoir-banner {
    margin: 0 40px 0;
    padding: 12px 16px;
    background: var(--danger-light);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: #991b1b;
    animation: slideDown 0.3s ease both;
    animation-delay: 0.1s;
  }

  /* ---- URSSAF banner ---- */
  .urssaf-banner {
    margin: 0 40px 0;
    padding: 12px 16px;
    background: var(--blue-light);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: #1e40af;
    animation: slideDown 0.3s ease both;
    animation-delay: 0.1s;
  }

  /* ---- Action bar ---- */
  .action-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 24px;
    animation: slideUp 0.4s ease both;
    animation-delay: 0.35s;
  }

  /* ---- Footer ---- */
  .invoice-footer {
    background: var(--gray-50);
    padding: 16px 40px;
    text-align: center;
    font-size: 11px;
    color: var(--gray-400);
    border-top: 1px solid var(--gray-100);
  }

  /* ---- Statut badge large ---- */
  .statut-lg {
    padding: 6px 16px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* ---- Print styles ---- */
  @media print {
    .sidebar, .sidebar-toggle, .sidebar-overlay, .action-bar, .breadcrumb { display: none !important; }
    .main-content { margin-left: 0 !important; }
    .invoice-header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .invoice-wrapper { box-shadow: none !important; }
  }
`;

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderFactureDetail(env: Env, factureId: string): Promise<string> {
  const data = await getFacture(env, factureId);

  if (!data) {
    return htmlPage({
      title: 'Facture introuvable',
      activePage: 'factures',
      content: `
        <div class="empty-state">
          <span class="empty-icon">&#128269;</span>
          <div class="empty-title">Facture introuvable</div>
          <div class="empty-text">Cette facture n'existe pas ou a &eacute;t&eacute; supprim&eacute;e.</div>
          <a href="/factures" class="btn btn-primary" style="margin-top: 16px;">&#8592; Retour aux factures</a>
        </div>
      `,
      userName: 'Admin',
    });
  }

  const { facture, lignes, parent, formateurs } = data;
  const isAvoir = facture.type === 'avoir';

  // Build lines HTML
  const lignesHTML = lignes.map(ligne => {
    const formateur = formateurs.find(f => f.id === ligne.intervenant_id);
    const formateurNom = formateur
      ? `${escapeHtml(formateur.prenom)} ${escapeHtml(formateur.nom)}`
      : '-';

    return `
      <tr>
        <td>
          <div class="line-desc">${escapeHtml(ligne.description)}</div>
          <div class="line-meta">
            Intervenant : ${formateurNom}
            ${ligne.intervenant_numero ? ` (${escapeHtml(ligne.intervenant_numero)})` : ''}
          </div>
          ${ligne.date_prestation ? `<div class="line-meta">Date : ${formatDateFr(ligne.date_prestation)}</div>` : ''}
        </td>
        <td style="text-align: center;">${ligne.quantite}h</td>
        <td style="text-align: right;">${formatPrix(Math.abs(ligne.prix_unitaire))}/h</td>
        <td style="text-align: right; font-weight: 600;">
          ${ligne.montant < 0 ? '-' : ''}${formatPrix(Math.abs(ligne.montant))}
        </td>
      </tr>`;
  }).join('');

  // Statut badge
  const statutHtml = makeStatutBadge(facture.statut);

  const content = `
    <div class="invoice-wrapper">

      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a href="/factures">&#128176; Facturation</a>
        <span class="separator">&#8250;</span>
        <span class="current">${escapeHtml(facture.reference)}</span>
      </div>

      <!-- Invoice header -->
      <div class="invoice-header">
        <div>
          <div class="company-name">Soutien Scolaire Caplogy</div>
          <div class="company-details">
            15 rue de la Formation<br>
            75008 Paris<br>
            SIRET : 123 456 789 00012
          </div>
          <div class="sap-badge">
            D&eacute;claration SAP n&deg; SAP/123456789 du 01/01/2026
          </div>
        </div>
        <div class="ref-block">
          <div class="ref-type">${isAvoir ? 'AVOIR' : 'FACTURE'}</div>
          <div class="ref-number">${escapeHtml(facture.reference)}</div>
        </div>
      </div>

      <div class="invoice-body">

        <!-- Client + Date info -->
        <div class="info-row">
          <div class="info-block">
            <div class="info-label">Factur&eacute; &agrave;</div>
            <div class="info-name">${escapeHtml(parent.prenom)} ${escapeHtml(parent.nom)}</div>
            ${parent.adresse ? `<div class="info-detail">${escapeHtml(parent.adresse)}</div>` : ''}
            <div class="info-detail">${escapeHtml(parent.code_postal)} ${escapeHtml(parent.ville)}</div>
            ${parent.email ? `<div class="info-detail">${escapeHtml(parent.email)}</div>` : ''}
          </div>
          <div class="info-block" style="text-align: right;">
            <div style="line-height: 2; font-size: 13px; color: var(--gray-500);">
              <div><strong>Date d'&eacute;mission :</strong> ${formatDateFr(facture.date_emission)}</div>
              ${facture.date_realisation ? `<div><strong>Date de r&eacute;alisation :</strong> ${formatDateFr(facture.date_realisation)}</div>` : ''}
              ${facture.periode_mois ? `<div><strong>P&eacute;riode :</strong> ${escapeHtml(facture.periode_mois)}</div>` : ''}
              <div><strong>Statut :</strong> ${statutHtml}</div>
            </div>
          </div>
        </div>

        ${isAvoir && facture.notes ? `
        <div class="avoir-banner">
          <strong>AVOIR</strong> - ${escapeHtml(facture.notes)}
        </div>` : ''}

        ${facture.avance_immediate ? `
        <div class="urssaf-banner">
          <strong>Avance imm&eacute;diate :</strong> Pr&eacute;l&egrave;vement URSSAF (AICI) - Le montant du cr&eacute;dit d'imp&ocirc;t est directement d&eacute;duit.
        </div>` : ''}

        <!-- Lines table -->
        <div class="invoice-lines">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qt&eacute;</th>
                <th style="text-align: right;">Taux TTC</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${lignesHTML}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="invoice-totals">
          <div class="totals-box">
            <div class="total-row">
              <span>Total brut TTC</span>
              <span class="total-amount">${isAvoir ? '-' : ''}${formatPrix(Math.abs(facture.montant_brut))}</span>
            </div>
            ${facture.eligible_credit_impot ? `
            <div class="total-row credit">
              <span>Cr&eacute;dit d'imp&ocirc;t 50%</span>
              <span class="total-amount">- ${formatPrix(Math.abs(facture.credit_impot))}</span>
            </div>` : ''}
            <div class="total-row final">
              <span>Reste &agrave; charge</span>
              <span class="total-amount">${isAvoir ? '-' : ''}${formatPrix(Math.abs(facture.reste_a_charge))}</span>
            </div>
          </div>
        </div>

        <!-- Legal mentions -->
        <div class="invoice-legal">
          <div class="legal-title">Mentions l&eacute;gales</div>
          <div><strong>TVA non applicable, art. 293 B du CGI</strong></div>
          <div>Organisme de services &agrave; la personne d&eacute;clar&eacute; sous le n&deg; SAP/123456789</div>
          ${facture.mode_paiement ? `<div>R&egrave;glement : ${escapeHtml(facture.mode_paiement)}</div>` : ''}
          ${facture.eligible_credit_impot ? `
          <div class="credit-info-box">
            <strong>Information cr&eacute;dit d'imp&ocirc;t :</strong> Les sommes vers&eacute;es au titre de services &agrave; la personne ouvrent droit &agrave; un cr&eacute;dit d'imp&ocirc;t de 50% (art. 199 sexdecies du CGI).
            Montant ouvrant droit : ${formatPrix(Math.abs(facture.montant_brut))} - Cr&eacute;dit d'imp&ocirc;t : ${formatPrix(Math.abs(facture.credit_impot))}.
          </div>` : ''}
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
          Soutien Scolaire Caplogy - SIRET 123 456 789 00012 - contact@caplogy.com - 01 23 45 67 89
        </div>
      </div>

      <!-- Action bar -->
      <div class="action-bar">
        <button class="btn btn-primary" onclick="window.print()">
          &#128424; Imprimer / PDF
        </button>
        ${facture.statut === 'emise' ? `
        <button class="btn btn-success" onclick="marquerPayee()">
          &#9989; Marquer pay&eacute;e
        </button>` : ''}
        ${facture.statut !== 'avoir' && facture.type !== 'avoir' ? `
        <button class="btn btn-danger" onclick="genererAvoir()">
          &#9888;&#65039; G&eacute;n&eacute;rer avoir
        </button>` : ''}
        <a href="/factures" class="btn btn-outline">
          &#8592; Retour &agrave; la liste
        </a>
      </div>
    </div>
  `;

  return htmlPage({
    title: `Facture ${facture.reference}`,
    activePage: 'factures',
    extraCss: PAGE_CSS,
    content,
    userName: 'Admin',
  }) + `
  <script>
    async function marquerPayee() {
      if (!confirm('Marquer cette facture comme payee ?')) return;
      try {
        const resp = await fetch('/api/factures/${escapeHtml(factureId)}/statut', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: 'payee' })
        });
        if (resp.ok) window.location.reload();
        else {
          const data = await resp.json();
          alert(data.error || 'Erreur');
        }
      } catch(e) { alert('Erreur reseau'); }
    }

    async function genererAvoir() {
      const motif = prompt('Motif de l\\'avoir (optionnel) :');
      if (motif === null) return; // cancelled
      try {
        const resp = await fetch('/api/factures/${escapeHtml(factureId)}/avoir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motif: motif })
        });
        const data = await resp.json();
        if (resp.ok) {
          alert('Avoir ' + data.reference + ' genere !');
          window.location.href = '/factures/' + data.avoir_id;
        } else {
          alert(data.error || 'Erreur');
        }
      } catch(e) { alert('Erreur reseau'); }
    }
  </script>`;
}

// ============================================================================
// HELPERS
// ============================================================================

function makeStatutBadge(statut: string): string {
  const labels: Record<string, string> = {
    'brouillon': 'Brouillon',
    'emise': '\u00C9mise',
    'payee': 'Pay\u00E9e',
    'echec': '\u00C9chec',
    'remboursee': 'Rembours\u00E9e',
    'avoir': 'Avoir',
  };
  return `<span class="badge badge-dot badge-${statut}">${labels[statut] || statut}</span>`;
}
