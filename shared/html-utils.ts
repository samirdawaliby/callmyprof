/**
 * CallMyProf - HTML utilities
 * Sidebar SSR, CSS design system, animations, components
 * Red + White + Charcoal theme with RTL support
 */

import { type Locale, t, htmlAttrs } from './i18n/index';

// ============================================================================
// ESCAPE & FORMAT HELPERS
// ============================================================================

/**
 * Echappe les caracteres HTML pour prevenir XSS
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Format a date according to locale
 */
export function formatDate(dateStr: string | undefined | null, locale: Locale = 'en'): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    const localeMap: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-LB' };
    return date.toLocaleDateString(localeMap[locale], { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '-';
  }
}

/** Backwards compat alias */
export function formatDateFr(dateStr: string | undefined | null): string {
  return formatDate(dateStr, 'fr');
}

/** Format currency amount */
export function formatCurrency(amount: number, currency = 'USD', locale: Locale = 'en'): string {
  const localeMap: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-LB' };
  return new Intl.NumberFormat(localeMap[locale], { style: 'currency', currency }).format(amount);
}

// ============================================================================
// CSS VARIABLES (Design System Caplogy)
// ============================================================================

export const CSS_VARS = `
  :root {
    --primary: #DC2626;
    --primary-dark: #B91C1C;
    --primary-light: #EF4444;
    --secondary: #1E293B;
    --secondary-light: #334155;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-900: #0f172a;
    --success: #10b981;
    --success-light: #d1fae5;
    --warning: #f59e0b;
    --warning-light: #fef3c7;
    --danger: #ef4444;
    --danger-light: #fee2e2;
    --blue: #3b82f6;
    --blue-light: #dbeafe;
    --purple: #8b5cf6;
    --purple-light: #ede9fe;
    --hot: #f97316;
    --hot-light: #ffedd5;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 10px 30px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
    --shadow-xl: 0 20px 50px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06);
    --transition-fast: 0.15s ease;
    --transition-normal: 0.25s ease;
    --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// ============================================================================
// CSS BASE (Reset + Body)
// ============================================================================

export const CSS_BASE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--gray-50);
    min-height: 100vh;
    color: var(--gray-900);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: var(--primary); text-decoration: none; }
  a:hover { color: var(--primary-dark); }
  img { max-width: 100%; height: auto; }
`;

// ============================================================================
// CSS ANIMATIONS
// ============================================================================

export const CSS_ANIMATIONS = `
  /* ---- Keyframes ---- */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  /* ---- Animation utilities ---- */
  .animate-fadeIn { animation: fadeIn 0.4s ease both; }
  .animate-slideUp { animation: slideUp 0.5s ease both; }
  .animate-slideDown { animation: slideDown 0.3s ease both; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-bounceIn { animation: bounceIn 0.6s ease both; }
  .animate-float { animation: float 3s ease-in-out infinite; }

  /* ---- Stagger animation for cards ---- */
  .card { animation: slideUp 0.5s ease both; }
  .card:nth-child(1) { animation-delay: 0.05s; }
  .card:nth-child(2) { animation-delay: 0.1s; }
  .card:nth-child(3) { animation-delay: 0.15s; }
  .card:nth-child(4) { animation-delay: 0.2s; }
  .card:nth-child(5) { animation-delay: 0.25s; }
  .card:nth-child(6) { animation-delay: 0.3s; }
  .card:nth-child(7) { animation-delay: 0.35s; }
  .card:nth-child(8) { animation-delay: 0.4s; }

  /* ---- Hover transforms ---- */
  .hover-lift {
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .hover-scale {
    transition: transform var(--transition-fast);
  }
  .hover-scale:hover {
    transform: scale(1.03);
  }

  .hover-glow {
    transition: box-shadow var(--transition-normal);
  }
  .hover-glow:hover {
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
  }

  /* ---- Smooth transitions on all interactive elements ---- */
  button, a, input, select, textarea, .btn, .card, .sidebar-link {
    transition: all var(--transition-fast);
  }

  /* ---- Loading spinner ---- */
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray-200);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  /* ---- Notification badge pulse ---- */
  .notification-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: var(--danger);
    color: var(--white);
    font-size: 11px;
    font-weight: 700;
    animation: pulse 2s ease-in-out infinite;
  }
`;

