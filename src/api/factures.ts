/**
 * Soutien Scolaire Caplogy - API Facturation
 * Handlers pour factures, avoirs, attestations fiscales, paiements formateurs
 */

import type { Env, StatutFacture } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import { generateInvoiceNumber } from '../../shared/invoice';
import { TARIFS, calculateCreditImpot } from '../../shared/pricing';

// ============================================================================
// TYPES
// ============================================================================

interface FactureRow {
  id: string;
  parent_id: string;
  reference: string;
  type: string;
  date_emission: string;
  date_realisation: string | null;
  periode_mois: string | null;
  montant_brut: number;
  credit_impot: number;
  reste_a_charge: number;
  numero_sap: string | null;
  eligible_credit_impot: number;
  avance_immediate: number;
  statut: StatutFacture;
  mode_paiement: string | null;
  stripe_payment_id: string | null;
  pdf_url: string | null;
  facture_avoir_ref: string | null;
  notes: string | null;
  created_at: string;
  // Joins
  parent_nom?: string;
  parent_prenom?: string;
  parent_email?: string;
  parent_adresse?: string;
  parent_ville?: string;
  parent_code_postal?: string;
}

interface FactureLigneRow {
  id: string;
  facture_id: string;
  cours_id: string | null;
  description: string;
  intervenant_id: string | null;
  intervenant_numero: string | null;
  date_prestation: string | null;
  quantite: number;
  prix_unitaire: number;
  montant: number;
  // Joins
  formateur_nom?: string;
  formateur_prenom?: string;
}

export interface FacturesListResult {
  factures: FactureRow[];
  total: number;
  page: number;
  limit: number;
  stats: {
    ca_mois: number;
    nb_factures_mois: number;
    total_impaye: number;
    marge_mois: number;
  };
}

export interface FactureDetailResult {
  facture: FactureRow;
  lignes: FactureLigneRow[];
  parent: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    adresse: string | null;
    ville: string;
    code_postal: string;
  };
  formateurs: Array<{
    id: string;
    nom: string;
    prenom: string;
  }>;
}

export interface PaiementsFormateursResult {
  paiements: Array<{
    id: string;
    formateur_id: string;
    formateur_nom: string;
    formateur_prenom: string;
    mois: string;
    montant: number;
    nb_heures: number;
    statut: string;
    date_virement: string | null;
    created_at: string;
  }>;
  total: number;
  page: number;
  limit: number;
  stats: {
    total_du: number;
    total_vire: number;
    nb_formateurs: number;
    nb_en_attente: number;
  };
}

// ============================================================================
// GET FACTURES (list with filters, stats, pagination)
// ============================================================================

