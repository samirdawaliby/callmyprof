/**
 * CallMyProf - FAQ Page
 */

import { publicPage } from '../../shared/public-layout';
import { type Locale, t } from '../../shared/i18n/index';

export function renderFaqPage(locale: Locale): string {
  const faqSections = [
    {
      title: t(locale, 'faq.section_general'),
      items: [
        { q: t(locale, 'faq.q1'), a: t(locale, 'faq.a1') },
        { q: t(locale, 'faq.q2'), a: t(locale, 'faq.a2') },
        { q: t(locale, 'faq.q3'), a: t(locale, 'faq.a3') },
      ],
    },
    {
      title: t(locale, 'faq.section_pricing'),
      items: [
        { q: t(locale, 'faq.q4'), a: t(locale, 'faq.a4') },
        { q: t(locale, 'faq.q5'), a: t(locale, 'faq.a5') },
        { q: t(locale, 'faq.q6'), a: t(locale, 'faq.a6') },
      ],
    },
    {
      title: t(locale, 'faq.section_tutors'),
      items: [
        { q: t(locale, 'faq.q7'), a: t(locale, 'faq.a7') },
        { q: t(locale, 'faq.q8'), a: t(locale, 'faq.a8') },
        { q: t(locale, 'faq.q9'), a: t(locale, 'faq.a9') },
      ],
    },
    {
      title: t(locale, 'faq.section_classes'),
      items: [
        { q: t(locale, 'faq.q10'), a: t(locale, 'faq.a10') },
        { q: t(locale, 'faq.q11'), a: t(locale, 'faq.a11') },
        { q: t(locale, 'faq.q12'), a: t(locale, 'faq.a12') },
      ],
    },
  ];

  const sectionsHtml = faqSections.map(section => `
    <h2>${section.title}</h2>
    ${section.items.map(item => `
      <div class="faq-item">
        <button class="faq-question">
          <span>${item.q}</span>
          <span class="arrow">&#9660;</span>
        </button>
        <div class="faq-answer">
          <p>${item.a}</p>
        </div>
      </div>
    `).join('')}
  `).join('');

  return publicPage({
    title: t(locale, 'faq.page_title'),
    heroTitle: t(locale, 'faq.hero_title'),
    heroSubtitle: t(locale, 'faq.hero_subtitle'),
    locale,
    content: `
      ${sectionsHtml}

      <div class="info-box" style="margin-top:40px;">
        <p>${t(locale, 'faq.still_questions')}</p>
      </div>
    `,
  });
}
