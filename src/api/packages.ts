/**
 * Soutien Scolaire Caplogy - API Packages
 * Handlers pour la gestion des packages (admin)
 */

import type { Env, StatutPackage } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import { calculateCreditImpot } from '../../shared/pricing';

// ============================================================================
// TYPES
// ============================================================================

interface PackageRow {
  id: string;
  parent_id: string | null;
  eleve_id: string;
  package_type_id: string;
  thematiques: string;
  heures_total: number;
  heures_utilisees: number;
  heures_restantes: number;
  montant_paye: number;
  credit_impot: number;
  date_achat: string;
  date_expiration: string;
  statut: StatutPackage;
  stripe_payment_id: string | null;
  created_at: string;
  // Joins
  eleve_prenom?: string;
  eleve_nom?: string;
  parent_nom?: string;
  parent_prenom?: string;
  package_nom?: string;
  package_type_cours?: string;
}

interface PackageTypeRow {
  id: string;
  nom: string;
  type_cours: string;
  nb_heures: number;
  prix: number;
  prix_par_heure: number;
  eligible_credit_impot: number;
  duree_validite_jours: number;
  max_eleves_collectif: number;
  actif: number;
  ordre: number;
}

interface PackagesListResult {
  packages: PackageRow[];
  total: number;
  page: number;
  limit: number;
  stats: {
    total_actifs: number;
    heures_consommees: number;
    heures_restantes: number;
    ca_total: number;
  };
  package_types: PackageTypeRow[];
}

// ============================================================================
// GET PACKAGES (list with filters)
// ============================================================================

export async function getPackages(env: Env, url: URL): Promise<PackagesListResult> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const search = url.searchParams.get('search')?.trim() || '';
  const statut = url.searchParams.get('statut') || '';
  const typeFilter = url.searchParams.get('type') || '';

  // Build WHERE clauses
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push("(e.prenom LIKE ? OR e.nom LIKE ? OR p_parent.nom LIKE ? OR p_parent.prenom LIKE ?)");
    const searchLike = `%${search}%`;
    params.push(searchLike, searchLike, searchLike, searchLike);
  }

  if (statut && ['actif', 'expire', 'epuise', 'rembourse'].includes(statut)) {
    conditions.push("pa.statut = ?");
    params.push(statut);
  }

  if (typeFilter) {
    conditions.push("pa.package_type_id = ?");
    params.push(typeFilter);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as count FROM packages_achetes pa
    JOIN eleves e ON e.id = pa.eleve_id
    LEFT JOIN parents p_parent ON p_parent.id = pa.parent_id
    ${whereClause}
  `;
  const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get packages with joins
  const dataQuery = `
    SELECT pa.*,
      e.prenom as eleve_prenom, e.nom as eleve_nom,
      p_parent.nom as parent_nom, p_parent.prenom as parent_prenom,
      pt.nom as package_nom, pt.type_cours as package_type_cours
    FROM packages_achetes pa
    JOIN eleves e ON e.id = pa.eleve_id
    LEFT JOIN parents p_parent ON p_parent.id = pa.parent_id
    JOIN package_types pt ON pt.id = pa.package_type_id
    ${whereClause}
    ORDER BY pa.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const dataParams = [...params, limit, offset];
  const dataResult = await env.DB.prepare(dataQuery).bind(...dataParams).all<PackageRow>();
  const packages = dataResult.results || [];

  // Get stats
  const statsResult = await env.DB.prepare(`
    SELECT
      SUM(CASE WHEN statut = 'actif' THEN 1 ELSE 0 END) as total_actifs,
      SUM(heures_utilisees) as heures_consommees,
      SUM(CASE WHEN statut = 'actif' THEN heures_restantes ELSE 0 END) as heures_restantes,
      SUM(montant_paye) as ca_total
    FROM packages_achetes
  `).first<{
    total_actifs: number;
    heures_consommees: number;
    heures_restantes: number;
    ca_total: number;
  }>();

  // Get package types
  const typesResult = await env.DB.prepare(`
    SELECT * FROM package_types ORDER BY ordre
  `).all<PackageTypeRow>();

  return {
    packages,
    total,
    page,
    limit,
    stats: {
      total_actifs: statsResult?.total_actifs || 0,
      heures_consommees: statsResult?.heures_consommees || 0,
      heures_restantes: statsResult?.heures_restantes || 0,
      ca_total: statsResult?.ca_total || 0,
    },
    package_types: typesResult.results || [],
  };
}