export async function getFactures(env: Env, url: URL): Promise<FacturesListResult> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const mois = url.searchParams.get('mois') || '';
  const statut = url.searchParams.get('statut') || '';
  const search = url.searchParams.get('q') || '';

  // Build WHERE clauses
  const conditions: string[] = [];
  const params: any[] = [];

  if (mois) {
    conditions.push("f.periode_mois = ?");
    params.push(mois);
  }
  if (statut) {
    conditions.push("f.statut = ?");
    params.push(statut);
  }
  if (search) {
    conditions.push("(p.nom LIKE ? OR p.prenom LIKE ? OR f.reference LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  // Count total
  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as total
    FROM factures f
    LEFT JOIN parents p ON p.id = f.parent_id
    ${whereClause}
  `).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  // Fetch factures
  const facturesResult = await env.DB.prepare(`
    SELECT
      f.*,
      p.nom as parent_nom,
      p.prenom as parent_prenom,
      p.email as parent_email,
      p.ville as parent_ville,
      p.code_postal as parent_code_postal
    FROM factures f
    LEFT JOIN parents p ON p.id = f.parent_id
    ${whereClause}
    ORDER BY f.date_emission DESC, f.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, limit, offset).all<FactureRow>();
  const factures = facturesResult?.results || [];

  // Stats du mois courant
  const now = new Date();
  const moisCourant = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const statsResult = await env.DB.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN f.periode_mois = ? AND f.statut IN ('emise','payee') THEN f.montant_brut ELSE 0 END), 0) as ca_mois,
      COUNT(CASE WHEN f.periode_mois = ? THEN 1 END) as nb_factures_mois,
      COALESCE(SUM(CASE WHEN f.statut IN ('emise','brouillon') THEN f.reste_a_charge ELSE 0 END), 0) as total_impaye
    FROM factures f
  `).bind(moisCourant, moisCourant).first<{ ca_mois: number; nb_factures_mois: number; total_impaye: number }>();

  // Marge approximation: montant_brut - paiements_formateurs
  const margeResult = await env.DB.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN f.periode_mois = ? AND f.statut IN ('emise','payee') THEN f.montant_brut ELSE 0 END), 0) -
      COALESCE((SELECT SUM(pf.montant) FROM paiements_formateurs pf WHERE pf.mois = ?), 0) as marge_mois
    FROM factures f
  `).bind(moisCourant, moisCourant).first<{ marge_mois: number }>();

  return {
    factures,
    total,
    page,
    limit,
    stats: {
      ca_mois: statsResult?.ca_mois || 0,
      nb_factures_mois: statsResult?.nb_factures_mois || 0,
      total_impaye: statsResult?.total_impaye || 0,
      marge_mois: margeResult?.marge_mois || 0,
    },
  };
}

// ============================================================================
// GET FACTURE DETAIL
// ============================================================================

export async function getFacture(env: Env, factureId: string): Promise<FactureDetailResult | null> {
  // Facture + parent
  const facture = await env.DB.prepare(`
    SELECT
      f.*,
      p.nom as parent_nom,
      p.prenom as parent_prenom,
      p.email as parent_email,
      p.adresse as parent_adresse,
      p.ville as parent_ville,
      p.code_postal as parent_code_postal
    FROM factures f
    LEFT JOIN parents p ON p.id = f.parent_id
    WHERE f.id = ?
  `).bind(factureId).first<FactureRow>();

  if (!facture) return null;

  // Lignes de facture
  const lignesResult = await env.DB.prepare(`
    SELECT
      fl.*,
      fo.nom as formateur_nom,
      fo.prenom as formateur_prenom
    FROM facture_lignes fl
    LEFT JOIN formateurs fo ON fo.id = fl.intervenant_id
    WHERE fl.facture_id = ?
    ORDER BY fl.date_prestation ASC, fl.id ASC
  `).bind(factureId).all<FactureLigneRow>();
  const lignes = lignesResult?.results || [];

  // Parent details
  const parentRow = await env.DB.prepare(`
    SELECT id, nom, prenom, email, telephone, adresse, ville, code_postal
    FROM parents WHERE id = ?
  `).bind(facture.parent_id).first<any>();

  // Formateurs distincts
  const formateurIds = [...new Set(lignes.filter(l => l.intervenant_id).map(l => l.intervenant_id!))];
  const formateurs: Array<{ id: string; nom: string; prenom: string }> = [];
  for (const fId of formateurIds) {
    const f = await env.DB.prepare('SELECT id, nom, prenom FROM formateurs WHERE id = ?').bind(fId).first<any>();
    if (f) formateurs.push(f);
  }

  return {
    facture,
    lignes,
    parent: parentRow || {
      id: facture.parent_id,
      nom: facture.parent_nom || '',
      prenom: facture.parent_prenom || '',
      email: facture.parent_email || '',
      telephone: null,
      adresse: facture.parent_adresse || null,
      ville: facture.parent_ville || '',
      code_postal: facture.parent_code_postal || '',
    },
    formateurs,
  };
}

// ============================================================================
// GENERATE MONTHLY INVOICE
// ============================================================================

