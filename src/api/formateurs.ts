/**
 * Soutien Scolaire Caplogy - API Formateurs
 * Handlers pour la gestion des formateurs (admin)
 */

import type { Env, Formateur, StatutFormateur } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';
import { escapeHtml } from '../../shared/html-utils';

// ============================================================================
// TYPES
// ============================================================================

interface FormateurRow extends Formateur {
  thematiques_list?: string;
}

interface FormateurListResult {
  formateurs: FormateurRow[];
  total: number;
  page: number;
  limit: number;
  stats: {
    total: number;
    valides: number;
    en_attente: number;
    refuses: number;
    suspendus: number;
  };
}

interface FormateurDetailResult {
  formateur: FormateurRow;
  thematiques: Array<{
    thematique_id: string;
    thematique_nom: string;
    sous_domaine_nom: string;
    domaine_nom: string;
    domaine_icone: string;
    niveau_enseigne: string;
  }>;
  documents: Array<{
    key: string;
    label: string;
    url: string | null;
    uploaded: boolean;
  }>;
  cours: Array<{
    id: string;
    date_cours: string;
    heure_debut: string;
    thematique_nom: string;
    type_cours: string;
    nb_eleves: number;
    statut: string;
  }>;
  avis: Array<{
    id: string;
    note: number;
    commentaire: string | null;
    created_at: string;
    eleve_prenom: string;
    eleve_nom: string | null;
  }>;
  paiements: Array<{
    id: string;
    mois: string;
    montant: number;
    nb_heures: number;
    statut: string;
    date_virement: string | null;
  }>;
  validation_history: Array<{
    status: string;
    date: string;
    by: string | null;
  }>;
}

// ============================================================================
// GET FORMATEURS (list with filters)
// ============================================================================

