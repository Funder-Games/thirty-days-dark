#!/usr/bin/env node
/* THIRTY DAYS DARK — manuscript lint
 *
 * Checks every manuscript/*.md against _dev/STYLE.md:
 *   - word count per file (chapter band 3,000-5,500)
 *   - the four parts, present and in order
 *   - "Do This Now" <= 250 words
 *   - every safety-critical number line carries a [src: ORG - title, year] tag
 *   - source tag shape, and org on the approved list
 *   - engagement boxes used, image placeholders well-formed, checklist present
 *   - zero TODO / TBD / XXX / FIXME
 *
 * Usage: node _dev/lint.js [file ...] [--json]
 * Exit 1 on any error.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MS = path.join(ROOT, 'manuscript');
const OUT = path.join(__dirname, 'out');

const BAND = { min: 3000, max: 5500 };
const DTN_MAX = 250;
const PARTS = ['Do This Now', 'The Craft', 'Thrive Hacks', 'Checklist'];
const BOX_LABELS = ['Village Hack', 'Day-X Challenge', "What I Wish I'd Stocked", 'Climate note'];
const ORGS = [
  'WHO', 'CDC', 'Red Cross', 'IFRC', 'UNICEF', 'NHS', 'FEMA', 'EPA', 'USDA', 'FDA',
  'NIOSH', 'OSHA', 'HSE', 'Sphere', 'UNHCR', 'MSF', 'Health Canada', 'NOAA', 'NFPA',
];

/* A line needs a source when it carries a digit AND sits in a safety domain. */
const SAFETY_DOMAINS = [
  ['water', /chlorin|bleach|hypochlorite|nadcc|iodine|\bppm\b|mg\/l|boil|micron|\bµm\b|turbid|filtrat|filter|purif|disinfect|litre|liter|\bgallon|water per|per person per day/i],
  ['food', /refrigerat|freezer|fridge|danger zone|pressure can|canning|botulis|brine|pasteuri|cook to|internal temperature|shelf life/i],
  ['firstaid', /\bdose|dosage|\bmg\b|\bml\b|\bORS\b|oral rehydration|rehydrat|paracetamol|ibuprofen|\bburn|fever|hypothermi|hyperthermi|dehydrat|sachet|antisept|diarrhoea|diarrhea/i],
  ['gas', /carbon monoxide|\bCO\b|ventilat|flue\b|exhaust|fumes/i],
  ['electrical', /\bvolt|\bamp\b|\bamps\b|ampere|\bwatt|mains\b|inverter|electric shock/i],
  ['temperature', /°C|°F|degrees C|degrees F/],
];

/* Spelled-out numbers dodge the numeral rule. Where the sentence is clearly about a
   dose or a contact time, say so as a warning so a human can look. */
const NUMWORD_RE = /\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|forty|sixty|half|quarter)\b/i;
const DOSING_RE = /\bdrops?\b|teaspoon|tablespoon|\bdose|\bmg\b|\bml\b|per litre of|per gallon of|minutes? of contact|contact time|\bhold it for|boil for|\bppm\b/i;

const SRC_RE = /\[src:\s*([^\]]+)\]/g;
const IMG_RE = /^\[IMAGE:\s*(.+?)\]$/;
const TODO_RE = /\b(TODO|TBD|XXX|FIXME)\b/;