export async function generateMonthlyInvoice(env: Env, request: Request): Promise<Response> {
  let body: { parent_id: string; mois: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete invalide');
  }

  const { parent_id, mois } = body;
  if (!parent_id || !mois) {
    return errorResponse('parent_id et mois sont requis');
  }

  // Check parent exists
  const parent = await env.DB.prepare('SELECT * FROM parents WHERE id = ?').bind(parent_id).first<any>();
  if (!parent) {
    return errorResponse('Parent introuvable', 404);
  }

  // Check if invoice already exists for this parent+month
  const existing = await env.DB.prepare(
    'SELECT id FROM factures WHERE parent_id = ? AND periode_mois = ? AND type = ? AND statut != ?'
  ).bind(parent_id, mois, 'mensuelle', 'avoir').first<any>();
  if (existing) {
    return errorResponse('Une facture existe deja pour ce parent et ce mois');
  }

  // Get all terminated courses for this parent in the given month
  // via cours_eleves -> eleves -> parents
  const coursResult = await env.DB.prepare(`
    SELECT
      c.id as cours_id,
      c.formateur_id,
      c.thematique_id,
      c.type_cours,
      c.date_cours,
      c.heure_debut,
      c.duree_minutes,
      c.titre,
      ce.heures_debitees,
      f.nom as formateur_nom,
      f.prenom as formateur_prenom,
      f.tarif_horaire_individuel,
      f.tarif_horaire_collectif,
      t.nom as thematique_nom,
      sd.nom as sous_domaine_nom,
      d.nom as domaine_nom
    FROM cours_eleves ce
    JOIN cours c ON c.id = ce.cours_id
    JOIN eleves e ON e.id = ce.eleve_id
    JOIN formateurs f ON f.id = c.formateur_id
    JOIN thematiques t ON t.id = c.thematique_id
    JOIN sous_domaines sd ON sd.id = t.sous_domaine_id
    JOIN domaines d ON d.id = sd.domaine_id
    WHERE e.parent_id = ?
      AND c.statut = 'termine'
      AND strftime('%Y-%m', c.date_cours) = ?
      AND ce.present = 1
    ORDER BY c.date_cours ASC, c.heure_debut ASC
  `).bind(parent_id, mois).all<any>();

  const coursRows = coursResult?.results || [];

  if (coursRows.length === 0) {
    return errorResponse('Aucun cours termine pour ce parent ce mois-ci');
  }

  // Generate invoice number
  const reference = await generateInvoiceNumber(env.DB);
  const factureId = generateId();

  // Build invoice lines
  let montantBrut = 0;
  let montantEligibleCredit = 0;
  const lignes: Array<{
    id: string;
    facture_id: string;
    cours_id: string;
    description: string;
    intervenant_id: string;
    intervenant_numero: string;
    date_prestation: string;
    quantite: number;
    prix_unitaire: number;
    montant: number;
  }> = [];

  // Assign intervenant numbers
  const formateurNumbers: Record<string, string> = {};
  let intervenantCounter = 1;

  for (const cours of coursRows) {
    if (!formateurNumbers[cours.formateur_id]) {
      formateurNumbers[cours.formateur_id] = `#INT${intervenantCounter.toString().padStart(3, '0')}`;
      intervenantCounter++;
    }

    const heures = cours.heures_debitees || (cours.duree_minutes / 60);
    const tarifHoraire = cours.type_cours === 'individuel'
      ? TARIFS.individuel.tarif_horaire
      : TARIFS.collectif.tarif_horaire_par_eleve;
    const montantLigne = Math.round(heures * tarifHoraire * 100) / 100;

    montantBrut += montantLigne;
    if (cours.type_cours === 'individuel') {
      montantEligibleCredit += montantLigne;
    }

    const description = `${cours.domaine_nom} - ${cours.thematique_nom} (${cours.type_cours === 'individuel' ? 'Individuel' : 'Collectif'})`;

    lignes.push({
      id: generateId(),
      facture_id: factureId,
      cours_id: cours.cours_id,
      description,
      intervenant_id: cours.formateur_id,
      intervenant_numero: formateurNumbers[cours.formateur_id],
      date_prestation: cours.date_cours,
      quantite: heures,
      prix_unitaire: tarifHoraire,
      montant: montantLigne,
    });
  }

  // Calculate credit d'impot
  const creditResult = calculateCreditImpot(montantEligibleCredit, montantEligibleCredit > 0);
  const creditImpot = creditResult.credit;
  const resteACharge = Math.round((montantBrut - creditImpot) * 100) / 100;

  // First course date for date_realisation
  const dateRealisation = coursRows[0]?.date_cours || null;

  // Insert facture
  await env.DB.prepare(`
    INSERT INTO factures (id, parent_id, reference, type, date_emission, date_realisation, periode_mois,
      montant_brut, credit_impot, reste_a_charge, eligible_credit_impot, statut)
    VALUES (?, ?, ?, 'mensuelle', datetime('now'), ?, ?, ?, ?, ?, ?, 'emise')
  `).bind(
    factureId, parent_id, reference, dateRealisation, mois,
    montantBrut, creditImpot, resteACharge,
    montantEligibleCredit > 0 ? 1 : 0
  ).run();

  // Insert lignes
  for (const ligne of lignes) {
    await env.DB.prepare(`
      INSERT INTO facture_lignes (id, facture_id, cours_id, description, intervenant_id, intervenant_numero, date_prestation, quantite, prix_unitaire, montant)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ligne.id, ligne.facture_id, ligne.cours_id, ligne.description,
      ligne.intervenant_id, ligne.intervenant_numero, ligne.date_prestation,
      ligne.quantite, ligne.prix_unitaire, ligne.montant
    ).run();
  }

  return jsonResponse({
    success: true,
    facture_id: factureId,
    reference,
    montant_brut: montantBrut,
    credit_impot: creditImpot,
    reste_a_charge: resteACharge,
    nb_lignes: lignes.length,
  });
}

// ============================================================================
// GENERATE AVOIR (credit note)
// ============================================================================

export async function generateAvoir(env: Env, factureId: string, request: Request): Promise<Response> {
  let body: { motif?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Get original invoice
  const original = await env.DB.prepare('SELECT * FROM factures WHERE id = ?').bind(factureId).first<any>();
  if (!original) {
    return errorResponse('Facture introuvable', 404);
  }

  if (original.statut === 'avoir') {
    return errorResponse('Cette facture est deja un avoir');
  }

  // Generate new number for the avoir
  const reference = await generateInvoiceNumber(env.DB);
  const avoirId = generateId();

  // Create avoir (negative amounts)
  await env.DB.prepare(`
    INSERT INTO factures (id, parent_id, reference, type, date_emission, date_realisation, periode_mois,
      montant_brut, credit_impot, reste_a_charge, eligible_credit_impot, avance_immediate,
      statut, facture_avoir_ref, notes)
    VALUES (?, ?, ?, 'avoir', datetime('now'), ?, ?, ?, ?, ?, ?, ?, 'emise', ?, ?)
  `).bind(
    avoirId,
    original.parent_id,
    reference,
    original.date_realisation,
    original.periode_mois,
    -original.montant_brut,
    -original.credit_impot,
    -original.reste_a_charge,
    original.eligible_credit_impot,
    original.avance_immediate,
    original.reference,
    body.motif || `Avoir sur facture ${original.reference}`
  ).run();

  // Copy lines as negative
  const originalLignes = await env.DB.prepare(
    'SELECT * FROM facture_lignes WHERE facture_id = ?'
  ).bind(factureId).all<any>();

  for (const ligne of (originalLignes?.results || [])) {
    await env.DB.prepare(`
      INSERT INTO facture_lignes (id, facture_id, cours_id, description, intervenant_id, intervenant_numero, date_prestation, quantite, prix_unitaire, montant)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      generateId(), avoirId, ligne.cours_id,
      `[AVOIR] ${ligne.description}`,
      ligne.intervenant_id, ligne.intervenant_numero, ligne.date_prestation,
      -ligne.quantite, ligne.prix_unitaire, -ligne.montant
    ).run();
  }

  // Mark original as "avoir" status
  await env.DB.prepare(
    "UPDATE factures SET statut = 'avoir' WHERE id = ?"
  ).bind(factureId).run();

  return jsonResponse({
    success: true,
    avoir_id: avoirId,
    reference,
    facture_originale: original.reference,
  });
}