// ============================================================================
// CREATE PACKAGE (sell to family)
// ============================================================================

export async function createPackage(env: Env, request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete JSON invalide');
  }

  const { eleve_id, package_type_id, thematiques } = body;

  if (!eleve_id || !package_type_id) {
    return errorResponse('Champs obligatoires: eleve_id, package_type_id');
  }

  // Verify eleve exists
  const eleve = await env.DB.prepare('SELECT id, parent_id FROM eleves WHERE id = ?')
    .bind(eleve_id).first<{ id: string; parent_id: string | null }>();

  if (!eleve) {
    return errorResponse('Eleve non trouve', 404);
  }

  // Verify package type exists
  const pkgType = await env.DB.prepare('SELECT * FROM package_types WHERE id = ? AND actif = 1')
    .bind(package_type_id).first<PackageTypeRow>();

  if (!pkgType) {
    return errorResponse('Type de package invalide', 404);
  }

  // Calculate credit impot
  const creditResult = calculateCreditImpot(pkgType.prix, pkgType.eligible_credit_impot === 1);

  // Calculate expiration date
  const now = new Date();
  const expiration = new Date(now);
  expiration.setDate(expiration.getDate() + pkgType.duree_validite_jours);
  const dateExpiration = expiration.toISOString().split('T')[0];

  const packageId = generateId();
  const thematiquesJson = JSON.stringify(thematiques || []);

  // Create the package
  await env.DB.prepare(`
    INSERT INTO packages_achetes (id, parent_id, eleve_id, package_type_id, thematiques,
                                   heures_total, heures_utilisees, montant_paye, credit_impot,
                                   date_expiration, statut)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'actif')
  `).bind(
    packageId,
    eleve.parent_id,
    eleve_id,
    package_type_id,
    thematiquesJson,
    pkgType.nb_heures,
    pkgType.prix,
    creditResult.credit,
    dateExpiration
  ).run();

  // Auto-generate invoice
  const factureId = generateId();

  // Get next invoice number
  const annee = now.getFullYear();
  await env.DB.prepare(`
    INSERT INTO compteur_factures (annee, dernier_numero) VALUES (?, 0)
    ON CONFLICT(annee) DO NOTHING
  `).bind(annee).run();

  await env.DB.prepare(`
    UPDATE compteur_factures SET dernier_numero = dernier_numero + 1 WHERE annee = ?
  `).bind(annee).run();

  const compteur = await env.DB.prepare(
    'SELECT dernier_numero FROM compteur_factures WHERE annee = ?'
  ).bind(annee).first<{ dernier_numero: number }>();

  const numero = compteur?.dernier_numero || 1;
  const reference = `FAC-${annee}-${numero.toString().padStart(4, '0')}`;

  if (eleve.parent_id) {
    await env.DB.prepare(`
      INSERT INTO factures (id, parent_id, reference, type, montant_brut, credit_impot,
                            reste_a_charge, eligible_credit_impot, statut)
      VALUES (?, ?, ?, 'package', ?, ?, ?, ?, 'emise')
    `).bind(
      factureId,
      eleve.parent_id,
      reference,
      pkgType.prix,
      creditResult.credit,
      creditResult.resteACharge,
      pkgType.eligible_credit_impot
    ).run();

    // Create invoice line
    await env.DB.prepare(`
      INSERT INTO facture_lignes (id, facture_id, description, quantite, prix_unitaire, montant)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      generateId(),
      factureId,
      `Package ${pkgType.nom} - ${pkgType.nb_heures}h`,
      1,
      pkgType.prix,
      pkgType.prix
    ).run();
  }

  // Return payment URL so admin can share it with the parent
  const paymentUrl = `/pay/package/${packageId}`;

  return jsonResponse({ success: true, id: packageId, facture_reference: reference, payment_url: paymentUrl }, 201);
}

// ============================================================================
// UPDATE PACKAGE TYPE
// ============================================================================

export async function updatePackageType(
  env: Env,
  id: string,
  request: Request
): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete JSON invalide');
  }

  const existing = await env.DB.prepare('SELECT id FROM package_types WHERE id = ?')
    .bind(id).first();

  if (!existing) {
    return errorResponse('Type de package non trouve', 404);
  }

  const allowedFields = [
    'nom', 'type_cours', 'nb_heures', 'prix', 'prix_par_heure',
    'eligible_credit_impot', 'duree_validite_jours', 'max_eleves_collectif',
    'actif', 'ordre',
  ];

  const updates: string[] = [];
  const params: any[] = [];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(body[field]);
    }
  }

  if (updates.length === 0) {
    return errorResponse('Aucun champ a mettre a jour');
  }

  params.push(id);

  await env.DB.prepare(
    `UPDATE package_types SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  return jsonResponse({ success: true });
}

// ============================================================================
// DEBITER HEURES (manual debit)
// ============================================================================

export async function debiterHeures(
  env: Env,
  packageId: string,
  heures: number
): Promise<Response> {
  if (!heures || heures <= 0) {
    return errorResponse('Le nombre d\'heures doit etre positif');
  }

  const pkg = await env.DB.prepare(
    'SELECT id, heures_restantes, statut FROM packages_achetes WHERE id = ?'
  ).bind(packageId).first<{ id: string; heures_restantes: number; statut: string }>();

  if (!pkg) {
    return errorResponse('Package non trouve', 404);
  }

  if (pkg.statut !== 'actif') {
    return errorResponse('Ce package n\'est pas actif');
  }

  if (pkg.heures_restantes < heures) {
    return errorResponse(`Heures insuffisantes (restant: ${pkg.heures_restantes}h)`);
  }

  await env.DB.prepare(`
    UPDATE packages_achetes SET heures_utilisees = heures_utilisees + ? WHERE id = ?
  `).bind(heures, packageId).run();

  // Check if exhausted
  const updated = await env.DB.prepare(
    'SELECT heures_restantes FROM packages_achetes WHERE id = ?'
  ).bind(packageId).first<{ heures_restantes: number }>();

  if (updated && updated.heures_restantes <= 0) {
    await env.DB.prepare(
      "UPDATE packages_achetes SET statut = 'epuise' WHERE id = ?"
    ).bind(packageId).run();
  }

  return jsonResponse({ success: true });
}

// ============================================================================
// GET DATA FOR PACKAGE SALE FORM
// ============================================================================

export async function getPackageFormData(env: Env) {
  // Eleves with parents
  const elevesResult = await env.DB.prepare(`
    SELECT e.id, e.prenom, e.nom, e.niveau, e.profil_specifique,
           p.id as parent_id, p.nom as parent_nom, p.prenom as parent_prenom
    FROM eleves e
    LEFT JOIN parents p ON p.id = e.parent_id
    ORDER BY p.nom, p.prenom, e.prenom
  `).all();

  // Package types
  const typesResult = await env.DB.prepare(`
    SELECT * FROM package_types WHERE actif = 1 ORDER BY ordre
  `).all<PackageTypeRow>();

  // Catalogue tree
  const domainesResult = await env.DB.prepare(`
    SELECT id, nom, icone FROM domaines WHERE actif = 1 ORDER BY ordre
  `).all();

  const sousDomainesResult = await env.DB.prepare(`
    SELECT id, domaine_id, nom FROM sous_domaines WHERE actif = 1 ORDER BY ordre
  `).all();

  const thematiquesResult = await env.DB.prepare(`
    SELECT id, sous_domaine_id, nom FROM thematiques WHERE actif = 1 ORDER BY ordre
  `).all();

  return {
    eleves: elevesResult.results || [],
    package_types: typesResult.results || [],
    domaines: domainesResult.results || [],
    sous_domaines: sousDomainesResult.results || [],
    thematiques: thematiquesResult.results || [],
  };
}
