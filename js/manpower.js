/* My Brain v4.33 — Revenue sub-pages (All Buyers): 👥 Manpower · 🧺 Finishing · 🧵 Line × Style · 🏆 Buyer Ranking (formula + worked examples).
   Data: data/manpower.js (window.MYBRAIN_MANPOWER) from Revenue/Buyer wise average CM & earned report (sheet 2026, one row per sewing line-day). */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const MP = () => window.MYBRAIN_MANPOWER || { buyers: [], monthly: [], lines: [], lineSum: [], months: [], factory: {}, ranking: { rows: [] } };
  const ND = '<span class="nd">— (no data)</span>';
  const n0 = v => v == null ? '—' : Math.round(v).toLocaleString('en-US');
  const n1 = v => v == null ? '—' : (+v).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const m0 = v => v == null ? '—' : (v < 0 ? '−$' : '$') + Math.abs(Math.round(v)).toLocaleString('en-US');
  const m2 = v => v == null ? '—' : '$' + (+v).toFixed(2);
  const d4 = v => v == null ? '—' : '$' + (+v).toFixed(4);
  const pc = v => v == null ? '—' : (+v).toFixed(1) + '%';
  const MON = m => { const [y, mm] = String(m).split('-'); return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+mm - 1] + '-' + String(y).slice(2); };
  const SER = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#7c5cd6', '#8a8f98'];
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#666';
  const effCol = (v, std) => v == null ? '' : v >= std ? 'color:var(--ok-ink,#1a7f37);font-weight:650' : v < std - 10 ? 'color:var(--bad);font-weight:650' : '';
  const head = (ico, t, chip, sub, ac = 6) => `<div class="page-head" style="--accent:var(--p${ac});--accent-ink:var(--p${ac}-ink);--accent-soft:var(--p${ac}-soft)">
      <h1 class="page-title">${ico} ${t} <span class="page-chip">${chip}</span></h1><div class="page-sub">${sub}</div></div>`;
  const srcLine = D => `Source: <b>Revenue/${esc(D.source)}</b> · sheet 2026 (sewing line-days) · ${esc(D.period)} · built ${esc(D.generated)}`;
  const mk = (id, cfg) => { const c = document.getElementById(id); if (c && window.Chart) State.charts.push(new Chart(c, cfg)); };
  const tt = () => ({ backgroundColor: css('--surface'), titleColor: css('--text'), bodyColor: css('--text'), borderColor: css('--border'), borderWidth: 1, padding: 10 });

  /* ======================= MANPOWER ======================= */
  let VM = Object.assign({ buyer: '', view: 'sew' }, LS.get('mybrain.mp.view', {}));
  function pageMP(main) {
    const D = MP(), F = D.factory, B = D.buyers, std = D.stdEff;
    const top = B.slice(0, 7), rest = B.slice(7);
    const sel = B.find(b => b.buyer === VM.buyer);
    main.innerHTML = head('👥', 'Manpower', `${n0(F.manDays)} man-days · ${B.length} buyers`, `${srcLine(D)}<br>Running manpower = OP-1 + HP-1 per line-day · Efficiency = produced min (pcs × SMV) ÷ available min (manpower × W.HRS × 60) · Finishing: ${ND}`) + `
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Avg sewing manpower / day</div><div class="value">${n0(F.avgMpDay)}</div><div class="foot">${F.days} working days · ${F.lines} lines</div></div>
        <div class="kpi"><div class="label">People per line</div><div class="value">${n1(F.avgMpLine)}</div><div class="foot">operators + helpers · helper share ${pc(F.helperPct)}</div></div>
        <div class="kpi"><div class="label">Sewing efficiency</div><div class="value" style="${effCol(F.eff, std)}">${pc(F.eff)}</div><div class="foot">target ${std}% · ${(F.prodMin / 1e6).toFixed(1)}M produced min</div></div>
        <div class="kpi"><div class="label">Output per person</div><div class="value">${n1(F.pcsMan)} pcs</div><div class="foot">per man-day · ${m2(F.earnedMan)} earned</div></div>
        <div class="kpi"><div class="label">Finishing manpower</div><div class="value" style="font-size:20px">— (no data)</div><div class="foot">add finishing report → Total updates</div></div>
      </div>
      <div class="card" style="margin:16px 0"><div class="card-head"><div class="card-title">Monthly — average sewing manpower per working day, by buyer</div><span class="tiny muted">stacked · top 7 buyers + others</span></div>
        <div class="lc-chart" style="height:340px"><canvas id="mp1"></canvas></div></div>
      <div class="lc-2col">
        <div class="card"><div class="card-head"><div class="card-title">Efficiency by buyer</div><span class="tiny muted">sewing · dashed = ${std}% target</span></div><div class="lc-chart" style="height:${Math.max(300, B.length * 22 + 40)}px"><canvas id="mp2"></canvas></div></div>
        <div class="card"><div class="card-head"><div class="card-title">Earned $ per man-day by buyer</div><span class="tiny muted">dashed = factory ${m2(F.earnedMan)}</span></div><div class="lc-chart" style="height:${Math.max(300, B.length * 22 + 40)}px"><canvas id="mp3"></canvas></div></div>
      </div>
      <div class="card" style="margin:16px 0"><div class="card-head"><div class="card-title">Yearly — manpower by buyer (2026 to date)</div><span class="tiny muted">click a buyer for pros &amp; cons · Sewing | Finishing | Total</span></div>
        <div class="table-scroll"><table class="data ln-table mp-table"><thead>
          <tr><th rowspan="2">Buyer</th><th colspan="7" class="mp-grp">Sewing</th><th colspan="2" class="mp-grp">Finishing</th><th colspan="2" class="mp-grp">Total</th><th rowspan="2" class="n">Output pcs / man-day</th><th rowspan="2" class="n">Earned $ / man-day</th><th rowspan="2" class="n">CM $ / SMV-min</th></tr>
          <tr><th class="n">Line-days</th><th class="n">Man-days</th><th class="n">Avg / day</th><th class="n">Per line</th><th class="n">Helper %</th><th class="n">Share</th><th class="n">Efficiency</th><th class="n">Man-days</th><th class="n">Eff.</th><th class="n">Man-days</th><th class="n">Eff.</th></tr></thead><tbody>
          ${B.map(b => `<tr class="ln-f ${VM.buyer === b.buyer ? 'mp-on' : ''}" data-b="${esc(b.buyer)}"><td class="b">${esc(b.buyer)}</td><td class="n">${n0(b.ld)}</td><td class="n">${n0(b.manDays)}</td><td class="n">${n1(b.avgMpDay)}</td><td class="n">${n1(b.avgMpLine)}</td><td class="n">${pc(b.helperPct)}</td><td class="n">${pc(b.share)}</td>
            <td class="n" style="${effCol(b.eff, std)}">${pc(b.eff)}</td><td class="n">${ND}</td><td class="n">${ND}</td><td class="n">${n0(b.manDays)}*</td><td class="n">${pc(b.eff)}*</td>
            <td class="n">${n1(b.pcsMan)}</td><td class="n">${m2(b.earnedMan)}</td><td class="n" style="${b.cmMin < D.stdCm ? 'color:var(--bad)' : ''}">${d4(b.cmMin)}</td></tr>`).join('')}
          <tr class="mg-tot"><td>FACTORY</td><td class="n">${n0(F.ld)}</td><td class="n">${n0(F.manDays)}</td><td class="n">${n1(F.avgMpDay)}</td><td class="n">${n1(F.avgMpLine)}</td><td class="n">${pc(F.helperPct)}</td><td class="n">100%</td><td class="n">${pc(F.eff)}</td><td class="n">${ND}</td><td class="n">${ND}</td><td class="n">${n0(F.manDays)}*</td><td class="n">${pc(F.eff)}*</td><td class="n">${n1(F.pcsMan)}</td><td class="n">${m2(F.earnedMan)}</td><td class="n">${d4(F.cmMin)}</td></tr>
        </tbody></table></div><div class="tiny muted" style="padding:6px 14px">* Total = sewing only until finishing data is added.</div></div>
      ${sel ? `<div class="card mp-pc" style="margin-bottom:16px"><div class="card-head"><div class="card-title">${esc(sel.buyer)} — pros &amp; cons</div><span class="tiny muted">vs factory average · ${n0(sel.ld)} line-days · ${sel.styles} styles · ${sel.lines} lines</span></div>
        <div class="lc-2col card-body"><div><div class="mp-h ok">✓ Pros</div><ul>${sel.pros.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="muted">—</li>'}</ul></div>
          <div><div class="mp-h bad">✗ Cons</div><ul>${sel.cons.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="muted">—</li>'}</ul></div></div></div>` : ''}
      <div class="card" style="margin-bottom:16px"><div class="card-head"><div class="card-title">Monthly — average sewing manpower per working day</div><span class="tiny muted">buyer × month · efficiency under the number</span></div>
        <div class="table-scroll"><table class="data ln-table"><thead><tr><th>Buyer</th>${D.months.map(m => `<th class="n">${MON(m)}</th>`).join('')}</tr></thead><tbody>
          ${B.map(b => `<tr><td class="b">${esc(b.buyer)}</td>${D.months.map(m => { const x = b.months[m]; return `<td class="n">${x ? `${n0(x.avgMpDay)}<div class="tiny" style="${effCol(x.eff, std)}">${pc(x.eff)}</div>` : '<span class="muted">·</span>'}</td>`; }).join('')}</tr>`).join('')}
          <tr class="mg-tot"><td>FACTORY</td>${D.monthly.map(x => `<td class="n">${n0(x.avgMpDay)}<div class="tiny">${pc(x.eff)}</div></td>`).join('')}</tr></tbody></table></div></div>
      <div class="card" style="margin-bottom:16px"><div class="card-head"><div class="card-title">Pros &amp; cons — every buyer</div><span class="tiny muted">rule-based against factory averages; read with order mix in mind</span></div>
        <div class="mp-grid">${B.map(b => `<div class="mp-cell"><div class="b">${esc(b.buyer)} <span class="tiny muted">${pc(b.share)} of man-days</span></div>
          <div class="tiny ok-t">${b.pros.map(esc).join(' · ') || '—'}</div><div class="tiny bad-t">${b.cons.map(esc).join(' · ') || '—'}</div></div>`).join('')}</div></div>`;
    // charts
    const months = D.months, grid = css('--border');
    const ds = top.map((b, i) => ({ label: b.buyer, data: months.map(m => b.months[m]?.avgMpDay || 0), backgroundColor: SER[i], borderColor: css('--surface'), borderWidth: 1 }));
    if (rest.length) ds.push({ label: 'Others', data: months.map(m => rest.reduce((s, b) => s + (b.months[m] ? b.months[m].manDays : 0), 0) / ((D.monthly.find(x => x.m === m) || {}).days || 1)), backgroundColor: SER[7] });
    mk('mp1', { type: 'bar', data: { labels: months.map(MON), datasets: ds }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 12 } }, tooltip: { ...tt(), mode: 'index', callbacks: { label: i => `${i.dataset.label}: ${n0(i.raw)}` } } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: grid }, title: { display: true, text: 'people per working day' } } } } });
    const hbar = (id, key, fmt, ref, refLab) => { const S = B.slice().sort((a, b) => (b[key] || 0) - (a[key] || 0));
      mk(id, { type: 'bar', data: { labels: S.map(b => b.buyer), datasets: [{ data: S.map(b => b[key]), backgroundColor: S.map(b => (b[key] || 0) >= ref ? SER[2] : SER[1]), borderRadius: 4, barThickness: 14 }] },
        options: { indexAxis: 'y', maintainAspectRatio: false, layout: { padding: { top: 22, right: 8 } }, plugins: { legend: { display: false }, tooltip: { ...tt(), callbacks: { label: i => fmt(i.raw) } } },
          scales: { x: { suggestedMax: Math.max(ref, ...S.map(b => b[key] || 0)) * 1.16, grid: { color: grid } }, y: { grid: { display: false }, ticks: { font: { size: 11.5, weight: '600' } } } } },
        plugins: [{ id: 'ref', afterDatasetsDraw(ch) { const { ctx, chartArea: a, scales } = ch, x = scales.x.getPixelForValue(ref); ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#d03b3b'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); ctx.stroke(); ctx.setLineDash([]);
          // reference label as a pill above the chart
          const pill = (txt, cx, cy, bg, fg, font, align) => { ctx.font = font; const w = ctx.measureText(txt).width + 12, h = 18, x0 = align === 'center' ? cx - w / 2 : cx; ctx.fillStyle = bg; ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(x0, cy - h / 2, w, h, 9) : ctx.rect(x0, cy - h / 2, w, h)); ctx.fill(); ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(txt, x0 + 6, cy + 0.5); return w; };
          pill(refLab, Math.min(Math.max(x, a.left + 50), a.right - 50), a.top - 12, '#d03b3b', '#fff', '700 10.5px system-ui', 'center');
          // value pill at the end of every bar (green = at/above reference, dark orange = below)
          const meta = ch.getDatasetMeta(0);
          meta.data.forEach((bar, i) => { const v = S[i][key] || 0, ok = v >= ref; pill(fmt(v), bar.x + 6, bar.y, ok ? '#0f6b47' : '#9a3412', '#fff', '700 11px system-ui', 'left'); });
          ctx.restore(); } }] }); };
    hbar('mp2', 'eff', pc, std, 'Target ' + std + '%'); hbar('mp3', 'earnedMan', m2, F.earnedMan, 'Factory ' + m2(F.earnedMan));
    main.querySelectorAll('.mp-table .ln-f').forEach(tr => tr.onclick = () => { VM.buyer = VM.buyer === tr.dataset.b ? '' : tr.dataset.b; LS.set('mybrain.mp.view', VM); State.charts.forEach(c => c.destroy()); State.charts = []; pageMP(main); });
  }

  /* ======================= FINISHING ======================= */
  function pageFIN(main) {
    const D = MP();
    main.innerHTML = head('🧺', 'Finishing', 'waiting for data', srcLine(D), 4) + `
      <div class="card" style="margin-top:16px"><div class="card-body" style="line-height:1.7">
        <div class="lc-big" style="font-size:28px;color:var(--text-2)">— (no data)</div>
        <p>${esc(D.finishingNote)}</p>
        <p><b>What this page will show once the file is in:</b> finishing manpower (iron, QC, packing, helpers) by buyer — yearly and monthly; finishing output (pcs) and efficiency; pcs per finishing man-day; and the <b>Sewing + Finishing = Total</b> view on the Manpower page.</p>
        <p><b>Columns needed (one row per day × buyer, or per finishing section):</b> Date · Unit · Buyer · Style · Iron man · QC man · Packing man · Helper · Finishing output pcs · Working hours · (optional) Finishing SMV.</p>
        <p class="tiny muted">Save the report in My Brain/Revenue (or 05_Production_Status) and say “finishing data diyechi”.</p></div></div>`;
  }

  /* ======================= LINE × STYLE ======================= */
  let VL = Object.assign({ unit: '', line: '', buyer: '', q: '', min: 3 }, LS.get('mybrain.ls.view', {}));
  function lsList() {
    const q = VL.q.trim().toLowerCase();
    return MP().lines.filter(r => (!VL.unit || r.unit === VL.unit) && (!VL.line || String(r.line) === VL.line) && (!VL.buyer || r.buyer === VL.buyer) && r.ld >= (+VL.min || 1)
      && (!q || [r.style, r.desc, r.buyer].join(' ').toLowerCase().includes(q)));
  }
  function pageLS(main) {
    const D = MP(), std = D.stdEff, L = lsList(), all = D.lines;
    const uniq = a => [...new Set(a)].sort((x, y) => String(x).localeCompare(String(y), undefined, { numeric: true }));
    const sel = (id, lab, arr, cur) => `<label class="tac-f"><span>${lab}</span><select id="${id}"><option value="">All</option>${arr.map(v => `<option ${String(v) === String(cur) ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`;
    const LSm = D.lineSum.filter(x => (!VL.unit || x.unit === VL.unit));
    main.innerHTML = head('🧵', 'Line × Style', `${all.length} line × style runs · ${D.lineSum.length} lines`, `${srcLine(D)}<br>Which buyer and style ran on each line — output, SMV, efficiency (produced ÷ available minutes), earned and CM per SMV-minute.`, 2) + `
      <div class="card" style="margin:16px 0"><div class="card-head"><div class="card-title">Lines — sewing efficiency (hover for buyers, earned per line-day, people)</div><span class="tiny muted">${VL.unit || 'all units'} · dashed = ${std}% target</span></div>
        <div class="lc-chart" style="height:320px"><canvas id="ls1"></canvas></div></div>
      <div class="card tac-filters"><div class="tac-frow">
        ${sel('lsU', 'Unit', uniq(all.map(r => r.unit)), VL.unit)}${sel('lsL', 'Line', uniq(all.filter(r => !VL.unit || r.unit === VL.unit).map(r => r.line)), VL.line)}${sel('lsB', 'Buyer', uniq(all.map(r => r.buyer)), VL.buyer)}
        <label class="tac-f"><span>Min line-days</span><select id="lsM">${[1, 3, 5, 10].map(v => `<option ${+VL.min === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <input id="lsQ" type="search" placeholder="Search style / description…" value="${esc(VL.q)}"><span class="tiny muted">${L.length} rows</span></div></div>
      <div class="card"><div class="table-scroll fb-scroll"><table class="data fb-table ln-table"><thead><tr>
        <th>Unit</th><th>Line</th><th>Buyer</th><th>Style</th><th>Description</th><th>From</th><th>To</th><th class="n">Line-days</th><th class="n">OP</th><th class="n">Helper</th><th class="n">Man-days</th>
        <th class="n">Output pcs</th><th class="n">Pcs / day</th><th class="n">SMV</th><th class="n">Efficiency</th><th class="n">Eff. (file)</th><th class="n">Pcs / man-day</th><th class="n">Earned $</th><th class="n">Earned / line-day</th><th class="n">CM $/SMV-min</th><th class="n">DHU</th></tr></thead><tbody>
        ${L.map(r => `<tr><td>${esc(r.unit)}</td><td class="b">${esc(r.line)}</td><td class="b">${esc(r.buyer)}</td><td>${esc(r.style)}</td><td class="fb-comp" title="${esc(r.desc)}">${esc(r.desc)}</td><td>${esc(r.first)}</td><td>${esc(r.last)}</td>
          <td class="n">${r.ld}</td><td class="n">${n1(r.opAvg)}</td><td class="n">${n1(r.hpAvg)}</td><td class="n">${n0(r.manDays)}</td><td class="n">${n0(r.pcs)}</td><td class="n">${n0(r.pcsDay)}</td><td class="n">${(r.smv || 0).toFixed(2)}</td>
          <td class="n" style="${effCol(r.eff, std)}">${pc(r.eff)}</td><td class="n muted">${pc(r.effFile)}</td><td class="n">${n1(r.pcsMan)}</td><td class="n">${m0(r.earned)}</td><td class="n" style="${r.earnedLine < D.bm ? 'color:var(--bad)' : ''}">${m0(r.earnedLine)}</td>
          <td class="n" style="${r.cmMin < D.stdCm ? 'color:var(--bad)' : ''}">${d4(r.cmMin)}</td><td class="n">${pc(r.dhu)}</td></tr>`).join('')}
      </tbody></table></div><div class="tiny muted" style="padding:8px 14px">Efficiency = Σ(pcs × SMV) ÷ Σ(manpower × W.HRS × 60) over the run · Eff. (file) = average of the report's daily efficiency · red Earned/line-day = below the $${D.bm} benchmark.</div></div>`;
    const grid = css('--border');
    mk('ls1', { type: 'bar', data: { labels: LSm.map(x => `${x.unit.replace('unit-', 'U')}-L${x.line}`), datasets: [
        { label: 'Efficiency %', data: LSm.map(x => x.eff), backgroundColor: LSm.map(x => x.eff >= std ? SER[2] : SER[0]), borderRadius: 4, yAxisID: 'y' }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tt(), callbacks: { title: i => { const x = LSm[i[0].dataIndex]; return `${x.unit} line ${x.line} · ${x.buyers.join(', ')}`; },
        label: i => { const x = LSm[i.dataIndex]; return [`Efficiency ${pc(x.eff)}`, `Earned ${m0(x.earnedLine)} / line-day`, `${n1(x.avgMpLine)} people · ${x.ld} line-days`]; } } } },
        scales: { y: { grid: { color: grid }, ticks: { callback: v => v + '%' } }, x: { grid: { display: false }, ticks: { font: { size: 9 }, autoSkip: false, maxRotation: 90, minRotation: 60 } } } },
      plugins: [{ id: 'ref', afterDatasetsDraw(ch) { const { ctx, chartArea: a, scales } = ch, y = scales.y.getPixelForValue(std); ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#d03b3b'; ctx.beginPath(); ctx.moveTo(a.left, y); ctx.lineTo(a.right, y); ctx.stroke(); ctx.setLineDash([]);
        // value written vertically inside each bar, on a dark contrast pill
        ch.getDatasetMeta(0).data.forEach((bar, i) => { const v = LSm[i].eff; if (v == null) return; const t = pc(v), w = Math.min(bar.width - 2, 20);
          ctx.save(); ctx.font = '700 11px system-ui'; const tw = ctx.measureText(t).width + 10, cx = bar.x, cy = bar.y + 8 + tw / 2;
          ctx.translate(cx, cy); ctx.rotate(-Math.PI / 2); ctx.fillStyle = v >= std ? '#0f5132' : '#12355b'; ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(-tw / 2, -w / 2, tw, w, 5) : ctx.rect(-tw / 2, -w / 2, tw, w)); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, 0, 0.5); ctx.restore(); });
        ctx.restore(); } }] });
    const re = () => { LS.set('mybrain.ls.view', VL); State.charts.forEach(c => c.destroy()); State.charts = []; pageLS(main); };
    [['lsU', 'unit'], ['lsL', 'line'], ['lsB', 'buyer'], ['lsM', 'min']].forEach(([id, k]) => { const e = document.getElementById(id); if (e) e.onchange = ev => { VL[k] = ev.target.value; if (k === 'unit') VL.line = ''; re(); }; });
    const q = document.getElementById('lsQ'); if (q) q.oninput = e => { VL.q = e.target.value; clearTimeout(window.__lsT); window.__lsT = setTimeout(() => { re(); const x = document.getElementById('lsQ'); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 300); };
  }

  /* ======================= BUYER RANKING (formula) ======================= */
  function pageRK(main) {
    const D = MP(), K = D.ranking, S = K.standards, W = K.weights, R = K.rows;
    const parts = [
      ['bench', 'Benchmark (earned per line-day)', 'benchmark', a => `min(100, ${n1(a.yld)} ÷ ${S.benchmark_per_line_day} × 100)`],
      ['value', 'Value (share of factory earned)', 'value', a => `min(100, ${a.share.toFixed(2)}% ÷ ${S.value_share_of_earned * 100}% × 100)`],
      ['price', 'Price (CM $ per SMV-minute)', 'price', a => `min(100, ${a.rate.toFixed(4)} ÷ ${S.price_cm_per_smv_min} × 100)`],
      ['eff', 'Efficiency', 'efficiency', a => `min(100, ${a.eff}% ÷ ${S.efficiency * 100}% × 100)`],
      ['qual', 'Quality (DHU)', 'quality', a => `min(100, ${S.dhu * 100}% ÷ ${a.dhu}% × 100)`],
      ['run', 'Run length (days a style holds a line)', 'run', a => `min(100, ${a.run} ÷ ${S.run_days} × 100)`]];
    const ex = K.examples.map(b => R.find(r => r.buyer === b)).filter(Boolean);
    main.innerHTML = head('🏆', 'Buyer Ranking — how the formula works', `${R.length} ranked buyers`, `${srcLine(D)}<br>Sterling's internal ranking method (from Joy's Buyer KPI pack) — not an external standard. Buyers with fewer than ${K.trial} line-days are listed as trial, not ranked.`, 6) + (window.MYBRAIN_KPI && window.MYBRAIN_KPI.rankXlsx ? `<div class="row wrap" style="gap:8px;margin:-4px 0 14px"><a class="btn-soft" href="${encodeURI(window.MYBRAIN_KPI.rankXlsx)}" download>⤓ Formula template (Excel, live formulas)</a>${window.MYBRAIN_KPI.rankHtml ? `<a class="btn-soft" href="${encodeURI(window.MYBRAIN_KPI.rankHtml)}" target="_blank" rel="noopener">↗ Formula breakdown (HTML)</a>` : ''}<span class="tiny muted" style="align-self:center">change the yellow cells on INPUTS (standards, weights) and every score recalculates</span></div>` : '') + `
      <div class="card" style="margin:16px 0"><div class="card-head"><div class="card-title">Step 1 — the formula</div></div><div class="card-body rk-f">
        <div class="rk-eq">Score = ${parts.map(p => `<span>${p[1].split(' (')[0]} × ${Math.round(W[p[2]] * 100)}%</span>`).join(' + ')}</div>
        <div class="tiny muted">Each part is first turned into a 0–100 sub-score against a standard, capped at 100. Grade: A ≥ ${K.bands.A} · B ≥ ${K.bands.B} · C ≥ ${K.bands.C} · D below.</div>
        <table class="data ln-table" style="margin-top:10px"><thead><tr><th>Part</th><th>Measures</th><th class="n">Standard (= 100)</th><th class="n">Weight</th><th>Sub-score formula</th></tr></thead><tbody>
          <tr><td class="b">Benchmark</td><td>Earned $ per line-day (pcs × CM ÷ line-days)</td><td class="n">$${S.benchmark_per_line_day}</td><td class="n">${W.benchmark * 100}%</td><td>min(100, earned per line-day ÷ ${S.benchmark_per_line_day} × 100)</td></tr>
          <tr><td class="b">Value</td><td>Buyer's share of factory earned $</td><td class="n">${S.value_share_of_earned * 100}%</td><td class="n">${W.value * 100}%</td><td>min(100, share ÷ 10% × 100)</td></tr>
          <tr><td class="b">Price</td><td>CM $ per SMV-minute (earned ÷ produced minutes)</td><td class="n">$${S.price_cm_per_smv_min}</td><td class="n">${W.price * 100}%</td><td>min(100, rate ÷ ${S.price_cm_per_smv_min} × 100)</td></tr>
          <tr><td class="b">Efficiency</td><td>Average daily line efficiency</td><td class="n">${S.efficiency * 100}%</td><td class="n">${W.efficiency * 100}%</td><td>min(100, efficiency ÷ 80% × 100)</td></tr>
          <tr><td class="b">Quality</td><td>Average DHU (lower is better)</td><td class="n">${S.dhu * 100}%</td><td class="n">${W.quality * 100}%</td><td>min(100, 10% ÷ DHU × 100)</td></tr>
          <tr><td class="b">Run</td><td>Average consecutive days one style holds a line</td><td class="n">${S.run_days} days</td><td class="n">${W.run * 100}%</td><td>min(100, run days ÷ 10 × 100)</td></tr>
        </tbody></table></div></div>
      <div class="card-title" style="margin:6px 2px 10px">Step 2 — worked examples (${ex.map(a => esc(a.buyer)).join(', ')})</div>
      <div class="rk-ex">${ex.map(a => `<div class="card rk-card"><div class="card-head"><div class="card-title">${esc(a.buyer)}</div><span class="badge ${a.grade === 'A' ? 'ok' : a.grade === 'D' ? 'bad' : 'warn'}">Rank ${a.rank} · Grade ${a.grade}</span></div>
          <div class="card-body"><div class="tiny muted" style="margin-bottom:6px">${n0(a.ld)} line-days · earned ${m0(a.earned)} · ${n1(a.yld)} $/line-day · ${a.rate.toFixed(4)} $/min · eff ${a.eff}% · DHU ${a.dhu}% · run ${a.run} d</div>
          <div class="table-scroll"><table class="data ln-table rk-t"><thead><tr><th>Part</th><th>Calculation</th><th class="n">Sub-score</th><th class="n">× Weight</th><th class="n">Points</th></tr></thead><tbody>
          ${parts.map(p => `<tr><td>${p[1].split(' (')[0]}</td><td class="tiny">${p[3](a)}</td><td class="n">${n1(a.s[p[0]])}</td><td class="n">${Math.round(W[p[2]] * 100)}%</td><td class="n b">${(a.s[p[0]] * W[p[2]]).toFixed(1)}</td></tr>`).join('')}
          <tr class="mg-tot"><td colspan="4">Total score</td><td class="n">${a.score.toFixed(1)}</td></tr></tbody></table></div></div></div>`).join('')}</div>
      <div class="card" style="margin:16px 0"><div class="card-head"><div class="card-title">Step 3 — full ranking</div><span class="tiny muted">sorted by score · "by earned" = rank if only earned $ counted</span></div>
        <div class="table-scroll"><table class="data ln-table"><thead><tr><th class="n">#</th><th>Buyer</th><th class="n">Score</th><th>Grade</th>${parts.map(p => `<th class="n">${p[1].split(' (')[0]}</th>`).join('')}<th class="n">Line-days</th><th class="n">Earned $</th><th class="n">By earned</th></tr></thead><tbody>
          ${R.map(a => `<tr class="${K.examples.includes(a.buyer) ? 'mp-on' : ''}"><td class="n">${a.rank}</td><td class="b">${esc(a.buyer)}</td><td class="n b">${a.score.toFixed(1)}</td><td>${a.grade}</td>${parts.map(p => `<td class="n">${n1(a.s[p[0]])}</td>`).join('')}<td class="n">${n0(a.ld)}</td><td class="n">${m0(a.earned)}</td><td class="n">${a.rankrev}</td></tr>`).join('')}
        </tbody></table></div>
        <div class="tiny muted" style="padding:8px 14px">Trial (under ${K.trial} line-days, not ranked): ${K.trialBuyers.map(t => `${esc(t.buyer)} (${t.ld})`).join(', ') || 'none'}.</div></div>`;
  }

  /* ======================= exports ======================= */
  window.MB_EXPORT = window.MB_EXPORT || {};
  window.MB_EXPORT.mp = () => { const D = MP(), F = D.factory; return { title: 'Manpower — sewing (2026)', sub: `${D.source} · ${D.period} · finishing: no data yet`,
    kpis: [['Avg manpower/day', n0(F.avgMpDay)], ['People per line', n1(F.avgMpLine)], ['Efficiency', pc(F.eff)], ['Pcs/man-day', n1(F.pcsMan)], ['Earned/man-day', m2(F.earnedMan)]],
    sheets: [{ name: 'Yearly by buyer', cols: ['Buyer', 'Line-days', 'Man-days', 'Avg/day', 'Per line', 'Helper %', 'Share %', 'Sewing eff %', 'Finishing man-days', 'Finishing eff', 'Total man-days', 'Pcs/man-day', 'Earned $/man-day', 'CM $/SMV-min', 'Pros', 'Cons'],
      rows: D.buyers.map(b => [b.buyer, b.ld, b.manDays, b.avgMpDay, b.avgMpLine, b.helperPct, b.share, b.eff, '— (no data)', '— (no data)', b.manDays, b.pcsMan, b.earnedMan, b.cmMin, b.pros.join(' · '), b.cons.join(' · ')]) },
      { name: 'Monthly avg per day', cols: ['Buyer', ...D.months.map(MON)], rows: D.buyers.map(b => [b.buyer, ...D.months.map(m => b.months[m] ? b.months[m].avgMpDay : '')]) },
      { name: 'Monthly efficiency', cols: ['Buyer', ...D.months.map(MON)], rows: D.buyers.map(b => [b.buyer, ...D.months.map(m => b.months[m] ? b.months[m].eff : '')]) },
      { name: 'Factory by month', cols: ['Month', 'Working days', 'Line-days', 'Man-days', 'Avg/day', 'Per line', 'Efficiency %', 'Pcs', 'Earned $'], rows: D.monthly.map(x => [MON(x.m), x.days, x.ld, x.manDays, x.avgMpDay, x.avgMpLine, x.eff, x.pcs, x.earned]) }] }; };
  window.MB_EXPORT.linestyle = () => { const D = MP(); return { title: 'Line × Style — productivity & efficiency', sub: `${D.source} · ${D.period}`,
    sheets: [{ name: 'Line × Style', cols: ['Unit', 'Line', 'Buyer', 'Style', 'Description', 'From', 'To', 'Line-days', 'OP avg', 'Helper avg', 'Man-days', 'Output pcs', 'Pcs/day', 'SMV', 'Efficiency %', 'Eff. file %', 'Pcs/man-day', 'Earned $', 'Earned/line-day', 'CM $/SMV-min', 'DHU %'],
      rows: lsList().map(r => [r.unit, r.line, r.buyer, r.style, r.desc, r.first, r.last, r.ld, r.opAvg, r.hpAvg, r.manDays, r.pcs, r.pcsDay, r.smv, r.eff, r.effFile, r.pcsMan, r.earned, r.earnedLine, r.cmMin, r.dhu]) },
      { name: 'Lines', cols: ['Unit', 'Line', 'Buyers', 'Line-days', 'Per line', 'Efficiency %', 'Earned/line-day', 'Pcs/man-day'], rows: D.lineSum.map(x => [x.unit, x.line, x.buyers.join(', '), x.ld, x.avgMpLine, x.eff, x.earnedLine, x.pcsMan]) }] }; };
  window.MB_EXPORT.rankf = () => { const K = MP().ranking; return { title: 'Buyer Ranking — formula & worked examples', sub: 'Score = Benchmark×30% + Value×20% + Price×20% + Efficiency×15% + Quality×10% + Run×5%',
    sheets: [{ name: 'Ranking', cols: ['Rank', 'Buyer', 'Score', 'Grade', 'Benchmark', 'Value', 'Price', 'Efficiency', 'Quality', 'Run', 'Line-days', 'Earned $', '$/line-day', 'CM $/min', 'Eff %', 'DHU %', 'Run days', 'Rank by earned'],
      rows: K.rows.map(a => [a.rank, a.buyer, a.score, a.grade, a.s.bench, a.s.value, a.s.price, a.s.eff, a.s.qual, a.s.run, a.ld, a.earned, a.yld, a.rate, a.eff, a.dhu, a.run, a.rankrev]) }] }; };
  window.MB_EXPORT.fin = () => ({ title: 'Finishing', sub: 'No finishing data yet', sheets: [{ name: 'Finishing', cols: ['Status'], rows: [[MP().finishingNote]] }] });

  /* ======================= nav + render ======================= */
  const PAGES = [['mp', '👥', 'Manpower', pageMP], ['fin', '🧺', 'Finishing', pageFIN], ['linestyle', '🧵', 'Line × Style', pageLS], ['rankf', '🏆', 'Buyer Ranking', pageRK]];
  const _nav = window.renderNav;
  window.renderNav = function () {
    _nav();
    const nav = document.getElementById('nav'); if (!nav || !window.MYBRAIN_MANPOWER) return;
    let after = [...nav.querySelectorAll('.nav-all')].find(b => /Revenue/.test(b.textContent)); if (!after) return;
    PAGES.forEach(([id, ico, txt]) => {
      const b = document.createElement('button');
      b.className = 'nav-item nav-ws nav-all nav-sub' + (State.module === id ? ' active' : '');
      b.style.setProperty('--accent', 'var(--p6)'); b.style.setProperty('--accent-ink', 'var(--p6-ink)'); b.style.setProperty('--accent-soft', 'var(--p6-soft)');
      b.innerHTML = `<span class="ws-ico">${ico}</span><span class="grow">${txt}</span>${id === 'fin' ? '<span class="count ws-count" title="no data yet">—</span>' : ''}`;
      b.onclick = () => go(id, 'all');
      after.after(b); after = b;
    });
  };
  const _render = window.render;
  window.render = function () {
    const p = PAGES.find(x => x[0] === State.module);
    if (p) { State.charts.forEach(c => c.destroy()); State.charts = []; const f = document.getElementById('fbar'); if (f) f.style.display = 'none'; p[3](document.getElementById('main')); return; }
    _render();
  };
  const h = (location.hash || '').slice(1); if (PAGES.some(x => x[0] === h)) setTimeout(() => { try { go(h, 'all'); } catch (e) {} }, 500);
})();
