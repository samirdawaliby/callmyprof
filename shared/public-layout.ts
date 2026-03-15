/**
 * CallMyProf - Public Page Layout
 * Shared navbar + footer for all public-facing pages (about, contact, terms, etc.)
 * Reuses the same visual language as the landing page.
 */

import { CSS_VARS, CSS_BASE, CSS_ANIMATIONS } from './html-utils';
import { type Locale, t, htmlAttrs } from './i18n/index';

// ============================================================================
// PUBLIC PAGE CSS
// ============================================================================

const PUBLIC_CSS = `
  /* ---- Navbar ---- */
  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #fff;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .nav-logo-icon { font-size: 26px; }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
    list-style: none;
  }
  .nav-links a {
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: #fff; }
  .nav-lang {
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 3px;
  }
  .nav-lang a {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    transition: all 0.2s;
  }
  .nav-lang a:hover {
    color: #fff;
    background: rgba(255,255,255,0.1);
  }
  .nav-lang a.active {
    background: var(--primary);
    color: #fff;
  }
  .nav-mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
  }
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-mobile-toggle { display: block; }
    .nav-links.open {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 64px;
      left: 0; right: 0;
      background: rgba(30, 41, 59, 0.98);
      padding: 20px;
      gap: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
  }

  /* ---- Page Content ---- */
  .page-wrapper {
    padding-top: 64px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .page-hero {
    background: linear-gradient(135deg, var(--secondary) 0%, #0F172A 100%);
    color: #fff;
    padding: 60px 24px 50px;
    text-align: center;
  }
  .page-hero h1 {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }
  .page-hero p {
    font-size: 16px;
    opacity: 0.7;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  .page-content {
    flex: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px 60px;
    width: 100%;
  }
  .page-content h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--secondary);
    margin: 36px 0 16px;
    letter-spacing: -0.3px;
  }
  .page-content h2:first-child {
    margin-top: 0;
  }
  .page-content p, .page-content li {
    font-size: 15px;
    line-height: 1.8;
    color: #475569;
  }
  .page-content ul, .page-content ol {
    padding-left: 24px;
    margin: 12px 0;
  }
  .page-content li {
    margin-bottom: 8px;
  }
  .page-content a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
  }
  .page-content a:hover {
    text-decoration: underline;
  }
  .page-content .highlight-box {
    background: #FEF2F2;
    border-left: 4px solid var(--primary);
    padding: 20px 24px;
    border-radius: 0 12px 12px 0;
    margin: 24px 0;
  }
  .page-content .highlight-box p {
    color: #991B1B;
    font-weight: 500;
    margin: 0;
  }
  .page-content .info-box {
    background: #F0F9FF;
    border-left: 4px solid #3B82F6;
    padding: 20px 24px;
    border-radius: 0 12px 12px 0;
    margin: 24px 0;
  }
  .page-content .info-box p {
    color: #1E40AF;
    font-weight: 500;
    margin: 0;
  }

  /* ---- Contact cards ---- */
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin: 32px 0;
  }
  .contact-card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    transition: all 0.3s;
  }
  .contact-card:hover {
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    transform: translateY(-4px);
  }
  .contact-card .icon {
    font-size: 40px;
    margin-bottom: 16px;
  }
  .contact-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--secondary);
    margin-bottom: 8px;
  }
  .contact-card p {
    font-size: 14px;
    color: #64748B;
    margin: 0;
  }
  .contact-card a {
    color: var(--primary);
    font-weight: 600;
  }

  /* ---- FAQ ---- */
  .faq-item {
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: all 0.2s;
  }
  .faq-item:hover {
    border-color: var(--primary);
  }
  .faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    cursor: pointer;
    background: #fff;
    font-weight: 600;
    font-size: 15px;
    color: var(--secondary);
    border: none;
    width: 100%;
    text-align: left;
  }
  [dir="rtl"] .faq-question { text-align: right; }
  .faq-question:hover { background: #F8FAFC; }
  .faq-question .arrow {
    transition: transform 0.3s;
    font-size: 18px;
    color: #94A3B8;
  }
  .faq-item.open .faq-question .arrow {
    transform: rotate(180deg);
  }
  .faq-answer {
    display: none;
    padding: 0 24px 20px;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }
  .faq-item.open .faq-answer { display: block; }

  /* ---- Team grid (About) ---- */
  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
    margin: 32px 0;
  }
  .value-card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 28px 24px;
    text-align: center;
    transition: all 0.3s;
  }
  .value-card:hover {
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    transform: translateY(-4px);
  }
  .value-card .icon {
    font-size: 40px;
    margin-bottom: 16px;
  }
  .value-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--secondary);
    margin-bottom: 8px;
  }
  .value-card p {
    font-size: 13px;
    color: #64748B;
    line-height: 1.6;
    margin: 0;
  }

  /* ---- Footer ---- */
  .footer {
    background: var(--secondary);
    color: rgba(255,255,255,0.6);
    padding: 60px 24px 30px;
  }
  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
  }
  .footer-brand h3 {
    color: #fff;
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .footer-brand p { font-size: 14px; line-height: 1.6; max-width: 300px; }
  .footer-col h4 {
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .footer-col a {
    display: block;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    font-size: 14px;
    padding: 4px 0;
    transition: color 0.2s;
  }
  .footer-col a:hover { color: #fff; }
  .footer-bottom {
    max-width: 1200px;
    margin: 40px auto 0;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
    text-align: center;
    font-size: 13px;
  }
  @media (max-width: 768px) {
    .footer-inner { grid-template-columns: 1fr 1fr; }
    .page-hero h1 { font-size: 28px; }
  }
  @media (max-width: 480px) {
    .footer-inner { grid-template-columns: 1fr; }
  }

  /* ---- CTA banner ---- */
  .cta-banner {
    background: linear-gradient(135deg, var(--primary) 0%, #B91C1C 100%);
    color: #fff;
    padding: 48px 24px;
    text-align: center;
    margin-top: 20px;
  }
  .cta-banner h2 {
    color: #fff !important;
    font-size: 28px;
    margin: 0 0 12px !important;
  }
  .cta-banner p {
    color: rgba(255,255,255,0.85) !important;
    font-size: 16px;
    margin-bottom: 24px;
  }
  .cta-banner .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: #fff;
    color: var(--primary);
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.3s;
  }
  .cta-banner .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
`;

