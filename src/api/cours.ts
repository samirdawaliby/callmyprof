/**
 * Soutien Scolaire Caplogy - API Cours
 * Handlers pour la gestion des cours et du planning (admin)
 */

import type { Env, StatutCours, TypeCours } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';

// ============================================================================
// TYPES
// ============================================================================

interface CoursRow {
  id: string;
  formateur_id: string;
  thematique_id: string;
  type_cours: TypeCours;
  titre: string | null;
  description: string | null;
  date_cours: string;
  heure_debut: string;
  duree_minutes: number;
  max_eleves: number;
  lieu: string | null;
  statut: StatutCours;
  notes_formateur: string | null;
  created_at: string;
  // Joins
  formateur_nom?: string;
  formateur_prenom?: string;
  thematique_nom?: string;
  domaine_nom?: string;
  domaine_icone?: string;
  nb_eleves?: number;
}

interface CoursListResult {
  cours: CoursRow[];
  total: number;
  page: number;
  limit: number;
  stats: {
    total: number;
    semaine: number;
    mois: number;
    annules: number;
    total_cours: number;
    individuels: number;
    collectifs: number;
    taux_annulation: number;
  };
  formateurs: Array<{ id: string; nom: string; prenom: string; ville: string }>;
  thematiques: Array<{ id: string; nom: string; domaine_nom: string }>;
}

interface CoursDetailResult {
  cours: CoursRow;
  formateur: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    photo_url: string | null;
    ville: string;
  };
  thematique: {
    id: string;
    nom: string;
    sous_domaine_nom: string;
    domaine_nom: string;
    domaine_icone: string;
  };
  eleves: Array<{
    eleve_id: string;
    eleve_prenom: string;
    eleve_nom: string | null;
    parent_nom: string;
    parent_prenom: string;
    package_id: string | null;
    package_nom: string | null;
    heures_debitees: number;
    present: number;
    notes_progression: string | null;
    niveau: string | null;
    profil_specifique: string;
  }>;
}

// ============================================================================
// GET COURS (list with filters)
// ============================================================================

