/**
 * Soutien Scolaire Caplogy - API Onboarding Formateur
 * Handlers pour l'inscription publique des formateurs (4 etapes)
 */

import type { Env } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';

// ============================================================================
// TYPES
// ============================================================================

interface RegisterBody {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  ville: string;
  code_postal?: string;
  rayon_km?: number;
}

interface Step2Body {
  bio?: string;
  experience_annees?: number;
  tarif_horaire_individuel?: number;
  tarif_horaire_collectif?: number;
  accepte_domicile?: number;
  accepte_collectif?: number;
  accepte_visio?: number;
  lieu_collectif?: string;
  thematiques?: string[];  // array of thematique_ids
}

interface Step3Body {
  iban?: string;
  siret?: string;
}

interface CatalogueNode {
  id: string;
  nom: string;
  icone?: string;
  sous_domaines: Array<{
    id: string;
    nom: string;
    thematiques: Array<{
      id: string;
      nom: string;
      description?: string;
    }>;
  }>;
}

// ============================================================================
// REGISTER FORMATEUR (Step 1 - Create draft)
// ============================================================================

export async function registerFormateur(env: Env, request: Request): Promise<Response> {
  let body: RegisterBody;
  try {
    body = await request.json() as RegisterBody;
  } catch {
    return errorResponse('Corps de requete JSON invalide');
  }

  // Validation
  if (!body.prenom?.trim() || !body.nom?.trim() || !body.email?.trim() || !body.ville?.trim()) {
    return errorResponse('Les champs prenom, nom, email et ville sont obligatoires');
  }

  // Check email uniqueness
  const existing = await env.DB.prepare(
    'SELECT id FROM formateurs WHERE email = ?'
  ).bind(body.email.trim().toLowerCase()).first<{ id: string }>();

  if (existing) {
    return errorResponse('Un formateur avec cet email existe deja', 409);
  }

  const id = generateId();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const r2Folder = `formateurs/${year}/${month}/formateur_${id}`;

  await env.DB.prepare(`
    INSERT INTO formateurs (id, nom, prenom, email, telephone, ville, code_postal, rayon_km, r2_folder, onboarding_step, application_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'draft', datetime('now'), datetime('now'))
  `).bind(
    id,
    body.nom.trim(),
    body.prenom.trim(),
    body.email.trim().toLowerCase(),
    body.telephone?.trim() || null,
    body.ville.trim(),
    body.code_postal?.trim() || null,
    body.rayon_km || 10,
    r2Folder
  ).run();

  return jsonResponse({ success: true, id, r2_folder: r2Folder }, 201);
}

// ============================================================================
// UPDATE ONBOARDING (per step)
// ============================================================================