// ============================================================================
// PUBLIC PAGE WRAPPER
// ============================================================================

export function publicPage(options: {
  title: string;
  heroTitle: string;
  heroSubtitle?: string;
  content: string;
  locale: Locale;
  extraCss?: string;
  showCta?: boolean;
}): string {
  const { locale, title, heroTitle, heroSubtitle, content, extraCss, showCta = true } = options;
  const attrs = htmlAttrs(locale);
  const year = new Date().getFullYear();

  const ctaBanner = showCta ? `
  <section class="cta-banner">
    <h2>${t(locale, 'hero.cta')}</h2>
    <p>${t(locale, 'hero.trust_1')}</p>
    <a href="/" class="btn">&#128222; ${t(locale, 'hero.cta')}</a>
  </section>` : '';

  return `<!DOCTYPE html>
<html lang="${attrs.lang}" dir="${attrs.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - CallMyProf</title>
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#DC2626">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    ${PUBLIC_CSS}
    ${extraCss || ''}
  </style>
</head>
<body>
  <div class="page-wrapper">

  <!-- NAVBAR -->
  <nav class="navbar">
    <a href="/" class="nav-logo">
      <span class="nav-logo-icon">&#128222;</span>
      <span>CallMyProf</span>
    </a>
    <button class="nav-mobile-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')">&#9776;</button>
    <ul class="nav-links">
      <li><a href="/#subjects">${t(locale, 'nav.subjects')}</a></li>
      <li><a href="/#pricing">${t(locale, 'nav.pricing')}</a></li>
      <li><a href="/onboarding">${t(locale, 'nav.become_tutor')}</a></li>
      <li><a href="/login">${t(locale, 'nav.login')}</a></li>
      <li>
        <div class="nav-lang">
          <a href="?lang=en" class="${locale === 'en' ? 'active' : ''}">EN</a>
          <a href="?lang=fr" class="${locale === 'fr' ? 'active' : ''}">FR</a>
          <a href="?lang=ar" class="${locale === 'ar' ? 'active' : ''}">AR</a>
        </div>
      </li>
    </ul>
  </nav>

  <!-- PAGE HERO -->
  <section class="page-hero">
    <h1>${heroTitle}</h1>
    ${heroSubtitle ? `<p>${heroSubtitle}</p>` : ''}
  </section>

  <!-- PAGE CONTENT -->
  <div class="page-content">
    ${content}
  </div>

  ${ctaBanner}

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <h3>&#128222; CallMyProf</h3>
        <p>${t(locale, 'footer.tagline')}</p>
      </div>
      <div class="footer-col">
        <h4>${t(locale, 'footer.company')}</h4>
        <a href="/about">${t(locale, 'footer.about')}</a>
        <a href="/contact">${t(locale, 'footer.contact')}</a>
        <a href="/onboarding">${t(locale, 'footer.careers')}</a>
      </div>
      <div class="footer-col">
        <h4>${t(locale, 'footer.legal')}</h4>
        <a href="/terms">${t(locale, 'footer.terms')}</a>
        <a href="/privacy">${t(locale, 'footer.privacy')}</a>
      </div>
      <div class="footer-col">
        <h4>${t(locale, 'footer.support')}</h4>
        <a href="/faq">${t(locale, 'footer.faq')}</a>
        <a href="/contact">${t(locale, 'footer.help')}</a>
      </div>
    </div>
    <div class="footer-bottom">
      ${t(locale, 'footer.copyright', { year: String(year) })}
    </div>
  </footer>

  </div>

  <script>
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.faq-item');
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  </script>
</body>
</html>`;
}
