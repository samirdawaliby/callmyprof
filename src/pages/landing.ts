/**
 * Soutien Scolaire Caplogy - Landing Page publique
 * Page marketing avec hero, simulateur, domaines, packages, temoignages
 * NO sidebar - standalone public page
 */

import { CSS_VARS, CSS_BASE, CSS_ANIMATIONS } from '../../shared/html-utils';
import { PACKAGES, formatPrix, TARIFS } from '../../shared/pricing';
import type { Env } from '../../shared/types';

// ============================================================================
// DOMAINES DATA
// ============================================================================

const DOMAINES = [
  { emoji: '\u{1F4DA}', nom: 'Soutien scolaire', desc: 'Maths, Fran\u00e7ais, Physique, SVT... du primaire au sup\u00e9rieur', nb: 50 },
  { emoji: '\u{1F30D}', nom: 'Langues vivantes', desc: 'Anglais, Espagnol, Allemand, Italien, Mandarin...', nb: 25 },
  { emoji: '\u{1F3B5}', nom: 'Musique & instruments', desc: 'Piano, guitare, chant, solf\u00e8ge et th\u00e9orie musicale', nb: 20 },
  { emoji: '\u{1F4BB}', nom: 'Informatique', desc: 'Programmation, bureautique, cr\u00e9ation num\u00e9rique', nb: 18 },
  { emoji: '\u{1F3A8}', nom: 'Arts & cr\u00e9ation', desc: 'Dessin, peinture, sculpture, arts visuels', nb: 15 },
  { emoji: '\u{26BD}', nom: 'Sport & bien-\u00eatre', desc: 'Coaching sportif, yoga, m\u00e9ditation, disciplines', nb: 22 },
  { emoji: '\u{1F393}', nom: 'Concours & pro', desc: 'Pr\u00e9pa concours, examens, formations pro', nb: 30 },
  { emoji: '\u{1F9E0}', nom: 'Accompagnement', desc: 'M\u00e9thodologie, DYS, TDAH, HPI, coaching scolaire', nb: 20 },
];

// ============================================================================
// TESTIMONIALS DATA
// ============================================================================

const TESTIMONIALS = [
  {
    note: 5,
    text: 'Notre fils a progress\u00e9 de 4 points en math\u00e9matiques en seulement 2 mois. Le formateur est exceptionnel, patient et p\u00e9dagogue.',
    name: 'Sophie M.',
    ville: 'Lyon',
    context: 'Maman de Lucas, 3\u00e8me',
  },
  {
    note: 5,
    text: 'Le cr\u00e9dit d\'imp\u00f4t de 50% rend le service vraiment accessible. Ma fille adore ses cours de piano et a fait des progr\u00e8s incroyables.',
    name: 'Pierre D.',
    ville: 'Paris',
    context: 'Papa de Camille, CM2',
  },
  {
    note: 4,
    text: 'Excellent accompagnement pour notre enfant TDAH. Le formateur comprend parfaitement ses besoins sp\u00e9cifiques et adapte ses m\u00e9thodes.',
    name: 'Isabelle R.',
    ville: 'Bordeaux',
    context: 'Maman de Th\u00e9o, 5\u00e8me',
  },
];

// ============================================================================
// CSS
// ============================================================================

