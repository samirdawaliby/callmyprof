/**
 * Soutien Scolaire Caplogy - Generation Factures & Attestations
 * Numerotation sequentielle, HTML conforme SAP, attestation fiscale
 */

import { escapeHtml, formatDateFr } from './html-utils';
import { formatPrix } from './pricing';
import type { Facture, FactureLigne, Parent, Formateur } from './types';

// ============================================================================
// CONSTANTS SAP
// ============================================================================

const ENTREPRISE = {
  nom: 'Soutien Scolaire Caplogy',
  adresse: '15 rue de la Formation',
  code_postal: '75008',
  ville: 'Paris',
  siret: '123 456 789 00012',
  sap_numero: 'SAP/123456789',
  sap_date_declaration: '01/01/2026',
  email: 'contact@caplogy.com',
  telephone: '01 23 45 67 89',
};

// ============================================================================
// INVOICE NUMBER GENERATION
// ============================================================================

/**
 * Genere le prochain numero de facture sequentiel : "FAC-2026-0001"
 * Utilise la table compteur_factures en D1 pour garantir la sequentialite
 */
export async function generateInvoiceNumber(db: D1Database): Promise<string> {
  const annee = new Date().getFullYear();

  // Upsert : incrementer le compteur ou creer s'il n'existe pas
  await db.prepare(`
    INSERT INTO compteur_factures (annee, dernier_numero)
    VALUES (?, 1)
    ON CONFLICT(annee) DO UPDATE SET dernier_numero = dernier_numero + 1
  `).bind(annee).run();

  // Recuperer le numero courant
  const row = await db.prepare(
    'SELECT dernier_numero FROM compteur_factures WHERE annee = ?'
  ).bind(annee).first<{ dernier_numero: number }>();

  const numero = row?.dernier_numero ?? 1;
  return `FAC-${annee}-${numero.toString().padStart(4, '0')}`;
}

// ============================================================================
// INVOICE HTML GENERATION
// ============================================================================

/**
 * Genere le HTML complet d'une facture avec toutes les mentions obligatoires SAP
 */
