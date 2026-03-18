/**
 * CallMyProf - Landing Page
 * Public marketing page: hero, CTA form, how it works, subjects, pricing, testimonials
 * Full i18n support (EN/FR/AR) with RTL
 */

import { CSS_VARS, CSS_BASE, CSS_ANIMATIONS } from '../../shared/html-utils';
import { type Locale, t, htmlAttrs, detectLocale, getCurrency } from '../../shared/i18n/index';
import type { Env, Domaine } from '../../shared/types';

// ============================================================================
// LANDING CSS
// ============================================================================

const LANDING_CSS = `
  /* ---- Navbar ---- */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
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
  .nav-logo-icon {
    font-size: 26px;
  }
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
  .nav-links a:hover {
    color: #fff;
  }
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
      left: 0;
      right: 0;
      background: rgba(30, 41, 59, 0.98);
      padding: 20px 24px;
      gap: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
  }

  /* ---- Hero ---- */
  .hero {
    padding: 120px 24px 80px;
    background: #1E293B;
    position: relative;
    overflow: hidden;
    text-align: center;
    color: #fff;
  }
  .hero-bg-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
    z-index: 0;
  }
  .hero-bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
    z-index: 0;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(220,38,38,0.7) 0%, rgba(30,41,59,0.85) 60%, rgba(15,23,42,0.9) 100%);
    z-index: 0;
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E");
    z-index: 0;
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    text-align: left;
  }
  [dir="rtl"] .hero-inner { text-align: right; }
  .hero-text h1 {
    font-size: 48px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 16px;
    animation: slideUp 0.6s ease both;
  }
  .hero-text h2 {
    font-size: 20px;
    font-weight: 400;
    opacity: 0.9;
    margin-bottom: 32px;
    line-height: 1.5;
    animation: slideUp 0.6s ease 0.1s both;
  }
  .hero-trust {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    animation: slideUp 0.6s ease 0.2s both;
  }
  .hero-trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    opacity: 0.9;
  }
  .hero-trust-item .check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  /* ---- CTA Form ---- */
  .cta-form-card {
    background: #fff;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: slideUp 0.6s ease 0.2s both;
    color: var(--gray-900);
    text-align: left;
    position: relative;
  }
  .form-free-badge {
    position: absolute;
    top: -14px;
    right: 20px;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: #fff;
    padding: 6px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 1px;
    box-shadow: 0 4px 12px rgba(22,163,74,0.4);
    animation: pulse 2s ease-in-out infinite;
  }
  [dir="rtl"] .form-free-badge { right: auto; left: 20px; }
  .form-urgency {
    background: #fef3c7;
    color: #92400e;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: center;
    animation: pulse 3s ease-in-out infinite;
  }
  [dir="rtl"] .cta-form-card { text-align: right; }
  .cta-form-card h3 {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 6px;
    color: var(--gray-900);
  }
  .cta-form-card .form-sub {
    font-size: 14px;
    color: var(--gray-500);
    margin-bottom: 24px;
  }
  .cta-form-card .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .cta-form-card .form-group {
    margin-bottom: 12px;
  }
  .cta-form-card label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 4px;
  }
  .cta-form-card input,
  .cta-form-card select {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid var(--gray-200);
    border-radius: 10px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: var(--gray-900);
    background: var(--gray-50);
    transition: all 0.2s;
    outline: none;
  }
  .cta-form-card input:focus,
  .cta-form-card select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
    background: #fff;
  }
  .cta-form-card select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }
  [dir="rtl"] .cta-form-card select {
    background-position: left 12px center;
    padding-right: 12px;
    padding-left: 36px;
  }
  .phone-group {
    display: flex;
    gap: 8px;
  }
  .phone-group select {
    width: 100px;
    flex-shrink: 0;
  }
  .phone-group input {
    flex: 1;
  }
  .service-type-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .service-type-btn {
    flex: 1;
    padding: 10px 8px;
    border: 1.5px solid var(--gray-200);
    border-radius: 10px;
    background: var(--gray-50);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    color: var(--gray-600);
    text-align: center;
    transition: all 0.2s;
  }
  .service-type-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
  .service-type-btn.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }
  .cta-submit-btn {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #DC2626, #EF4444);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
  }
  .cta-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220,38,38,0.4);
  }
  .cta-submit-btn:active {
    transform: translateY(0);
  }
  .cta-submit-btn.loading {
    pointer-events: none;
    opacity: 0.85;
  }
  @keyframes ctaPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
    50% { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
  }
  .cta-submit-btn { animation: ctaPulse 2s ease-in-out infinite; }
  .cta-submit-btn:hover { animation: none; }

  @media (max-width: 900px) {
    .hero-inner {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 40px;
    }
    [dir="rtl"] .hero-inner { text-align: center; }
    .hero-text h1 { font-size: 36px; }
    .hero-text h2 { font-size: 18px; }
    .hero-trust { justify-content: center; }
    .cta-form-card .form-row { grid-template-columns: 1fr; }
  }

  /* ---- Section common ---- */
  .section {
    padding: 80px 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .section-title {
    text-align: center;
    font-size: 36px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }
  .section-subtitle {
    text-align: center;
    font-size: 16px;
    color: var(--gray-500);
    margin-bottom: 48px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ---- Image strip ---- */
  .image-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    max-height: 280px;
    overflow: hidden;
  }
  .image-strip img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    transition: transform 0.5s;
  }
  .image-strip img:hover {
    transform: scale(1.05);
  }
  @media (max-width: 768px) {
    .image-strip { grid-template-columns: 1fr 1fr; max-height: 200px; }
    .image-strip img { height: 200px; }
  }
  @media (max-width: 480px) {
    .image-strip { grid-template-columns: 1fr 1fr; max-height: 150px; }
    .image-strip img { height: 150px; }
  }

  /* ---- How it works ---- */
  .how-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .how-image {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .how-image img {
    width: 100%;
    height: 400px;
    object-fit: cover;
    display: block;
  }
  .how-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .how-step {
    text-align: center;
    position: relative;
    animation: slideUp 0.5s ease both;
    background: var(--gray-50);
    border-radius: 16px;
    padding: 24px 16px;
    border: 1px solid var(--gray-100);
    transition: all 0.3s;
  }
  .how-step:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    border-color: var(--primary);
  }
  .how-step:nth-child(1) { animation-delay: 0.1s; }
  .how-step:nth-child(2) { animation-delay: 0.2s; }
  .how-step:nth-child(3) { animation-delay: 0.3s; }
  .how-step:nth-child(4) { animation-delay: 0.4s; }
  .how-number {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: #fff;
    font-size: 20px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    box-shadow: 0 4px 12px rgba(220,38,38,0.3);
  }
  .how-step h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 6px;
  }
  .how-step p {
    font-size: 13px;
    color: var(--gray-500);
    line-height: 1.5;
  }
  @media (max-width: 900px) {
    .how-layout { grid-template-columns: 1fr; }
    .how-image { display: none; }
  }
  @media (max-width: 480px) {
    .how-grid { grid-template-columns: 1fr; }
  }

  /* ---- Subjects grid ---- */
  .subjects-bg {
    background: var(--gray-50);
  }
  .subjects-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .subject-card {
    background: #fff;
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    border: 1px solid var(--gray-100);
    transition: all 0.3s;
    cursor: pointer;
  }
  .subject-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    border-color: var(--primary);
  }
  .subject-icon {
    font-size: 40px;
    margin-bottom: 12px;
    display: block;
  }
  .subject-card h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 6px;
  }
  @media (max-width: 768px) {
    .subjects-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .subjects-grid { grid-template-columns: 1fr; }
  }

  /* ---- Pricing ---- */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .pricing-card {
    background: #fff;
    border-radius: 20px;
    padding: 36px 28px;
    border: 2px solid var(--gray-100);
    text-align: center;
    transition: all 0.3s;
    position: relative;
  }
  .pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  }
  .pricing-card.featured {
    border-color: var(--primary);
    box-shadow: 0 8px 24px rgba(220,38,38,0.15);
  }
  .pricing-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: #fff;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .pricing-icon {
    font-size: 40px;
    margin-bottom: 16px;
    display: block;
  }
  .pricing-card h4 {
    font-size: 20px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 8px;
  }
  .pricing-card .pricing-desc {
    font-size: 14px;
    color: var(--gray-500);
    margin-bottom: 20px;
  }
  .pricing-price {
    font-size: 14px;
    color: var(--gray-500);
    margin-bottom: 4px;
  }
  .pricing-amount {
    font-size: 42px;
    font-weight: 800;
    color: var(--primary);
    line-height: 1;
    margin-bottom: 4px;
  }
  .pricing-unit {
    font-size: 14px;
    color: var(--gray-500);
    margin-bottom: 24px;
  }
  .pricing-features {
    list-style: none;
    text-align: left;
    margin-bottom: 28px;
  }
  [dir="rtl"] .pricing-features { text-align: right; }
  .pricing-features li {
    padding: 8px 0;
    font-size: 14px;
    color: var(--gray-600);
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--gray-50);
  }
  .pricing-features li:last-child { border-bottom: none; }
  .pricing-features .feat-check {
    color: var(--success);
    font-weight: 700;
  }
  .pricing-cta {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--primary);
    background: transparent;
    color: var(--primary);
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pricing-cta:hover {
    background: var(--primary);
    color: #fff;
  }
  .pricing-card.featured .pricing-cta {
    background: var(--primary);
    color: #fff;
  }
  .pricing-card.featured .pricing-cta:hover {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
  }
  @media (max-width: 768px) {
    .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
  }

  /* ---- Testimonials ---- */
  .testimonials-bg {
    background: var(--gray-50);
  }
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .testimonial-card {
    background: #fff;
    border-radius: 16px;
    padding: 28px;
    border: 1px solid var(--gray-100);
  }
  .testimonial-stars {
    color: #f59e0b;
    font-size: 16px;
    letter-spacing: 2px;
    margin-bottom: 12px;
  }
  .testimonial-text {
    font-size: 14px;
    color: var(--gray-700);
    line-height: 1.7;
    margin-bottom: 16px;
    font-style: italic;
  }
  .testimonial-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-900);
  }
  .testimonial-role {
    font-size: 12px;
    color: var(--gray-400);
  }
  @media (max-width: 768px) {
    .testimonials-grid { grid-template-columns: 1fr; }
  }

  /* ---- Tutor CTA ---- */
  .tutor-cta {
    padding: 80px 24px;
    background: var(--secondary);
    text-align: center;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .tutor-cta-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.2;
  }
  .tutor-cta > *:not(.tutor-cta-bg) {
    position: relative;
    z-index: 1;
  }
  .tutor-cta h2 {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  .tutor-cta p {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 28px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  .tutor-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    background: var(--primary);
    color: #fff;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.3s;
  }
  .tutor-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220,38,38,0.4);
    color: #fff;
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
  .footer-brand p {
    font-size: 14px;
    line-height: 1.6;
    max-width: 300px;
  }
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
  .footer-col a:hover {
    color: #fff;
  }
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
  }
  @media (max-width: 480px) {
    .footer-inner { grid-template-columns: 1fr; }
  }

  /* ---- WhatsApp Widget ---- */
  .whatsapp-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #25D366;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    text-decoration: none;
    box-shadow: 0 4px 16px rgba(37,211,102,0.4);
    transition: all 0.3s;
  }
  [dir="rtl"] .whatsapp-widget { right: auto; left: 24px; }
  .whatsapp-widget:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(37,211,102,0.5);
    color: #fff;
  }

  /* ---- Discord Widget ---- */
  .discord-widget {
    position: fixed;
    bottom: 90px;
    right: 24px;
    z-index: 99;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #5865F2;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    text-decoration: none;
    box-shadow: 0 4px 16px rgba(88,101,242,0.4);
    transition: all 0.3s;
    cursor: pointer;
    border: none;
  }
  [dir="rtl"] .discord-widget { right: auto; left: 24px; }
  [dir="rtl"] .whatsapp-widget { bottom: 24px; }
  .discord-widget:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(88,101,242,0.5);
    color: #fff;
  }
  .discord-popup {
    position: fixed;
    bottom: 90px;
    right: 88px;
    z-index: 100;
    width: 320px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    padding: 0;
    overflow: hidden;
    animation: slideUp 0.3s ease both;
    display: none;
  }
  [dir="rtl"] .discord-popup { right: auto; left: 88px; }
  .discord-popup.open { display: block; }
  .discord-popup-header {
    background: linear-gradient(135deg, #5865F2, #7289DA);
    padding: 20px;
    color: #fff;
    position: relative;
  }
  .discord-popup-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  [dir="rtl"] .discord-popup-close { right: auto; left: 12px; }
  .discord-popup-close:hover { background: rgba(255,255,255,0.3); }
  .discord-popup-header h4 {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .discord-popup-body {
    padding: 20px;
  }
  .discord-popup-body p {
    font-size: 14px;
    color: var(--gray-600);
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .discord-popup-features {
    list-style: none;
    margin-bottom: 20px;
  }
  .discord-popup-features li {
    font-size: 13px;
    color: var(--gray-700);
    padding: 6px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .discord-popup-features li span {
    font-size: 16px;
  }
  .discord-popup-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: #5865F2;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }
  .discord-popup-cta:hover {
    background: #4752C4;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(88,101,242,0.4);
    color: #fff;
  }
  .discord-online {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    opacity: 0.85;
  }
  .discord-online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #57F287;
    animation: pulse 2s ease-in-out infinite;
  }
  @media (max-width: 480px) {
    .discord-popup { width: calc(100vw - 48px); right: 24px; bottom: 90px; }
    [dir="rtl"] .discord-popup { left: 24px; right: auto; }
  }
`;

