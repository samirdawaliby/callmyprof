/**
 * CallMyProf - Contact Page
 */

import { publicPage } from '../../shared/public-layout';
import { type Locale, t } from '../../shared/i18n/index';

export function renderContactPage(locale: Locale): string {
  return publicPage({
    title: t(locale, 'contact.page_title'),
    heroTitle: t(locale, 'contact.hero_title'),
    heroSubtitle: t(locale, 'contact.hero_subtitle'),
    locale,
    content: `
      <div class="contact-grid">
        <div class="contact-card">
          <div class="icon">&#128231;</div>
          <h3>${t(locale, 'contact.email_title')}</h3>
          <p>${t(locale, 'contact.email_desc')}</p>
          <p><a href="mailto:contact@callmyprof.com">contact@callmyprof.com</a></p>
        </div>
        <div class="contact-card">
          <div class="icon">&#128172;</div>
          <h3>${t(locale, 'contact.whatsapp_title')}</h3>
          <p>${t(locale, 'contact.whatsapp_desc')}</p>
          <p><a href="https://wa.me/MESSAGE" target="_blank" rel="noopener">WhatsApp</a></p>
        </div>
        <div class="contact-card">
          <div class="icon">&#128205;</div>
          <h3>${t(locale, 'contact.location_title')}</h3>
          <p>${t(locale, 'contact.location_desc')}</p>
          <p>${t(locale, 'contact.location_city')}</p>
        </div>
      </div>

      <h2>${t(locale, 'contact.hours_title')}</h2>
      <div class="info-box">
        <p>${t(locale, 'contact.hours_text')}</p>
      </div>

      <h2>${t(locale, 'contact.form_title')}</h2>
      <p>${t(locale, 'contact.form_desc')}</p>
      <div class="highlight-box">
        <p>${t(locale, 'contact.form_cta')}</p>
      </div>
    `,
  });
}