// ============================================================================
// CSS CARDS (Stat cards, content cards)
// ============================================================================

export const CSS_CARDS = `
  /* ---- Stats grid ---- */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  /* ---- Stat card ---- */
  .stat-card {
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 22px 24px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    position: relative;
    overflow: hidden;
    animation: slideUp 0.5s ease both;
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.1s; }
  .stat-card:nth-child(3) { animation-delay: 0.15s; }
  .stat-card:nth-child(4) { animation-delay: 0.2s; }
  .stat-card:nth-child(5) { animation-delay: 0.25s; }
  .stat-card:nth-child(6) { animation-delay: 0.3s; }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
  .stat-card.blue::before { background: linear-gradient(90deg, var(--blue), var(--secondary)); }
  .stat-card.green::before { background: linear-gradient(90deg, var(--success), #34d399); }
  .stat-card.orange::before { background: linear-gradient(90deg, var(--hot), var(--warning)); }
  .stat-card.purple::before { background: linear-gradient(90deg, var(--purple), #a78bfa); }
  .stat-card.red::before { background: linear-gradient(90deg, var(--danger), #f87171); }
  .stat-card.teal::before { background: linear-gradient(90deg, var(--secondary), #2dd4bf); }

  .stat-card .stat-icon {
    font-size: 28px;
    margin-bottom: 10px;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }
  .stat-card:nth-child(2) .stat-icon { animation-delay: 0.5s; }
  .stat-card:nth-child(3) .stat-icon { animation-delay: 1s; }
  .stat-card:nth-child(4) .stat-icon { animation-delay: 1.5s; }

  .stat-card .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: var(--gray-900);
    line-height: 1.1;
    letter-spacing: -0.5px;
  }

  .stat-card .stat-label {
    font-size: 13px;
    color: var(--gray-500);
    margin-top: 4px;
    font-weight: 500;
  }

  .stat-card .stat-change {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
    padding: 2px 8px;
    border-radius: 20px;
  }
  .stat-card .stat-change.up {
    color: var(--success);
    background: var(--success-light);
  }
  .stat-card .stat-change.down {
    color: var(--danger);
    background: var(--danger-light);
  }

  /* ---- Content card ---- */
  .content-card {
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    overflow: hidden;
    animation: slideUp 0.5s ease both;
    transition: box-shadow var(--transition-normal);
  }
  .content-card:hover {
    box-shadow: var(--shadow-md);
  }

  .content-card-header {
    padding: 18px 24px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .content-card-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .content-card-body {
    padding: 20px 24px;
  }

  .content-card-footer {
    padding: 14px 24px;
    border-top: 1px solid var(--gray-100);
    background: var(--gray-50);
    font-size: 13px;
    color: var(--gray-500);
  }

  /* ---- Empty state ---- */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--gray-400);
    animation: fadeIn 0.5s ease both;
  }
  .empty-state .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  .empty-state .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 6px;
  }
  .empty-state .empty-text {
    font-size: 14px;
    color: var(--gray-400);
  }

  /* ---- Page header ---- */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
    animation: slideDown 0.4s ease both;
  }
  .page-header h1 {
    font-size: 26px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .page-header h1 .page-icon {
    font-size: 28px;
  }
  .page-header .page-subtitle {
    font-size: 14px;
    color: var(--gray-500);
    font-weight: 400;
    margin-top: 2px;
  }

  /* ---- Button styles ---- */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }
  .btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  .btn:active {
    transform: translateY(0);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: var(--white);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
    color: var(--white);
    box-shadow: 0 4px 12px rgba(220,38,38,0.3);
  }

  .btn-secondary {
    background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
    color: var(--primary-dark);
  }
  .btn-secondary:hover {
    box-shadow: 0 4px 12px rgba(30,41,59,0.3);
    color: var(--primary-dark);
  }

  .btn-success {
    background: linear-gradient(135deg, var(--success) 0%, #34d399 100%);
    color: var(--white);
  }
  .btn-success:hover {
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    color: var(--white);
  }

  .btn-danger {
    background: linear-gradient(135deg, var(--danger) 0%, #f87171 100%);
    color: var(--white);
  }
  .btn-danger:hover {
    box-shadow: 0 4px 12px rgba(239,68,68,0.3);
    color: var(--white);
  }

  .btn-warning {
    background: linear-gradient(135deg, var(--warning) 0%, #fbbf24 100%);
    color: var(--gray-900);
  }
  .btn-warning:hover {
    box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    color: var(--gray-900);
  }

  .btn-outline {
    background: var(--white);
    color: var(--gray-700);
    border: 1px solid var(--gray-200);
  }
  .btn-outline:hover {
    background: var(--gray-50);
    border-color: var(--gray-300);
    color: var(--gray-900);
  }

  .btn-sm {
    padding: 6px 14px;
    font-size: 12px;
    border-radius: 6px;
  }

  .btn-lg {
    padding: 14px 28px;
    font-size: 16px;
    border-radius: var(--radius-md);
  }

  .btn-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
  }

  .btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

// ============================================================================
// CSS TABLE
// ============================================================================

export const CSS_TABLE = `
  .table-wrapper {
    overflow-x: auto;
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-100);
    background: var(--white);
    box-shadow: var(--shadow-sm);
    animation: slideUp 0.5s ease both;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead {
    background: linear-gradient(180deg, var(--gray-50) 0%, var(--gray-100) 100%);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  thead th {
    padding: 14px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-600);
    border-bottom: 2px solid var(--gray-200);
    white-space: nowrap;
  }

  tbody tr {
    transition: background var(--transition-fast);
    border-bottom: 1px solid var(--gray-100);
  }

  tbody tr:nth-child(even) {
    background: var(--gray-50);
  }

  tbody tr:hover {
    background: rgba(220, 38, 38, 0.04);
  }

  tbody td {
    padding: 12px 16px;
    color: var(--gray-700);
    vertical-align: middle;
  }

  tbody td.text-right {
    text-align: right;
  }

  tbody td.text-center {
    text-align: center;
  }

  tbody td .cell-main {
    font-weight: 600;
    color: var(--gray-900);
  }

  tbody td .cell-sub {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 2px;
  }

  /* ---- Table actions ---- */
  .table-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .table-actions .btn-sm {
    padding: 4px 10px;
    font-size: 11px;
  }

  /* ---- Sortable header ---- */
  th.sortable {
    cursor: pointer;
    user-select: none;
  }
  th.sortable:hover {
    color: var(--primary);
  }
  th.sortable::after {
    content: ' \\2195';
    font-size: 10px;
    opacity: 0.4;
  }

  /* ---- User row with avatar ---- */
  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .user-cell .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gray-100);
    flex-shrink: 0;
    background: var(--gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--gray-500);
  }
  .user-cell .user-info .user-name {
    font-weight: 600;
    color: var(--gray-900);
    font-size: 14px;
  }
  .user-cell .user-info .user-meta {
    font-size: 12px;
    color: var(--gray-400);
  }

  /* ---- Star rating display ---- */
  .stars {
    color: var(--warning);
    font-size: 14px;
    letter-spacing: 1px;
  }
  .stars .empty { color: var(--gray-200); }
