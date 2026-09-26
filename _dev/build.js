#!/usr/bin/env node
/* THIRTY DAYS DARK — build
 *
 *   manuscript/*.md  --marked-->  HTML (+ _dev/print.css)
 *                    --chromium-->  A5 PDF   (per chapter, and the whole book)
 *                    --pdf.js----->  page PNGs in _dev/shots/
 *
 * Chromium comes from playwright-core driving the browser already on disk at
 * /opt/pw-browsers/chromium*\/chrome-linux/chrome. No pandoc, no LaTeX.
 *
 * Usage:
 *   node _dev/build.js                  everything: chapters + book + shots + probes
 *   node _dev/build.js --only 02        just the file(s) whose name starts 02
 *   node _dev/build.js --no-shots       PDFs only
 *   node _dev/build.js --scale 2        page PNG scale (default 2 -> 840x1190)
 *
 * Outputs: _dev/out/*.pdf, _dev/out/*.html, _dev/out/probe.json,
 *          _dev/shots/<slug>-pNN.png, _dev/shots/thumb/<slug>-pNN.png
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { marked } = require('marked');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const MS = path.join(ROOT, 'manuscript');
const OUT = path.join(__dirname, 'out');
const SHOTS = path.join(__dirname, 'shots');
const THUMBS = path.join(SHOTS, 'thumb');
const CSS = path.join(__dirname, 'print.css');
const PORT = Number(process.env.PORT || 8732);

const BOOK_TITLE = 'Thirty Days Dark';
const BOOK_SUB = 'A practical field manual for the first 30 days after the grid and the internet go down.';

/* ------------------------------------------------------------------ chromium */

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const base = '/opt/pw-browsers';
  const cands = [];
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).sort()) {
      cands.push(path.join(base, d, 'chrome-linux', 'chrome'));
      cands.push(path.join(base, d, 'chrome-linux', 'headless_shell'));
    }
  }
  cands.push('/usr/bin/chromium', '/usr/bin/google-chrome');
  // full chromium before headless_shell: headless_shell cannot print backgrounds reliably
  const full = cands.filter((c) => c.endsWith('/chrome') && !/headless_shell/.test(c) && fs.existsSync(c));
  if (full.length) return full[0];
  const any = cands.find((c) => fs.existsSync(c));
  if (!any) throw new Error(`no chromium found under ${base}`);
  return any;
}

/* --------------------------------------------------------------- md -> html */

marked.setOptions({ gfm: true, breaks: false });

