# Soutien Scolaire Caplogy - Guide Developpement

## Stack technique
- **Runtime** : Cloudflare Workers (TypeScript)
- **Database** : Cloudflare D1 (SQLite distribue)
- **Storage** : Cloudflare R2 (documents, photos, PDFs)
- **IA** : Cloudflare Workers AI (OCR, matching)
- **Paiements** : Stripe (a integrer)

## Architecture
- UN SEUL WORKER (`soutien-scolaire-admin`) qui sert tout : pages publiques + admin SSR
- Pattern identique a `caplogy-prospector-v2` : sidebar HTML server-side rendered
- Pas de framework frontend (React, Vue, etc.) - tout est HTML genere cote serveur
- JavaScript vanilla inline pour l'interactivite (formulaires, modales, toggles)

## Conventions de code
- TypeScript strict
- Fonctions de rendu HTML dans `src/pages/*.ts`
- Logique API dans `src/api/*.ts`
- Utilitaires partages dans `shared/*.ts`
- Router principal dans `src/index.ts` (switch path + method)
- Nommage francais pour les variables metier (formateur, eleve, cours, facture)
- Nommage anglais pour le code technique (request, response, handler)

## Design System
- Couleurs du Prospector v2 : `--primary: #0d3865`, `--secondary: #6dcbdd`, `--primary-dark: #092847`
- Font : Inter
- Sidebar fixe 260px avec gradient bleu fonce
- Cards avec border-radius 12px et box-shadow subtil
- Responsive : hamburger menu mobile a 768px

## Structure des pages admin
Chaque page admin suit ce pattern :
```typescript
export function renderMyPage(data: MyData, userName: string): string {
  return htmlPage({
    title: 'Mon titre',
    activePage: 'my-key',
    extraCss: MY_PAGE_CSS,
    content: `<!-- contenu HTML -->`,
    userName
  });
}
```

## Base de donnees
- Schema complet dans `migrations/0001_schema.sql`
- Catalogue (domaines, thematiques) dans `migrations/0002_seed_catalogue.sql`
- Toujours utiliser des transactions pour les operations multi-tables
- IDs generes avec `lower(hex(randomblob(16)))`

## Facturation
- Mentions SAP obligatoires sur chaque facture (voir PLAN.md)
- Numerotation sequentielle FAC-AAAA-NNNN
- "TVA non applicable, art. 293 B du CGI"
- Attestation fiscale annuelle avant le 31 mars N+1

## Fichiers de reference (autres projets)
- `caplogy-prospector-v2/shared/html-utils.ts` → sidebar + layout
- `site-factory/recruitment/src/index.js` → onboarding formateur 4 etapes
- `caplogy-prospector-v2/workers/crm/crm-clients-page.ts` → page listing avec filtres