// ============================================================================
// SUBJECTS DATA (static, matches catalogue domains)
// ============================================================================

function getSubjects() {
  return [
    { icon: '&#128218;', key: 'domain.scolaire' },
    { icon: '&#127760;', key: 'domain.langues' },
    { icon: '&#127925;', key: 'domain.musique' },
    { icon: '&#128187;', key: 'domain.informatique' },
    { icon: '&#127912;', key: 'domain.arts' },
    { icon: '&#9917;', key: 'domain.sport' },
    { icon: '&#127891;', key: 'domain.concours' },
    { icon: '&#129504;', key: 'domain.accompagnement' },
  ];
}

// ============================================================================
// TESTIMONIALS DATA
// ============================================================================

const TESTIMONIALS = [
  {
    text_en: 'My son went from a C to an A in math in just two months. The tutor was incredibly patient and knowledgeable.',
    text_fr: 'Mon fils est pass\u00e9 de 10 \u00e0 16 en maths en deux mois. Le professeur \u00e9tait incroyablement patient.',
    text_ar: '\u0627\u0628\u0646\u064A \u0627\u0646\u062A\u0642\u0644 \u0645\u0646 \u0639\u0644\u0627\u0645\u0629 \u0645\u062A\u0648\u0633\u0637\u0629 \u0625\u0644\u0649 \u0639\u0644\u0627\u0645\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0641\u064A \u0634\u0647\u0631\u064A\u0646 \u0641\u0642\u0637',
    author: 'Sarah M.',
    role_en: 'Parent',
    role_fr: 'Parent',
    role_ar: '\u0648\u0644\u064A \u0623\u0645\u0631',
    note: 5,
  },
  {
    text_en: 'The group classes are amazing value. My daughter loves the collaborative environment and her grades improved.',
    text_fr: 'Les cours collectifs sont d\'un excellent rapport qualit\u00e9-prix. Ma fille adore et ses notes ont augment\u00e9.',
    text_ar: '\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u062C\u0645\u0627\u0639\u064A\u0629 \u0630\u0627\u062A \u0642\u064A\u0645\u0629 \u0645\u0645\u062A\u0627\u0632\u0629. \u0627\u0628\u0646\u062A\u064A \u062A\u062D\u0628 \u0627\u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u0639\u0627\u0648\u0646\u064A\u0629',
    author: 'Ahmed K.',
    role_en: 'Parent',
    role_fr: 'Parent',
    role_ar: '\u0648\u0644\u064A \u0623\u0645\u0631',
    note: 5,
  },
  {
    text_en: 'I was struggling with English for years. CallMyProf matched me with the perfect tutor and now I feel confident.',
    text_fr: 'Je galérais en anglais depuis des ann\u00e9es. CallMyProf m\'a trouv\u00e9 le prof parfait et je me sens confiant.',
    text_ar: '\u0643\u0646\u062A \u0623\u0639\u0627\u0646\u064A \u0645\u0639 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0644\u0633\u0646\u0648\u0627\u062A. CallMyProf \u0648\u062C\u062F \u0644\u064A \u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u0645\u062B\u0627\u0644\u064A',
    author: 'Lina R.',
    role_en: 'Student, 16',
    role_fr: '\u00c9l\u00e8ve, 16 ans',
    role_ar: '\u0637\u0627\u0644\u0628\u0629\u060C 16 \u0633\u0646\u0629',
    note: 5,
  },
];