export async function getCours(env: Env, url: URL): Promise<CoursListResult> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const dateFrom = url.searchParams.get('date_from') || '';
  const dateTo = url.searchParams.get('date_to') || '';
  const formateurId = url.searchParams.get('formateur_id') || '';
  const thematiqueId = url.searchParams.get('thematique_id') || '';
  const typeCours = url.searchParams.get('type_cours') || '';
  const statut = url.searchParams.get('statut') || '';

  // Build WHERE clauses
  const conditions: string[] = [];
  const params: any[] = [];

  if (dateFrom) {
    conditions.push("c.date_cours >= ?");
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push("c.date_cours <= ?");
    params.push(dateTo);
  }

  if (formateurId) {
    conditions.push("c.formateur_id = ?");
    params.push(formateurId);
  }

  if (thematiqueId) {
    conditions.push("c.thematique_id = ?");
    params.push(thematiqueId);
  }

  if (typeCours && ['individuel', 'collectif'].includes(typeCours)) {
    conditions.push("c.type_cours = ?");
    params.push(typeCours);
  }

  if (statut && ['planifie', 'confirme', 'en_cours', 'termine', 'annule'].includes(statut)) {
    conditions.push("c.statut = ?");
    params.push(statut);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM cours c ${whereClause}`;
  const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get cours with joins
  const dataQuery = `
    SELECT c.*,
      f.nom as formateur_nom, f.prenom as formateur_prenom,
      t.nom as thematique_nom,
      d.nom as domaine_nom, d.icone as domaine_icone,
      (SELECT COUNT(*) FROM cours_eleves ce WHERE ce.cours_id = c.id) as nb_eleves
    FROM cours c
    JOIN formateurs f ON f.id = c.formateur_id
    JOIN thematiques t ON t.id = c.thematique_id
    JOIN sous_domaines sd ON sd.id = t.sous_domaine_id
    JOIN domaines d ON d.id = sd.domaine_id
    ${whereClause}
    ORDER BY c.date_cours DESC, c.heure_debut DESC
    LIMIT ? OFFSET ?
  `;
  const dataParams = [...params, limit, offset];
  const dataResult = await env.DB.prepare(dataQuery).bind(...dataParams).all<CoursRow>();
  const cours = dataResult.results || [];

  // Get stats
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const weekStr = startOfWeek.toISOString().split('T')[0];
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const weekEndStr = endOfWeek.toISOString().split('T')[0];
  const monthStr = now.toISOString().slice(0, 7);

  const statsResult = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_cours,
      SUM(CASE WHEN date_cours >= ? AND date_cours <= ? THEN 1 ELSE 0 END) as semaine,
      SUM(CASE WHEN date_cours LIKE ? || '%' THEN 1 ELSE 0 END) as mois,
      SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) as annules,
      SUM(CASE WHEN type_cours = 'individuel' THEN 1 ELSE 0 END) as individuels,
      SUM(CASE WHEN type_cours = 'collectif' THEN 1 ELSE 0 END) as collectifs
    FROM cours
  `).bind(weekStr, weekEndStr, monthStr).first<{
    total_cours: number;
    semaine: number;
    mois: number;
    annules: number;
    individuels: number;
    collectifs: number;
  }>();

  const totalCours = statsResult?.total_cours || 0;
  const annules = statsResult?.annules || 0;
  const tauxAnnulation = totalCours > 0 ? Math.round((annules / totalCours) * 100) : 0;

  // Get formateurs list for filter dropdown
  const formateursResult = await env.DB.prepare(`
    SELECT id, nom, prenom, ville FROM formateurs
    WHERE application_status = 'valide'
    ORDER BY nom, prenom
  `).all<{ id: string; nom: string; prenom: string; ville: string }>();

  // Get thematiques list for filter dropdown
  const thematiquesResult = await env.DB.prepare(`
    SELECT t.id, t.nom, d.nom as domaine_nom
    FROM thematiques t
    JOIN sous_domaines sd ON sd.id = t.sous_domaine_id
    JOIN domaines d ON d.id = sd.domaine_id
    WHERE t.actif = 1
    ORDER BY d.ordre, sd.ordre, t.ordre
  `).all<{ id: string; nom: string; domaine_nom: string }>();

  return {
    cours,
    total,
    page,
    limit,
    stats: {
      total,
      semaine: statsResult?.semaine || 0,
      mois: statsResult?.mois || 0,
      annules,
      total_cours: totalCours,
      individuels: statsResult?.individuels || 0,
      collectifs: statsResult?.collectifs || 0,
      taux_annulation: tauxAnnulation,
    },
    formateurs: formateursResult.results || [],
    thematiques: thematiquesResult.results || [],
  };
}

// ============================================================================
// GET COURS DETAIL
// ============================================================================

export async function getCoursDetail(env: Env, id: string): Promise<CoursDetailResult | null> {
  const cours = await env.DB.prepare('SELECT * FROM cours WHERE id = ?')
    .bind(id).first<CoursRow>();

  if (!cours) return null;

  // Formateur info
  const formateur = await env.DB.prepare(`
    SELECT id, nom, prenom, email, telephone, photo_url, ville
    FROM formateurs WHERE id = ?
  `).bind(cours.formateur_id).first<CoursDetailResult['formateur']>();

  if (!formateur) return null;

  // Thematique info
  const thematique = await env.DB.prepare(`
    SELECT t.id, t.nom,
           sd.nom as sous_domaine_nom,
           d.nom as domaine_nom,
           d.icone as domaine_icone
    FROM thematiques t
    JOIN sous_domaines sd ON sd.id = t.sous_domaine_id
    JOIN domaines d ON d.id = sd.domaine_id
    WHERE t.id = ?
  `).bind(cours.thematique_id).first<CoursDetailResult['thematique']>();

  if (!thematique) return null;

  // Eleves inscrits
  const elevesResult = await env.DB.prepare(`
    SELECT ce.eleve_id, e.prenom as eleve_prenom, e.nom as eleve_nom,
           e.niveau, e.profil_specifique,
           p.nom as parent_nom, p.prenom as parent_prenom,
           ce.package_id, pt.nom as package_nom,
           ce.heures_debitees, ce.present, ce.notes_progression
    FROM cours_eleves ce
    JOIN eleves e ON e.id = ce.eleve_id
    LEFT JOIN parents p ON p.id = e.parent_id
    LEFT JOIN packages_achetes pa ON pa.id = ce.package_id
    LEFT JOIN package_types pt ON pt.id = pa.package_type_id
    WHERE ce.cours_id = ?
    ORDER BY e.prenom
  `).bind(id).all();

  return {
    cours,
    formateur,
    thematique,
    eleves: (elevesResult.results || []) as CoursDetailResult['eleves'],
  };
}

