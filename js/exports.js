/* My Brain v4.22 — every tab gets "⤓ HTML report" + "⤓ Excel (organized)".
   Pages can register a provider: window.MB_EXPORT[pageId] = () => ({ title, sub, kpis:[[label,value,foot]], sheets:[{ name, cols:[..], rows:[[..]] }] }).
   Without a provider: the tab's full data (module rows) + every table and KPI card visible on the page. */
(function () {
  window.MB_EXPORT = window.MB_EXPORT || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const xesc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const today = () => new Date().toISOString().slice(0, 10);
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const safeName = s => clean(s).replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 60) || 'MyBrain';

  /* ---------- collect ---------- */
  function pageId() { try { return State.module || 'overview'; } catch (e) { return 'overview'; } }
  function scrapeKpis(main) {
    return [...main.querySelectorAll('.kpi')].map(k => [clean((k.querySelector('.label') || {}).textContent), clean((k.querySelector('.value') || {}).textContent), clean((k.querySelector('.foot') || {}).textContent)]).filter(x => x[0]);
  }
  function tableName(t, i) {
    const main = document.getElementById('main');
    const hs = [...main.querySelectorAll('.card-title, h2, h3, h4, summary, .tac-fab-h, .section-title, .sec-title, .nav-label')]
      .filter(h => h.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING && !h.closest('table'));
    const h = hs.pop();
    return clean(h ? h.textContent : '').replace(/[↓↑⤓▶▸]/g, '').slice(0, 60).trim() || `Table ${i + 1}`;
  }
  function cellVal(td) {
    const inp = td.querySelector('select, input'); if (inp) return inp.tagName === 'SELECT' ? (inp.options[inp.selectedIndex] || {}).text || '' : inp.value;
    return clean(td.innerText);
  }
  function scrapeTables(main) {
    return [...main.querySelectorAll('table')].filter(t => t.offsetParent !== null || t.closest('details')).map((t, i) => {
      const head = [...t.querySelectorAll('thead tr')].pop();
      const cols = head ? [...head.children].map(th => clean(th.innerText)) : [];
      const rows = [...t.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(cellVal)).filter(r => r.some(v => v !== ''));
      return { name: tableName(t, i), cols: cols.length ? cols : (rows[0] || []).map((_, j) => 'Col ' + (j + 1)), rows };
    }).filter(s => s.rows.length);
  }
  function moduleSheet(id) {
    try {
      const m = (typeof MODULE_BY_ID !== 'undefined' ? MODULE_BY_ID : {})[id]; if (!m || m.virtual || typeof rowsOf !== 'function') return null;
      const recs = rowsOf(id); if (!recs.length) return null;
      const cols = []; recs.forEach(r => Object.keys(r.__row).forEach(k => { if (!cols.includes(k) && !k.startsWith('__')) cols.push(k); }));
      return { name: (m.short || id) + ' data', cols, rows: recs.map(r => cols.map(c => r.__row[c])) };
    } catch (e) { return null; }
  }
  function collect() {
    const id = pageId(), main = document.getElementById('main');
    const h1 = main.querySelector('.page-title'); let title = 'My Brain';
    if (h1) { const c = h1.cloneNode(true); c.querySelectorAll('.page-chip, .badge').forEach(x => x.remove()); title = clean(c.textContent) || title; }
    const sub = clean((main.querySelector('.page-sub') || {}).textContent);
    let d = null;
    if (typeof window.MB_EXPORT[id] === 'function') { try { d = window.MB_EXPORT[id](); } catch (e) { console.warn('export provider', e); } }
    if (!d) {
      const sheets = [];
      const ms = moduleSheet(id); if (ms) sheets.push(ms);
      scrapeTables(main).forEach(t => sheets.push(t));
      d = { sheets };
    }
    d.title = d.title || title; d.sub = d.sub != null ? d.sub : sub; d.kpis = d.kpis || scrapeKpis(main);
    const seen = {}; d.sheets.forEach(s => { let n = String(s.name || 'Sheet').replace(/[\\\/\?\*\[\]:]/g, '-').replace(/\s+/g, ' ').slice(0, 28).trim() || 'Sheet'; const b = n; let k = 2; while (seen[n.toLowerCase()]) n = b.slice(0, 25) + ' ' + k++; seen[n.toLowerCase()] = 1; s.name = n; });
    return d;
  }


  /* built-in providers for pages without their own */
  if (!window.MB_EXPORT.erp) window.MB_EXPORT.erp = () => {
    const E = window.MYBRAIN_ERP || { pi: [], budget: [] };
    return { title: 'ERP (PrideBook) — pending at Dept. Head', sub: `${E.source || ''} · snapshot ${E.generated ? new Date(E.generated).toLocaleString('en-GB') : '— (no data)'}`,
      kpis: [['PI pending', String((E.pi || []).length), 'Team Leader passed'], ['Budget pending', String((E.budget || []).length), 'Team Leader passed']],
      sheets: [{ name: 'PI pending', cols: ['Entry No', 'PI No', 'Date', 'Buyer', 'Supplier', 'Merchandiser', 'PI Value', 'Status', 'File'], rows: (E.pi || []).map(x => [x.id, x.ref, x.date, x.buyer, x.supplier, x.merch, x.value, x.status, x.file]) },
               { name: 'Budget pending', cols: ['Budget ID', 'Budget No / Style', 'Contract', 'Date', 'Buyer', 'Item', 'Merchandiser', 'GMT Qty', 'GMT Value', 'Status'], rows: (E.budget || []).map(x => [x.id, x.ref, x.contract, x.date, x.buyer, x.item, x.merch, x.qty, x.value, x.status]) }] };
  };
  if (!window.MB_EXPORT.mail) window.MB_EXPORT.mail = () => {
    const M = window.MYBRAIN_MAIL || { items: [], approvals: [], notices: [], drafts: {}, counts: {} };
    const iso = v => v ? String(v).slice(0, 16).replace('T', ' ') : '';
    return { title: 'Mail Desk', sub: `${M.mailbox || ''} · ${iso(M.windowFrom)} → ${iso(M.windowTo)}`,
      kpis: Object.entries(M.counts || {}).map(([k, v]) => [k.replace(/_/g, ' '), String(v), '']),
      sheets: [{ name: 'Items', cols: ['Category', 'Urgent', 'Subject', 'From', 'Party', 'Owner', 'Why', 'Received', 'Age (h)', 'Buyer', 'Styles', 'POs', 'Draft ready', 'Summary', 'Link'],
                 rows: (M.items || []).map(x => [x.cat, x.urgent ? 'Yes' : '', x.subject, x.fromName || x.from_, x.party, x.owner, x.why, iso(x.at), x.ageH, x.buyer, (x.styles || []).join(', '), (x.pos || []).join(', '), (M.drafts || {})[x.id] ? 'Yes' : '', x.sum, x.link]) },
               { name: 'Drafts', cols: ['Mode', 'Draft text', 'Created'], rows: Object.values(M.drafts || {}).map(d => [d.mode, d.text, d.created]) },
               { name: 'ERP approval mails', cols: ['Ref', 'Kind', 'Created', 'Received', 'Age (h)', 'Link'], rows: (M.approvals || []).map(x => [x.ref, x.kind, x.created, iso(x.at), x.ageH, x.link]) },
               { name: 'Buyer notices', cols: ['Source', 'Subject', 'PO', 'Style', 'Received', 'Age (h)', 'Link'], rows: (M.notices || []).map(x => [x.src, x.subject, x.po, x.style, iso(x.at), x.ageH, x.link]) }] };
  };
  /* ---------- value typing ---------- */
  const ISO = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
  function typed(v) {
    if (v == null || v === '') return { t: 'e' };
    if (v instanceof Date && !isNaN(v)) return { t: 'd', v: v };
    if (typeof v === 'number' && isFinite(v)) return { t: 'n', v };
    if (typeof v === 'boolean') return { t: 's', v: v ? 'Yes' : 'No' };
    if (typeof v === 'object') return { t: 's', v: JSON.stringify(v) };
    const s = String(v).trim();
    if (ISO.test(s)) { const d = new Date(s.length === 10 ? s + 'T00:00:00Z' : s); if (!isNaN(d)) return { t: 'd', v: d }; }
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$|^-?\d+(\.\d+)?$/.test(s) && s.length < 16 && !/^0\d/.test(s)) return { t: 'n', v: +s.replace(/,/g, '') };
    return { t: 's', v: s };
  }
  const serial = d => (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 864e5) + 25569;
  const dispDate = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC' });

  /* ---------- xlsx (styled, stored zip) ---------- */
  const colL = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; };
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="dd\\-mmm\\-yy"/><numFmt numFmtId="165" formatCode="#,##0.###"/></numFmts>
<fonts count="5"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><i/><sz val="9"/><color rgb="FF595959"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="10"/><name val="Calibri"/></font></fonts>
<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2E75B6"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEBF3FB"/></patternFill></fill></fills>
<borders count="2"><border/><border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom></border></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="11">
<xf/>
<xf fontId="1" fillId="2" applyFont="1" applyFill="1"><alignment vertical="center"/></xf>
<xf fontId="2" applyFont="1"/>
<xf fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf borderId="1" applyBorder="1"><alignment vertical="top"/></xf>
<xf borderId="1" numFmtId="165" applyBorder="1" applyNumberFormat="1"><alignment vertical="top"/></xf>
<xf borderId="1" numFmtId="164" applyBorder="1" applyNumberFormat="1"><alignment horizontal="center" vertical="top"/></xf>
<xf fillId="4" borderId="1" applyFill="1" applyBorder="1"><alignment vertical="top"/></xf>
<xf fillId="4" borderId="1" numFmtId="165" applyFill="1" applyBorder="1" applyNumberFormat="1"><alignment vertical="top"/></xf>
<xf fillId="4" borderId="1" numFmtId="164" applyFill="1" applyBorder="1" applyNumberFormat="1"><alignment horizontal="center" vertical="top"/></xf>
<xf fontId="4" borderId="1" applyFont="1" applyBorder="1"/>
</cellXfs></styleSheet>`;
  const TXT = h => /(style|^po\b|po no|po number|order no|code|contract|\bid\b|entry no|pi no|apn|barcode|key)/i.test(h) && !/qty|value|amount|price|\$|fob|cm\b/i.test(h);
  function sheetXml(sh, title, sub) {
    const tx = sh.cols.map(c => TXT(String(c)));
    const nC = Math.max(1, sh.cols.length), last = colL(nC - 1);
    const W = sh.cols.map((c, j) => { let m = String(c).length; for (let i = 0; i < Math.min(sh.rows.length, 400); i++) { const v = sh.rows[i][j]; const t = typed(v); const L = t.t === 'd' ? 10 : t.t === 'e' ? 0 : String(t.v).length; if (L > m) m = L; } return Math.min(48, Math.max(8, m + 2)); });
    const cell = (r, c, t, s) => {
      const ref = colL(c) + r;
      if (t.t === 'e') return `<c r="${ref}" s="${s.e}"/>`;
      if (t.t === 'n') return `<c r="${ref}" s="${s.n}"><v>${t.v}</v></c>`;
      if (t.t === 'd') return `<c r="${ref}" s="${s.d}"><v>${serial(t.v)}</v></c>`;
      return `<c r="${ref}" s="${s.e}" t="inlineStr"><is><t xml:space="preserve">${xesc(String(t.v).slice(0, 32000))}</t></is></c>`;
    };
    let rows = `<row r="1" ht="24" customHeight="1"><c r="A1" s="1" t="inlineStr"><is><t>${xesc(title)}</t></is></c>${sh.cols.slice(1).map((_, j) => `<c r="${colL(j + 1)}1" s="1"/>`).join('')}</row>`;
    rows += `<row r="2"><c r="A2" s="2" t="inlineStr"><is><t>${xesc(sub)}</t></is></c></row>`;
    rows += `<row r="4" ht="30" customHeight="1">${sh.cols.map((c, j) => `<c r="${colL(j)}4" s="3" t="inlineStr"><is><t>${xesc(c)}</t></is></c>`).join('')}</row>`;
    sh.rows.forEach((r, i) => {
      const alt = i % 2 ? { e: 7, n: 8, d: 9 } : { e: 4, n: 5, d: 6 }, rn = i + 5;
      rows += `<row r="${rn}">${sh.cols.map((_, j) => { const t = typed(r[j]); return cell(rn, j, tx[j] && t.t === 'n' ? { t: 's', v: String(r[j]) } : t, alt); }).join('')}</row>`;
    });
    const lastRow = Math.max(5, sh.rows.length + 4);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${last}${lastRow}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${W.map((w, j) => `<col min="${j + 1}" max="${j + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>