// ============================================================================
// UPDATE FACTURE STATUT
// ============================================================================

export async function updateFactureStatut(env: Env, factureId: string, request: Request): Promise<Response> {
  let body: { statut: StatutFacture; mode_paiement?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete invalide');
  }

  const { statut, mode_paiement } = body;
  const validStatuts: StatutFacture[] = ['brouillon', 'emise', 'payee', 'echec', 'remboursee', 'avoir'];
  if (!validStatuts.includes(statut)) {
    return errorResponse('Statut invalide');
  }

  const facture = await env.DB.prepare('SELECT id FROM factures WHERE id = ?').bind(factureId).first();
  if (!facture) {
    return errorResponse('Facture introuvable', 404);
  }

  await env.DB.prepare(`
    UPDATE factures SET statut = ?, mode_paiement = COALESCE(?, mode_paiement) WHERE id = ?
  `).bind(statut, mode_paiement || null, factureId).run();

  return jsonResponse({ success: true, statut });
}

// ============================================================================
// GENERATE ATTESTATION FISCALE
// ============================================================================

export async function generateAttestationFiscale(env: Env, request: Request): Promise<Response> {
  let body: { parent_id: string; annee: number };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete invalide');
  }

  const { parent_id, annee } = body;
  if (!parent_id || !annee) {
    return errorResponse('parent_id et annee sont requis');
  }

  // Check parent
  const parent = await env.DB.prepare('SELECT * FROM parents WHERE id = ?').bind(parent_id).first<any>();
  if (!parent) {
    return errorResponse('Parent introuvable', 404);
  }

  // Sum all paid invoices for this parent in this year
  const facturesResult = await env.DB.prepare(`
    SELECT
      f.id, f.montant_brut, f.credit_impot, f.eligible_credit_impot
    FROM factures f
    WHERE f.parent_id = ?
      AND strftime('%Y', f.date_emission) = ?
      AND f.statut IN ('payee', 'emise')
      AND f.type != 'avoir'
  `).bind(parent_id, annee.toString()).all<any>();

  const factureRows = facturesResult?.results || [];

  if (factureRows.length === 0) {
    return errorResponse('Aucune facture payee pour cette annee');
  }

  // Get all lines with formateur details
  const factureIds = factureRows.map((f: any) => f.id);
  let detailInterventions: any[] = [];

  // Build grouped data by formateur
  const formateurData: Record<string, {
    formateur_nom: string;
    formateur_prenom: string;
    intervenant_numero: string;
    interventions: Array<{
      date: string;
      duree_heures: number;
      montant: number;
      description: string;
    }>;
    total_heures: number;
    total_montant: number;
  }> = {};

  for (const fId of factureIds) {
    const lignesResult = await env.DB.prepare(`
      SELECT
        fl.*,
        fo.nom as formateur_nom,
        fo.prenom as formateur_prenom
      FROM facture_lignes fl
      LEFT JOIN formateurs fo ON fo.id = fl.intervenant_id
      WHERE fl.facture_id = ?
    `).bind(fId).all<any>();

    for (const ligne of (lignesResult?.results || [])) {
      const fmtId = ligne.intervenant_id || 'unknown';
      if (!formateurData[fmtId]) {
        formateurData[fmtId] = {
          formateur_nom: ligne.formateur_nom || 'Inconnu',
          formateur_prenom: ligne.formateur_prenom || '',
          intervenant_numero: ligne.intervenant_numero || '-',
          interventions: [],
          total_heures: 0,
          total_montant: 0,
        };
      }
      formateurData[fmtId].interventions.push({
        date: ligne.date_prestation || '',
        duree_heures: Math.abs(ligne.quantite),
        montant: Math.abs(ligne.montant),
        description: ligne.description,
      });
      formateurData[fmtId].total_heures += Math.abs(ligne.quantite);
      formateurData[fmtId].total_montant += Math.abs(ligne.montant);
    }
  }

  detailInterventions = Object.values(formateurData);

  // Calculate totals
  const montantTotalPaye = factureRows.reduce((s: number, f: any) => s + f.montant_brut, 0);
  const montantCesuPrefinance = 0; // Not yet implemented
  const montantOuvrantDroit = montantTotalPaye - montantCesuPrefinance;
  const creditImpotCalcule = Math.round(montantOuvrantDroit * 0.5 * 100) / 100;

  // Check if attestation already exists
  const existingAttestation = await env.DB.prepare(
    'SELECT id FROM attestations_fiscales WHERE parent_id = ? AND annee = ?'
  ).bind(parent_id, annee).first<any>();

  const attestationId = existingAttestation?.id || generateId();

  if (existingAttestation) {
    // Update existing
    await env.DB.prepare(`
      UPDATE attestations_fiscales
      SET montant_total_paye = ?, montant_cesu_prefinance = ?, montant_ouvrant_droit = ?,
          credit_impot_calcule = ?, detail_interventions = ?, date_generation = datetime('now')
      WHERE id = ?
    `).bind(
      montantTotalPaye, montantCesuPrefinance, montantOuvrantDroit,
      creditImpotCalcule, JSON.stringify(detailInterventions), attestationId
    ).run();
  } else {
    // Insert new
    await env.DB.prepare(`
      INSERT INTO attestations_fiscales (id, parent_id, annee, montant_total_paye, montant_cesu_prefinance,
        montant_ouvrant_droit, credit_impot_calcule, detail_interventions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      attestationId, parent_id, annee, montantTotalPaye, montantCesuPrefinance,
      montantOuvrantDroit, creditImpotCalcule, JSON.stringify(detailInterventions)
    ).run();
  }

  return jsonResponse({
    success: true,
    attestation_id: attestationId,
    annee,
    montant_total_paye: montantTotalPaye,
    montant_ouvrant_droit: montantOuvrantDroit,
    credit_impot_calcule: creditImpotCalcule,
    nb_intervenants: detailInterventions.length,
  });
}

// ============================================================================
// GET PAIEMENTS FORMATEURS
// ============================================================================

export async function getPaiementsFormateurs(env: Env, url: URL): Promise<PaiementsFormateursResult> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const now = new Date();
  const moisFilter = url.searchParams.get('mois') || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  // Count total
  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as total FROM paiements_formateurs WHERE mois = ?
  `).bind(moisFilter).first<{ total: number }>();
  const total = countResult?.total || 0;

  // Fetch paiements with formateur info
  const paiementsResult = await env.DB.prepare(`
    SELECT
      pf.*,
      f.nom as formateur_nom,
      f.prenom as formateur_prenom
    FROM paiements_formateurs pf
    JOIN formateurs f ON f.id = pf.formateur_id
    WHERE pf.mois = ?
    ORDER BY f.nom ASC, f.prenom ASC
    LIMIT ? OFFSET ?
  `).bind(moisFilter, limit, offset).all<any>();
  const paiements = paiementsResult?.results || [];

  // Stats
  const statsResult = await env.DB.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN statut = 'en_attente' THEN montant ELSE 0 END), 0) as total_du,
      COALESCE(SUM(CASE WHEN statut = 'vire' THEN montant ELSE 0 END), 0) as total_vire,
      COUNT(DISTINCT formateur_id) as nb_formateurs,
      COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as nb_en_attente
    FROM paiements_formateurs
    WHERE mois = ?
  `).bind(moisFilter).first<any>();

  return {
    paiements,
    total,
    page,
    limit,
    stats: {
      total_du: statsResult?.total_du || 0,
      total_vire: statsResult?.total_vire || 0,
      nb_formateurs: statsResult?.nb_formateurs || 0,
      nb_en_attente: statsResult?.nb_en_attente || 0,
    },
  };
}

// ============================================================================
// GENERATE PAIEMENTS DU MOIS
// ============================================================================

export async function generatePaiementsMois(env: Env, request: Request): Promise<Response> {
  let body: { mois: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete invalide');
  }

  const { mois } = body;
  if (!mois) {
    return errorResponse('Le mois est requis (format YYYY-MM)');
  }

  // Get all terminated courses for the month grouped by formateur
  const coursResult = await env.DB.prepare(`
    SELECT
      c.formateur_id,
      SUM(c.duree_minutes) / 60.0 as total_heures,
      f.tarif_horaire_individuel,
      f.tarif_horaire_collectif,
      c.type_cours,
      COUNT(*) as nb_cours
    FROM cours c
    JOIN formateurs f ON f.id = c.formateur_id
    WHERE c.statut = 'termine'
      AND strftime('%Y-%m', c.date_cours) = ?
    GROUP BY c.formateur_id, c.type_cours
  `).bind(mois).all<any>();

  const coursRows = coursResult?.results || [];
  if (coursRows.length === 0) {
    return errorResponse('Aucun cours termine pour ce mois');
  }

  // Group by formateur
  const formateurTotals: Record<string, { heures: number; montant: number }> = {};
  for (const row of coursRows) {
    if (!formateurTotals[row.formateur_id]) {
      formateurTotals[row.formateur_id] = { heures: 0, montant: 0 };
    }
    const tarif = row.type_cours === 'individuel'
      ? (row.tarif_horaire_individuel || TARIFS.individuel.tarif_formateur)
      : (row.tarif_horaire_collectif || TARIFS.collectif.tarif_formateur_horaire);
    formateurTotals[row.formateur_id].heures += row.total_heures;
    formateurTotals[row.formateur_id].montant += row.total_heures * tarif;
  }

  let created = 0;
  for (const [formateurId, totals] of Object.entries(formateurTotals)) {
    // Check if already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM paiements_formateurs WHERE formateur_id = ? AND mois = ?'
    ).bind(formateurId, mois).first();
    if (existing) continue;

    await env.DB.prepare(`
      INSERT INTO paiements_formateurs (id, formateur_id, mois, montant, nb_heures, statut)
      VALUES (?, ?, ?, ?, ?, 'en_attente')
    `).bind(generateId(), formateurId, mois, Math.round(totals.montant * 100) / 100, totals.heures).run();
    created++;
  }

  return jsonResponse({
    success: true,
    nb_paiements_crees: created,
    nb_formateurs: Object.keys(formateurTotals).length,
  });
}

// ============================================================================
// MARK PAIEMENT AS VIRE
// ============================================================================

export async function marquerPaiementVire(env: Env, paiementId: string, request: Request): Promise<Response> {
  const paiement = await env.DB.prepare('SELECT id FROM paiements_formateurs WHERE id = ?').bind(paiementId).first();
  if (!paiement) {
    return errorResponse('Paiement introuvable', 404);
  }

  await env.DB.prepare(`
    UPDATE paiements_formateurs SET statut = 'vire', date_virement = datetime('now') WHERE id = ?
  `).bind(paiementId).run();

  return jsonResponse({ success: true });
}