// ============================================================================
// CREATE COURS
// ============================================================================

export async function createCours(env: Env, request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Corps de requete JSON invalide');
  }

  const {
    formateur_id, thematique_id, type_cours, titre, description,
    date_cours, heure_debut, duree_minutes, max_eleves, lieu,
    eleve_ids,
  } = body;

  // Validations
  if (!formateur_id || !thematique_id || !type_cours || !date_cours || !heure_debut) {
    return errorResponse('Champs obligatoires: formateur_id, thematique_id, type_cours, date_cours, heure_debut');
  }

  if (!['individuel', 'collectif'].includes(type_cours)) {
    return errorResponse('type_cours doit etre individuel ou collectif');
  }

  // Verify formateur exists and is validated
  const formateur = await env.DB.prepare(
    "SELECT id FROM formateurs WHERE id = ? AND application_status = 'valide'"
  ).bind(formateur_id).first();

  if (!formateur) {
    return errorResponse('Formateur invalide ou non valide', 404);
  }

  // Verify thematique exists
  const thematique = await env.DB.prepare(
    'SELECT id FROM thematiques WHERE id = ? AND actif = 1'
  ).bind(thematique_id).first();

  if (!thematique) {
    return errorResponse('Thematique invalide', 404);
  }

  const coursId = generateId();
  const duree = parseInt(duree_minutes) || 60;
  const maxEl = type_cours === 'individuel' ? 1 : (parseInt(max_eleves) || 6);

  // Create the cours
  await env.DB.prepare(`
    INSERT INTO cours (id, formateur_id, thematique_id, type_cours, titre, description,
                       date_cours, heure_debut, duree_minutes, max_eleves, lieu, statut)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planifie')
  `).bind(
    coursId, formateur_id, thematique_id, type_cours,
    titre || null, description || null,
    date_cours, heure_debut, duree, maxEl, lieu || null
  ).run();

  // Enroll eleves if provided
  if (Array.isArray(eleve_ids) && eleve_ids.length > 0) {
    const heuresDebitees = duree / 60;
    for (const eleveId of eleve_ids) {
      // Find an active package for the eleve with remaining hours
      const pkg = await env.DB.prepare(`
        SELECT id FROM packages_achetes
        WHERE eleve_id = ? AND statut = 'actif' AND heures_restantes >= ?
        ORDER BY date_expiration ASC
        LIMIT 1
      `).bind(eleveId, heuresDebitees).first<{ id: string }>();

      await env.DB.prepare(`
        INSERT INTO cours_eleves (cours_id, eleve_id, package_id, heures_debitees, present)
        VALUES (?, ?, ?, ?, 1)
      `).bind(coursId, eleveId, pkg?.id || null, heuresDebitees).run();
    }
  }

  return jsonResponse({ success: true, id: coursId }, 201);
}

// ============================================================================
// UPDATE COURS STATUT
// ============================================================================

export async function updateCoursStatut(
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

  const { statut } = body;

  if (!statut || !['planifie', 'confirme', 'en_cours', 'annule'].includes(statut)) {
    return errorResponse('Statut invalide. Valeurs: planifie, confirme, en_cours, annule');
  }

  const existing = await env.DB.prepare('SELECT id, statut FROM cours WHERE id = ?')
    .bind(id).first<{ id: string; statut: string }>();

  if (!existing) {
    return errorResponse('Cours non trouve', 404);
  }

  // Prevent invalid transitions
  if (existing.statut === 'termine') {
    return errorResponse('Un cours termine ne peut pas changer de statut');
  }
  if (existing.statut === 'annule') {
    return errorResponse('Un cours annule ne peut pas changer de statut');
  }

  await env.DB.prepare(
    "UPDATE cours SET statut = ? WHERE id = ?"
  ).bind(statut, id).run();

  return jsonResponse({ success: true, statut });
}

// ============================================================================
// TERMINER COURS (mark as done + debit package hours)
// ============================================================================