const LANDING_CSS = `
  /* ---- Global landing ---- */
  body {
    background: var(--white);
    overflow-x: hidden;
  }

  /* ---- Navbar ---- */
  .landing-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(9, 40, 71, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(109, 203, 221, 0.15);
    transition: all 0.3s ease;
  }

  .landing-nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--white);
    font-size: 18px;
    font-weight: 700;
  }

  .landing-nav-logo img {
    height: 30px;
    border-radius: 6px;
  }

  .landing-nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .landing-nav-links a {
    padding: 8px 18px;
    color: rgba(255,255,255,0.8);
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .landing-nav-links a:hover {
    color: var(--white);
    background: rgba(255,255,255,0.08);
  }

  .landing-nav-links .nav-cta {
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    color: var(--primary-dark);
    font-weight: 700;
    padding: 9px 22px;
  }

  .landing-nav-links .nav-cta:hover {
    box-shadow: 0 4px 16px rgba(109, 203, 221, 0.4);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .landing-nav { padding: 12px 16px; }
    .landing-nav-links { gap: 4px; }
    .landing-nav-links a { padding: 7px 12px; font-size: 12px; }
  }

  /* ---- Hero ---- */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 40%, #1a5a9e 70%, var(--primary-dark) 100%);
    background-size: 300% 300%;
    animation: heroGradient 12s ease-in-out infinite;
    position: relative;
    overflow: hidden;
    padding: 120px 40px 80px;
    text-align: center;
  }

  @keyframes heroGradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  /* Floating shapes */
  .hero-shapes {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .hero-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
    background: var(--secondary);
  }

  .hero-shape:nth-child(1) {
    width: 500px; height: 500px;
    top: -10%; right: -8%;
    animation: floatShape1 18s ease-in-out infinite;
  }
  .hero-shape:nth-child(2) {
    width: 300px; height: 300px;
    bottom: -5%; left: -5%;
    animation: floatShape2 14s ease-in-out infinite;
    background: var(--secondary-light);
    opacity: 0.06;
  }
  .hero-shape:nth-child(3) {
    width: 200px; height: 200px;
    top: 30%; left: 10%;
    animation: floatShape3 10s ease-in-out infinite;
    opacity: 0.05;
  }
  .hero-shape:nth-child(4) {
    width: 150px; height: 150px;
    top: 20%; right: 15%;
    animation: floatShape2 12s ease-in-out infinite;
    animation-delay: 3s;
    background: #fff;
    opacity: 0.04;
  }
  .hero-shape:nth-child(5) {
    width: 80px; height: 80px;
    bottom: 25%; right: 25%;
    animation: floatShape1 8s ease-in-out infinite;
    animation-delay: 2s;
    opacity: 0.07;
  }
  .hero-shape:nth-child(6) {
    width: 120px; height: 120px;
    top: 50%; left: 25%;
    animation: floatShape3 15s ease-in-out infinite;
    animation-delay: 5s;
    opacity: 0.04;
    background: #fff;
  }

  @keyframes floatShape1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -40px) rotate(5deg); }
    66% { transform: translate(-20px, 20px) rotate(-3deg); }
  }
  @keyframes floatShape2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(40px, -30px) scale(1.05); }
  }
  @keyframes floatShape3 {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-50px) rotate(8deg); }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
  }

  .hero h1 {
    font-size: 52px;
    font-weight: 800;
    color: var(--white);
    letter-spacing: -1.5px;
    line-height: 1.12;
    margin-bottom: 20px;
    animation: slideUp 0.7s ease both;
  }

  .hero h1 .highlight {
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 20px;
    color: rgba(255,255,255,0.8);
    line-height: 1.6;
    margin-bottom: 12px;
    font-weight: 400;
    animation: slideUp 0.7s ease both;
    animation-delay: 0.15s;
  }

  .hero-credit {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(109, 203, 221, 0.3);
    border-radius: 30px;
    padding: 10px 24px;
    margin-bottom: 32px;
    font-size: 16px;
    color: var(--white);
    font-weight: 600;
    animation: bounceIn 0.8s ease both;
    animation-delay: 0.4s;
  }

  .hero-credit .original-price {
    text-decoration: line-through;
    opacity: 0.5;
    font-weight: 400;
  }

  .hero-credit .credit-badge {
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    color: var(--primary-dark);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 14px;
    animation: pulse 2.5s ease-in-out infinite;
  }

  .hero-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 40px;
    animation: slideUp 0.7s ease both;
    animation-delay: 0.3s;
    flex-wrap: wrap;
  }

  .hero-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 36px;
    border-radius: var(--radius-md);
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.25s ease;
    border: none;
    cursor: pointer;
  }

  .hero-btn-primary {
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    color: var(--primary-dark);
    box-shadow: 0 4px 20px rgba(109, 203, 221, 0.4);
  }
  .hero-btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(109, 203, 221, 0.5);
    color: var(--primary-dark);
  }

  .hero-btn-outline {
    background: transparent;
    color: var(--white);
    border: 2px solid rgba(255,255,255,0.3);
  }
  .hero-btn-outline:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.6);
    transform: translateY(-3px);
    color: var(--white);
  }

  .hero-badges {
    display: flex;
    justify-content: center;
    gap: 28px;
    flex-wrap: wrap;
    animation: fadeIn 1s ease both;
    animation-delay: 0.6s;
  }

  .hero-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: rgba(255,255,255,0.7);
    font-size: 12px;
    font-weight: 500;
  }

  .hero-badge .badge-icon {
    font-size: 28px;
    animation: float 3s ease-in-out infinite;
  }
  .hero-badge:nth-child(2) .badge-icon { animation-delay: 1s; }
  .hero-badge:nth-child(3) .badge-icon { animation-delay: 2s; }

  @media (max-width: 768px) {
    .hero { padding: 100px 20px 60px; }
    .hero h1 { font-size: 32px; }
    .hero-subtitle { font-size: 16px; }
    .hero-btn { padding: 14px 24px; font-size: 14px; }
  }

  /* ---- Section common ---- */
  .landing-section {
    padding: 90px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .landing-section { padding: 60px 20px; }
  }

  .section-title {
    font-size: 36px;
    font-weight: 800;
    color: var(--gray-900);
    text-align: center;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }

  .section-subtitle {
    font-size: 17px;
    color: var(--gray-500);
    text-align: center;
    max-width: 600px;
    margin: 0 auto 48px;
    line-height: 1.6;
  }

  /* ---- Price simulator ---- */
  .simulator-section {
    background: var(--gray-50);
  }

  .simulator-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 90px 40px;
  }

  .simulator-card {
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 40px 48px;
    max-width: 700px;
    margin: 0 auto;
    border: 1px solid var(--gray-100);
  }

  .sim-controls {
    display: flex;
    gap: 20px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .sim-type-btns {
    display: flex;
    gap: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid var(--gray-200);
  }

  .sim-type-btn {
    padding: 12px 28px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: var(--white);
    color: var(--gray-600);
    transition: all 0.2s ease;
  }

  .sim-type-btn.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: var(--white);
  }

  .sim-slider-wrap {
    flex: 1;
    min-width: 200px;
  }

  .sim-slider-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .sim-slider-label .sim-hours-val {
    color: var(--primary);
    font-weight: 800;
    font-size: 15px;
  }

  .sim-slider {
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 4px;
    background: var(--gray-200);
    outline: none;
  }

  .sim-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(13,56,101,0.3);
    transition: transform 0.15s ease;
  }
  .sim-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  .sim-result {
    text-align: center;
    padding: 28px 0 0;
    border-top: 1px solid var(--gray-100);
  }

  .sim-result-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .sim-original {
    font-size: 28px;
    font-weight: 700;
    color: var(--gray-400);
    text-decoration: line-through;
    position: relative;
  }

  @keyframes strikeThrough {
    from { width: 0; }
    to { width: 100%; }
  }

  .sim-arrow {
    font-size: 24px;
    color: var(--success);
    animation: pulse 2s ease-in-out infinite;
  }

  .sim-final {
    font-size: 42px;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -1px;
  }

  .sim-credit-info {
    font-size: 14px;
    color: var(--gray-500);
    margin-top: 4px;
  }

  .sim-credit-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--success-light);
    color: #065f46;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    margin-top: 12px;
    border: 1px solid #a7f3d0;
  }

  .sim-hourly {
    font-size: 14px;
    color: var(--gray-500);
    margin-top: 10px;
  }

  /* ---- Domaines grid ---- */
  .domaines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }

  .domaine-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 28px 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(30px);
  }

  .domaine-card.visible {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .domaine-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-xl);
  }

  .domaine-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--secondary), var(--primary-light));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .domaine-card:hover::after { opacity: 1; }

  .domaine-emoji {
    font-size: 44px;
    margin-bottom: 14px;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }
  .domaine-card:nth-child(2) .domaine-emoji { animation-delay: 0.5s; }
  .domaine-card:nth-child(3) .domaine-emoji { animation-delay: 1s; }
  .domaine-card:nth-child(4) .domaine-emoji { animation-delay: 1.5s; }
  .domaine-card:nth-child(5) .domaine-emoji { animation-delay: 2s; }
  .domaine-card:nth-child(6) .domaine-emoji { animation-delay: 2.5s; }
  .domaine-card:nth-child(7) .domaine-emoji { animation-delay: 3s; }
  .domaine-card:nth-child(8) .domaine-emoji { animation-delay: 3.5s; }

  .domaine-nom {
    font-size: 17px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 8px;
  }

  .domaine-desc {
    font-size: 13px;
    color: var(--gray-500);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .domaine-count {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: var(--primary);
    background: rgba(13, 56, 101, 0.06);
    padding: 4px 12px;
    border-radius: 20px;
  }

  /* ---- How it works ---- */
  .how-section {
    background: linear-gradient(160deg, var(--primary-dark), var(--primary));
    color: var(--white);
    padding: 90px 40px;
  }

  .how-section .section-title { color: var(--white); }
  .how-section .section-subtitle { color: rgba(255,255,255,0.7); }

  .how-steps {
    display: flex;
    justify-content: center;
    gap: 0;
    position: relative;
    max-width: 900px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .how-steps { flex-direction: column; align-items: center; gap: 20px; }
    .how-step-line { display: none; }
  }

  .how-step {
    flex: 1;
    text-align: center;
    position: relative;
    padding: 0 20px;
    animation: slideUp 0.6s ease both;
  }
  .how-step:nth-child(1) { animation-delay: 0.1s; }
  .how-step:nth-child(2) { animation-delay: 0.3s; }
  .how-step:nth-child(3) { animation-delay: 0.5s; }

  .how-step-number {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    color: var(--primary-dark);
    font-size: 26px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 18px;
    position: relative;
    z-index: 2;
    box-shadow: 0 4px 16px rgba(109, 203, 221, 0.3);
  }

  .how-step-line {
    position: absolute;
    top: 32px;
    left: 50%;
    width: 100%;
    height: 3px;
    background: rgba(109, 203, 221, 0.3);
    z-index: 1;
  }
  .how-step:last-child .how-step-line { display: none; }

  .how-step-icon {
    font-size: 36px;
    margin-bottom: 12px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  .how-step:nth-child(2) .how-step-icon { animation-delay: 1s; }
  .how-step:nth-child(3) .how-step-icon { animation-delay: 2s; }

  .how-step-title {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .how-step-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.5;
  }

  /* ---- Packages comparison ---- */
  .packages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 18px;
  }

  .package-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 28px 22px;
    box-shadow: var(--shadow-sm);
    border: 2px solid var(--gray-100);
    text-align: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .package-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-xl);
    border-color: var(--secondary);
  }

  .package-card.popular {
    border-color: var(--secondary);
    box-shadow: var(--shadow-lg);
    transform: scale(1.03);
  }

  .package-card.popular:hover {
    transform: scale(1.03) translateY(-6px);
  }

  .package-badge-popular {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    color: var(--primary-dark);
    font-size: 11px;
    font-weight: 800;
    padding: 4px 16px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    animation: pulse 2.5s ease-in-out infinite;
    white-space: nowrap;
  }

  .package-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 4px;
    margin-top: 4px;
  }

  .package-hours {
    font-size: 13px;
    color: var(--gray-500);
    margin-bottom: 16px;
  }

  .package-price {
    font-size: 32px;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -1px;
    margin-bottom: 2px;
  }

  .package-per-hour {
    font-size: 13px;
    color: var(--gray-500);
    margin-bottom: 12px;
  }

  .package-credit {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 14px;
  }

  .package-credit.eligible {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .package-credit.not-eligible {
    background: var(--gray-100);
    color: var(--gray-500);
    border: 1px solid var(--gray-200);
  }

  .package-final-price {
    font-size: 14px;
    color: var(--gray-600);
    padding-top: 12px;
    border-top: 1px solid var(--gray-100);
  }

  .package-final-price strong {
    color: var(--success);
    font-weight: 800;
    font-size: 18px;
  }

  .package-desc {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 8px;
    line-height: 1.4;
  }

  /* ---- Testimonials ---- */
  .testimonials-section {
    background: var(--gray-50);
  }

  .testimonials-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 90px 40px;
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .testimonial-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 28px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    position: relative;
    transition: all 0.3s ease;
  }
  .testimonial-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .testimonial-stars {
    margin-bottom: 14px;
    font-size: 20px;
    letter-spacing: 2px;
  }

  .testimonial-text {
    font-style: italic;
    color: var(--gray-700);
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 18px;
    position: relative;
    padding-left: 18px;
  }

  .testimonial-text::before {
    content: '\\201C';
    position: absolute;
    left: 0;
    top: -2px;
    font-size: 24px;
    color: var(--secondary);
    font-style: normal;
    font-weight: 800;
  }

  .testimonial-author {
    display: flex;
    align-items: center;
    gap: 12px;
    border-top: 1px solid var(--gray-100);
    padding-top: 14px;
  }

  .testimonial-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: var(--primary-dark);
    flex-shrink: 0;
  }

  .testimonial-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-900);
  }

  .testimonial-context {
    font-size: 12px;
    color: var(--gray-500);
  }

  /* ---- Formateur CTA ---- */
  .formateur-cta {
    background: linear-gradient(160deg, var(--primary-dark), var(--primary), #1a5a9e);
    padding: 90px 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .formateur-cta::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: rgba(109,203,221,0.06);
    animation: floatShape1 20s ease-in-out infinite;
  }

  .formateur-cta-inner {
    max-width: 700px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .formateur-cta h2 {
    font-size: 36px;
    font-weight: 800;
    color: var(--white);
    margin-bottom: 14px;
    letter-spacing: -1px;
  }

  .formateur-cta-subtitle {
    font-size: 17px;
    color: rgba(255,255,255,0.75);
    margin-bottom: 28px;
    line-height: 1.6;
  }

  .formateur-benefits {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
  }

  .formateur-benefit {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 14px;
    color: rgba(255,255,255,0.9);
    font-weight: 500;
  }

  .formateur-benefit .benefit-icon {
    font-size: 18px;
  }

  /* ---- Footer ---- */
  .landing-footer {
    background: var(--gray-900);
    color: rgba(255,255,255,0.6);
    padding: 48px 40px 28px;
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
  }

  @media (max-width: 768px) {
    .footer-inner { grid-template-columns: 1fr 1fr; gap: 28px; }
  }
  @media (max-width: 480px) {
    .footer-inner { grid-template-columns: 1fr; }
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--white);
    font-size: 16px;
    font-weight: 700;
  }

  .footer-logo img {
    height: 28px;
    border-radius: 6px;
  }

  .footer-brand p {
    font-size: 13px;
    line-height: 1.6;
    color: rgba(255,255,255,0.5);
  }

  .footer-col h4 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.8);
    margin-bottom: 14px;
  }

  .footer-col a {
    display: block;
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    padding: 4px 0;
    transition: color 0.2s ease;
  }

  .footer-col a:hover {
    color: var(--secondary);
  }

  .footer-bottom {
    max-width: 1200px;
    margin: 28px auto 0;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    flex-wrap: wrap;
    gap: 12px;
  }

  /* ---- Smooth scroll ---- */
  html {
    scroll-behavior: smooth;
  }
`;