export function generateInvoiceHTML(
  facture: Facture,
  lignes: FactureLigne[],
  parent: Parent,
  formateurs: Formateur[]
): string {
  // Table des lignes de facture
  const lignesHTML = lignes.map(ligne => {
    const formateur = formateurs.find(f => f.id === ligne.intervenant_id);
    const formateurNom = formateur
      ? `${escapeHtml(formateur.prenom)} ${escapeHtml(formateur.nom)}`
      : '-';
    const intervenantNum = ligne.intervenant_numero || '-';

    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
          <div style="font-weight: 600; color: #0f172a;">${escapeHtml(ligne.description)}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
            Intervenant : ${formateurNom} (n\u{00B0} ${escapeHtml(intervenantNum)})
          </div>
          ${ligne.date_prestation ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Date : ${formatDateFr(ligne.date_prestation)}</div>` : ''}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center;">${ligne.quantite}h</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatPrix(ligne.prix_unitaire)}/h</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${formatPrix(ligne.montant)}</td>
      </tr>`;
  }).join('');

  // Mention avance immediate URSSAF si applicable
  const mentionUrssaf = facture.avance_immediate
    ? `<div style="margin-top: 12px; padding: 12px 16px; background: #dbeafe; border-radius: 8px; font-size: 13px; color: #1e40af;">
        <strong>Avance imm\u{00E9}diate :</strong> Pr\u{00E9}l\u{00E8}vement URSSAF (AICI) - Le montant du cr\u{00E9}dit d'imp\u{00F4}t est directement d\u{00E9}duit.
      </div>`
    : '';

  // Mention avoir si applicable
  const mentionAvoir = facture.type === 'avoir' && facture.notes
    ? `<div style="margin-top: 12px; padding: 12px 16px; background: #fee2e2; border-radius: 8px; font-size: 13px; color: #991b1b;">
        <strong>AVOIR</strong> - Cette facture annule et remplace la facture ${escapeHtml(facture.notes)}.
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${escapeHtml(facture.reference)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }
    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none !important; }
      .invoice-container { box-shadow: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container" style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">

    <!-- EN-TETE -->
    <div style="background: linear-gradient(135deg, #0d3865 0%, #092847 100%); color: white; padding: 36px 40px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px;">${escapeHtml(ENTREPRISE.nom)}</div>
        <div style="font-size: 13px; opacity: 0.7; line-height: 1.6;">
          ${escapeHtml(ENTREPRISE.adresse)}<br>
          ${escapeHtml(ENTREPRISE.code_postal)} ${escapeHtml(ENTREPRISE.ville)}<br>
          SIRET : ${escapeHtml(ENTREPRISE.siret)}
        </div>
        <div style="margin-top: 10px; font-size: 12px; padding: 6px 14px; background: rgba(255,255,255,0.12); border-radius: 6px; display: inline-block;">
          D\u{00E9}claration SAP n\u{00B0} ${escapeHtml(ENTREPRISE.sap_numero)} du ${escapeHtml(ENTREPRISE.sap_date_declaration)}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 32px; font-weight: 800; letter-spacing: -1px;">
          ${facture.type === 'avoir' ? 'AVOIR' : 'FACTURE'}
        </div>
        <div style="font-size: 18px; font-weight: 600; margin-top: 4px; color: #6dcbdd;">
          ${escapeHtml(facture.reference)}
        </div>
      </div>
    </div>

    <!-- INFOS FACTURE + CLIENT -->
    <div style="padding: 30px 40px; display: flex; justify-content: space-between; gap: 30px; flex-wrap: wrap;">
      <div>
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px;">Factur\u{00E9} \u{00E0}</div>
        <div style="font-weight: 700; font-size: 16px; color: #0f172a;">${escapeHtml(parent.prenom)} ${escapeHtml(parent.nom)}</div>
        ${parent.adresse ? `<div style="font-size: 13px; color: #64748b; margin-top: 4px;">${escapeHtml(parent.adresse)}</div>` : ''}
        <div style="font-size: 13px; color: #64748b;">${escapeHtml(parent.code_postal)} ${escapeHtml(parent.ville)}</div>
        ${parent.email ? `<div style="font-size: 13px; color: #64748b; margin-top: 2px;">${escapeHtml(parent.email)}</div>` : ''}
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; color: #64748b; line-height: 2;">
          <div><strong>Date d'\u{00E9}mission :</strong> ${formatDateFr(facture.date_emission)}</div>
          ${facture.date_realisation ? `<div><strong>Date de r\u{00E9}alisation :</strong> ${formatDateFr(facture.date_realisation)}</div>` : ''}
          ${facture.periode_mois ? `<div><strong>P\u{00E9}riode :</strong> ${escapeHtml(facture.periode_mois)}</div>` : ''}
          <div><strong>Statut :</strong> <span style="padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; ${getStatutStyle(facture.statut)}">${labelStatut(facture.statut)}</span></div>
        </div>
      </div>
    </div>

    <!-- TABLEAU LIGNES -->
    <div style="padding: 0 40px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #e2e8f0;">Description</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #e2e8f0;">Qt\u{00E9}</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #e2e8f0;">Taux TTC</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 2px solid #e2e8f0;">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${lignesHTML}
        </tbody>
      </table>
    </div>

    <!-- TOTAUX -->
    <div style="padding: 24px 40px; display: flex; justify-content: flex-end;">
      <div style="width: 320px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">
          <span>Total brut TTC</span>
          <span style="font-weight: 600;">${formatPrix(facture.montant_brut)}</span>
        </div>
        ${facture.eligible_credit_impot ? `
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #10b981; border-bottom: 1px solid #e2e8f0;">
          <span>Cr\u{00E9}dit d'imp\u{00F4}t 50%</span>
          <span style="font-weight: 600;">- ${formatPrix(facture.credit_impot)}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; padding: 14px 0; font-size: 18px; font-weight: 800; color: #0d3865; border-top: 3px solid #0d3865; margin-top: 4px;">
          <span>Reste \u{00E0} charge</span>
          <span>${formatPrix(facture.reste_a_charge)}</span>
        </div>
      </div>
    </div>

    ${mentionUrssaf}
    ${mentionAvoir}

    <!-- MENTIONS LEGALES -->
    <div style="padding: 24px 40px 36px; border-top: 1px solid #e2e8f0; margin-top: 12px;">
      <div style="font-size: 12px; color: #94a3b8; line-height: 1.8;">
        <div style="font-weight: 700; color: #64748b; margin-bottom: 6px;">Mentions l\u{00E9}gales</div>
        <div><strong>TVA non applicable, art. 293 B du CGI</strong></div>
        <div>Organisme de services \u{00E0} la personne d\u{00E9}clar\u{00E9} sous le n\u{00B0} ${escapeHtml(ENTREPRISE.sap_numero)}</div>
        ${facture.mode_paiement ? `<div>R\u{00E8}glement : ${escapeHtml(facture.mode_paiement)}</div>` : ''}
        ${facture.eligible_credit_impot ? `<div style="margin-top: 8px; padding: 10px 14px; background: #f0fdf4; border-radius: 6px; color: #065f46; font-size: 12px;">
          <strong>Information cr\u{00E9}dit d'imp\u{00F4}t :</strong> Les sommes vers\u{00E9}es au titre de services \u{00E0} la personne ouvrent droit \u{00E0} un cr\u{00E9}dit d'imp\u{00F4}t de 50% (art. 199 sexdecies du CGI). Montant ouvrant droit : ${formatPrix(facture.montant_brut)} - Cr\u{00E9}dit d'imp\u{00F4}t : ${formatPrix(facture.credit_impot)}.
        </div>` : ''}
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background: #f8fafc; padding: 16px 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      ${escapeHtml(ENTREPRISE.nom)} - SIRET ${escapeHtml(ENTREPRISE.siret)} - ${escapeHtml(ENTREPRISE.email)} - ${escapeHtml(ENTREPRISE.telephone)}
    </div>
  </div>

  <!-- BOUTON IMPRIMER (non imprime) -->
  <div class="no-print" style="text-align: center; margin-top: 24px;">
    <button onclick="window.print()" style="
      padding: 12px 28px;
      background: linear-gradient(135deg, #0d3865, #1a4f8a);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: Inter, sans-serif;
      transition: all 0.15s ease;
    ">Imprimer / T\u{00E9}l\u{00E9}charger PDF</button>
  </div>
</body>
</html>`;
}

// ============================================================================
// ATTESTATION FISCALE ANNUELLE
// ============================================================================

export interface AttestationDetail {
  formateur_nom: string;
  formateur_prenom: string;
  intervenant_numero: string;
  interventions: {
    date: string;
    duree_heures: number;
    montant: number;
    description: string;
  }[];
  total_heures: number;
  total_montant: number;
}

/**
 * Genere le HTML de l'attestation fiscale annuelle
 * Document obligatoire a fournir avant le 31 mars N+1
 */
export function generateAttestationHTML(
  parent: Parent,
  annee: number,
  details: AttestationDetail[],
  totaux: {
    montant_total_paye: number;
    montant_cesu_prefinance: number;
    montant_ouvrant_droit: number;
    credit_impot_calcule: number;
  }
): string {
  // Tableau recapitulatif par intervenant
  const intervenantsHTML = details.map(detail => {
    const interventionsRows = detail.interventions.map(i => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${formatDateFr(i.date)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${escapeHtml(i.description)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569; text-align: center;">${i.duree_heures}h</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569; text-align: right;">${formatPrix(i.montant)}</td>
      </tr>`).join('');

    return `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <div style="padding: 4px 12px; background: #dbeafe; border-radius: 6px; font-size: 12px; font-weight: 700; color: #1e40af;">
            ${escapeHtml(detail.intervenant_numero)}
          </div>
          <div style="font-weight: 700; font-size: 15px; color: #0f172a;">
            ${escapeHtml(detail.formateur_prenom)} ${escapeHtml(detail.formateur_nom)}
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0;">Date</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0;">Description</th>
              <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0;">Dur\u{00E9}e</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${interventionsRows}
            <tr style="background: #f1f5f9; font-weight: 700;">
              <td colspan="2" style="padding: 10px 12px; font-size: 13px; color: #334155;">Sous-total ${escapeHtml(detail.formateur_prenom)} ${escapeHtml(detail.formateur_nom)}</td>
              <td style="padding: 10px 12px; font-size: 13px; color: #334155; text-align: center;">${detail.total_heures}h</td>
              <td style="padding: 10px 12px; font-size: 13px; color: #334155; text-align: right;">${formatPrix(detail.total_montant)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attestation fiscale ${annee} - ${escapeHtml(parent.prenom)} ${escapeHtml(parent.nom)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }
    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">

    <!-- EN-TETE -->
    <div style="background: linear-gradient(135deg, #0d3865 0%, #092847 100%); color: white; padding: 36px 40px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px;">${escapeHtml(ENTREPRISE.nom)}</div>
          <div style="font-size: 13px; opacity: 0.7; line-height: 1.6;">
            ${escapeHtml(ENTREPRISE.adresse)}<br>
            ${escapeHtml(ENTREPRISE.code_postal)} ${escapeHtml(ENTREPRISE.ville)}<br>
            SIRET : ${escapeHtml(ENTREPRISE.siret)}
          </div>
          <div style="margin-top: 10px; font-size: 12px; padding: 6px 14px; background: rgba(255,255,255,0.12); border-radius: 6px; display: inline-block;">
            D\u{00E9}claration SAP n\u{00B0} ${escapeHtml(ENTREPRISE.sap_numero)} du ${escapeHtml(ENTREPRISE.sap_date_declaration)}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6;">Attestation fiscale</div>
          <div style="font-size: 42px; font-weight: 800; color: #6dcbdd; letter-spacing: -1px; margin-top: 2px;">${annee}</div>
        </div>
      </div>
    </div>

    <!-- TITRE -->
    <div style="padding: 30px 40px 10px; text-align: center;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0d3865; margin-bottom: 6px;">
        ATTESTATION FISCALE ANNUELLE
      </h1>
      <p style="font-size: 13px; color: #64748b;">
        Article 199 sexdecies du Code G\u{00E9}n\u{00E9}ral des Imp\u{00F4}ts - Ann\u{00E9}e ${annee}
      </p>
    </div>

    <!-- INFO CLIENT -->
    <div style="padding: 20px 40px;">
      <div style="padding: 20px 24px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px;">B\u{00E9}n\u{00E9}ficiaire des prestations</div>
        <div style="font-weight: 700; font-size: 16px; color: #0f172a;">${escapeHtml(parent.prenom)} ${escapeHtml(parent.nom)}</div>
        ${parent.adresse ? `<div style="font-size: 13px; color: #64748b; margin-top: 4px;">${escapeHtml(parent.adresse)}</div>` : ''}
        <div style="font-size: 13px; color: #64748b;">${escapeHtml(parent.code_postal)} ${escapeHtml(parent.ville)}</div>
      </div>
    </div>

    <!-- DETAIL INTERVENTIONS -->
    <div style="padding: 10px 40px 20px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        R\u{00E9}capitulatif des interventions
      </h2>
      ${intervenantsHTML}
    </div>

    <!-- TOTAUX -->
    <div style="padding: 0 40px 24px;">
      <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">R\u{00E9}capitulatif financier ${annee}</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #475569;">
            <span>Total pay\u{00E9} par le client</span>
            <span style="font-weight: 700;">${formatPrix(totaux.montant_total_paye)}</span>
          </div>
          ${totaux.montant_cesu_prefinance > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #475569;">
            <span>Dont CESU pr\u{00E9}financ\u{00E9} (non d\u{00E9}ductible)</span>
            <span style="font-weight: 600; color: #f59e0b;">- ${formatPrix(totaux.montant_cesu_prefinance)}</span>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #0d3865; padding-top: 10px; border-top: 2px solid #cbd5e1;">
            <span style="font-weight: 700;">Montant ouvrant droit au cr\u{00E9}dit d'imp\u{00F4}t</span>
            <span style="font-weight: 800; font-size: 16px;">${formatPrix(totaux.montant_ouvrant_droit)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; color: #065f46;">
            <span style="font-weight: 700;">Cr\u{00E9}dit d'imp\u{00F4}t 50%</span>
            <span style="font-weight: 800; font-size: 18px;">${formatPrix(totaux.credit_impot_calcule)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CERTIFICATION -->
    <div style="padding: 0 40px 30px;">
      <div style="padding: 20px 24px; background: #fffbeb; border-radius: 10px; border: 1px solid #fde68a; font-size: 13px; color: #92400e; line-height: 1.7;">
        <div style="font-weight: 700; margin-bottom: 8px;">Certification</div>
        <p>
          Je soussign\u{00E9}(e), repr\u{00E9}sentant l\u{00E9}gal de <strong>${escapeHtml(ENTREPRISE.nom)}</strong>,
          organisme de services \u{00E0} la personne d\u{00E9}clar\u{00E9} sous le n\u{00B0} <strong>${escapeHtml(ENTREPRISE.sap_numero)}</strong>,
          certifie que les prestations mentionn\u{00E9}es ci-dessus ont \u{00E9}t\u{00E9} effectu\u{00E9}es
          au domicile de <strong>${escapeHtml(parent.prenom)} ${escapeHtml(parent.nom)}</strong>
          au cours de l'ann\u{00E9}e <strong>${annee}</strong> et que le montant total pay\u{00E9}
          par le b\u{00E9}n\u{00E9}ficiaire s'\u{00E9}l\u{00E8}ve \u{00E0} <strong>${formatPrix(totaux.montant_total_paye)}</strong>.
        </p>
        <p style="margin-top: 10px;">
          Cette attestation est d\u{00E9}livr\u{00E9}e pour servir et valoir ce que de droit, notamment
          en vue de l'obtention du cr\u{00E9}dit d'imp\u{00F4}t pr\u{00E9}vu \u{00E0} l'article 199 sexdecies du CGI.
        </p>
      </div>
    </div>

    <!-- DATE ET SIGNATURE -->
    <div style="padding: 0 40px 30px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div style="font-size: 13px; color: #64748b;">
        Fait \u{00E0} ${escapeHtml(ENTREPRISE.ville)}, le ${formatDateFr(new Date().toISOString())}
      </div>
      <div style="text-align: center;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 40px;">Signature et cachet</div>
        <div style="font-size: 13px; font-weight: 600; color: #334155;">${escapeHtml(ENTREPRISE.nom)}</div>
      </div>
    </div>

    <!-- MENTIONS -->
    <div style="padding: 16px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.7;">
      <div><strong>TVA non applicable, art. 293 B du CGI</strong></div>
      <div>${escapeHtml(ENTREPRISE.nom)} - SIRET ${escapeHtml(ENTREPRISE.siret)} - D\u{00E9}claration SAP n\u{00B0} ${escapeHtml(ENTREPRISE.sap_numero)}</div>
    </div>
  </div>

  <!-- BOUTON IMPRIMER -->
  <div class="no-print" style="text-align: center; margin-top: 24px;">
    <button onclick="window.print()" style="
      padding: 12px 28px;
      background: linear-gradient(135deg, #0d3865, #1a4f8a);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: Inter, sans-serif;
    ">Imprimer / T\u{00E9}l\u{00E9}charger PDF</button>
  </div>
</body>
</html>`;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Retourne le style inline CSS pour un badge de statut facture
 */
function getStatutStyle(statut: string): string {
  switch (statut) {
    case 'payee':
      return 'background: #d1fae5; color: #065f46;';
    case 'emise':
      return 'background: #dbeafe; color: #1e40af;';
    case 'brouillon':
      return 'background: #fef3c7; color: #92400e;';
    case 'echec':
    case 'remboursee':
      return 'background: #fee2e2; color: #991b1b;';
    case 'avoir':
      return 'background: #ede9fe; color: #5b21b6;';
    default:
      return 'background: #f1f5f9; color: #475569;';
  }
}

/**
 * Retourne le libelle francais d'un statut facture
 */
function labelStatut(statut: string): string {
  switch (statut) {
    case 'brouillon': return 'Brouillon';
    case 'emise': return '\u{00C9}mise';
    case 'payee': return 'Pay\u{00E9}e';
    case 'echec': return '\u{00C9}chec';
    case 'remboursee': return 'Rembours\u{00E9}e';
    case 'avoir': return 'Avoir';
    default: return statut;
  }
}