export async function terminerCours(
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

  const { notes_formateur, presences } = body;
  // presences: Array<{ eleve_id: string; present: boolean; notes_progression?: string }>

  const cours = await env.DB.prepare('SELECT * FROM cours WHERE id = ?')
    .bind(id).first<CoursRow>();

  if (!cours) {
    return errorResponse('Cours non trouve', 404);
  }

  if (cours.statut === 'termine') {
    return errorResponse('Ce cours est deja termine');
  }
  if (cours.statut === 'annule') {
    return errorResponse('Un cours annule ne peut pas etre termine');
  }

  // Update cours status
  await env.DB.prepare(
    "UPDATE cours SET statut = 'termine', notes_formateur = ? WHERE id = ?"
  ).bind(notes_formateur || cours.notes_formateur || null, id).run();

  // Update presences and debit packages
  if (Array.isArray(presences)) {
    for (const p of presences) {
      const present = p.present ? 1 : 0;

      // Update cours_eleves row
      await env.DB.prepare(`
        UPDATE cours_eleves
        SET present = ?, notes_progression = ?
        WHERE cours_id = ? AND eleve_id = ?
      `).bind(present, p.notes_progression || null, id, p.eleve_id).run();

      // Debit package hours if present
      if (present) {
        const ce = await env.DB.prepare(`
          SELECT package_id, heures_debitees FROM cours_eleves
          WHERE cours_id = ? AND eleve_id = ?
        `).bind(id, p.eleve_id).first<{ package_id: string | null; heures_debitees: number }>();

        if (ce?.package_id) {
          await env.DB.prepare(`
            UPDATE packages_achetes
            SET heures_utilisees = heures_utilisees + ?
            WHERE id = ? AND statut = 'actif'
          `).bind(ce.heures_debitees, ce.package_id).run();

          // Check if package is now exhausted
          const pkg = await env.DB.prepare(`
            SELECT heures_restantes FROM packages_achetes WHERE id = ?
          `).bind(ce.package_id).first<{ heures_restantes: number }>();

          if (pkg && pkg.heures_restantes <= 0) {
            await env.DB.prepare(
              "UPDATE packages_achetes SET statut = 'epuise' WHERE id = ?"
            ).bind(ce.package_id).run();
          }
        }
      }
    }
  }

  // Update formateur total hours
  await env.DB.prepare(`
    UPDATE formateurs
    SET nb_heures_total = nb_heures_total + ?
    WHERE id = ?
  `).bind(cours.duree_minutes / 60, cours.formateur_id).run();

  return jsonResponse({ success: true });
}

// ============================================================================
// GET DATA FOR COURS FORM (formateurs, thematiques, eleves)
// ============================================================================

export async function getCoursFormData(env: Env) {
  // Validated formateurs
  const formateursResult = await env.DB.prepare(`
    SELECT id, nom, prenom, ville, email
    FROM formateurs
    WHERE application_status = 'valide'
    ORDER BY nom, prenom
  `).all<{ id: string; nom: string; prenom: string; ville: string; email: string }>();

  // Domaines > Sous-domaines > Thematiques
  const domainesResult = await env.DB.prepare(`
    SELECT id, nom, icone FROM domaines WHERE actif = 1 ORDER BY ordre
  `).all();

  const sousDomainesResult = await env.DB.prepare(`
    SELECT id, domaine_id, nom FROM sous_domaines WHERE actif = 1 ORDER BY ordre
  `).all();

  const thematiquesResult = await env.DB.prepare(`
    SELECT id, sous_domaine_id, nom FROM thematiques WHERE actif = 1 ORDER BY ordre
  `).all();

  // Eleves with parent info and package status
  const elevesResult = await env.DB.prepare(`
    SELECT e.id, e.prenom, e.nom, e.niveau, e.profil_specifique,
           p.nom as parent_nom, p.prenom as parent_prenom,
           (SELECT COUNT(*) FROM packages_achetes pa
            WHERE pa.eleve_id = e.id AND pa.statut = 'actif' AND pa.heures_restantes > 0) as packages_actifs
    FROM eleves e
    LEFT JOIN parents p ON p.id = e.parent_id
    ORDER BY e.prenom, e.nom
  `).all();

  return {
    formateurs: formateursResult.results || [],
    domaines: domainesResult.results || [],
    sous_domaines: sousDomainesResult.results || [],
    thematiques: thematiquesResult.results || [],
    eleves: elevesResult.results || [],
  };
}