// ============================================================================
// RENDER
// ============================================================================

export async function renderLanding(env: Env): Promise<string> {
  // Build packages HTML from PACKAGES data
  const packagesHtml = PACKAGES.map(pkg => {
    const isPopular = pkg.tag === 'Populaire';
    const credit = pkg.eligible_credit_impot ? Math.round(pkg.prix * 0.5 * 100) / 100 : 0;
    const resteACharge = pkg.prix - credit;

    return `
      <div class="package-card${isPopular ? ' popular' : ''}">
        ${pkg.tag ? `<div class="package-badge-popular">${pkg.tag}</div>` : ''}
        <div class="package-name">${pkg.nom}</div>
        <div class="package-hours">${pkg.nb_heures}h &middot; ${pkg.type_cours === 'collectif' ? 'Collectif' : 'Individuel'}</div>
        <div class="package-price">${formatPrix(pkg.prix)}</div>
        <div class="package-per-hour">${formatPrix(pkg.prix_par_heure)}/h</div>
        <div class="package-credit ${pkg.eligible_credit_impot ? 'eligible' : 'not-eligible'}">
          ${pkg.eligible_credit_impot ? '\u2705 Cr\u00e9dit d\'imp\u00f4t 50%' : '\u274C Non \u00e9ligible'}
        </div>
        ${pkg.eligible_credit_impot ? `
          <div class="package-final-price">
            Soit <strong>${formatPrix(resteACharge)}</strong> apr\u00e8s cr\u00e9dit
          </div>
        ` : ''}
        <div class="package-desc">${pkg.description}</div>
      </div>`;
  }).join('');

  // Domaines cards HTML
  const domainesHtml = DOMAINES.map(d => `
    <div class="domaine-card">
      <div class="domaine-emoji">${d.emoji}</div>
      <div class="domaine-nom">${d.nom}</div>
      <div class="domaine-desc">${d.desc}</div>
      <span class="domaine-count">${d.nb}+ th\u00e9matiques</span>
    </div>
  `).join('');

  // Testimonials HTML
  const starsFor = (n: number) => {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += i <= n ? '<span style="color: #f59e0b;">\u2605</span>' : '<span style="color: #e2e8f0;">\u2605</span>';
    }
    return s;
  };

  const testimonialsHtml = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${starsFor(t.note)}</div>
      <div class="testimonial-text">${t.text}</div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testimonial-name">${t.name} &middot; ${t.ville}</div>
          <div class="testimonial-context">${t.context}</div>
        </div>
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soutien Scolaire Caplogy - Cours particuliers \u00e0 domicile</title>
  <meta name="description" content="Soutien scolaire, langues, musique, informatique... Cours particuliers \u00e0 domicile avec cr\u00e9dit d'imp\u00f4t de 50%. SAP agr\u00e9\u00e9, 200+ th\u00e9matiques.">
  <link rel="icon" href="https://www.caplogy.com/logo_C.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    ${LANDING_CSS}
  </style>
