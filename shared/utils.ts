/**
 * Soutien Scolaire Caplogy - Utilitaires generaux
 * Helpers pour ID, slug, pagination, responses HTTP, formatage
 */

// ============================================================================
// ID & SLUG
// ============================================================================

/**
 * Genere un identifiant unique (UUID v4)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Convertit un texte en slug URL-safe
 * "Cours de Mathématiques" -> "cours-de-mathematiques"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retire les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // Retire caracteres speciaux
    .replace(/[\s_]+/g, '-')         // Remplace espaces par tirets
    .replace(/-+/g, '-')             // Retire tirets doubles
    .replace(/^-|-$/g, '');          // Retire tirets debut/fin
}

// ============================================================================
// HTTP RESPONSES
// ============================================================================

/**
 * Retourne une Response JSON
 */
export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * Retourne une Response HTML
 */
export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * Retourne une redirection HTTP 302
 */
export function redirectResponse(url: string, cookie?: string): Response {
  const headers: Record<string, string> = { Location: url };
  if (cookie) {
    headers['Set-Cookie'] = cookie;
  }
  return new Response(null, {
    status: 302,
    headers,
  });
}

/**
 * Retourne une erreur JSON
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// ============================================================================
// FORM PARSING
// ============================================================================

/**
 * Parse les donnees FormData d'une requete POST en objet cle-valeur
 */
export async function parseFormData(request: Request): Promise<Record<string, string>> {
  const formData = await request.formData();
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Formate un nombre au format francais avec espaces comme separateur de milliers
 * 1234567 -> "1 234 567"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR');
}

/**
 * Tronque une chaine avec ellipsis si elle depasse la longueur max
 */
export function truncate(str: string, len: number): string {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len).trimEnd() + '\u2026';
}

/**
 * Formate une duree en minutes en texte lisible
 * 90 -> "1h30", 60 -> "1h", 45 -> "45min"
 */
export function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

/**
 * Capitalise la premiere lettre d'une chaine
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Genere le HTML de pagination avec fleches et numeros
 */
export function paginationHTML(
  page: number,
  total: number,
  limit: number,
  baseUrl: string
): string {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return '';

  // Determine le separateur URL (? ou &)
  const sep = baseUrl.includes('?') ? '&' : '?';

  const pages: string[] = [];

  // Fleche precedent
  if (page > 1) {
    pages.push(`<a href="${baseUrl}${sep}page=${page - 1}" class="pagination-btn pagination-arrow">&laquo; Pr\u{00E9}c\u{00E9}dent</a>`);
  } else {
    pages.push(`<span class="pagination-btn pagination-arrow disabled">&laquo; Pr\u{00E9}c\u{00E9}dent</span>`);
  }

  // Numeros de pages
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  if (startPage > 1) {
    pages.push(`<a href="${baseUrl}${sep}page=1" class="pagination-btn">1</a>`);
    if (startPage > 2) {
      pages.push(`<span class="pagination-ellipsis">\u2026</span>`);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    if (i === page) {
      pages.push(`<span class="pagination-btn pagination-active">${i}</span>`);
    } else {
      pages.push(`<a href="${baseUrl}${sep}page=${i}" class="pagination-btn">${i}</a>`);
    }
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(`<span class="pagination-ellipsis">\u2026</span>`);
    }
    pages.push(`<a href="${baseUrl}${sep}page=${totalPages}" class="pagination-btn">${totalPages}</a>`);
  }

  // Fleche suivant
  if (page < totalPages) {
    pages.push(`<a href="${baseUrl}${sep}page=${page + 1}" class="pagination-btn pagination-arrow">Suivant &raquo;</a>`);
  } else {
    pages.push(`<span class="pagination-btn pagination-arrow disabled">Suivant &raquo;</span>`);
  }

  // Info
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return `
    <div class="pagination-wrapper">
      <div class="pagination-info">
        ${from}-${to} sur ${total} r\u{00E9}sultats
      </div>
      <div class="pagination">
        ${pages.join('\n        ')}
      </div>
    </div>
    <style>
      .pagination-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        padding: 16px 0;
        flex-wrap: wrap;
        gap: 12px;
        animation: fadeIn 0.3s ease both;
      }
      .pagination-info {
        font-size: 13px;
        color: var(--gray-500);
        font-weight: 500;
      }
      .pagination {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .pagination-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
        padding: 0 10px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--gray-600);
        background: var(--white);
        border: 1px solid var(--gray-200);
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .pagination-btn:hover:not(.disabled):not(.pagination-active) {
        background: var(--gray-50);
        border-color: var(--secondary);
        color: var(--primary);
        transform: translateY(-1px);
      }
      .pagination-btn.pagination-active {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
        color: var(--white);
        border-color: var(--primary);
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(13,56,101,0.25);
      }
      .pagination-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .pagination-arrow {
        font-size: 12px;
        padding: 0 14px;
      }
      .pagination-ellipsis {
        padding: 0 6px;
        color: var(--gray-400);
        font-size: 14px;
      }
      @media (max-width: 600px) {
        .pagination-wrapper {
          flex-direction: column;
          align-items: center;
        }
      }
    </style>`;
}

// ============================================================================
// STAR RATING HTML
// ============================================================================

/**
 * Genere le HTML d'un affichage etoiles
 */
export function starsHTML(note: number, max = 5): string {
  let html = '<span class="stars">';
  for (let i = 1; i <= max; i++) {
    html += i <= note ? '\u2605' : '<span class="empty">\u2605</span>';
  }
  html += '</span>';
  return html;
}
