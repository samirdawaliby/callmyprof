/**
 * CallMyProf - About Us Page
 */

import { publicPage } from '../../shared/public-layout';
import { type Locale, t } from '../../shared/i18n/index';

export function renderAboutPage(locale: Locale): string {
  return publicPage({
    title: t(locale, 'about.page_title'),
    heroTitle: t(locale, 'about.hero_title'),
    heroSubtitle: t(locale, 'about.hero_subtitle'),
    locale,
    content: `
      <h2>${t(locale, 'about.mission_title')}</h2>
      <p>${t(locale, 'about.mission_text')}</p>

      <div class="highlight-box">
        <p>${t(locale, 'about.mission_quote')}</p>
      </div>

      <h2>${t(locale, 'about.values_title')}</h2>
      <div class="values-grid">
        <div class="value-card">
          <div class="icon">&#127919;</div>
          <h3>${t(locale, 'about.value1_title')}</h3>
          <p>${t(locale, 'about.value1_desc')}</p>
        </div>
        <div class="value-card">
          <div class="icon">&#128176;</div>
          <h3>${t(locale, 'about.value2_title')}</h3>
          <p>${t(locale, 'about.value2_desc')}</p>
        </div>
        <div class="value-card">
          <div class="icon">&#127760;</div>
          <h3>${t(locale, 'about.value3_title')}</h3>
          <p>${t(locale, 'about.value3_desc')}</p>
        </div>
        <div class="value-card">
          <div class="icon">&#129309;</div>
          <h3>${t(locale, 'about.value4_title')}</h3>
          <p>${t(locale, 'about.value4_desc')}</p>
        </div>
      </div>

      <h2>${t(locale, 'about.how_title')}</h2>
      <ol>
        <li><strong>${t(locale, 'about.how_step1_title')}</strong> &mdash; ${t(locale, 'about.how_step1_desc')}</li>
        <li><strong>${t(locale, 'about.how_step2_title')}</strong> &mdash; ${t(locale, 'about.how_step2_desc')}</li>
        <li><strong>${t(locale, 'about.how_step3_title')}</strong> &mdash; ${t(locale, 'about.how_step3_desc')}</li>
        <li><strong>${t(locale, 'about.how_step4_title')}</strong> &mdash; ${t(locale, 'about.how_step4_desc')}</li>
      </ol>

      <h2>${t(locale, 'about.stats_title')}</h2>
      <div class="values-grid">
        <div class="value-card">
          <div class="icon" style="font-size:32px;font-weight:800;color:var(--primary);">500+</div>
          <h3>${t(locale, 'about.stat1')}</h3>
        </div>
        <div class="value-card">
          <div class="icon" style="font-size:32px;font-weight:800;color:var(--primary);">50+</div>
          <h3>${t(locale, 'about.stat2')}</h3>
        </div>
        <div class="value-card">
          <div class="icon" style="font-size:32px;font-weight:800;color:var(--primary);">3</div>
          <h3>${t(locale, 'about.stat3')}</h3>
        </div>
        <div class="value-card">
          <div class="icon" style="font-size:32px;font-weight:800;color:var(--primary);">4.8/5</div>
          <h3>${t(locale, 'about.stat4')}</h3>
        </div>
      </div>
    `,
  });
}