function stripForWords(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(SRC_RE, ' ')
    .replace(/^\[IMAGE:.*\]$/gm, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, ' ')
    .replace(/^\s*>\s?/gm, ' ')
    .replace(/^\s*([-*+]|\d+\.)\s+(\[[ xX]\]\s*)?/gm, ' ')
    .replace(/^\s*\|?[\s:|-]{6,}\|?\s*$/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/[*_`~]/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
}

function countWords(md) {
  const t = stripForWords(md).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));
  return t.length;
}

function isChapterFile(base) {
  return /^(\d{2})-/.test(base) && !base.startsWith('00-');
}

function lintFile(file) {
  const base = path.basename(file);
  const md = fs.readFileSync(file, 'utf8');
  const lines = md.split(/\r?\n/);
  const errors = [];
  const warnings = [];
  const chapter = isChapterFile(base);

  /* ---- headings ---- */
  const h1s = lines.filter((l) => /^#\s+/.test(l));
  const h2s = [];
  let inFence = false;
  lines.forEach((l, i) => {
    if (/^```/.test(l)) inFence = !inFence;
    if (inFence) return;
    const m = /^##\s+(.+?)\s*$/.exec(l);
    if (m) h2s.push({ title: m[1], line: i + 1 });
  });

  if (h1s.length !== 1) errors.push(`expected exactly 1 h1, found ${h1s.length}`);
  if (chapter && h1s.length === 1 && !/^#\s+Chapter\s+\d+\s+·\s+\S/.test(h1s[0])) {
    errors.push(`h1 must read "# Chapter N · Title", got: ${h1s[0].slice(0, 60)}`);
  }

  /* ---- promise line: first non-empty line after the h1 ---- */
  if (chapter && h1s.length === 1) {
    const hi = lines.indexOf(h1s[0]);
    let j = hi + 1;
    while (j < lines.length && lines[j].trim() === '') j += 1;
    if (!/^>\s+\S/.test(lines[j] || '')) {
      errors.push('h1 must be followed by a one-line promise blockquote ("> ...")');
    } else if (countWords(lines[j]) > 30) {
      warnings.push(`promise line is ${countWords(lines[j])} words — keep it to one line`);
    }
  }

  /* ---- part order ---- */
  const titles = h2s.map((h) => h.title);
  if (chapter) {
    const found = PARTS.filter((p) => titles.includes(p));
    const missing = PARTS.filter((p) => !titles.includes(p));
    if (missing.length) errors.push(`missing part(s): ${missing.join(', ')}`);
    const idx = found.map((p) => titles.indexOf(p));
    const sorted = idx.slice().sort((a, b) => a - b);
    if (String(idx) !== String(sorted)) {
      errors.push(`parts out of order: got ${found.join(' -> ')}, want ${PARTS.join(' -> ')}`);
    }
    const extra = titles.filter((t) => !PARTS.includes(t));
    if (extra.length) warnings.push(`unexpected h2 section(s): ${extra.join(', ')}`);
  }

  /* ---- section slices ---- */
  const sectionText = (name) => {
    const at = h2s.findIndex((h) => h.title === name);
    if (at < 0) return null;
    const from = h2s[at].line; // 1-based line of the h2
    const to = at + 1 < h2s.length ? h2s[at + 1].line - 1 : lines.length;
    return lines.slice(from, to).join('\n');
  };

  const dtn = sectionText('Do This Now');
  const dtnWords = dtn === null ? 0 : countWords(dtn);
  if (chapter && dtn !== null && dtnWords > DTN_MAX) {
    errors.push(`"Do This Now" is ${dtnWords} words, max ${DTN_MAX} (must fit one A5 page)`);
  }

  /* ---- word band ---- */
  const words = countWords(md);
  if (chapter && (words < BAND.min || words > BAND.max)) {
    errors.push(`word count ${words} outside band ${BAND.min}-${BAND.max}`);
  }

  /* ---- TODOs ---- */
  let todos = 0;
  lines.forEach((l, i) => {
    if (TODO_RE.test(l)) { todos += 1; errors.push(`line ${i + 1}: TODO marker — ${l.trim().slice(0, 60)}`); }
  });

  /* ---- safety numbers ---- */
  let unsourced = 0;
  let sourced = 0;
  inFence = false;
  lines.forEach((l, i) => {
    if (/^```/.test(l)) { inFence = !inFence; return; }
    if (inFence) return;
    const raw = l.trim();
    if (!raw) return;
    if (/^#{1,6}\s/.test(raw)) return;                 // headings
    if (/^\|?[\s:|-]{6,}\|?$/.test(raw)) return;       // table rule
    if (IMG_RE.test(raw)) return;                      // art brief
    const hasSrc = /\[src:/.test(raw);
    // strip the structural numerals a list marker contributes ("1." is not a dose)
    const body = raw
      .replace(SRC_RE, ' ')
      .replace(/^\s*(?:[-*+]\s+(?:\[[ xX]\]\s*)?|\d{1,3}[.)]\s+)/, ' ');
    if (!/\d/.test(body)) {
      // spelled-out dosing figures escape the numeral rule — warn, do not fail
      if (!hasSrc && NUMWORD_RE.test(body) && DOSING_RE.test(body)) {
        warnings.push(`line ${i + 1}: spelled-out figure in a dosing sentence with no [src:] — ${raw.slice(0, 64)}`);
      }
      return;
    }
    const domains = SAFETY_DOMAINS.filter(([, re]) => re.test(body)).map(([d]) => d);
    if (!domains.length) return;
    if (hasSrc) { sourced += 1; return; }
    unsourced += 1;
    errors.push(`line ${i + 1}: safety number (${domains.join('/')}) with no [src:] — ${raw.slice(0, 72)}`);
  });

  /* ---- source tag shape ---- */
  let m;
  SRC_RE.lastIndex = 0;
  const tags = [];
  while ((m = SRC_RE.exec(md)) !== null) tags.push(m[1].trim());
  tags.forEach((t) => {
    if (!/[—–-]/.test(t) || !/\b(18|19|20)\d{2}\b/.test(t)) {
      errors.push(`malformed source tag (want "ORG — document title, year"): [src: ${t}]`);
      return;
    }
    const org = t.split(/[—–]|\s-\s/)[0].trim();
    if (!ORGS.some((o) => org.toLowerCase().includes(o.toLowerCase()))) {
      warnings.push(`source org not on the approved list: "${org}"`);
    }
  });

  /* ---- boxes ---- */
  const boxesUsed = BOX_LABELS.filter((lbl) => {
    const esc = lbl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^>\\s*\\*\\*${esc}`, 'im').test(md);
  });
  const boxCount = (md.match(/^>\s*\*\*/gm) || []).length;
  if (chapter && boxCount === 0) errors.push('no boxes used (Village Hack / Day-X Challenge / What I Wish I\'d Stocked / Climate note)');
  else if (chapter && boxesUsed.length < 3) warnings.push(`only ${boxesUsed.length} of 4 box kinds used: ${boxesUsed.join(', ')}`);

  /* ---- image placeholders ---- */
  const imgs = lines.filter((l) => IMG_RE.test(l.trim())).length;
  lines.forEach((l, i) => {
    const raw = l.trim();
    if (/\[IMAGE/i.test(raw) && !IMG_RE.test(raw)) {
      errors.push(`line ${i + 1}: malformed image placeholder (want "[IMAGE: brief]" alone on the line)`);
    }
  });
  if (chapter && imgs === 0) warnings.push('no [IMAGE:] art briefs');

  /* ---- checklist ---- */
  const cl = sectionText('Checklist');
  const clItems = cl === null ? 0 : (cl.match(/^\s*-\s\[[ xX]\]\s+\S/gm) || []).length;
  if (chapter && cl !== null && clItems < 5) {
    errors.push(`Checklist has ${clItems} "- [ ]" items, want at least 5`);
  }

  return {
    file: path.relative(ROOT, file), chapter, words, dtnWords, sections: titles,
    todos, sourced, unsourced, boxes: boxesUsed, boxCount, images: imgs,
    checklist: clItems, errors, warnings,
  };
}