export async function updateOnboarding(
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

  const step = body.step as number;
  if (!step || ![1, 2, 3, 4].includes(step)) {
    return errorResponse('Etape invalide (1-4)');
  }

  // Verify formateur exists
  const formateur = await env.DB.prepare(
    'SELECT id, application_status, r2_folder FROM formateurs WHERE id = ?'
  ).bind(id).first<{ id: string; application_status: string; r2_folder: string }>();

  if (!formateur) {
    return errorResponse('Formateur non trouve', 404);
  }

  if (formateur.application_status !== 'draft') {
    return errorResponse('Le dossier a deja ete soumis et ne peut plus etre modifie');
  }

  if (step === 1) {
    // Update personal info
    const updates: string[] = [];
    const params: any[] = [];
    const fields: Array<[string, any]> = [
      ['nom', body.nom],
      ['prenom', body.prenom],
      ['email', body.email],
      ['telephone', body.telephone],
      ['ville', body.ville],
      ['code_postal', body.code_postal],
      ['rayon_km', body.rayon_km],
    ];

    for (const [field, value] of fields) {
      if (value !== undefined) {
        updates.push(`${field} = ?`);
        params.push(typeof value === 'string' ? value.trim() : value);
      }
    }

    if (updates.length > 0) {
      updates.push("onboarding_step = MAX(onboarding_step, 2)");
      updates.push("updated_at = datetime('now')");
      params.push(id);
      await env.DB.prepare(
        `UPDATE formateurs SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...params).run();
    }
  }

  if (step === 2) {
    const data = body as Step2Body;
    const updates: string[] = [];
    const params: any[] = [];
    const fields: Array<[string, any]> = [
      ['bio', data.bio],
      ['experience_annees', data.experience_annees],
      ['tarif_horaire_individuel', data.tarif_horaire_individuel],
      ['tarif_horaire_collectif', data.tarif_horaire_collectif],
      ['accepte_domicile', data.accepte_domicile],
      ['accepte_collectif', data.accepte_collectif],
      ['accepte_visio', data.accepte_visio],
      ['lieu_collectif', data.lieu_collectif],
    ];

    for (const [field, value] of fields) {
      if (value !== undefined) {
        updates.push(`${field} = ?`);
        params.push(typeof value === 'string' ? value.trim() : value);
      }
    }

    if (updates.length > 0) {
      updates.push("onboarding_step = MAX(onboarding_step, 3)");
      updates.push("updated_at = datetime('now')");
      params.push(id);
      await env.DB.prepare(
        `UPDATE formateurs SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...params).run();
    }

    // Update thematiques if provided
    if (data.thematiques && Array.isArray(data.thematiques)) {
      // Delete existing
      await env.DB.prepare('DELETE FROM formateur_thematiques WHERE formateur_id = ?').bind(id).run();

      // Insert new ones
      for (const thId of data.thematiques) {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO formateur_thematiques (formateur_id, thematique_id) VALUES (?, ?)'
        ).bind(id, thId).run();
      }
    }
  }

  if (step === 3) {
    const data = body as Step3Body;
    const updates: string[] = [];
    const params: any[] = [];

    if (data.iban !== undefined) {
      updates.push('iban = ?');
      params.push(data.iban.trim().replace(/\s/g, ''));
    }
    if (data.siret !== undefined) {
      updates.push('siret = ?');
      params.push(data.siret.trim().replace(/\s/g, ''));
    }

    updates.push("onboarding_step = MAX(onboarding_step, 4)");
    updates.push("updated_at = datetime('now')");
    params.push(id);

    await env.DB.prepare(
      `UPDATE formateurs SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();
  }

  if (step === 4) {
    // CGV acceptance + signature
    const updates: string[] = [
      "cgv_acceptees = 1",
      "date_signature = datetime('now')",
      "updated_at = datetime('now')",
    ];
    const params: any[] = [id];

    await env.DB.prepare(
      `UPDATE formateurs SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();
  }

  return jsonResponse({ success: true, step });
}

// ============================================================================
// UPLOAD DOCUMENT (to R2)
// ============================================================================