const BOX_KINDS = [
  [/^Village Hack$/i, 'village'],
  [/^Day-X Challenge$/i, 'day-x'],
  [/^What I Wish I'?d Stocked$/i, 'stocked'],
  [/^Climate note.*$/i, 'climate'],
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* [IMAGE: brief] -> framed placeholder.
   Run AFTER marked: injecting raw <figure> into the markdown makes marked open an
   HTML block that swallows the block after it (seen: "## Do This Now" came out literal). */
function imagePlaceholders(html) {
  return html.replace(/<p>\s*\[IMAGE:\s*([\s\S]+?)\]\s*<\/p>/g, (_, brief) =>
    `<figure class="imgframe"><div class="frame"><span>Illustration</span></div>` +
    `<figcaption>${brief.trim()}</figcaption></figure>`);
}

/* blockquote whose first line is **Label** — ...  ->  a styled box */
function boxes(html) {
  return html.replace(/<blockquote>\s*([\s\S]*?)<\/blockquote>/g, (whole, inner) => {
    const m = /^\s*<p><strong>(.+?)<\/strong>\s*(?:—|–|-)?\s*([\s\S]*)$/.exec(inner);
    if (!m) return whole;
    const label = m[1].trim();
    const plain = label.replace(/&#39;|&#x27;|&rsquo;|’/g, "'");
    const kind = (BOX_KINDS.find(([re]) => re.test(plain)) || [null, 'plain'])[1];
    const body = `<p>${m[2]}`;
    // label comes out of marked already HTML-escaped; esc() again turns ' into &amp;#39;
    return `<div class="box box--${kind}"><span class="boxlabel">${label}</span>${body}</div>`;
  });
}

function srcTags(html) {
  return html.replace(/\[src:\s*([^\]]+)\]/g, (_, t) => `<span class="src">[${esc(t.trim())}]</span>`);
}

function checkboxes(html) {
  html = html.replace(/<input disabled="" type="checkbox">\s*/g, '<span class="cb"></span>');
  html = html.replace(/<input checked="" disabled="" type="checkbox">\s*/g, '<span class="cb"></span>');
  // any <ul> that now holds .cb items is a checklist
  return html.replace(/<ul>\s*<li><span class="cb">/g, '<ul class="checklist">\n<li><span class="cb">');
}

/* h1 "Chapter 2 · Water" -> eyebrow + title; the blockquote after it -> .promise */
function opener(html) {
  html = html.replace(/<h1>(.*?)<\/h1>/, (_, t) => {
    const parts = t.split(/\s+·\s+/);
    if (parts.length >= 2) {
      return `<h1><span class="eyebrow">${parts[0]}</span><span class="title">${parts.slice(1).join(' · ')}</span></h1>`;
    }
    return `<h1><span class="title">${t}</span></h1>`;
  });
  return html.replace(/(<\/h1>\s*)<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/,
    (_, head, body) => `${head}<p class="promise">${body}</p>`);
}

/* split at <h2> into <section class="part part--slug"> ... the Do This Now part
   gets an inner .cardbody so the whole card can be framed and kept off a break */
function parts(html) {
  const pieces = html.split(/(?=<h2>)/);
  if (pieces.length < 2) return html;
  const head = pieces.shift();
  const out = pieces.map((p) => {
    const m = /^<h2>(.*?)<\/h2>/.exec(p);
    const title = m ? m[1] : 'section';
    const slug = slugify(title);
    const h2 = `<h2 id="${slug}">${title}</h2>`;
    const rest = p.slice(m ? m[0].length : 0);
    const body = slug === 'do-this-now' ? `<div class="cardbody">${rest}</div>` : rest;
    return `<section class="part part--${slug}" data-part="${slug}">${h2}${body}</section>`;
  });
  return head + out.join('\n');
}

function chapterHtml(md) {
  let html = marked.parse(md);
  html = opener(html);
  html = imagePlaceholders(html);
  html = boxes(html);
  html = checkboxes(html);
  html = srcTags(html);
  html = parts(html);
  return `<article class="chapter">${html}</article>`;
}

function page(bodyHtml, title) {
  const css = fs.readFileSync(CSS, 'utf8');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${css}</style></head>
<body>${bodyHtml}</body></html>`;
}

function bookplate() {
  return `<div class="bookplate"><div class="bt">${BOOK_TITLE}</div>` +
    `<div class="bs">${BOOK_SUB}</div>` +
    `<div class="bm">Draft build · ${new Date().toISOString().slice(0, 10)} · CC BY-SA 4.0</div></div>`;
}

/* ------------------------------------------------------------------- server */

const MIME = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.pdf': 'application/pdf', '.css': 'text/css', '.map': 'application/json', '.png': 'image/png' };

function serve() {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    if (rel === 'favicon.ico') { res.writeHead(204); res.end(); return; }
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      console.log(`  http 404 ${rel}`);
      res.writeHead(404); res.end('nope'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => srv.listen(PORT, '127.0.0.1', () => ok(srv)));
}

/* --------------------------------------------------------------------- main */

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const noShots = argv.includes('--no-shots');
  const only = arg('--only', null);
  const scale = Number(arg('--scale', 2));

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(THUMBS, { recursive: true });

  let files = fs.existsSync(MS) ? fs.readdirSync(MS).filter((f) => f.endsWith('.md')).sort() : [];
  if (only) files = files.filter((f) => f.startsWith(only));
  if (!files.length) { console.error('BUILD: no manuscript/*.md to build'); process.exit(1); }

  const chrome = findChrome();
  console.log(`BUILD chromium=${chrome}`);
  console.log(`BUILD chapters=${files.length} [${files.join(', ')}]`);

  const browser = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });
  const srv = await serve();
  const logs = [];
  const ctx = await browser.newContext();
  ctx.on('weberror', (e) => logs.push(`pageerror: ${e.error().message}`));

  const targets = [];
  const chapterBodies = [];
  for (const f of files) {
    const md = fs.readFileSync(path.join(MS, f), 'utf8');
    const body = chapterHtml(md);
    chapterBodies.push(body);
    const slug = f.replace(/\.md$/, '');
    const title = (/^#\s+(.+)$/m.exec(md) || [, slug])[1];
    targets.push({ slug, title, html: page(body, `${title} — ${BOOK_TITLE}`) });
  }
  {
    targets.push({
      slug: 'thirty-days-dark',
      title: BOOK_TITLE,
      html: page(bookplate() + chapterBodies.join('\n'), BOOK_TITLE),
      isBook: true,
    });
  }

  const probe = { chromium: chrome, generated: new Date().toISOString(), docs: [] };

  for (const t of targets) {
    const htmlPath = path.join(OUT, `${t.slug}.html`);
    const pdfPath = path.join(OUT, `${t.slug}.pdf`);
    fs.writeFileSync(htmlPath, t.html);

    const pg = await ctx.newPage();
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`console.${m.type()}: ${m.text()}`); });
    await pg.goto(`http://127.0.0.1:${PORT}/_dev/out/${t.slug}.html`, { waitUntil: 'load' });
    await pg.emulateMedia({ media: 'print' });
    await pg.pdf({
      path: pdfPath,
      format: 'A5',
      printBackground: true,
      margin: { top: '14mm', bottom: '15mm', left: '14mm', right: '14mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width:100%;font-family:Liberation Sans,sans-serif;font-size:7pt;color:#7b8288;' +
        'padding:0 14mm;display:flex;justify-content:space-between;">' +
        `<span style="letter-spacing:.1em;text-transform:uppercase">${BOOK_TITLE}</span>` +
        '<span class="pageNumber"></span></div>',
    });
    await pg.close();

    const doc = { slug: t.slug, title: t.title, pdf: path.relative(ROOT, pdfPath), bytes: fs.statSync(pdfPath).size };

    /* ---- pages: render the real PDF with pdf.js and shoot each page ---- */
    const vp = await ctx.newPage();
    vp.on('console', (m) => { if (m.type() === 'error') logs.push(`viewer.console.error: ${m.text()}`); });
    const shots = [];
    for (const [tag, sc, dir] of [['full', scale, SHOTS], ['thumb', 1.6, THUMBS]]) {
      await vp.goto(`http://127.0.0.1:${PORT}/_dev/viewer.html?pdf=/_dev/out/${t.slug}.pdf&scale=${sc}`, { waitUntil: 'load' });
      await vp.waitForFunction('window.TS && window.TS.ready === true', null, { timeout: 60000 });
      const st = await vp.evaluate(() => ({ pages: window.TS.pages, text: window.TS.text, error: window.TS.error }));
      if (st.error) throw new Error(`pdf.js: ${st.error}`);
      doc.pages = st.pages;
      if (tag === 'full') doc.pageText = st.text;
      if (noShots) break;
      for (let i = 1; i <= st.pages; i += 1) {
        const p = path.join(dir, `${t.slug}-p${String(i).padStart(2, '0')}.png`);
        await vp.locator(`#p${i}`).screenshot({ path: p });
        if (tag === 'full') shots.push(path.relative(ROOT, p));
      }
      const dim = await vp.evaluate(() => { const c = document.querySelector('canvas'); return c ? `${c.width}x${c.height}` : '0x0'; });
      doc[tag === 'full' ? 'shotSize' : 'thumbSize'] = dim;
    }
    await vp.close();
    doc.shots = shots;

    /* ---- section -> page map, read off the PDF's own text layer ---- */
    /* headings are letter-spaced, so Chrome emits them glyph by glyph and the text
       layer reads "T H E  C R A F T" — compare with all whitespace removed */
    const despace = (s) => s.toLowerCase().replace(/\s+/g, '');
    const find = (needle) => (doc.pageText || []).findIndex((tx) => despace(tx).includes(needle)) + 1;
    const pDtn = find('dothisnow');
    const pCraft = find('thecraft');
    const pThrive = find('thrivehacks');
    const pList = find('checklist');
    doc.sectionPages = { doThisNow: pDtn, theCraft: pCraft, thriveHacks: pThrive, checklist: pList };
    doc.doThisNowPages = pDtn && pCraft ? pCraft - pDtn : null;

    probe.docs.push(doc);
    console.log(
      `BUILD ${t.slug}: pages=${doc.pages} bytes=${doc.bytes} shot=${doc.shotSize || '-'} ` +
      `sections{dtn=p${pDtn} craft=p${pCraft} thrive=p${pThrive} checklist=p${pList}} ` +
      `doThisNowPages=${doc.doThisNowPages}`
    );
  }

  await ctx.close();
  await browser.close();
  srv.close();

  fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(probe, null, 2));

  console.log('');
  for (const d of probe.docs) {
    console.log(`PROBE build doc=${d.slug} pages=${d.pages} bytes=${d.bytes} shots=${d.shots.length} px=${d.shotSize} doThisNowPages=${d.doThisNowPages} dtnPage=${d.sectionPages.doThisNow}`);
  }
  console.log(`LOGS: ${logs.length ? logs.join(' | ') : 'clean'}`);
  console.log(logs.length ? 'BUILD: FAIL (console not clean)' : 'BUILD: PASS');
  process.exit(logs.length ? 1 : 0);
}

main().catch((e) => { console.error('BUILD: FAIL', e); process.exit(1); });