`;

// ============================================================================
// CSS FORMS
// ============================================================================

export const CSS_FORMS = `
  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: 6px;
    letter-spacing: -0.1px;
  }

  .form-label .required {
    color: var(--danger);
    margin-left: 2px;
  }

  .form-hint {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 4px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: var(--gray-900);
    background: var(--white);
    transition: all var(--transition-fast);
    outline: none;
  }

  .form-input:hover,
  .form-select:hover,
  .form-textarea:hover {
    border-color: var(--gray-300);
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
  }

  .form-input::placeholder {
    color: var(--gray-400);
  }

  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: var(--danger);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .form-error {
    font-size: 12px;
    color: var(--danger);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    animation: slideDown 0.2s ease both;
  }

  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }

  .form-textarea {
    min-height: 100px;
    resize: vertical;
    line-height: 1.6;
  }

  .form-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: var(--gray-700);
  }

  .form-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    accent-color: var(--primary);
    cursor: pointer;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .form-section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 28px 0 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--gray-100);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ---- Search / Filter bar ---- */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    padding: 16px 20px;
    background: var(--white);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-100);
    box-shadow: var(--shadow-sm);
    animation: slideDown 0.3s ease both;
  }

  .filter-bar .search-input {
    flex: 1;
    min-width: 200px;
    padding: 9px 14px 9px 38px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 14px;
    background: var(--gray-50);
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 12px center;
    transition: all var(--transition-fast);
    outline: none;
  }
  .filter-bar .search-input:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
    background-color: var(--white);
  }

  .filter-bar .filter-select {
    padding: 9px 36px 9px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-sm);
    font-size: 13px;
    background: var(--gray-50);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
    outline: none;
    transition: all var(--transition-fast);
  }
  .filter-bar .filter-select:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
  }

  /* ---- Upload zone ---- */
  .upload-zone {
    border: 2px dashed var(--gray-300);
    border-radius: var(--radius-md);
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--gray-50);
  }
  .upload-zone:hover {
    border-color: var(--secondary);
    background: rgba(220, 38, 38, 0.05);
  }
  .upload-zone.dragover {
    border-color: var(--secondary);
    background: rgba(220, 38, 38, 0.08);
    transform: scale(1.01);
  }
  .upload-zone .upload-icon {
    font-size: 36px;
    margin-bottom: 10px;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  .upload-zone .upload-text {
    font-size: 14px;
    color: var(--gray-500);
    font-weight: 500;
  }
  .upload-zone .upload-hint {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 4px;
  }
`;

// ============================================================================
// CSS BADGES
// ============================================================================

export const CSS_BADGES = `
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    transition: transform var(--transition-fast);
  }
  .badge:hover {
    transform: scale(1.05);
  }

  /* ---- Status badges ---- */
  .badge-valide, .badge-actif, .badge-payee, .badge-termine {
    background: var(--success-light);
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .badge-en_attente, .badge-planifie, .badge-brouillon {
    background: var(--warning-light);
    color: #92400e;
    border: 1px solid #fde68a;
  }

  .badge-refuse, .badge-echec, .badge-annule, .badge-rembourse {
    background: var(--danger-light);
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .badge-suspendu, .badge-expire, .badge-epuise, .badge-draft {
    background: var(--gray-100);
    color: var(--gray-600);
    border: 1px solid var(--gray-200);
  }

  .badge-confirme, .badge-emise, .badge-en_cours, .badge-submitted {
    background: var(--blue-light);
    color: #1e40af;
    border: 1px solid #93c5fd;
  }

  .badge-avoir {
    background: var(--purple-light);
    color: #5b21b6;
    border: 1px solid #c4b5fd;
  }

  /* ---- Type badges ---- */
  .badge-individuel {
    background: var(--blue-light);
    color: #1e40af;
    border: 1px solid #93c5fd;
  }

  .badge-collectif {
    background: var(--purple-light);
    color: #5b21b6;
    border: 1px solid #c4b5fd;
  }

  /* ---- Profile badges ---- */
  .badge-dys {
    background: var(--hot-light);
    color: #9a3412;
    border: 1px solid #fdba74;
  }

  .badge-tdah {
    background: #fce7f3;
    color: #9d174d;
    border: 1px solid #f9a8d4;
  }

  .badge-hpi {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #6ee7b7;
  }

  .badge-standard {
    background: var(--gray-100);
    color: var(--gray-600);
    border: 1px solid var(--gray-200);
  }

  /* ---- Badge with dot indicator ---- */
  .badge-dot::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge-valide.badge-dot::before,
  .badge-actif.badge-dot::before { background: var(--success); }
  .badge-en_attente.badge-dot::before { background: var(--warning); }
  .badge-refuse.badge-dot::before { background: var(--danger); }
  .badge-suspendu.badge-dot::before { background: var(--gray-400); }
  .badge-confirme.badge-dot::before,
  .badge-emise.badge-dot::before { background: var(--blue); }
`;

// ============================================================================
// SIDEBAR NAVIGATION SYSTEM
// ============================================================================

export interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  href: string;
  future?: boolean;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

/** Build sidebar sections with i18n */
export function getSidebarSections(locale: Locale): SidebarSection[] {
  return [
    {
      title: t(locale, 'sidebar.management'),
      items: [
        { key: 'dashboard', label: t(locale, 'sidebar.dashboard'), icon: '\u{1F4CA}', href: '/dashboard' },
        { key: 'leads', label: t(locale, 'sidebar.leads'), icon: '\u{1F4DE}', href: '/leads' },
        { key: 'formateurs', label: t(locale, 'sidebar.tutors'), icon: '\u{1F468}\u{200D}\u{1F3EB}', href: '/formateurs' },
        { key: 'familles', label: t(locale, 'sidebar.students'), icon: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}', href: '/familles' },
        { key: 'catalogue', label: t(locale, 'sidebar.catalogue'), icon: '\u{1F4DA}', href: '/catalogue' },
      ]
    },
    {
      title: t(locale, 'sidebar.operations'),
      items: [
        { key: 'cours', label: t(locale, 'sidebar.classes'), icon: '\u{1F4C5}', href: '/cours' },
        { key: 'sessions', label: 'Sessions', icon: '\u{1F3A5}', href: '/sessions' },
        { key: 'group-classes', label: t(locale, 'sidebar.group_classes'), icon: '\u{1F465}', href: '/group-classes' },
        { key: 'packages', label: t(locale, 'sidebar.packages'), icon: '\u{1F4E6}', href: '/packages' },
        { key: 'payments', label: t(locale, 'sidebar.payments'), icon: '\u{1F4B3}', href: '/payments' },
      ]
    },
    {
      title: t(locale, 'sidebar.tools'),
      items: [
        { key: 'avis', label: t(locale, 'sidebar.reviews'), icon: '\u{2B50}', href: '/avis' },
        { key: 'statistiques', label: t(locale, 'sidebar.stats'), icon: '\u{1F4C8}', href: '/statistiques' },
        { key: 'chatbot', label: t(locale, 'sidebar.chatbot'), icon: '\u{1F916}', href: '/chatbot-config' },
      ]
    },
  ];
}

// ============================================================================
// CSS SIDEBAR
// ============================================================================

export const CSS_SIDEBAR = `
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  /* ---- Sidebar ---- */
  .sidebar {
    width: 260px;
    background: linear-gradient(180deg, var(--secondary) 0%, #0F172A 100%);
    color: var(--white);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

  .sidebar-header {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    margin-bottom: 14px;
  }

  .sidebar-logo img {
    height: 32px;
    width: auto;
    border-radius: 6px;
  }

  .sidebar-logo span {
    color: var(--white);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .sidebar-user {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sidebar-user-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    display: inline-block;
    animation: pulse 2s ease-in-out infinite;
  }

  .sidebar-nav {
    flex: 1;
    padding: 12px 0;
    overflow-y: auto;
  }

  .sidebar-section {
    margin-bottom: 4px;
  }

  .sidebar-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: rgba(255,255,255,0.35);
    padding: 12px 20px 6px;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px;
    color: rgba(255,255,255,0.65);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    transition: all 0.15s ease;
    border-left: 3px solid transparent;
    position: relative;
  }

  .sidebar-link:hover {
    color: var(--white);
    background: rgba(255,255,255,0.07);
  }

  .sidebar-link.active {
    color: var(--white);
    background: rgba(255,255,255,0.1);
    border-left-color: var(--primary);
    font-weight: 600;
  }

  .sidebar-link .icon {
    width: 22px;
    text-align: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .sidebar-link.future {
    opacity: 0.35;
    pointer-events: none;
  }

  .sidebar-link.future::after {
    content: 'Soon';
    font-size: 9px;
    background: rgba(255,255,255,0.12);
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: auto;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .sidebar-footer {
    padding: 14px 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-logout {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    transition: all 0.15s ease;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .sidebar-logout:hover {
    color: var(--white);
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
  }

  /* ---- Main content ---- */
  .main-content {
    margin-left: 260px;
    flex: 1;
    min-height: 100vh;
    background: var(--gray-50);
  }

  .page-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 25px 30px;
  }

  /* ---- Mobile toggle ---- */
  .sidebar-toggle {
    display: none;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1001;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--secondary);
    color: var(--white);
    border: none;
    font-size: 18px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 999;
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .sidebar-toggle {
      display: flex;
    }
    .main-content {
      margin-left: 0;
    }
    .sidebar-overlay.open {
      display: block;
    }
    .page-inner {
      padding: 20px 16px;
    }
    .stats-grid {
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .page-header h1 {
      font-size: 22px;
    }
    .filter-bar {
      flex-direction: column;
      align-items: stretch;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1100px) and (min-width: 769px) {
    .sidebar { width: 220px; }
    .main-content { margin-left: 220px; }
    [dir="rtl"] .main-content { margin-left: 0; margin-right: 220px; }
  }

  /* ---- RTL Support ---- */
  [dir="rtl"] .sidebar {
    left: auto;
    right: 0;
    border-right: none;
    border-left: 1px solid rgba(255,255,255,0.06);
  }
  [dir="rtl"] .main-content {
    margin-left: 0;
    margin-right: 260px;
  }
  [dir="rtl"] .sidebar-link {
    border-left: none;
    border-right: 3px solid transparent;
  }
  [dir="rtl"] .sidebar-link.active {
    border-left-color: transparent;
    border-right-color: var(--primary);
  }
  [dir="rtl"] .sidebar-toggle {
    left: auto;
    right: 16px;
  }
  [dir="rtl"] .page-header {
    direction: rtl;
  }
  [dir="rtl"] thead th {
    text-align: right;
  }
  [dir="rtl"] .form-select {
    background-position: left 12px center;
    padding-right: 14px;
    padding-left: 36px;
  }
  [dir="rtl"] .filter-bar .search-input {
    background-position: right 12px center;
    padding-left: 14px;
    padding-right: 38px;
  }
  @media (max-width: 768px) {
    [dir="rtl"] .sidebar {
      transform: translateX(100%);
    }
    [dir="rtl"] .sidebar.open {
      transform: translateX(0);
    }
    [dir="rtl"] .main-content {
      margin-right: 0;
    }
  }
`;

// ============================================================================
// HTML GENERATORS
// ============================================================================

/**
 * Generate the common HTML <head> with all styles inlined
 */
export function htmlHead(title: string, extraCss = ''): string {
  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - CallMyProf</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${CSS_VARS}
    ${CSS_BASE}
    ${CSS_ANIMATIONS}
    ${CSS_SIDEBAR}
    ${CSS_CARDS}
    ${CSS_TABLE}
    ${CSS_FORMS}
    ${CSS_BADGES}
    ${extraCss}
  </style>`;
}

/**
 * Generate sidebar HTML with navigation
 */
export function htmlSidebar(activePage: string, userName?: string, locale: Locale = 'en'): string {
  const sections = getSidebarSections(locale).map(section => {
    const items = section.items.map(item => {
      const isActive = item.key === activePage ? ' active' : '';
      const isFuture = item.future ? ' future' : '';
      return `      <a href="${item.href}" class="sidebar-link${isActive}${isFuture}">
        <span class="icon">${item.icon}</span>
        ${item.label}
      </a>`;
    }).join('\n');

    return `    <div class="sidebar-section">
      <div class="sidebar-section-title">${section.title}</div>
${items}
    </div>`;
  }).join('\n');

  return `<button class="sidebar-toggle" onclick="toggleSidebar()">&#9776;</button>
  <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <a href="/dashboard" class="sidebar-logo">
        <span style="font-size:24px">&#128222;</span>
        <span>CallMyProf</span>
      </a>
      <div class="sidebar-user">
        <span class="sidebar-user-dot"></span>
        ${userName ? escapeHtml(userName.split(' ')[0]) : 'Admin'}
      </div>
    </div>
    <nav class="sidebar-nav">
${sections}
    </nav>
    <div class="sidebar-footer">
      <span>CallMyProf v1</span>
      <a href="/logout" class="sidebar-logout">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ${t(locale, 'nav.logout')}
      </a>
    </div>
  </aside>`;
}

/**
 * Full page wrapper with sidebar
 */
export function htmlPage(options: {
  title: string;
  activePage: string;
  extraCss?: string;
  content: string;
  userName?: string;
  locale?: Locale;
}): string {
  const locale = options.locale || 'en';
  const attrs = htmlAttrs(locale);
  return `<!DOCTYPE html>
<html lang="${attrs.lang}" dir="${attrs.dir}">
<head>
  ${htmlHead(options.title, options.extraCss || '')}
</head>
<body>
  <div class="app-layout">
    ${htmlSidebar(options.activePage, options.userName, locale)}
    <main class="main-content">
      <div class="page-inner">
        ${options.content}
      </div>
    </main>
  </div>
  <script>
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebar-overlay').classList.toggle('open');
    }
  </script>
</body>
</html>`;
}
