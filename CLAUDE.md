# Soutien Scolaire Caplogy - Guide Developpement

## Stack technique
- **Runtime** : Cloudflare Workers (TypeScript)
- **Database** : Cloudflare D1 (SQLite distribue)
- **Storage** : Cloudflare R2 (documents, photos, PDFs)
- **IA** : Cloudflare Workers AI (OCR, matching)
- **Paiements** : Checkout.com (cartes Visa/MC/Amex/Apple Pay) + PayPal

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

## Paiements (Checkout.com + PayPal)

### Architecture
- **Gateway adapters** : `src/api/payment-gateways/` — factory pattern with `PaymentAdapter` interface
  - `checkout.ts` — Checkout.com Frames (inline card form) + REST API for payment processing
  - `paypal.ts` — PayPal Orders API v2, OAuth2 auth, redirect checkout
  - `index.ts` — `getPaymentAdapter('checkout' | 'paypal', env)` factory
- **Payment page** : `src/pages/payment-checkout.ts` — SSR page with embedded Checkout.com Frames (Stripe-like inline card fields) + PayPal button below
- **DB migration** : `migrations/0008_payment_gateways.sql`

### Routes (public, no auth)
| Route | Method | Description |
|-------|--------|-------------|
| `/pay/:type/:id` | GET | Payment selection page (type = `package` or `payment`) |
| `/api/payment/create-session` | POST | Creates PayPal redirect session |
| `/api/payment/process-card` | POST | Processes Checkout.com Frames card token |
| `/api/webhooks/checkout` | POST | Checkout.com webhook |
| `/api/webhooks/paypal` | POST | PayPal webhook |
| `/payment/success` | GET | Success page |
| `/payment/cancelled` | GET | Cancelled page |

### Environment secrets (Cloudflare Workers secrets)
- `CHECKOUT_SECRET_KEY` — Checkout.com secret API key
- `CHECKOUT_WEBHOOK_SECRET` — Checkout.com webhook HMAC secret
- `PAYPAL_CLIENT_ID` — PayPal REST app client ID
- `PAYPAL_SECRET` — PayPal REST app secret

### Environment vars (wrangler.toml)
- `CHECKOUT_PUBLIC_KEY` — Checkout.com public key (used in Frames JS on client)
- `PAYPAL_SANDBOX` — "true" for sandbox mode

### Payment flow
1. Admin creates package for student → gets `payment_url` (`/pay/package/{id}`)
2. Share URL with parent
3. Parent sees inline card form (Checkout.com Frames) or PayPal button
4. Card: Frames tokenizes → `/api/payment/process-card` charges via Checkout.com API (with 3DS support)
5. PayPal: `/api/payment/create-session` creates order → redirect to PayPal → webhook confirms
6. Webhooks update `payments` or `packages_achetes` tables

### Test cards (Checkout.com sandbox)
- Visa: `4242 4242 4242 4242`, Expiry: any future, CVV: `100`
- Mastercard: `5436 0310 3060 6378`, CVV: `257`
- 3DS test: `4543 4740 0224 9996`, CVV: `956`

## Fichiers de reference (autres projets)
- `caplogy-prospector-v2/shared/html-utils.ts` → sidebar + layout
- `site-factory/recruitment/src/index.js` → onboarding formateur 4 etapes
- `caplogy-prospector-v2/workers/crm/crm-clients-page.ts` → page listing avec filtres
