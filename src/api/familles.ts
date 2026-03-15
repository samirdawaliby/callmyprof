/**
 * Soutien Scolaire Caplogy - API Familles & Eleves
 * Handlers pour la gestion des familles et enfants (admin)
 */

import type { Env, Parent, Eleve, ProfilSpecifique } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';

// ============================================================================
// TYPES
// ============================================================================

interface FamilleRow extends Parent {
  nb_enfants: number;
  packages_actifs: number;
  total_depense: number;
}

export interface FamilleListResult {
  familles: FamilleRow[];
  total: number;
  page: number;
  limit: number;
  stats: {
    total: number;
    total_enfants: number;
    packages_actifs: number;
    urssaf_actifs: number;
  };
}

export interface FamilleDetailResult {
  parent: Parent;
  enfants: Array<Eleve & {
    thematiques_list?: string;
  }>;
  packages: Array<{
    id: string;
    package_nom: string;
    type_cours: string;
    heures_total: number;
    heures_utilisees: number;
    heures_restantes: number;
    montant_paye: number;
    date_achat: string;
    date_expiration: string;
    statut: string;
    eleve_prenom: string;
  }>;
  cours: Array<{
    id: string;
    date_cours: string;
    heure_debut: string;
    duree_minutes: number;
    thematique_nom: string;
    formateur_nom: string;
    type_cours: string;
    statut: string;
    eleve_prenom: string;
  }>;
  factures: Array<{
    id: string;
    reference: string;
    date_emission: string;
    montant_brut: number;
    reste_a_charge: number;
    statut: string;
    type: string;
  }>;
}

// ============================================================================
// GET FAMILLES (list with filters, pagination, aggregates)
// ============================================================================