<sheetData>${rows}</sheetData>
${sh.rows.length ? `<autoFilter ref="A4:${last}${lastRow}"/>` : ''}<mergeCells count="1"><mergeCell ref="A1:${nC > 1 ? last : 'B'}1"/></mergeCells>
<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToHeight="0"/></worksheet>`;
  }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }; })();
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
    files.forEach(([name, text]) => {
      const nb = enc.encode(name), db = enc.encode(text), crc = CRC(db);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint32(14, crc, true); h.setUint32(18, db.length, true); h.setUint32(22, db.length, true); h.setUint16(26, nb.length, true);
      parts.push(new Uint8Array(h.buffer), nb, db);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, db.length, true); c.setUint32(24, db.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
      cen.push(new Uint8Array(c.buffer), nb); off += 30 + nb.length + db.length;
    });
    const csz = cen.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csz, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cen, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function buildXlsx(d) {
    const gen = `My Brain · ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    const sheets = [];
    if (d.kpis && d.kpis.length) sheets.push({ name: 'Summary', cols: ['KPI', 'Value', 'Note'], rows: d.kpis });
    d.sheets.forEach(s => sheets.push(s));
    if (!sheets.length) sheets.push({ name: 'Summary', cols: ['Note'], rows: [['— (no data on this tab)']] });
    const files = [
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xesc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><definedNames>${sheets.map((s, i) => s.rows.length && s.name !== 'Summary' ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xesc(s.name).replace(/'/g, "''")}'!$A$4:$${colL(Math.max(1, s.cols.length) - 1)}$${s.rows.length + 4}</definedName>` : '').join('')}</definedNames></workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', STYLES]];
    sheets.forEach((s, i) => files.push([`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s, `${d.title} — ${s.name}`, [d.sub, gen].filter(Boolean).join(' · '))]));
    return zip(files);
  }

  /* ---------- html ---------- */
  function buildHtml(d) {
    const gen = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const td = (v, isTx) => { const t = isTx && typed(v).t === 'n' ? { t: 's', v: String(v) } : typed(v); return t.t === 'e' ? '<td class="e">—</td>' : t.t === 'n' ? `<td class="n">${t.v.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>` : t.t === 'd' ? `<td class="d">${dispDate(t.v)}</td>` : `<td>${esc(t.v)}</td>`; };
    const nav = d.sheets.map((s, i) => `<a href="#t${i}">${esc(s.name)} <b>${s.rows.length.toLocaleString()}</b></a>`).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.title)} — My Brain</title>
