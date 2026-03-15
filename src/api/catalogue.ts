/**
 * Soutien Scolaire Caplogy - API Catalogue
 * Handlers pour la gestion de l'arborescence domaines/sous-domaines/thematiques
 */

import type { Env, Domaine, SousDomaine, Thematique } from '../../shared/types';
import { generateId, jsonResponse, errorResponse } from '../../shared/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CatalogueTreeNode {
  domaine: Domaine & { nb_formateurs: number };
  sous_domaines: Array<{
    sous_domaine: SousDomaine & { nb_formateurs: number };
    thematiques: Array<Thematique & { nb_formateurs: number }>;
  }>;
}

export interface CatalogueTreeResult {
  tree: CatalogueTreeNode[];
  stats: {
    nb_domaines: number;
    nb_sous_domaines: number;
    nb_thematiques: number;
    nb_formateurs: number;
  };
}

// ============================================================================
// GET CATALOGUE TREE (full tree with formateur counts)
// ============================================================================

export async function getCatalogueTree(env: Env): Promise<CatalogueTreeResult> {
  // Get all domaines
  const domainesResult = await env.DB.prepare(`
    SELECT d.*,
      (SELECT COUNT(DISTINCT ft.formateur_id)
       FROM formateur_thematiques ft
       JOIN thematiques t ON t.id = ft.thematique_id
       JOIN sous_domaines sd ON sd.id = t.sous_domaine_id
       WHERE sd.domaine_id = d.id) as nb_formateurs
    FROM domaines d
    ORDER BY d.ordre, d.nom
  `).all<Domaine & { nb_formateurs: number }>();

  // Get all sous_domaines
  const sousDomainesResult = await env.DB.prepare(`
    SELECT sd.*,
      (SELECT COUNT(DISTINCT ft.formateur_id)
       FROM formateur_thematiques ft
       JOIN thematiques t ON t.id = ft.thematique_id
       WHERE t.sous_domaine_id = sd.id) as nb_formateurs
    FROM sous_domaines sd
    ORDER BY sd.ordre, sd.nom
  `).all<SousDomaine & { nb_formateurs: number }>();

  // Get all thematiques
  const thematiquesResult = await env.DB.prepare(`
    SELECT t.*,
      (SELECT COUNT(DISTINCT ft.formateur_id)
       FROM formateur_thematiques ft
       WHERE ft.thematique_id = t.id) as nb_formateurs
    FROM thematiques t
    ORDER BY t.ordre, t.nom
  `).all<Thematique & { nb_formateurs: number }>();

  const domaines = domainesResult.results || [];
  const sousDomaines = sousDomainesResult.results || [];
  const thematiques = thematiquesResult.results || [];

  // Build tree
  const tree: CatalogueTreeNode[] = domaines.map(d => {
    const sds = sousDomaines.filter(sd => sd.domaine_id === d.id);
    return {
      domaine: d,
      sous_domaines: sds.map(sd => ({
        sous_domaine: sd,
        thematiques: thematiques.filter(t => t.sous_domaine_id === sd.id),
      })),
    };
  });

  // Stats
  const nbFormateurs = await env.DB.prepare(
    'SELECT COUNT(DISTINCT formateur_id) as count FROM formateur_thematiques'
  ).first<{ count: number }>();

  return {
    tree,
    stats: {
      nb_domaines: domaines.length,
      nb_sous_domaines: sousDomaines.length,
      nb_thematiques: thematiques.length,
      nb_formateurs: nbFormateurs?.count || 0,
    },
  };
}

// ============================================================================
// CREATE DOMAINE
// ============================================================================