export async function getFormateurs(env: Env, url: URL): Promise<FormateurListResult> {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(10, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const search = url.searchParams.get('search')?.trim() || '';
  const status = url.searchParams.get('status') || '';
  const ville = url.searchParams.get('ville')?.trim() || '';

  // Build WHERE clauses
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push("(f.nom LIKE ? OR f.prenom LIKE ? OR f.email LIKE ?)");
    const searchLike = `%${search}%`;
    params.push(searchLike, searchLike, searchLike);
  }

  if (status && ['draft', 'submitted', 'en_attente', 'valide', 'refuse', 'suspendu'].includes(status)) {
    conditions.push("f.application_status = ?");
    params.push(status);
  }

  if (ville) {
    conditions.push("f.ville LIKE ?");
    params.push(`%${ville}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM formateurs f ${whereClause}`;
  const countResult = await env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get formateurs with thematiques as comma-separated
  const dataQuery = `
    SELECT f.*,
      GROUP_CONCAT(DISTINCT t.nom) as thematiques_list
    FROM formateurs f
    LEFT JOIN formateur_thematiques ft ON ft.formateur_id = f.id
    LEFT JOIN thematiques t ON t.id = ft.thematique_id
    ${whereClause}
    GROUP BY f.id
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const dataParams = [...params, limit, offset];
  const dataResult = await env.DB.prepare(dataQuery).bind(...dataParams).all<FormateurRow>();
  const formateurs = dataResult.results || [];

  // Get stats
  const statsQuery = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN application_status = 'valide' THEN 1 ELSE 0 END) as valides,
      SUM(CASE WHEN application_status IN ('en_attente', 'submitted') THEN 1 ELSE 0 END) as en_attente,
      SUM(CASE WHEN application_status = 'refuse' THEN 1 ELSE 0 END) as refuses,
      SUM(CASE WHEN application_status = 'suspendu' THEN 1 ELSE 0 END) as suspendus
    FROM formateurs
  `;
  const statsResult = await env.DB.prepare(statsQuery).first<{
    total: number; valides: number; en_attente: number; refuses: number; suspendus: number;
  }>();

  return {
    formateurs,
    total,
    page,
    limit,
    stats: {
      total: statsResult?.total || 0,
      valides: statsResult?.valides || 0,
      en_attente: statsResult?.en_attente || 0,
      refuses: statsResult?.refuses || 0,
      suspendus: statsResult?.suspendus || 0,
    },
  };
}

// ============================================================================
// GET FORMATEUR (detail with all joins)
// ============================================================================

export async function getFormateur(env: Env, id: string): Promise<FormateurDetailResult | null> {
  // Main formateur
  const formateur = await env.DB.prepare('SELECT * FROM formateurs WHERE id = ?')
    .bind(id).first<FormateurRow>();

  if (!formateur) return null;

  // Thematiques
  const thematiquesResult = await env.DB.prepare(`
    SELECT ft.thematique_id, ft.niveau_enseigne,
           t.nom as thematique_nom,
           sd.nom as sous_domaine_nom,
           d.nom as domaine_nom,
           d.icone as domaine_icone
    FROM formateur_thematiques ft
    JOIN thematiques t ON t.id = ft.thematique_id
    JOIN sous_domaines sd ON sd.id = t.sous_domaine_id
    JOIN domaines d ON d.id = sd.domaine_id
    WHERE ft.formateur_id = ?
    ORDER BY d.ordre, sd.ordre, t.ordre
  `).bind(id).all();

  // Documents mapping
  const documents = [
    { key: 'doc_identite_url', label: "Pi\u00e8ce d'identit\u00e9", url: formateur.doc_identite_url || null, uploaded: !!formateur.doc_identite_url },
    { key: 'doc_diplomes_url', label: "Dipl\u00f4mes", url: formateur.doc_diplomes_url || null, uploaded: !!formateur.doc_diplomes_url },
    { key: 'doc_casier_url', label: "Casier judiciaire (B3)", url: formateur.doc_casier_url || null, uploaded: !!formateur.doc_casier_url },
    { key: 'doc_rib_url', label: "RIB", url: formateur.doc_rib_url || null, uploaded: !!formateur.doc_rib_url },
    { key: 'doc_cv_url', label: "CV", url: formateur.doc_cv_url || null, uploaded: !!formateur.doc_cv_url },
    { key: 'doc_siret_url', label: "SIRET / Enregistrement", url: formateur.doc_siret_url || null, uploaded: !!formateur.doc_siret_url },
    { key: 'doc_urssaf_url', label: "Attestation URSSAF", url: formateur.doc_urssaf_url || null, uploaded: !!formateur.doc_urssaf_url },
  ];

  // Recent courses
  const coursResult = await env.DB.prepare(`
    SELECT c.id, c.date_cours, c.heure_debut, c.type_cours, c.statut,
           t.nom as thematique_nom,
           (SELECT COUNT(*) FROM cours_eleves ce WHERE ce.cours_id = c.id) as nb_eleves
    FROM cours c
    JOIN thematiques t ON t.id = c.thematique_id
    WHERE c.formateur_id = ?
    ORDER BY c.date_cours DESC
    LIMIT 20
  `).bind(id).all();

  // Avis
  const avisResult = await env.DB.prepare(`
    SELECT a.id, a.note, a.commentaire, a.created_at,
           e.prenom as eleve_prenom, e.nom as eleve_nom
    FROM avis a
    JOIN eleves e ON e.id = a.eleve_id
    WHERE a.formateur_id = ? AND a.visible = 1
    ORDER BY a.created_at DESC
    LIMIT 20
  `).bind(id).all();

  // Paiements
  const paiementsResult = await env.DB.prepare(`
    SELECT id, mois, montant, nb_heures, statut, date_virement
    FROM paiements_formateurs
    WHERE formateur_id = ?
    ORDER BY mois DESC
    LIMIT 12
  `).bind(id).all();

  // Build a simple validation history from existing data
  const validation_history: Array<{ status: string; date: string; by: string | null }> = [];
  if (formateur.created_at) {
    validation_history.push({ status: 'draft', date: formateur.created_at, by: null });
  }
  if (formateur.application_status !== 'draft' && formateur.updated_at) {
    validation_history.push({ status: formateur.application_status, date: formateur.validated_at || formateur.updated_at, by: formateur.validated_by || null });
  }

  return {
    formateur,
    thematiques: (thematiquesResult.results || []) as FormateurDetailResult['thematiques'],
    documents,
    cours: (coursResult.results || []) as FormateurDetailResult['cours'],
    avis: (avisResult.results || []) as FormateurDetailResult['avis'],
    paiements: (paiementsResult.results || []) as FormateurDetailResult['paiements'],
    validation_history,
  };
}

// ============================================================================
// UPDATE FORMATEUR STATUS
// ============================================================================

export async function updateFormateurStatus(
  env: Env,
  id: string,
  request: Request
): Promise<Response> {
  const body = await request.json() as { status: StatutFormateur; admin_notes?: string; validated_by?: string };

  if (!body.status || !['valide', 'refuse', 'suspendu', 'en_attente'].includes(body.status)) {
    return errorResponse('Statut invalide. Valeurs acceptees: valide, refuse, suspendu, en_attente');
  }

  // Verify formateur exists
  const existing = await env.DB.prepare('SELECT id, application_status FROM formateurs WHERE id = ?')
    .bind(id).first<{ id: string; application_status: string }>();

  if (!existing) {
    return errorResponse('Formateur non trouve', 404);
  }

  const updates: string[] = [
    "application_status = ?",
    "updated_at = datetime('now')",
  ];
  const params: any[] = [body.status];

  if (body.status === 'valide' || body.status === 'refuse' || body.status === 'suspendu') {
    updates.push("validated_at = datetime('now')");
    if (body.validated_by) {
      updates.push("validated_by = ?");
      params.push(body.validated_by);
    }
  }

  if (body.admin_notes !== undefined) {
    updates.push("admin_notes = ?");
    params.push(body.admin_notes);
  }

  params.push(id);

  await env.DB.prepare(
    `UPDATE formateurs SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  return jsonResponse({ success: true, status: body.status });
}

// ============================================================================
// UPDATE FORMATEUR (edit info)
// ============================================================================

export async function updateFormateur(
  env: Env,
  id: string,
  request: Request
): Promise<Response> {
  const body = await request.json() as Partial<Formateur>;

  // Verify formateur exists
  const existing = await env.DB.prepare('SELECT id FROM formateurs WHERE id = ?')
    .bind(id).first<{ id: string }>();

  if (!existing) {
    return errorResponse('Formateur non trouve', 404);
  }

  // Build update dynamically - only allow certain fields
  const allowedFields = [
    'nom', 'prenom', 'email', 'telephone', 'ville', 'code_postal',
    'rayon_km', 'bio', 'diplomes', 'experience_annees',
    'tarif_horaire_individuel', 'tarif_horaire_collectif',
    'accepte_domicile', 'accepte_collectif', 'accepte_visio',
    'lieu_collectif', 'admin_notes',
  ];

  const updates: string[] = ["updated_at = datetime('now')"];
  const params: any[] = [];

  for (const field of allowedFields) {
    if ((body as any)[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push((body as any)[field]);
    }
  }

  if (updates.length <= 1) {
    return errorResponse('Aucun champ a mettre a jour');
  }

  params.push(id);

  await env.DB.prepare(
    `UPDATE formateurs SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  return jsonResponse({ success: true });
}

// ============================================================================
// DOWNLOAD DOCUMENT FROM R2
// ============================================================================

const VALID_DOC_KEYS = ['doc_identite_url', 'doc_diplomes_url', 'doc_siret_url', 'doc_urssaf_url', 'doc_casier_url', 'doc_rib_url', 'doc_cv_url', 'photo_url', 'signature_url'];

export async function downloadFormateurDocument(env: Env, formateurId: string, docKey: string): Promise<Response> {
  if (!VALID_DOC_KEYS.includes(docKey)) {
    return errorResponse('Invalid document key', 400);
  }

  const result = await env.DB.prepare(
    `SELECT ${docKey}, r2_folder FROM formateurs WHERE id = ?`
  ).bind(formateurId).first<any>();

  if (!result || !result[docKey]) {
    return errorResponse('Document not found', 404);
  }

  const r2Key = result[docKey];
  const object = await env.R2.get(r2Key);

  if (!object) {
    return errorResponse('File not found in storage', 404);
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Content-Disposition', `inline; filename="${docKey.replace('_url', '')}.${r2Key.split('.').pop()}"`);
  headers.set('Cache-Control', 'private, max-age=3600');

  return new Response(object.body, { headers });
}
