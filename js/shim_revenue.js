/* Sterling Styles — Revenue & CM management site (standalone copy of the My Brain "Revenue / CM Earned" group).
   Provides the small set of globals the My Brain page modules expect (State, go, render, renderNav, esc, fmtShort, rowsOf, toast). */
window.State = { module: 'revenue', scope: 'all', charts: [] };
window.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
window.fmtShort = n => { const a = Math.abs(n); return (n < 0 ? '-' : '') + (a >= 1e6 ? (a / 1e6).toFixed(2) + 'M' : a >= 1e3 ? (a / 1e3).toFixed(1) + 'K' : String(Math.round(a))); };
window.rowsOf = () => [];
window.MYBRAIN_KPI = { rankXlsx: 'reports/kpi/Buyer_Ranking_Formula_Breakdown_to-17Oct.xlsx', rankHtml: 'reports/kpi/Buyer_Ranking_Formula_Breakdown_to-17Oct.html' };
window.toast = (msg) => { const t = document.getElementById('toasts'); if (!t) return; const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; t.appendChild(d); setTimeout(() => d.remove(), 3000); };
const RV = { view: 'mgmt' };
try { RV.view = localStorage.getItem('ss.rv.view') || 'mgmt'; } catch (e) {}
const REPORTS = {
  mgmt: { label: 'Management dashboard', src: 'reports/revenue/Revenue_CM_Management_Dashboard.html', dl: [['reports/revenue/Revenue_CM_Management_Dashboard.html', 'HTML'], ['reports/revenue/Revenue_CM_Management_Review.pdf', 'Deck PDF'], ['reports/revenue/Revenue_CM_Management_Review.pptx', 'Deck PPTX']] },
  kpi: { label: 'Buyer KPI report', src: 'reports/kpi/Buyer_KPI_Dashboard_to-17Oct.html', dl: [['reports/kpi/Buyer_KPI_Dashboard_to-17Oct.html', 'HTML'], ['reports/kpi/Buyer_KPI_Deck_to-17Oct.pdf', 'KPI deck PDF'], ['reports/kpi/Buyer_KPI_Deck_to-17Oct.pptx', 'KPI deck PPTX'], ['reports/kpi/Buyer_KPI_2026_to-17Oct.xlsx', 'KPI pack Excel']] },
  rank: { label: 'Buyer ranking formula', src: 'reports/kpi/Buyer_Ranking_Formula_Breakdown_to-17Oct.html', dl: [['reports/kpi/Buyer_Ranking_Formula_Breakdown_to-17Oct.xlsx', 'Ranking formula Excel'], ['reports/kpi/Buyer_Ranking_Formula_Breakdown_to-17Oct.html', 'HTML']] }
};
window.renderNav = function () {
  const nav = document.getElementById('nav'); nav.innerHTML = '';
  const lbl = document.createElement('div'); lbl.className = 'nav-label nav-label-all'; lbl.textContent = 'All Buyers'; nav.appendChild(lbl);
  const b = document.createElement('button');
  b.className = 'nav-item nav-ws nav-all' + (State.module === 'revenue' ? ' active' : '');
  b.style.setProperty('--accent', 'var(--p6)'); b.style.setProperty('--accent-ink', 'var(--p6-ink)'); b.style.setProperty('--accent-soft', 'var(--p6-soft)');
  b.innerHTML = '<span class="ws-ico">$</span><span class="grow">Revenue / CM Earned</span>';
  b.onclick = () => go('revenue', 'all'); nav.appendChild(b);
};
window.render = function () {
  State.charts.forEach(c => { try { c.destroy(); } catch (e) {} }); State.charts = [];
  const main = document.getElementById('main'); const D = window.MYBRAIN_MANPOWER || {};
  const R = REPORTS[RV.view] || REPORTS.mgmt;
  main.innerHTML = `<div class="page-head" style="--accent:var(--p6);--accent-ink:var(--p6-ink);--accent-soft:var(--p6-soft)">
      <h1 class="page-title">$ Revenue / CM Earned <span class="page-chip">All buyers</span></h1>
      <div class="page-sub">Source: <b>Revenue/${esc(D.source || '—')}</b> · ${esc(D.period || '')} · sub-pages: Manpower, Finishing, Line × Style, Buyer Ranking (left menu)</div></div>
    <div class="row wrap" style="justify-content:space-between;gap:10px">
      <div class="rv-tabs">${Object.entries(REPORTS).map(([k, r]) => `<button class="btn-soft rv-t${k === RV.view ? ' on' : ''}" data-k="${k}">${r.label}</button>`).join('')}</div>
      <div class="rv-dl">${R.dl.map(([f, l]) => `<a class="btn-soft" href="${encodeURI(f)}" download>⤓ ${l}</a>`).join('')}<a class="btn-soft" href="${encodeURI(R.src)}" target="_blank" rel="noopener">↗ Full screen</a></div>
    </div>
    <iframe class="rv-frame" src="${encodeURI(R.src)}" title="${esc(R.label)}"></iframe>
    <div class="mg-note">Read-only management copy of the My Brain Revenue group. Numbers come from the Revenue file named above; nothing is entered or stored here.</div>`;
  main.querySelectorAll('.rv-t').forEach(x => x.onclick = () => { RV.view = x.dataset.k; try { localStorage.setItem('ss.rv.view', RV.view); } catch (e) {} render(); });
};
window.go = function (id, scope) {
  State.module = id; State.scope = scope || 'all';
  try { if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id); } catch (e) {}
  renderNav(); render(); document.querySelector('.sidebar').classList.remove('open'); window.scrollTo(0, 0);
};
function applyTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('ss.theme', t); } catch (e) {} document.getElementById('themeBtn').textContent = t === 'dark' ? '☀' : '☾'; }
window.startSite = function () {
  let t = 'light'; try { t = localStorage.getItem('ss.theme') || 'light'; } catch (e) {}
  applyTheme(t);
  document.getElementById('themeBtn').onclick = () => { applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); render(); };
  document.getElementById('menuBtn').onclick = () => document.querySelector('.sidebar').classList.toggle('open');
  const D = window.MYBRAIN_MANPOWER || {}; document.getElementById('asOf').textContent = D.period ? 'Data: ' + D.period : '';
  const h = (location.hash || '').slice(1);
  go(['mp', 'fin', 'linestyle', 'rankf'].includes(h) ? h : 'revenue', 'all');
};
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== State.module && ['revenue', 'mp', 'fin', 'linestyle', 'rankf'].includes(h)) go(h, 'all'); });
