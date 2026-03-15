/**
 * Soutien Scolaire Caplogy - Page Statistiques
 * CA, heures, charts SVG, donut CSS, top formateurs
 */

import { htmlPage, escapeHtml, formatDateFr } from '../../shared/html-utils';
import { starsHTML } from '../../shared/utils';
import { formatPrix } from '../../shared/pricing';
import { formatNumber } from '../../shared/utils';
import type { Env } from '../../shared/types';

// ============================================================================
// CSS
// ============================================================================

const STATS_CSS = `
  /* ---- Period selector ---- */
  .period-selector {
    display: flex;
    gap: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid var(--gray-200);
    background: var(--white);
  }

  .period-btn {
    padding: 9px 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: var(--white);
    color: var(--gray-600);
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .period-btn:hover {
    background: var(--gray-50);
    color: var(--primary);
  }

  .period-btn.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: var(--white);
  }

  /* ---- Charts row ---- */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }

  @media (max-width: 900px) {
    .charts-row { grid-template-columns: 1fr; }
  }

  .chart-card {
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-100);
    overflow: hidden;
    animation: slideUp 0.5s ease both;
  }

  .chart-card-header {
    padding: 18px 24px;
    border-bottom: 1px solid var(--gray-100);
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chart-card-body {
    padding: 24px;
  }

  /* ---- SVG bar chart ---- */
  .bar-chart-svg {
    width: 100%;
    overflow: visible;
  }

  @keyframes barRise {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }

  .bar-chart-bar {
    animation: barRise 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
    transform-origin: bottom;
  }
  .bar-chart-bar:nth-child(1) { animation-delay: 0.1s; }
  .bar-chart-bar:nth-child(2) { animation-delay: 0.2s; }
  .bar-chart-bar:nth-child(3) { animation-delay: 0.3s; }
  .bar-chart-bar:nth-child(4) { animation-delay: 0.4s; }
  .bar-chart-bar:nth-child(5) { animation-delay: 0.5s; }
  .bar-chart-bar:nth-child(6) { animation-delay: 0.6s; }

  /* ---- Horizontal bar chart ---- */
  .hbar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    animation: slideInLeft 0.4s ease both;
  }
  .hbar-row:nth-child(1) { animation-delay: 0.1s; }
  .hbar-row:nth-child(2) { animation-delay: 0.15s; }
  .hbar-row:nth-child(3) { animation-delay: 0.2s; }
  .hbar-row:nth-child(4) { animation-delay: 0.25s; }
  .hbar-row:nth-child(5) { animation-delay: 0.3s; }
  .hbar-row:nth-child(6) { animation-delay: 0.35s; }
  .hbar-row:nth-child(7) { animation-delay: 0.4s; }
  .hbar-row:nth-child(8) { animation-delay: 0.45s; }

  .hbar-label {
    width: 130px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .hbar-label .hbar-emoji {
    font-size: 16px;
  }

  .hbar-track {
    flex: 1;
    height: 26px;
    background: var(--gray-100);
    border-radius: 13px;
    overflow: hidden;
    position: relative;
  }

  .hbar-fill {
    height: 100%;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    font-size: 11px;
    font-weight: 700;
    color: var(--white);
    min-width: 0;
    animation: barGrow 1s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @keyframes barGrow {
    from { width: 0 !important; }
  }

  .hbar-fill.blue { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
  .hbar-fill.teal { background: linear-gradient(90deg, var(--secondary), #2dd4bf); }
  .hbar-fill.green { background: linear-gradient(90deg, var(--success), #34d399); }
  .hbar-fill.orange { background: linear-gradient(90deg, var(--hot), var(--warning)); }
  .hbar-fill.purple { background: linear-gradient(90deg, var(--purple), #a78bfa); }
  .hbar-fill.red { background: linear-gradient(90deg, var(--danger), #f87171); }
  .hbar-fill.pink { background: linear-gradient(90deg, #ec4899, #f9a8d4); }
  .hbar-fill.indigo { background: linear-gradient(90deg, #6366f1, #818cf8); }

  .hbar-value {
    width: 50px;
    text-align: right;
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-600);
    flex-shrink: 0;
  }

  /* ---- Donut chart ---- */
  .donut-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
  }

  .donut {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: bounceIn 0.8s ease both;
  }

  .donut-inner {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: var(--white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }

  .donut-inner .donut-pct {
    font-size: 28px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -1px;
    line-height: 1;
  }

  .donut-inner .donut-label {
    font-size: 11px;
    color: var(--gray-500);
    font-weight: 500;
    margin-top: 2px;
  }

  .donut-legend {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .donut-legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--gray-700);
  }

  .donut-legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .donut-legend-value {
    font-weight: 700;
    margin-left: auto;
    color: var(--gray-900);
  }

  /* ---- Progress ring ---- */
  .ring-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .ring-svg {
    width: 160px;
    height: 160px;
    transform: rotate(-90deg);
  }

  .ring-bg {
    fill: none;
    stroke: var(--gray-100);
    stroke-width: 12;
  }

  .ring-progress {
    fill: none;
    stroke-width: 12;
    stroke-linecap: round;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes ringDraw {
    from { stroke-dashoffset: var(--ring-circumference); }
  }

  .ring-progress {
    animation: ringDraw 1.5s cubic-bezier(0.4, 0, 0.2, 1) both;
    animation-delay: 0.3s;
  }

  .ring-label {
    text-align: center;
  }

  .ring-value {
    font-size: 36px;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -1px;
  }

  .ring-text {
    font-size: 14px;
    color: var(--gray-500);
    font-weight: 500;
  }

  /* ---- Top formateurs table ---- */
  .top-formateurs-table {
    width: 100%;
    border-collapse: collapse;
  }

  .top-formateurs-table thead th {
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-500);
    border-bottom: 2px solid var(--gray-100);
  }

  .top-formateurs-table tbody td {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-100);
  }

  .top-formateurs-table tbody tr {
    transition: background 0.15s ease;
  }
  .top-formateurs-table tbody tr:hover {
    background: rgba(109, 203, 221, 0.06);
  }

  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 800;
  }

  .rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: var(--white); }
  .rank-2 { background: linear-gradient(135deg, #cbd5e1, #94a3b8); color: var(--white); }
  .rank-3 { background: linear-gradient(135deg, #f97316, #ea580c); color: var(--white); }
  .rank-default { background: var(--gray-100); color: var(--gray-500); }

  /* ---- Bottom grid ---- */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }

  @media (max-width: 1100px) {
    .bottom-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 700px) {
    .bottom-grid { grid-template-columns: 1fr; }
  }
`;