function main() {
  const argv = process.argv.slice(2);
  const wantJson = argv.includes('--json');
  let files = argv.filter((a) => !a.startsWith('--'));
  if (!files.length) {
    files = fs.existsSync(MS)
      ? fs.readdirSync(MS).filter((f) => f.endsWith('.md')).sort().map((f) => path.join(MS, f))
      : [];
  }

  if (!files.length) {
    console.log('LINT: no manuscript/*.md files found');
    console.log('PROBE lint files=0 words=0 errors=1 warnings=0 todos=0 unsourced=0');
    process.exit(1);
  }

  const reports = files.map(lintFile);
  let errs = 0;
  let warns = 0;
  let words = 0;

  for (const r of reports) {
    errs += r.errors.length;
    warns += r.warnings.length;
    words += r.words;
    const flag = r.errors.length ? 'FAIL' : (r.warnings.length ? 'WARN' : 'ok  ');
    console.log(
      `${flag} ${r.file}  words=${r.words}${r.chapter ? ` (band ${BAND.min}-${BAND.max})` : ' (front/back matter)'}` +
      `  doThisNow=${r.dtnWords}w  src=${r.sourced}  unsourced=${r.unsourced}` +
      `  todos=${r.todos}  boxes=${r.boxCount}[${r.boxes.length}/4 kinds]  images=${r.images}  checklist=${r.checklist}`
    );
    if (r.sections.length) console.log(`     sections: ${r.sections.join(' -> ')}`);
    r.errors.forEach((e) => console.log(`     ERROR  ${e}`));
    r.warnings.forEach((w) => console.log(`     warn   ${w}`));
  }

  const todos = reports.reduce((a, r) => a + r.todos, 0);
  const unsourced = reports.reduce((a, r) => a + r.unsourced, 0);
  console.log('');
  console.log(`PROBE lint files=${reports.length} words=${words} errors=${errs} warnings=${warns} todos=${todos} unsourced=${unsourced}`);
  console.log(errs ? 'LINT: FAIL' : 'LINT: PASS');

  if (wantJson) {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, 'lint.json'), JSON.stringify({ reports, errs, warns, words, todos, unsourced }, null, 2));
  }
  process.exit(errs ? 1 : 0);
}

main();