export async function uploadDocument(
  env: Env,
  id: string,
  request: Request
): Promise<Response> {
  // Verify formateur exists
  const formateur = await env.DB.prepare(
    'SELECT id, r2_folder FROM formateurs WHERE id = ?'
  ).bind(id).first<{ id: string; r2_folder: string }>();

  if (!formateur) {
    return errorResponse('Formateur non trouve', 404);
  }

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const docType = formData.get('doc_type') as string | null;

  if (!file) {
    return errorResponse('Aucun fichier fourni');
  }

  const validDocTypes = [
    'doc_identite_url', 'doc_diplomes_url', 'doc_siret_url',
    'doc_urssaf_url', 'doc_casier_url', 'doc_rib_url', 'doc_cv_url', 'photo_url', 'signature_url'
  ];

  if (!docType || !validDocTypes.includes(docType)) {
    return errorResponse(`Type de document invalide. Types valides: ${validDocTypes.join(', ')}`);
  }

  // Get file extension
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const r2Key = `${formateur.r2_folder}/${docType.replace('_url', '')}.${ext}`;

  // Upload to R2
  const arrayBuffer = await file.arrayBuffer();
  await env.R2.put(r2Key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
    customMetadata: {
      formateurId: id,
      docType,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Update the formateur record with the R2 URL
  const publicUrl = r2Key; // In production, prefix with CDN URL

  await env.DB.prepare(
    `UPDATE formateurs SET ${docType} = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(publicUrl, id).run();

  return jsonResponse({ success: true, key: r2Key, url: publicUrl });
}

// ============================================================================
// SUBMIT ONBOARDING (change status to en_attente)
// ============================================================================

export async function submitOnboarding(env: Env, id: string): Promise<Response> {
  const formateur = await env.DB.prepare(
    'SELECT id, application_status, onboarding_step, nom, prenom, email, ville, cgv_acceptees FROM formateurs WHERE id = ?'
  ).bind(id).first<{
    id: string;
    application_status: string;
    onboarding_step: number;
    nom: string;
    prenom: string;
    email: string;
    ville: string;
    cgv_acceptees: number;
  }>();

  if (!formateur) {
    return errorResponse('Formateur non trouve', 404);
  }

  if (formateur.application_status !== 'draft') {
    return errorResponse('Le dossier a deja ete soumis');
  }

  // Validate minimum requirements
  const errors: string[] = [];
  if (!formateur.nom || !formateur.prenom) errors.push('Nom et prenom requis');
  if (!formateur.email) errors.push('Email requis');
  if (!formateur.ville) errors.push('Ville requise');
  if (!formateur.cgv_acceptees) errors.push('CGV non acceptees');

  if (errors.length > 0) {
    return errorResponse(`Dossier incomplet: ${errors.join(', ')}`, 422);
  }

  await env.DB.prepare(`
    UPDATE formateurs SET
      application_status = 'en_attente',
      onboarding_step = 4,
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(id).run();

  return jsonResponse({ success: true, status: 'en_attente' });
}

// ============================================================================
// GET ONBOARDING STATE
// ============================================================================

export async function getOnboardingState(env: Env, id: string): Promise<Response> {
  const formateur = await env.DB.prepare(`
    SELECT f.id, f.nom, f.prenom, f.email, f.telephone, f.ville, f.code_postal,
           f.rayon_km, f.photo_url, f.bio, f.experience_annees,
           f.tarif_horaire_individuel, f.tarif_horaire_collectif,
           f.accepte_domicile, f.accepte_collectif, f.accepte_visio,
           f.lieu_collectif, f.iban, f.siret,
           f.doc_identite_url, f.doc_diplomes_url, f.doc_siret_url,
           f.doc_urssaf_url, f.doc_casier_url, f.doc_rib_url, f.doc_cv_url,
           f.signature_url, f.cgv_acceptees, f.onboarding_step,
           f.application_status, f.r2_folder
    FROM formateurs f
    WHERE f.id = ?
  `).bind(id).first();

  if (!formateur) {
    return errorResponse('Formateur non trouve', 404);
  }

  // Get selected thematiques
  const thematiquesResult = await env.DB.prepare(`
    SELECT ft.thematique_id
    FROM formateur_thematiques ft
    WHERE ft.formateur_id = ?
  `).bind(id).all<{ thematique_id: string }>();

  const thematiques = (thematiquesResult.results || []).map(r => r.thematique_id);

  return jsonResponse({ ...formateur, thematiques });
}

// ============================================================================
// GET CATALOGUE TREE (domaines > sous-domaines > thematiques)
// ============================================================================

export async function getCatalogueTree(env: Env): Promise<Response> {
  // Get all domaines
  const domaines = await env.DB.prepare(
    'SELECT id, nom, icone FROM domaines WHERE actif = 1 ORDER BY ordre'
  ).all<{ id: string; nom: string; icone: string }>();

  // Get all sous-domaines
  const sousDomaines = await env.DB.prepare(
    'SELECT id, domaine_id, nom FROM sous_domaines WHERE actif = 1 ORDER BY ordre'
  ).all<{ id: string; domaine_id: string; nom: string }>();

  // Get all thematiques
  const thematiques = await env.DB.prepare(
    'SELECT id, sous_domaine_id, nom, description FROM thematiques WHERE actif = 1 ORDER BY ordre'
  ).all<{ id: string; sous_domaine_id: string; nom: string; description: string }>();

  // Build tree
  const tree: CatalogueNode[] = (domaines.results || []).map(d => {
    const sds = (sousDomaines.results || []).filter(sd => sd.domaine_id === d.id);
    return {
      id: d.id,
      nom: d.nom,
      icone: d.icone,
      sous_domaines: sds.map(sd => {
        const ths = (thematiques.results || []).filter(t => t.sous_domaine_id === sd.id);
        return {
          id: sd.id,
          nom: sd.nom,
          thematiques: ths.map(t => ({
            id: t.id,
            nom: t.nom,
            description: t.description,
          })),
        };
      }),
    };
  });

  return jsonResponse({ tree });
}