<style>
:root{--ink:#1d2433;--mut:#667085;--line:#e4e7ec;--head:#1F4E79;--soft:#EBF3FB;--bg:#f7f8fb}
*{box-sizing:border-box}body{margin:0;font:13px/1.45 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ink);background:var(--bg)}
header{background:var(--head);color:#fff;padding:18px 24px}header h1{margin:0;font-size:20px}header p{margin:4px 0 0;opacity:.85;font-size:12px}
main{padding:18px 24px;max-width:100%}
.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:16px}
.kpi{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 12px}.kpi .l{font-size:11px;text-transform:uppercase;color:var(--mut);letter-spacing:.04em}.kpi .v{font-size:22px;font-weight:700;margin:2px 0}.kpi .f{font-size:11px;color:var(--mut)}
.toc{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.toc a{background:#fff;border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:var(--ink);text-decoration:none;font-size:12px}.toc b{color:var(--head)}
section{background:#fff;border:1px solid var(--line);border-radius:10px;margin-bottom:18px;overflow:hidden}
section h2{margin:0;font-size:14px;padding:10px 14px;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
section h2 input{margin-left:auto;padding:5px 9px;border:1px solid var(--line);border-radius:7px;min-width:220px;font:inherit}
.wrap{overflow:auto;max-height:75vh}table{border-collapse:collapse;width:max-content;min-width:100%}
th{position:sticky;top:0;background:#2E75B6;color:#fff;font-weight:600;text-align:left;padding:7px 9px;border:1px solid #d0d5dd;white-space:nowrap}
td{padding:5px 9px;border:1px solid var(--line);vertical-align:top;max-width:420px}tr:nth-child(even) td{background:var(--soft)}
td.n{text-align:right;font-variant-numeric:tabular-nums}td.d{text-align:center;white-space:nowrap}td.e{color:#98a2b3;text-align:center}
.cnt{font-weight:400;color:var(--mut);font-size:12px}footer{color:var(--mut);font-size:11px;padding:0 24px 24px}
@media print{section h2 input{display:none}.wrap{max-height:none;overflow:visible}th{position:static}}
</style></head><body>
<header><h1>${esc(d.title)}</h1><p>${esc(d.sub || '')}${d.sub ? ' · ' : ''}My Brain export · ${gen}</p></header><main>
${d.kpis && d.kpis.length ? `<div class="kpis">${d.kpis.map(k => `<div class="kpi"><div class="l">${esc(k[0])}</div><div class="v">${esc(k[1])}</div><div class="f">${esc(k[2] || '')}</div></div>`).join('')}</div>` : ''}
${d.sheets.length > 1 ? `<div class="toc">${nav}</div>` : ''}
${d.sheets.map((s, i) => `<section id="t${i}"><h2>${esc(s.name)} <span class="cnt">${s.rows.length.toLocaleString()} rows</span><input type="search" placeholder="Filter rows…" data-t="${i}"></h2><div class="wrap"><table id="tb${i}"><thead><tr>${s.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${(() => { const tx = s.cols.map(c => TXT(String(c))); return s.rows.map(r => `<tr>${s.cols.map((_, j) => td(r[j], tx[j])).join('')}</tr>`).join(''); })()}</tbody></table></div></section>`).join('') || '<p>— (no data on this tab)</p>'}
</main><footer>Generated from My Brain (Sterling Styles Ltd). Numbers come only from the source files; blank = — (no data).</footer>
<script>document.querySelectorAll('input[data-t]').forEach(function(i){i.oninput=function(){var q=i.value.toLowerCase(),n=0;document.querySelectorAll('#tb'+i.dataset.t+' tbody tr').forEach(function(tr){var s=tr.textContent.toLowerCase().indexOf(q)>-1;tr.style.display=s?'':'none';if(s)n++;});i.previousElementSibling.textContent=n.toLocaleString()+' rows';};});<\/script>
</body></html>`;
  }

  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function run(kind) {
    try {
      const d = collect(), base = `MyBrain_${safeName(d.title.replace(/^[^\w]+/, ''))}_${today()}`;
      if (kind === 'html') download(new Blob([buildHtml(d)], { type: 'text/html' }), base + '.html');
      else download(buildXlsx(d), base + '.xlsx');
      (window.toast || (() => {}))(`Downloading ${kind === 'html' ? 'HTML report' : 'organized Excel'} · ${d.sheets.length} table${d.sheets.length === 1 ? '' : 's'}`, 'ok');
    } catch (e) { console.error(e); alert('Export failed: ' + e.message); }
  }
  window.MB_exportNow = run; window.MB_buildXlsx = buildXlsx; window.MB_collectExport = collect;

  /* ---------- toolbar on every tab ---------- */
  function inject() {
    const main = document.getElementById('main'); if (!main || pageId() === 'settings') return;
    const head = main.querySelector('.page-head'); if (!head || head.querySelector('.mb-xp')) return;
    const box = document.createElement('div'); box.className = 'mb-xp';
    box.innerHTML = `<button type="button" class="btn-soft" data-x="html" title="Download this tab as a standalone HTML report">⤓ HTML</button><button type="button" class="btn-soft" data-x="xlsx" title="Download this tab as an organized Excel (Summary + tables, headers, filters, frozen header)">⤓ Excel</button>`;
    box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => run(b.dataset.x));
    const row = head.querySelector(':scope > .row, :scope > div > .row');
    if (row) row.appendChild(box); else { head.appendChild(box); head.classList.add('has-xp'); }
  }
  const mo = new MutationObserver(() => { clearTimeout(inject.t); inject.t = setTimeout(inject, 60); });
  const start = () => { const m = document.getElementById('main'); if (m) { mo.observe(m, { childList: true }); inject(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