export async function getFamilles(env: Env, url: URL): Promise<FamilleListResult> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const search = url.searchParams.get('search')?.trim() || '';
  const ville = url.searchParams.get('ville')?.trim() || '';

  // Build WHERE clauses
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push("(p.nom LIKE ? OR p.prenom LIKE ? OR p.email LIKE ?)");
    const searchLike = `%${search}%`;
    params.push(searchLike, searchLike, searchLike);
  }

  if (ville) {
    conditions.push("p.ville LIKE ?");
    params.push(`%${ville}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM parents p ${whereClause}`;
  const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get familles with aggregates
  const dataQuery = `
    SELECT p.*,
      (SELECT COUNT(*) FROM eleves e WHERE e.parent_id = p.id) as nb_enfants,
      (SELECT COUNT(*) FROM packages_achetes pa WHERE pa.parent_id = p.id AND pa.statut = 'actif') as packages_actifs,
      COALESCE((SELECT SUM(pa.montant_paye) FROM packages_achetes pa WHERE pa.parent_id = p.id), 0) as total_depense
    FROM parents p
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const dataParams = [...params, limit, offset];
  const dataResult = await env.DB.prepare(dataQuery).bind(...dataParams).all<FamilleRow>();
  const familles = dataResult.results || [];

  // Get stats
  const statsQuery = `
    SELECT
      (SELECT COUNT(*) FROM parents) as total,
      (SELECT COUNT(*) FROM eleves) as total_enfants,
      (SELECT COUNT(*) FROM packages_achetes WHERE statut = 'actif') as packages_actifs,
      (SELECT COUNT(*) FROM parents WHERE urssaf_compte_actif = 1) as urssaf_actifs
  `;
  const statsResult = await env.DB.prepare(statsQuery).first<{
    total: number; total_enfants: number; packages_actifs: number; urssaf_actifs: number;
  }>();

  return {
    familles,
    total,
    page,
    limit,
    stats: {
      total: statsResult?.total || 0,
      total_enfants: statsResult?.total_enfants || 0,
      packages_actifs: statsResult?.packages_actifs || 0,
      urssaf_actifs: statsResult?.urssaf_actifs || 0,
    },
  };
}

// ============================================================================
// GET FAMILLE (detail with enfants, packages, cours, factures)
// ============================================================================

export async function getFamille(env: Env, id: string): Promise<FamilleDetailResult | null> {
  // Main parent
  const parent = await env.DB.prepare('SELECT * FROM parents WHERE id = ?')
    .bind(id).first<Parent>();

  if (!parent) return null;

  // Enfants with thematiques
  const enfantsResult = await env.DB.prepare(`
    SELECT e.*,
      GROUP_CONCAT(DISTINCT t.nom) as thematiques_list
    FROM eleves e
    LEFT JOIN eleve_thematiques et ON et.eleve_id = e.id
    LEFT JOIN thematiques t ON t.id = et.thematique_id
    WHERE e.parent_id = ?
    GROUP BY e.id
    ORDER BY e.created_at ASC
  `).bind(id).all();

  // Packages
  const packagesResult = await env.DB.prepare(`
    SELECT pa.id, pa.heures_total, pa.heures_utilisees, pa.heures_restantes,
           pa.montant_paye, pa.date_achat, pa.date_expiration, pa.statut,
           pt.nom as package_nom, pt.type_cours,
           e.prenom as eleve_prenom
    FROM packages_achetes pa
    JOIN package_types pt ON pt.id = pa.package_type_id
    JOIN eleves e ON e.id = pa.eleve_id
    WHERE pa.parent_id = ?
    ORDER BY pa.date_achat DESC
  `).bind(id).all();

  // Recent courses
  const coursResult = await env.DB.prepare(`
    SELECT c.id, c.date_cours, c.heure_debut, c.duree_minutes, c.type_cours, c.statut,
           t.nom as thematique_nom,
           f.prenom || ' ' || f.nom as formateur_nom,
           e.prenom as eleve_prenom
    FROM cours c
    JOIN cours_eleves ce ON ce.cours_id = c.id
    JOIN eleves e ON e.id = ce.eleve_id
    JOIN thematiques t ON t.id = c.thematique_id
    JOIN formateurs f ON f.id = c.formateur_id
    WHERE e.parent_id = ?
    ORDER BY c.date_cours DESC
    LIMIT 20
  `).bind(id).all();

  // Factures
  const facturesResult = await env.DB.prepare(`
    SELECT id, reference, date_emission, montant_brut, reste_a_charge, statut, type
    FROM factures
    WHERE parent_id = ?
    ORDER BY date_emission DESC
    LIMIT 20
  `).bind(id).all();

  return {
    parent,
    enfants: (enfantsResult.results || []) as unknown as FamilleDetailResult['enfants'],
    packages: (packagesResult.results || []) as unknown as FamilleDetailResult['packages'],
    cours: (coursResult.results || []) as unknown as FamilleDetailResult['cours'],
    factures: (facturesResult.results || []) as unknown as FamilleDetailResult['factures'],
  };
}

// ============================================================================
// CREATE FAMILLE (parent + enfants in transaction)
// ============================================================================

export async function createFamille(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      nom: string;
      prenom: string;
      email: string;
      telephone?: string;
      adresse?: string;
      ville: string;
      code_postal: string;
      enfants: Array<{
        prenom: string;
        nom?: string;
        niveau?: string;
        profil_specifique?: ProfilSpecifique;
      }>;
    };

    // Validation
    if (!body.nom || !body.prenom || !body.email || !body.ville || !body.code_postal) {
      return errorResponse('Champs obligatoires manquants: nom, prenom, email, ville, code_postal');
    }

    if (!body.enfants || body.enfants.length === 0) {
      return errorResponse('Au moins un enfant est requis');
    }

    for (const enfant of body.enfants) {
      if (!enfant.prenom) {
        return errorResponse('Le prenom de chaque enfant est requis');
      }
    }

    const parentId = generateId();

    // Build batch statements
    const statements: D1PreparedStatement[] = [];

    // Insert parent
    statements.push(
      env.DB.prepare(`
        INSERT INTO parents (id, nom, prenom, email, telephone, adresse, ville, code_postal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        parentId, body.nom, body.prenom, body.email,
        body.telephone || null, body.adresse || null,
        body.ville, body.code_postal
      )
    );

    // Insert enfants
    const enfantIds: string[] = [];
    for (const enfant of body.enfants) {
      const enfantId = generateId();
      enfantIds.push(enfantId);
      statements.push(
        env.DB.prepare(`
          INSERT INTO eleves (id, parent_id, prenom, nom, niveau, profil_specifique)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          enfantId, parentId, enfant.prenom, enfant.nom || null,
          enfant.niveau || null, enfant.profil_specifique || 'standard'
        )
      );
    }

    // Execute batch
    await env.DB.batch(statements);

    return jsonResponse({
      success: true,
      parentId,
      enfantIds,
    }, 201);

  } catch (error) {
    console.error('Error creating famille:', error);
    return errorResponse('Erreur lors de la creation de la famille', 500);
  }
}

// ============================================================================
// CREATE ENFANT (add child to existing family)
// ============================================================================

export async function createEnfant(env: Env, familleId: string, request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      prenom: string;
      nom?: string;
      niveau?: string;
      profil_specifique?: ProfilSpecifique;
    };

    if (!body.prenom) {
      return errorResponse('Le prenom est requis');
    }

    // Verify parent exists
    const parent = await env.DB.prepare('SELECT id FROM parents WHERE id = ?')
      .bind(familleId).first<{ id: string }>();

    if (!parent) {
      return errorResponse('Famille non trouvee', 404);
    }

    const enfantId = generateId();

    await env.DB.prepare(`
      INSERT INTO eleves (id, parent_id, prenom, nom, niveau, profil_specifique)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      enfantId, familleId, body.prenom, body.nom || null,
      body.niveau || null, body.profil_specifique || 'standard'
    ).run();

    return jsonResponse({ success: true, enfantId }, 201);

  } catch (error) {
    console.error('Error creating enfant:', error);
    return errorResponse('Erreur lors de l\'ajout de l\'enfant', 500);
  }
}