export async function createDomaine(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json() as { nom: string; icone?: string; description?: string; ordre?: number };

    if (!body.nom) {
      return errorResponse('Le nom du domaine est requis');
    }

    const id = generateId();
    const maxOrdre = await env.DB.prepare('SELECT MAX(ordre) as max_ordre FROM domaines').first<{ max_ordre: number }>();
    const ordre = body.ordre ?? ((maxOrdre?.max_ordre || 0) + 1);

    await env.DB.prepare(`
      INSERT INTO domaines (id, nom, icone, description, ordre, actif)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(id, body.nom, body.icone || null, body.description || null, ordre).run();

    return jsonResponse({ success: true, id }, 201);
  } catch (error) {
    console.error('Error creating domaine:', error);
    return errorResponse('Erreur lors de la creation du domaine', 500);
  }
}

// ============================================================================
// UPDATE DOMAINE
// ============================================================================

export async function updateDomaine(env: Env, id: string, request: Request): Promise<Response> {
  try {
    const body = await request.json() as Partial<Domaine>;

    const existing = await env.DB.prepare('SELECT id FROM domaines WHERE id = ?')
      .bind(id).first<{ id: string }>();

    if (!existing) {
      return errorResponse('Domaine non trouve', 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (body.nom !== undefined) { updates.push('nom = ?'); params.push(body.nom); }
    if (body.icone !== undefined) { updates.push('icone = ?'); params.push(body.icone); }
    if (body.description !== undefined) { updates.push('description = ?'); params.push(body.description); }
    if (body.ordre !== undefined) { updates.push('ordre = ?'); params.push(body.ordre); }

    if (updates.length === 0) {
      return errorResponse('Aucun champ a mettre a jour');
    }

    params.push(id);
    await env.DB.prepare(`UPDATE domaines SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating domaine:', error);
    return errorResponse('Erreur lors de la mise a jour du domaine', 500);
  }
}

// ============================================================================
// DELETE DOMAINE
// ============================================================================

export async function deleteDomaine(env: Env, id: string): Promise<Response> {
  try {
    const existing = await env.DB.prepare('SELECT id FROM domaines WHERE id = ?')
      .bind(id).first<{ id: string }>();

    if (!existing) {
      return errorResponse('Domaine non trouve', 404);
    }

    // Check if there are sous-domaines
    const childCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM sous_domaines WHERE domaine_id = ?'
    ).bind(id).first<{ count: number }>();

    if (childCount && childCount.count > 0) {
      return errorResponse('Impossible de supprimer: ce domaine contient des sous-domaines');
    }

    await env.DB.prepare('DELETE FROM domaines WHERE id = ?').bind(id).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting domaine:', error);
    return errorResponse('Erreur lors de la suppression du domaine', 500);
  }
}

// ============================================================================
// CREATE SOUS-DOMAINE
// ============================================================================

export async function createSousDomaine(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      domaine_id: string; nom: string; icone?: string; description?: string; ordre?: number;
    };

    if (!body.domaine_id || !body.nom) {
      return errorResponse('domaine_id et nom sont requis');
    }

    // Verify domaine exists
    const domaine = await env.DB.prepare('SELECT id FROM domaines WHERE id = ?')
      .bind(body.domaine_id).first<{ id: string }>();
    if (!domaine) {
      return errorResponse('Domaine non trouve', 404);
    }

    const id = generateId();
    const maxOrdre = await env.DB.prepare(
      'SELECT MAX(ordre) as max_ordre FROM sous_domaines WHERE domaine_id = ?'
    ).bind(body.domaine_id).first<{ max_ordre: number }>();
    const ordre = body.ordre ?? ((maxOrdre?.max_ordre || 0) + 1);

    await env.DB.prepare(`
      INSERT INTO sous_domaines (id, domaine_id, nom, icone, description, ordre, actif)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(id, body.domaine_id, body.nom, body.icone || null, body.description || null, ordre).run();

    return jsonResponse({ success: true, id }, 201);
  } catch (error) {
    console.error('Error creating sous-domaine:', error);
    return errorResponse('Erreur lors de la creation du sous-domaine', 500);
  }
}

// ============================================================================
// UPDATE SOUS-DOMAINE
// ============================================================================

export async function updateSousDomaine(env: Env, id: string, request: Request): Promise<Response> {
  try {
    const body = await request.json() as Partial<SousDomaine>;

    const existing = await env.DB.prepare('SELECT id FROM sous_domaines WHERE id = ?')
      .bind(id).first<{ id: string }>();

    if (!existing) {
      return errorResponse('Sous-domaine non trouve', 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (body.nom !== undefined) { updates.push('nom = ?'); params.push(body.nom); }
    if (body.icone !== undefined) { updates.push('icone = ?'); params.push(body.icone); }
    if (body.description !== undefined) { updates.push('description = ?'); params.push(body.description); }
    if (body.ordre !== undefined) { updates.push('ordre = ?'); params.push(body.ordre); }

    if (updates.length === 0) {
      return errorResponse('Aucun champ a mettre a jour');
    }

    params.push(id);
    await env.DB.prepare(`UPDATE sous_domaines SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating sous-domaine:', error);
    return errorResponse('Erreur lors de la mise a jour du sous-domaine', 500);
  }
}