// ============================================================================
// PHONE CODES
// ============================================================================

const PHONE_CODES = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'FR' },
  { code: '+961', country: 'LB' },
  { code: '+971', country: 'AE' },
  { code: '+966', country: 'SA' },
  { code: '+212', country: 'MA' },
  { code: '+216', country: 'TN' },
  { code: '+213', country: 'DZ' },
  { code: '+20', country: 'EG' },
  { code: '+49', country: 'DE' },
  { code: '+34', country: 'ES' },
  { code: '+39', country: 'IT' },
  { code: '+32', country: 'BE' },
  { code: '+41', country: 'CH' },
  { code: '+974', country: 'QA' },
  { code: '+965', country: 'KW' },
  { code: '+962', country: 'JO' },
];

// ============================================================================
// RENDER LANDING
// ============================================================================

export async function renderLanding(env: Env, request: Request): Promise<string> {
  const locale = detectLocale(request);
  const attrs = htmlAttrs(locale);
  const cf = (request as any).cf;
  const country = cf?.country || '';
  const currency = getCurrency(country);

  // Determine starting price based on currency
  const startPrice = currency.code === 'EUR' ? '15\u20AC' : currency.code === 'GBP' ? '\u00A315' : '$15';

  // Load domaines from DB for the subject dropdown
  let domaines: Domaine[] = [];
  try {
    const result = await env.DB.prepare('SELECT * FROM domaines WHERE actif = 1 ORDER BY ordre').all<Domaine>();
    domaines = result.results || [];
  } catch {
    // DB might not be ready yet
  }

  const domaineOptions = domaines.map(d => {
    const nom = locale === 'ar' ? (d.nom_ar || d.nom) : locale === 'fr' ? d.nom : (d.nom_en || d.nom);
    return `<option value="${d.id}">${nom}</option>`;
  }).join('');

  const subjects = getSubjects();
  const year = new Date().getFullYear();

  // Determine default phone code from country
  const defaultCode = PHONE_CODES.find(p => p.country === country)?.code || '+1';

  const phoneCodeOptions = PHONE_CODES.map(p => {
    const selected = p.code === defaultCode ? ' selected' : '';
    return `<option value="${p.code}"${selected}>${p.code} ${p.country}</option>`;
  }).join('');

  const levels = [
    { value: 'elementary', label: t(locale, 'level.elementary') },
    { value: 'middle', label: t(locale, 'level.middle') },
    { value: 'high', label: t(locale, 'level.high') },
    { value: 'university', label: t(locale, 'level.university') },
    { value: 'adult', label: t(locale, 'level.adult') },
  ];
  const levelOptions = levels.map(l => `<option value="${l.value}">${l.label}</option>`).join('');

  const testimonialCards = TESTIMONIALS.map(tm => {
    const text = locale === 'ar' ? tm.text_ar : locale === 'fr' ? tm.text_fr : tm.text_en;
    const role = locale === 'ar' ? tm.role_ar : locale === 'fr' ? tm.role_fr : tm.role_en;
    const stars = '\u2605'.repeat(tm.note);
    return `<div class="testimonial-card card">
      <div class="testimonial-stars">${stars}</div>
      <p class="testimonial-text">&ldquo;${text}&rdquo;</p>
      <div class="testimonial-author">${tm.author}</div>
      <div class="testimonial-role">${role}</div>
    </div>`;
  }).join('');

  const subjectCards = subjects.map(s => `
    <div class="subject-card card" onclick="document.getElementById('form-subject').focus()">
      <span class="subject-icon">${s.icon}</span>
      <h4>${t(locale, s.key)}</h4>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="${attrs.lang}" dir="${attrs.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(locale, 'seo.title')}</title>
  <meta name="description" content="${t(locale, 'seo.description')}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://callmyprof.com${locale !== 'en' ? '?lang=' + locale : ''}">
  <meta name="theme-color" content="#DC2626">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CallMyProf">
  <meta property="og:title" content="${t(locale, 'seo.og_title')}">
  <meta property="og:description" content="${t(locale, 'seo.og_description')}">
  <meta property="og:url" content="https://callmyprof.com${locale !== 'en' ? '?lang=' + locale : ''}">
  <meta property="og:locale" content="${locale === 'ar' ? 'ar_LB' : locale === 'fr' ? 'fr_FR' : 'en_US'}">
  ${locale !== 'en' ? '<meta property="og:locale:alternate" content="en_US">' : ''}
  ${locale !== 'fr' ? '<meta property="og:locale:alternate" content="fr_FR">' : ''}
  ${locale !== 'ar' ? '<meta property="og:locale:alternate" content="ar_LB">' : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t(locale, 'seo.og_title')}">
  <meta name="twitter:description" content="${t(locale, 'seo.og_description')}">

  <!-- Alternate languages -->
  <link rel="alternate" hreflang="en" href="https://callmyprof.com?lang=en">
  <link rel="alternate" hreflang="fr" href="https://callmyprof.com?lang=fr">
  <link rel="alternate" hreflang="ar" href="https://callmyprof.com?lang=ar">
  <link rel="alternate" hreflang="x-default" href="https://callmyprof.com">

  <!-- Google Analytics 4 (replace G-XXXXXXXXXX with your Measurement ID) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>

  <!-- Meta Pixel (replace PIXEL_ID with your Facebook Pixel ID) -->
  <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'PIXEL_ID');
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1"/></noscript>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    ${LANDING_CSS}
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <nav class="navbar">
    <a href="/" class="nav-logo">
      <span class="nav-logo-icon">&#128222;</span>
      <span>CallMyProf</span>
    </a>
    <button class="nav-mobile-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')">&#9776;</button>
    <ul class="nav-links">
      <li><a href="#subjects">${t(locale, 'nav.subjects')}</a></li>
      <li><a href="#pricing">${t(locale, 'nav.pricing')}</a></li>
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

  <!-- HERO -->
  <section class="hero">
    <img class="hero-bg-image" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80&auto=format" alt="" loading="eager">
    <div class="hero-inner">
      <div class="hero-text">
        <h1>${t(locale, 'hero.title')}</h1>
        <h2>${t(locale, 'hero.subtitle', { price: startPrice })}</h2>
        <div class="hero-trust">
          <div class="hero-trust-item">
            <span class="check">&#10003;</span>
            ${t(locale, 'hero.trust_1')}
          </div>
          <div class="hero-trust-item">
            <span class="check">&#10003;</span>
            ${t(locale, 'hero.trust_2')}
          </div>
          <div class="hero-trust-item">
            <span class="check">&#10003;</span>
            ${t(locale, 'hero.trust_3')}
          </div>
        </div>
      </div>

      <!-- CTA FORM -->
      <div class="cta-form-card">
        <div class="form-free-badge">&#127881; ${t(locale, 'form.free_badge')}</div>
        <h3>${t(locale, 'form.title')}</h3>
        <p class="form-sub">${t(locale, 'form.no_commitment')}</p>
        <div class="form-urgency">&#128101; ${t(locale, 'form.spots_left')}</div>
        <form id="ctaForm" method="POST" action="/api/leads">
          <input type="hidden" name="detected_locale" value="${locale}">
          <input type="hidden" name="country" value="${country}">
          <input type="hidden" name="service_type" value="individual" id="service_type_input">
          <input type="hidden" name="preferred_language" value="${locale}">

          <div class="form-group">
            <label>${t(locale, 'form.first_name')} *</label>
            <input type="text" name="prenom" required placeholder="${t(locale, 'form.first_name')}">
          </div>

          <div class="form-group">
            <label>${t(locale, 'form.phone')} *</label>
            <div class="phone-group">
              <select name="country_code">
                ${phoneCodeOptions}
              </select>
              <input type="tel" name="telephone" required placeholder="123 456 789">
            </div>
          </div>

          <div class="form-group">
            <label>${t(locale, 'form.email')}</label>
            <input type="email" name="email" placeholder="email@example.com">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>${t(locale, 'form.subject')}</label>
              <select name="domaine_id" id="form-subject">
                <option value="">${t(locale, 'form.subject_placeholder')}</option>
                ${domaineOptions}
              </select>
            </div>
            <div class="form-group">
              <label>${t(locale, 'form.level')}</label>
              <select name="level">
                <option value="">${t(locale, 'form.level_placeholder')}</option>
                ${levelOptions}
              </select>
            </div>
          </div>

          <button type="submit" class="cta-submit-btn" id="ctaSubmitBtn">
            <span class="btn-text">&#128222; ${t(locale, 'form.submit')}</span>
            <span class="btn-loading" style="display:none">${t(locale, 'form.submitting')}</span>
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- IMAGE STRIP -->
  <div class="image-strip">
    <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=75&auto=format" alt="Classroom" loading="lazy">
    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=75&auto=format" alt="Students studying" loading="lazy">
    <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=75&auto=format" alt="School" loading="lazy">
    <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=75&auto=format" alt="Learning" loading="lazy">
  </div>

  <!-- HOW IT WORKS -->
  <section class="section" id="how">
    <h2 class="section-title">${t(locale, 'how.title')}</h2>
    <div class="how-layout">
      <div class="how-image">
        <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80&auto=format" alt="Tutor with student" loading="lazy">
      </div>
      <div class="how-grid">
        <div class="how-step">
          <div class="how-number">1</div>
          <h4>${t(locale, 'how.step1_title')}</h4>
          <p>${t(locale, 'how.step1_desc')}</p>
        </div>
        <div class="how-step">
          <div class="how-number">2</div>
          <h4>${t(locale, 'how.step2_title')}</h4>
          <p>${t(locale, 'how.step2_desc')}</p>
        </div>
        <div class="how-step">
          <div class="how-number">3</div>
          <h4>${t(locale, 'how.step3_title')}</h4>
          <p>${t(locale, 'how.step3_desc')}</p>
        </div>
        <div class="how-step">
          <div class="how-number">4</div>
          <h4>${t(locale, 'how.step4_title')}</h4>
          <p>${t(locale, 'how.step4_desc')}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SUBJECTS -->
  <section class="subjects-bg" id="subjects">
    <div class="section">
      <h2 class="section-title">${t(locale, 'subjects.title')}</h2>
      <div class="subjects-grid">
        ${subjectCards}
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="section" id="pricing">
    <h2 class="section-title">${t(locale, 'pricing.title')}</h2>
    <div class="pricing-grid">
      <!-- Individual -->
      <div class="pricing-card featured">
        <span class="pricing-badge">&#11088; ${t(locale, 'pricing.most_popular')}</span>
        <span class="pricing-icon">&#128100;</span>
        <h4>${t(locale, 'pricing.individual_title')}</h4>
        <p class="pricing-desc">${t(locale, 'pricing.individual_desc')}</p>
        <div class="pricing-price">${t(locale, 'pricing.from')}</div>
        <div class="pricing-amount">${currency.symbol}15</div>
        <div class="pricing-unit">${t(locale, 'pricing.per_hour')}</div>
        <ul class="pricing-features">
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.individual_f1')}</li>
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.individual_f2')}</li>
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.individual_f3')}</li>
        </ul>
        <button class="pricing-cta" onclick="document.querySelector('.hero').scrollIntoView({behavior:'smooth'})">
          ${t(locale, 'hero.cta')}
        </button>
      </div>

      <!-- Group -->
      <div class="pricing-card">
        <span class="pricing-icon">&#128101;</span>
        <h4>${t(locale, 'pricing.group_title')}</h4>
        <p class="pricing-desc">${t(locale, 'pricing.group_desc')}</p>
        <div class="pricing-price">${t(locale, 'pricing.from')}</div>
        <div class="pricing-amount">${currency.symbol}8</div>
        <div class="pricing-unit">${t(locale, 'pricing.per_hour')}</div>
        <ul class="pricing-features">
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.group_f1')}</li>
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.group_f2')}</li>
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.group_f3')}</li>
        </ul>
        <button class="pricing-cta" onclick="document.querySelector('.hero').scrollIntoView({behavior:'smooth'})">
          ${t(locale, 'hero.cta')}
        </button>
      </div>

      <!-- Online -->
      <div class="pricing-card">
        <span class="pricing-icon">&#128187;</span>
        <h4>${t(locale, 'pricing.online_title')}</h4>
        <p class="pricing-desc">${t(locale, 'pricing.online_desc')}</p>
        <div class="pricing-price">${t(locale, 'pricing.from')}</div>
        <div class="pricing-amount">${currency.symbol}12</div>
        <div class="pricing-unit">${t(locale, 'pricing.per_hour')}</div>
        <ul class="pricing-features">
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.online_f1')}</li>
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.online_f2')}</li>
          <li><span class="feat-check">&#10003;</span> ${t(locale, 'pricing.online_f3')}</li>
        </ul>
        <button class="pricing-cta" onclick="document.querySelector('.hero').scrollIntoView({behavior:'smooth'})">
          ${t(locale, 'hero.cta')}
        </button>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials-bg" id="testimonials">
    <div class="section">
      <h2 class="section-title">${t(locale, 'testimonials.title')}</h2>
      <div class="testimonials-grid">
        ${testimonialCards}
      </div>
    </div>
  </section>

  <!-- BECOME A TUTOR -->
  <section class="tutor-cta">
    <img class="tutor-cta-bg" src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=75&auto=format" alt="" loading="lazy">
    <h2>${t(locale, 'tutor_cta.title')}</h2>
    <p>${t(locale, 'tutor_cta.subtitle')}</p>
    <a href="/onboarding" class="tutor-cta-btn">
      &#128640; ${t(locale, 'tutor_cta.button')}
    </a>
  </section>

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

  <!-- DISCORD WIDGET + POPUP -->
  <div class="discord-popup" id="discordPopup">
    <div class="discord-popup-header">
      <button class="discord-popup-close" onclick="document.getElementById('discordPopup').classList.remove('open')">&times;</button>
      <h4>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        ${t(locale, 'discord.popup_title')}
      </h4>
      <div class="discord-online">
        <span class="discord-online-dot"></span>
        12 ${locale === 'fr' ? 'en ligne' : locale === 'ar' ? '\u0645\u062a\u0635\u0644' : 'online'}
      </div>
    </div>
    <div class="discord-popup-body">
      <p>${t(locale, 'discord.popup_text')}</p>
      <ul class="discord-popup-features">
        <li><span>&#128218;</span> ${locale === 'fr' ? 'Aide aux devoirs entre \u00e9l\u00e8ves' : locale === 'ar' ? '\u0645\u0633\u0627\u0639\u062f\u0629 \u0641\u064a \u0627\u0644\u0648\u0627\u062c\u0628\u0627\u062a' : 'Homework help from peers'}</li>
        <li><span>&#127891;</span> ${locale === 'fr' ? 'Sessions Q&A avec les profs' : locale === 'ar' ? '\u062c\u0644\u0633\u0627\u062a \u0623\u0633\u0626\u0644\u0629 \u0645\u0639 \u0627\u0644\u0645\u0639\u0644\u0645\u064a\u0646' : 'Q&A sessions with tutors'}</li>
        <li><span>&#128640;</span> ${locale === 'fr' ? 'Ressources et astuces gratuites' : locale === 'ar' ? '\u0645\u0648\u0627\u0631\u062f \u0648\u0646\u0635\u0627\u0626\u062d \u0645\u062c\u0627\u0646\u064a\u0629' : 'Free resources & study tips'}</li>
      </ul>
      <a href="https://discord.gg/VOTRE_INVITE" class="discord-popup-cta" target="_blank" rel="noopener">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        ${t(locale, 'discord.popup_cta')}
      </a>
    </div>
  </div>
  <button class="discord-widget" id="discordBtn" title="${t(locale, 'discord.tooltip')}" onclick="document.getElementById('discordPopup').classList.toggle('open')">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
  </button>

  <!-- WHATSAPP WIDGET -->
  <a href="https://wa.me/MESSAGE" class="whatsapp-widget" title="${t(locale, 'whatsapp.tooltip')}" target="_blank" rel="noopener">
    &#128172;
  </a>

  <!-- STRUCTURED DATA (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "CallMyProf",
    "url": "https://callmyprof.com",
    "description": "${t(locale, 'seo.description').replace(/"/g, '\\"')}",
    "logo": "https://callmyprof.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "French", "Arabic"]
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": { "@type": "GeoCoordinates", "latitude": 33.89, "longitude": 35.50 },
      "geoRadius": "50000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Tutoring Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Individual Tutoring" },
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "15", "priceCurrency": "USD", "unitCode": "HUR" }
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Group Classes" },
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "8", "priceCurrency": "USD", "unitCode": "HUR" }
        }
      ]
    }
  }
  </script>

  <!-- SCRIPTS -->
  <script>
    // Service type toggle
    function selectServiceType(btn) {
      document.querySelectorAll('.service-type-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('service_type_input').value = btn.getAttribute('data-type');
    }

    // Form submission via fetch
    document.getElementById('ctaForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var form = e.target;
      var btn = document.getElementById('ctaSubmitBtn');
      var btnText = btn.querySelector('.btn-text');
      var btnLoading = btn.querySelector('.btn-loading');
      btn.classList.add('loading');
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';

      var formData = new FormData(form);
      var data = {};
      formData.forEach(function(val, key) { data[key] = val; });

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(res) { return res.json(); })
      .then(function(result) {
        if (result.success) {
          // Track conversion events
          if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'engagement', event_label: 'trial_lesson' });
          if (typeof fbq === 'function') fbq('track', 'Lead');
          window.location.href = '/thanks?lang=${locale}';
        } else {
          btn.classList.remove('loading');
          btnText.style.display = 'inline';
          btnLoading.style.display = 'none';
          alert(result.error || 'An error occurred. Please try again.');
        }
      })
      .catch(function() {
        btn.classList.remove('loading');
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        alert('Network error. Please try again.');
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  </script>
</body>
</html>`;
}

// ============================================================================
// THANK YOU PAGE
// ============================================================================

export function renderThanksPage(locale: Locale): string {
  const attrs = htmlAttrs(locale);
  return `<!DOCTYPE html>
<html lang="${attrs.lang}" dir="${attrs.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(locale, 'thanks.title')} - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc, #fff);
    }
    .thanks-card {
      text-align: center;
      max-width: 500px;
      animation: slideUp 0.6s ease both;
    }
    .thanks-icon {
      font-size: 80px;
      display: block;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    .thanks-card h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 12px;
    }
    .thanks-card p {
      font-size: 16px;
      color: var(--gray-500);
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .thanks-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: #fff;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s;
    }
    .thanks-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(220,38,38,0.4);
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="thanks-card">
    <span class="thanks-icon">&#9989;</span>
    <h1>${t(locale, 'thanks.title')}</h1>
    <p>${t(locale, 'thanks.message')}</p>
    <a href="/?lang=${locale}" class="thanks-btn">
      &#127968; ${t(locale, 'thanks.back')}
    </a>
  </div>
</body>
</html>`;
}
