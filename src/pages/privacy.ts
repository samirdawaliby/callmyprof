/**
 * CallMyProf - Privacy Policy Page
 */

import { publicPage } from '../../shared/public-layout';
import { type Locale, t } from '../../shared/i18n/index';

export function renderPrivacyPage(locale: Locale): string {
  return publicPage({
    title: t(locale, 'privacy.page_title'),
    heroTitle: t(locale, 'privacy.hero_title'),
    heroSubtitle: t(locale, 'privacy.hero_subtitle'),
    locale,
    showCta: false,
    content: `
      <p><em>${t(locale, 'privacy.last_updated')}</em></p>

      <h2>1. ${t(locale, 'privacy.s1_title')}</h2>
      <p>${t(locale, 'privacy.s1_text')}</p>
      <ul>
        <li>${t(locale, 'privacy.s1_item1')}</li>
        <li>${t(locale, 'privacy.s1_item2')}</li>
        <li>${t(locale, 'privacy.s1_item3')}</li>
        <li>${t(locale, 'privacy.s1_item4')}</li>
      </ul>

      <h2>2. ${t(locale, 'privacy.s2_title')}</h2>
      <p>${t(locale, 'privacy.s2_text')}</p>
      <ul>
        <li>${t(locale, 'privacy.s2_item1')}</li>
        <li>${t(locale, 'privacy.s2_item2')}</li>
        <li>${t(locale, 'privacy.s2_item3')}</li>
      </ul>

      <h2>3. ${t(locale, 'privacy.s3_title')}</h2>
      <p>${t(locale, 'privacy.s3_text')}</p>

      <h2>4. ${t(locale, 'privacy.s4_title')}</h2>
      <p>${t(locale, 'privacy.s4_text')}</p>

      <h2>5. ${t(locale, 'privacy.s5_title')}</h2>
      <p>${t(locale, 'privacy.s5_text')}</p>

      <h2>6. ${t(locale, 'privacy.s6_title')}</h2>
      <p>${t(locale, 'privacy.s6_text')}</p>
      <ul>
        <li>${t(locale, 'privacy.s6_item1')}</li>
        <li>${t(locale, 'privacy.s6_item2')}</li>
        <li>${t(locale, 'privacy.s6_item3')}</li>
        <li>${t(locale, 'privacy.s6_item4')}</li>
      </ul>

      <h2>7. ${t(locale, 'privacy.s7_title')}</h2>
      <p>${t(locale, 'privacy.s7_text')}</p>

      <h2>8. ${t(locale, 'privacy.s8_title')}</h2>
      <p>${t(locale, 'privacy.s8_text')}</p>
      <p><a href="mailto:privacy@callmyprof.com">privacy@callmyprof.com</a></p>
    `,
  });
}
