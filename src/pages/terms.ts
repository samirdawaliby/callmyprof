/**
 * CallMyProf - Terms of Service Page
 */

import { publicPage } from '../../shared/public-layout';
import { type Locale, t } from '../../shared/i18n/index';

export function renderTermsPage(locale: Locale): string {
  return publicPage({
    title: t(locale, 'terms.page_title'),
    heroTitle: t(locale, 'terms.hero_title'),
    heroSubtitle: t(locale, 'terms.hero_subtitle'),
    locale,
    showCta: false,
    content: `
      <p><em>${t(locale, 'terms.last_updated')}</em></p>

      <h2>1. ${t(locale, 'terms.s1_title')}</h2>
      <p>${t(locale, 'terms.s1_text')}</p>

      <h2>2. ${t(locale, 'terms.s2_title')}</h2>
      <p>${t(locale, 'terms.s2_text')}</p>

      <h2>3. ${t(locale, 'terms.s3_title')}</h2>
      <p>${t(locale, 'terms.s3_text')}</p>
      <ul>
        <li>${t(locale, 'terms.s3_item1')}</li>
        <li>${t(locale, 'terms.s3_item2')}</li>
        <li>${t(locale, 'terms.s3_item3')}</li>
      </ul>

      <h2>4. ${t(locale, 'terms.s4_title')}</h2>
      <p>${t(locale, 'terms.s4_text')}</p>

      <h2>5. ${t(locale, 'terms.s5_title')}</h2>
      <p>${t(locale, 'terms.s5_text')}</p>

      <h2>6. ${t(locale, 'terms.s6_title')}</h2>
      <p>${t(locale, 'terms.s6_text')}</p>

      <h2>7. ${t(locale, 'terms.s7_title')}</h2>
      <p>${t(locale, 'terms.s7_text')}</p>

      <h2>8. ${t(locale, 'terms.s8_title')}</h2>
      <p>${t(locale, 'terms.s8_text')}</p>

      <h2>9. ${t(locale, 'terms.s9_title')}</h2>
      <p>${t(locale, 'terms.s9_text')}</p>
      <p><a href="mailto:legal@callmyprof.com">legal@callmyprof.com</a></p>

      <h2>10. ${t(locale, 'terms.s10_title')}</h2>
      <p>${t(locale, 'terms.s10_text')}</p>
    `,
  });
}
