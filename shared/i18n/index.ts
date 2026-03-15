import { en } from './en';
import { fr } from './fr';
import { ar } from './ar';

export type Locale = 'en' | 'fr' | 'ar';

const translations: Record<Locale, Record<string, string>> = { en, fr, ar };

/**
 * Translate a key with optional parameter interpolation.
 * Falls back to English, then to the raw key.
 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const value = translations[locale]?.[key] || translations['en'][key] || key;
  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
    value
  );
}

/** Country lists for locale detection */
const FRENCH_COUNTRIES = [
  'FR', 'BE', 'CH', 'CA', 'LU', 'MC', 'SN', 'CI', 'CM', 'ML', 'BF',
  'NE', 'TD', 'CG', 'CD', 'MG', 'GA', 'DJ', 'KM', 'HT', 'RW', 'BI'
];
const ARABIC_COUNTRIES = [
  'LB', 'MA', 'DZ', 'TN', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM',
  'JO', 'IQ', 'SY', 'EG', 'LY', 'SD', 'MR', 'YE', 'PS'
];

/** Parse a cookie value by name */
function parseCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Detect locale from request:
 * 1. ?lang= query param (sets cookie)
 * 2. cmp_lang cookie
 * 3. Cloudflare geo-detection (request.cf.country)
 * 4. Default: 'en'
 */
export function detectLocale(request: Request): Locale {
  const url = new URL(request.url);

  // 1. Query param
  const langParam = url.searchParams.get('lang');
  if (langParam && isValidLocale(langParam)) {
    return langParam as Locale;
  }

  // 2. Cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieLocale = parseCookieValue(cookieHeader, 'cmp_lang');
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 3. Cloudflare geo
  const cf = (request as any).cf;
  const country = cf?.country || '';
  if (FRENCH_COUNTRIES.includes(country)) return 'fr';
  if (ARABIC_COUNTRIES.includes(country)) return 'ar';

  return 'en';
}

function isValidLocale(value: string): boolean {
  return ['en', 'fr', 'ar'].includes(value);
}

/** HTML lang and dir attributes */
export function htmlAttrs(locale: Locale): { lang: string; dir: 'ltr' | 'rtl' } {
  return {
    lang: locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  };
}

/** Set-Cookie header for language preference (1 year) */
export function langCookieHeader(locale: Locale): string {
  return `cmp_lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

/** Get currency symbol based on country or default */
export function getCurrency(country?: string): { code: string; symbol: string } {
  if (!country) return { code: 'USD', symbol: '$' };
  const euroCountries = ['FR', 'BE', 'DE', 'IT', 'ES', 'NL', 'PT', 'AT', 'IE', 'FI', 'LU', 'MC'];
  const gbpCountries = ['GB'];
  if (euroCountries.includes(country)) return { code: 'EUR', symbol: '\u20AC' };
  if (gbpCountries.includes(country)) return { code: 'GBP', symbol: '\u00A3' };
  return { code: 'USD', symbol: '$' };
}