// ============================================================================
// CREATE THEMATIQUE
// ============================================================================

export async function createThematique(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      sous_domaine_id: string; nom: string; description?: string; niveau_min?: string; ordre?: number;
    };

    if (!body.sous_domaine_id || !body.nom) {
      return errorResponse('sous_domaine_id et nom sont requis');
    }

    // Verify sous-domaine exists
    const sd = await env.DB.prepare('SELECT id FROM sous_domaines WHERE id = ?')
      .bind(body.sous_domaine_id).first<{ id: string }>();
    if (!sd) {
      return errorResponse('Sous-domaine non trouve', 404);
    }

    const id = generateId();
    const maxOrdre = await env.DB.prepare(
      'SELECT MAX(ordre) as max_ordre FROM thematiques WHERE sous_domaine_id = ?'
    ).bind(body.sous_domaine_id).first<{ max_ordre: number }>();
    const ordre = body.ordre ?? ((maxOrdre?.max_ordre || 0) + 1);

    await env.DB.prepare(`
      INSERT INTO thematiques (id, sous_domaine_id, nom, description, niveau_min, ordre, actif)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(id, body.sous_domaine_id, body.nom, body.description || null, body.niveau_min || null, ordre).run();

    return jsonResponse({ success: true, id }, 201);
  } catch (error) {
    console.error('Error creating thematique:', error);
    return errorResponse('Erreur lors de la creation de la thematique', 500);
  }
}

// ============================================================================
// UPDATE THEMATIQUE
// ============================================================================

export async function updateThematique(env: Env, id: string, request: Request): Promise<Response> {
  try {
    const body = await request.json() as Partial<Thematique>;

    const existing = await env.DB.prepare('SELECT id FROM thematiques WHERE id = ?')
      .bind(id).first<{ id: string }>();

    if (!existing) {
      return errorResponse('Thematique non trouvee', 404);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (body.nom !== undefined) { updates.push('nom = ?'); params.push(body.nom); }
    if (body.description !== undefined) { updates.push('description = ?'); params.push(body.description); }
    if (body.niveau_min !== undefined) { updates.push('niveau_min = ?'); params.push(body.niveau_min); }
    if (body.ordre !== undefined) { updates.push('ordre = ?'); params.push(body.ordre); }

    if (updates.length === 0) {
      return errorResponse('Aucun champ a mettre a jour');
    }

    params.push(id);
    await env.DB.prepare(`UPDATE thematiques SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating thematique:', error);
    return errorResponse('Erreur lors de la mise a jour de la thematique', 500);
  }
}

// ============================================================================
// TOGGLE ACTIF (domaine, sous-domaine, thematique)
// ============================================================================

export async function toggleActif(env: Env, type: string, id: string): Promise<Response> {
  try {
    let table: string;
    switch (type) {
      case 'domaine':
      case 'domaines':
        table = 'domaines';
        break;
      case 'sous-domaine':
      case 'sous-domaines':
        table = 'sous_domaines';
        break;
      case 'thematique':
      case 'thematiques':
        table = 'thematiques';
        break;
      default:
        return errorResponse('Type invalide. Valeurs acceptees: domaine, sous-domaine, thematique');
    }

    // Get current state
    const current = await env.DB.prepare(`SELECT id, actif FROM ${table} WHERE id = ?`)
      .bind(id).first<{ id: string; actif: number }>();

    if (!current) {
      return errorResponse(`${type} non trouve(e)`, 404);
    }

    const newActif = current.actif === 1 ? 0 : 1;
    await env.DB.prepare(`UPDATE ${table} SET actif = ? WHERE id = ?`)
      .bind(newActif, id).run();

    return jsonResponse({ success: true, actif: newActif });
  } catch (error) {
    console.error('Error toggling actif:', error);
    return errorResponse('Erreur lors du changement de statut', 500);
  }
}