// ============================================================================
// DATA HELPERS
// ============================================================================

interface MoisCA {
  mois: string;
  label: string;
  montant: number;
}

interface DomaineHeures {
  nom: string;
  icone: string;
  heures: number;
}

interface TopFormateur {
  nom: string;
  prenom: string;
  heures: number;
  note: number;
}

async function getStatsData(env: Env, periode: number) {
  // Calculate date range
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - periode);
  const startStr = startDate.toISOString().split('T')[0];

  // Total CA
  const caResult = await env.DB.prepare(`
    SELECT COALESCE(SUM(montant_brut), 0) as total_ca
    FROM factures
    WHERE date_emission >= ? AND statut IN ('emise', 'payee')
  `).bind(startStr).first<{ total_ca: number }>();

  // Total heures
  const heuresResult = await env.DB.prepare(`
    SELECT COALESCE(SUM(duree_minutes), 0) as total_minutes
    FROM cours
    WHERE date_cours >= ? AND statut = 'termine'
  `).bind(startStr).first<{ total_minutes: number }>();

  // Nb eleves actifs
  const elevesResult = await env.DB.prepare(`
    SELECT COUNT(DISTINCT ce.eleve_id) as nb_eleves
    FROM cours_eleves ce
    JOIN cours c ON c.id = ce.cours_id
    WHERE c.date_cours >= ? AND c.statut = 'termine'
  `).bind(startStr).first<{ nb_eleves: number }>();

  // Nb formateurs actifs
  const formateursResult = await env.DB.prepare(`
    SELECT COUNT(DISTINCT formateur_id) as nb_formateurs
    FROM cours
    WHERE date_cours >= ? AND statut = 'termine'
  `).bind(startStr).first<{ nb_formateurs: number }>();

  // CA par mois (last 6 months)
  const moisStart = new Date(now);
  moisStart.setMonth(moisStart.getMonth() - 5);
  const caParMoisRows = await env.DB.prepare(`
    SELECT
      strftime('%Y-%m', date_emission) as mois,
      SUM(montant_brut) as montant
    FROM factures
    WHERE date_emission >= ? AND statut IN ('emise', 'payee')
    GROUP BY mois
    ORDER BY mois
  `).bind(moisStart.toISOString().split('T')[0]).all<{ mois: string; montant: number }>();

  const moisLabels = ['Jan', 'F\u00e9v', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Ao\u00fb', 'Sep', 'Oct', 'Nov', 'D\u00e9c'];
  const caMap = new Map((caParMoisRows.results || []).map(r => [r.mois, r.montant]));
  const caParMois: MoisCA[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    caParMois.push({
      mois: key,
      label: moisLabels[d.getMonth()],
      montant: caMap.get(key) || 0,
    });
  }

  // Heures par domaine
  const domaineHeuresRows = await env.DB.prepare(`
    SELECT
      d.nom, d.icone,
      COALESCE(SUM(c.duree_minutes), 0) as minutes
    FROM domaines d
    LEFT JOIN sous_domaines sd ON sd.domaine_id = d.id
    LEFT JOIN thematiques t ON t.sous_domaine_id = sd.id
    LEFT JOIN cours c ON c.thematique_id = t.id AND c.date_cours >= ? AND c.statut = 'termine'
    WHERE d.actif = 1
    GROUP BY d.id
    ORDER BY minutes DESC
  `).bind(startStr).all<{ nom: string; icone: string; minutes: number }>();

  const domaineHeures: DomaineHeures[] = (domaineHeuresRows.results || []).map(r => ({
    nom: r.nom,
    icone: r.icone || '\u{1F4DA}',
    heures: Math.round(r.minutes / 60 * 10) / 10,
  }));

  // Top formateurs by heures
  const topRows = await env.DB.prepare(`
    SELECT
      f.nom, f.prenom,
      COALESCE(SUM(c.duree_minutes), 0) as total_minutes,
      f.note_moyenne
    FROM formateurs f
    JOIN cours c ON c.formateur_id = f.id AND c.date_cours >= ? AND c.statut = 'termine'
    GROUP BY f.id
    ORDER BY total_minutes DESC
    LIMIT 5
  `).bind(startStr).all<{ nom: string; prenom: string; total_minutes: number; note_moyenne: number }>();

  const topFormateurs: TopFormateur[] = (topRows.results || []).map(r => ({
    nom: r.nom,
    prenom: r.prenom,
    heures: Math.round(r.total_minutes / 60 * 10) / 10,
    note: r.note_moyenne,
  }));

  // Repartition individuel/collectif
  const repResult = await env.DB.prepare(`
    SELECT
      type_cours,
      COUNT(*) as nb
    FROM cours
    WHERE date_cours >= ? AND statut = 'termine'
    GROUP BY type_cours
  `).bind(startStr).all<{ type_cours: string; nb: number }>();

  const repMap = new Map((repResult.results || []).map(r => [r.type_cours, r.nb]));
  const nbIndividuel = repMap.get('individuel') || 0;
  const nbCollectif = repMap.get('collectif') || 0;
  const totalCours = nbIndividuel + nbCollectif;
  const pctIndividuel = totalCours > 0 ? Math.round((nbIndividuel / totalCours) * 100) : 50;
  const pctCollectif = totalCours > 0 ? 100 - pctIndividuel : 50;

  // Taux retention (eleves avec >1 cours)
  const retentionResult = await env.DB.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN cnt > 1 THEN eleve_id END) as retained,
      COUNT(DISTINCT eleve_id) as total_eleves
    FROM (
      SELECT ce.eleve_id, COUNT(*) as cnt
      FROM cours_eleves ce
      JOIN cours c ON c.id = ce.cours_id AND c.date_cours >= ?
      GROUP BY ce.eleve_id
    )
  `).bind(startStr).first<{ retained: number; total_eleves: number }>();

  const retentionPct = (retentionResult?.total_eleves || 0) > 0
    ? Math.round(((retentionResult?.retained || 0) / (retentionResult?.total_eleves || 1)) * 100)
    : 0;

  return {
    totalCA: caResult?.total_ca || 0,
    totalHeures: Math.round((heuresResult?.total_minutes || 0) / 60 * 10) / 10,
    nbEleves: elevesResult?.nb_eleves || 0,
    nbFormateurs: formateursResult?.nb_formateurs || 0,
    caParMois,
    domaineHeures,
    topFormateurs,
    pctIndividuel,
    pctCollectif,
    nbIndividuel,
    nbCollectif,
    retentionPct,
  };
}

// ============================================================================
// RENDER
// ============================================================================

export async function renderStatistiques(env: Env, url: URL): Promise<string> {
  const periodeParam = url.searchParams.get('periode') || '6';
  const periode = [1, 3, 6, 12].includes(parseInt(periodeParam)) ? parseInt(periodeParam) : 6;

  const data = await getStatsData(env, periode);

  // Period buttons
  const periods = [
    { val: 1, label: 'Ce mois' },
    { val: 3, label: '3 mois' },
    { val: 6, label: '6 mois' },
    { val: 12, label: '12 mois' },
  ];
  const periodBtns = periods.map(p =>
    `<a href="/statistiques?periode=${p.val}" class="period-btn${p.val === periode ? ' active' : ''}">${p.label}</a>`
  ).join('');

  // SVG bar chart for CA par mois
  const maxCA = Math.max(...data.caParMois.map(m => m.montant), 1);
  const chartWidth = 480;
  const chartHeight = 220;
  const barWidth = 52;
  const barGap = 24;
  const chartPadding = 30;

  const svgBars = data.caParMois.map((m, i) => {
    const barH = maxCA > 0 ? (m.montant / maxCA) * (chartHeight - 40) : 0;
    const x = chartPadding + i * (barWidth + barGap);
    const y = chartHeight - barH - 20;
    const amountLabel = m.montant > 0 ? formatPrix(m.montant) : '0 \u20AC';

    return `
      <g class="bar-chart-bar" style="animation-delay: ${0.1 + i * 0.1}s">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="6" fill="url(#barGrad)" />
        <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#334155" font-size="11" font-weight="700">${amountLabel}</text>
        <text x="${x + barWidth / 2}" y="${chartHeight - 2}" text-anchor="middle" fill="#94a3b8" font-size="12" font-weight="600">${m.label}</text>
      </g>`;
  }).join('');

  const svgChart = `
    <svg class="bar-chart-svg" viewBox="0 0 ${chartPadding * 2 + data.caParMois.length * (barWidth + barGap)} ${chartHeight + 10}">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6dcbdd" />
          <stop offset="100%" stop-color="#0d3865" />
        </linearGradient>
      </defs>
      <!-- Baseline -->
      <line x1="${chartPadding}" y1="${chartHeight - 20}" x2="${chartPadding + data.caParMois.length * (barWidth + barGap)}" y2="${chartHeight - 20}" stroke="#e2e8f0" stroke-width="1" />
      ${svgBars}
    </svg>`;

  // Horizontal bars for domaines
  const maxDomHeures = Math.max(...data.domaineHeures.map(d => d.heures), 1);
  const barColors = ['blue', 'teal', 'green', 'orange', 'purple', 'red', 'pink', 'indigo'];
  const domainesBars = data.domaineHeures.map((d, i) => {
    const pct = Math.round((d.heures / maxDomHeures) * 100);
    const color = barColors[i % barColors.length];
    return `
      <div class="hbar-row">
        <span class="hbar-label"><span class="hbar-emoji">${escapeHtml(d.icone)}</span> ${escapeHtml(d.nom)}</span>
        <div class="hbar-track">
          <div class="hbar-fill ${color}" style="width: ${Math.max(pct, 2)}%"></div>
        </div>
        <span class="hbar-value">${d.heures}h</span>
      </div>`;
  }).join('');

  // Top formateurs table
  const topTable = data.topFormateurs.length > 0
    ? data.topFormateurs.map((f, i) => {
      const rankClass = i < 3 ? `rank-${i + 1}` : 'rank-default';
      return `
        <tr>
          <td><span class="rank-badge ${rankClass}">${i + 1}</span></td>
          <td><strong>${escapeHtml(f.prenom)} ${escapeHtml(f.nom)}</strong></td>
          <td>${f.heures}h</td>
          <td>${starsHTML(Math.round(f.note))}</td>
        </tr>`;
    }).join('')
    : '<tr><td colspan="4" style="text-align:center; color: var(--gray-400); padding: 20px;">Aucune donn\u00e9e</td></tr>';

  // Donut chart CSS
  const donutGradient = `conic-gradient(
    var(--primary) 0% ${data.pctIndividuel}%,
    var(--secondary) ${data.pctIndividuel}% 100%
  )`;

  // Retention ring
  const ringCircumference = 2 * Math.PI * 62; // radius = 62
  const ringOffset = ringCircumference - (data.retentionPct / 100) * ringCircumference;

  const content = `
    <div class="page-header">
      <div>
        <h1><span class="page-icon">\u{1F4C8}</span> Statistiques</h1>
        <div class="page-subtitle">Vue d'ensemble de l'activit&eacute;</div>
      </div>
      <div class="period-selector">
        ${periodBtns}
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <span class="stat-icon">\u{1F4B0}</span>
        <div class="stat-value">${formatPrix(data.totalCA)}</div>
        <div class="stat-label">CA total</div>
      </div>
      <div class="stat-card teal">
        <span class="stat-icon">\u{23F0}</span>
        <div class="stat-value">${data.totalHeures}h</div>
        <div class="stat-label">Heures de cours</div>
      </div>
      <div class="stat-card green">
        <span class="stat-icon">\u{1F393}</span>
        <div class="stat-value">${formatNumber(data.nbEleves)}</div>
        <div class="stat-label">&Eacute;l&egrave;ves actifs</div>
      </div>
      <div class="stat-card purple">
        <span class="stat-icon">\u{1F468}\u{200D}\u{1F3EB}</span>
        <div class="stat-value">${formatNumber(data.nbFormateurs)}</div>
        <div class="stat-label">Formateurs actifs</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <div class="chart-card" style="animation-delay: 0.15s">
        <div class="chart-card-header">\u{1F4CA} CA par mois</div>
        <div class="chart-card-body" style="overflow-x: auto;">
          ${svgChart}
        </div>
      </div>
      <div class="chart-card" style="animation-delay: 0.25s">
        <div class="chart-card-header">\u{1F4DA} Heures par domaine</div>
        <div class="chart-card-body">
          ${domainesBars || '<div style="text-align:center; color: var(--gray-400); padding: 20px;">Aucune donn\u00e9e</div>'}
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="bottom-grid">
      <!-- Top formateurs -->
      <div class="chart-card" style="animation-delay: 0.35s">
        <div class="chart-card-header">\u{1F3C6} Top formateurs</div>
        <div class="chart-card-body" style="padding: 0;">
          <table class="top-formateurs-table">
            <thead>
              <tr>
                <th style="width:50px">#</th>
                <th>Formateur</th>
                <th>Heures</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${topTable}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Donut individuel/collectif -->
      <div class="chart-card" style="animation-delay: 0.45s">
        <div class="chart-card-header">\u{1F4CA} R&eacute;partition des cours</div>
        <div class="chart-card-body">
          <div class="donut-container">
            <div class="donut" style="background: ${donutGradient}">
              <div class="donut-inner">
                <span class="donut-pct">${data.pctIndividuel}%</span>
                <span class="donut-label">Individuel</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="donut-legend-item">
                <span class="donut-legend-dot" style="background: var(--primary);"></span>
                Individuel
                <span class="donut-legend-value">${data.nbIndividuel}</span>
              </div>
              <div class="donut-legend-item">
                <span class="donut-legend-dot" style="background: var(--secondary);"></span>
                Collectif
                <span class="donut-legend-value">${data.nbCollectif}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Retention ring -->
      <div class="chart-card" style="animation-delay: 0.55s">
        <div class="chart-card-header">\u{1F504} Taux de r&eacute;tention</div>
        <div class="chart-card-body">
          <div class="ring-container">
            <svg class="ring-svg" viewBox="0 0 140 140">
              <circle class="ring-bg" cx="70" cy="70" r="62" />
              <circle
                class="ring-progress"
                cx="70" cy="70" r="62"
                stroke="${data.retentionPct >= 60 ? 'var(--success)' : data.retentionPct >= 30 ? 'var(--warning)' : 'var(--danger)'}"
                stroke-dasharray="${ringCircumference}"
                stroke-dashoffset="${ringOffset}"
                style="--ring-circumference: ${ringCircumference}"
              />
            </svg>
            <div class="ring-label">
              <div class="ring-value">${data.retentionPct}%</div>
              <div class="ring-text">&Eacute;l&egrave;ves avec +1 cours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return htmlPage({
    title: 'Statistiques',
    activePage: 'statistiques',
    extraCss: STATS_CSS,
    content,
    userName: 'Admin',
  });
}