</head>
<body>

  <!-- Navbar -->
  <nav class="landing-nav">
    <a href="/" class="landing-nav-logo">
      <img src="https://www.caplogy.com/logo_C.png" alt="Caplogy">
      <span>Soutien Scolaire</span>
    </a>
    <div class="landing-nav-links">
      <a href="#domaines">Domaines</a>
      <a href="#tarifs">Tarifs</a>
      <a href="#temoignages">Avis</a>
      <a href="/onboarding" class="nav-cta">Devenir formateur</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero" id="hero">
    <div class="hero-shapes">
      <div class="hero-shape"></div>
      <div class="hero-shape"></div>
      <div class="hero-shape"></div>
      <div class="hero-shape"></div>
      <div class="hero-shape"></div>
      <div class="hero-shape"></div>
    </div>
    <div class="hero-content">
      <h1>
        <span class="highlight">Soutien Scolaire</span><br>
        &agrave; domicile par Caplogy
      </h1>
      <p class="hero-subtitle">
        Cours particuliers et collectifs dans 200+ th&eacute;matiques.
        Des formateurs qualifi&eacute;s, un suivi personnalis&eacute;.
      </p>
      <div class="hero-credit">
        <span class="original-price">36,00 &euro;/h</span>
        <span>\u2192</span>
        <span class="credit-badge">-50% Cr&eacute;dit d'imp&ocirc;t</span>
        <span>\u2192</span>
        <strong>18,00 &euro;/h</strong>
      </div>
      <div class="hero-buttons">
        <a href="#simulator" class="hero-btn hero-btn-primary">
          \u{1F4B0} Simuler mon prix
        </a>
        <a href="/onboarding" class="hero-btn hero-btn-outline">
          \u{1F468}\u{200D}\u{1F3EB} Devenir formateur
        </a>
      </div>
      <div class="hero-badges">
        <div class="hero-badge">
          <span class="badge-icon">\u{1F3E0}</span>
          <span>SAP Agr&eacute;&eacute;</span>
        </div>
        <div class="hero-badge">
          <span class="badge-icon">\u{1F4B3}</span>
          <span>Cr&eacute;dit d'imp&ocirc;t 50%</span>
        </div>
        <div class="hero-badge">
          <span class="badge-icon">\u{1F4DA}</span>
          <span>200+ th&eacute;matiques</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Price simulator -->
  <section class="simulator-section" id="simulator">
    <div class="simulator-inner">
      <h2 class="section-title">Simulez votre tarif</h2>
      <p class="section-subtitle">
        D&eacute;couvrez le co&ucirc;t r&eacute;el de vos cours apr&egrave;s cr&eacute;dit d'imp&ocirc;t de 50%.
      </p>
      <div class="simulator-card">
        <div class="sim-controls">
          <div class="sim-type-btns">
            <button class="sim-type-btn active" onclick="setSimType('individuel')" id="sim-btn-individuel">Individuel</button>
            <button class="sim-type-btn" onclick="setSimType('collectif')" id="sim-btn-collectif">Collectif</button>
          </div>
          <div class="sim-slider-wrap">
            <div class="sim-slider-label">
              <span>Nombre d'heures</span>
              <span class="sim-hours-val" id="sim-hours-label">1h</span>
            </div>
            <input type="range" class="sim-slider" id="sim-slider" min="1" max="20" value="1" oninput="updateSim()">
          </div>
        </div>
        <div class="sim-result">
          <div class="sim-result-row">
            <span class="sim-original" id="sim-original">36,00 &euro;</span>
            <span class="sim-arrow">\u2192</span>
            <span class="sim-final" id="sim-final">18,00 &euro;</span>
          </div>
          <div class="sim-credit-info" id="sim-credit-info">
            Cr&eacute;dit d'imp&ocirc;t de 18,00 &euro;
          </div>
          <div class="sim-credit-badge" id="sim-credit-badge">
            \u2705 &Eacute;ligible au cr&eacute;dit d'imp&ocirc;t 50%
          </div>
          <div class="sim-hourly" id="sim-hourly">
            Soit 18,00 &euro;/h apr&egrave;s cr&eacute;dit d'imp&ocirc;t
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 8 Domaines -->
  <section class="landing-section" id="domaines">
    <h2 class="section-title">8 domaines, 200+ th&eacute;matiques</h2>
    <p class="section-subtitle">
      Du soutien scolaire classique aux activit&eacute;s cr&eacute;atives, trouvez la th&eacute;matique qui correspond &agrave; vos besoins.
    </p>
    <div class="domaines-grid">
      ${domainesHtml}
    </div>
  </section>

  <!-- How it works -->
  <section class="how-section" id="comment">
    <h2 class="section-title">Comment &ccedil;a marche ?</h2>
    <p class="section-subtitle">
      3 &eacute;tapes simples pour d&eacute;marrer.
    </p>
    <div class="how-steps">
      <div class="how-step">
        <div class="how-step-number">1</div>
        <div class="how-step-line"></div>
        <span class="how-step-icon">\u{1F4DA}</span>
        <div class="how-step-title">Choisissez vos th&eacute;matiques</div>
        <div class="how-step-desc">S&eacute;lectionnez parmi 200+ th&eacute;matiques dans 8 domaines diff&eacute;rents.</div>
      </div>
      <div class="how-step">
        <div class="how-step-number">2</div>
        <div class="how-step-line"></div>
        <span class="how-step-icon">\u{1F50D}</span>
        <div class="how-step-title">Nous trouvons votre formateur</div>
        <div class="how-step-desc">Notre algorithme associe le formateur id&eacute;al selon le profil et les besoins.</div>
      </div>
      <div class="how-step">
        <div class="how-step-number">3</div>
        <span class="how-step-icon">\u{1F393}</span>
        <div class="how-step-title">Commencez les cours</div>
        <div class="how-step-desc">Les cours d&eacute;marrent &agrave; domicile ou en ligne. Suivez les progr&egrave;s en temps r&eacute;el.</div>
      </div>
    </div>
  </section>

  <!-- Packages -->
  <section class="landing-section" id="tarifs">
    <h2 class="section-title">Nos formules</h2>
    <p class="section-subtitle">
      Des packages adapt&eacute;s &agrave; tous les besoins et tous les budgets.
    </p>
    <div class="packages-grid">
      ${packagesHtml}
    </div>
  </section>

  <!-- Testimonials -->
  <section class="testimonials-section" id="temoignages">
    <div class="testimonials-inner">
      <h2 class="section-title">Ce que disent nos familles</h2>
      <p class="section-subtitle">
        Des milliers de familles nous font confiance pour l'accompagnement de leurs enfants.
      </p>
      <div class="testimonials-grid">
        ${testimonialsHtml}
      </div>
    </div>
  </section>

  <!-- Formateur CTA -->
  <section class="formateur-cta" id="formateur">
    <div class="formateur-cta-inner">
      <h2>Devenez formateur Caplogy</h2>
      <p class="formateur-cta-subtitle">
        Rejoignez notre r&eacute;seau de formateurs qualifi&eacute;s. G&eacute;rez votre emploi du temps,
        choisissez vos &eacute;l&egrave;ves et g&eacute;n&eacute;rez des revenus compl&eacute;mentaires.
      </p>
      <div class="formateur-benefits">
        <div class="formateur-benefit">
          <span class="benefit-icon">\u{1F4C5}</span>
          Flexibilit&eacute; totale
        </div>
        <div class="formateur-benefit">
          <span class="benefit-icon">\u{1F4B0}</span>
          22-30 &euro;/h
        </div>
        <div class="formateur-benefit">
          <span class="benefit-icon">\u{1F4F1}</span>
          Outils num&eacute;riques
        </div>
        <div class="formateur-benefit">
          <span class="benefit-icon">\u{1F91D}</span>
          Accompagnement admin
        </div>
      </div>
      <a href="/onboarding" class="hero-btn hero-btn-primary">
        \u{1F680} Rejoindre l'&eacute;quipe
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="landing-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="/" class="footer-logo">
          <img src="https://www.caplogy.com/logo_C.png" alt="Caplogy">
          <span>Soutien Scolaire Caplogy</span>
        </a>
        <p>
          Service d'aide &agrave; la personne agr&eacute;&eacute; SAP. Cours particuliers et collectifs
          &agrave; domicile dans toute la France. &Eacute;ligible au cr&eacute;dit d'imp&ocirc;t de 50%.
        </p>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="#domaines">Soutien scolaire</a>
        <a href="#domaines">Langues</a>
        <a href="#domaines">Musique</a>
        <a href="#domaines">Informatique</a>
        <a href="#tarifs">Nos formules</a>
      </div>
      <div class="footer-col">
        <h4>Formateurs</h4>
        <a href="/onboarding">Devenir formateur</a>
        <a href="/login">Espace formateur</a>
      </div>
      <div class="footer-col">
        <h4>L&eacute;gal</h4>
        <a href="#">Mentions l&eacute;gales</a>
        <a href="#">CGV</a>
        <a href="#">Politique de confidentialit&eacute;</a>
        <a href="#">Contact</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} Caplogy SAS. Tous droits r&eacute;serv&eacute;s.</span>
      <span>TVA non applicable, art. 293 B du CGI</span>
    </div>
  </footer>

  <!-- Scripts -->
  <script>
    // ---- Price simulator ----
    let simType = 'individuel';
    const tarifIndividuel = ${TARIFS.individuel.tarif_horaire};
    const tarifCollectif = ${TARIFS.collectif.tarif_horaire_par_eleve};

    function fmt(n) {
      return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \\u20AC';
    }

    function setSimType(t) {
      simType = t;
      document.getElementById('sim-btn-individuel').classList.toggle('active', t === 'individuel');
      document.getElementById('sim-btn-collectif').classList.toggle('active', t === 'collectif');
      updateSim();
    }

    function updateSim() {
      const hours = parseInt(document.getElementById('sim-slider').value);
      document.getElementById('sim-hours-label').textContent = hours + 'h';

      const tarif = simType === 'individuel' ? tarifIndividuel : tarifCollectif;
      const total = tarif * hours;
      const eligible = simType === 'individuel';
      const credit = eligible ? total * 0.5 : 0;
      const final_ = total - credit;

      document.getElementById('sim-original').textContent = fmt(total);
      document.getElementById('sim-final').textContent = fmt(final_);

      if (eligible) {
        document.getElementById('sim-original').style.textDecoration = 'line-through';
        document.getElementById('sim-credit-info').textContent = 'Cr\\u00e9dit d\\'imp\\u00f4t de ' + fmt(credit);
        document.getElementById('sim-credit-badge').innerHTML = '\\u2705 \\u00C9ligible au cr\\u00e9dit d\\'imp\\u00f4t 50%';
        document.getElementById('sim-credit-badge').style.background = '#d1fae5';
        document.getElementById('sim-credit-badge').style.color = '#065f46';
        document.getElementById('sim-hourly').textContent = 'Soit ' + fmt(final_ / hours) + '/h apr\\u00e8s cr\\u00e9dit d\\'imp\\u00f4t';
      } else {
        document.getElementById('sim-original').style.textDecoration = 'none';
        document.getElementById('sim-credit-info').textContent = 'Collectif - pas de cr\\u00e9dit d\\'imp\\u00f4t';
        document.getElementById('sim-credit-badge').innerHTML = '\\u274C Non \\u00e9ligible au cr\\u00e9dit d\\'imp\\u00f4t';
        document.getElementById('sim-credit-badge').style.background = '#f1f5f9';
        document.getElementById('sim-credit-badge').style.color = '#64748b';
        document.getElementById('sim-hourly').textContent = 'Soit ' + fmt(final_ / hours) + '/h';
      }
    }

    // ---- IntersectionObserver for domaine cards ----
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.domaine-card');
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, index) {
          if (entry.isIntersecting) {
            setTimeout(function() {
              entry.target.classList.add('visible');
            }, index * 80);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      cards.forEach(function(card) {
        observer.observe(card);
      });
    });
  </script>
</body>
</html>`;

  return html;
}
