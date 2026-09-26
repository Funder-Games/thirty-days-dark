# SPRINT-001 — Build pipeline + Chapter 2 Water

**MISSION:** A broad, practical field manual for the first 30 days after the grid and internet go down.
**Status:** DONE
**Marathon:** MARATHON-001   **Rigour:** HIGH
**Moves:** 1.1 #1 (chapters drafted, sourced, lint-clean); 1.1 #2 (A5 PDF)
**Max steps:** 80   **File set:** _dev/, manuscript/02-water.md, package.json, package-lock.json
**Cut:** 2026-09-26   **Green-lit:** 2026-09-26 by COA

## GOAL
`npm run lint` and `npm run build` work end to end, and Chapter 2 (Water) is drafted to _dev/STYLE.md, lint-clean, and renders to A5 PDF with page PNGs.

## DONE WHEN
- [x] _dev/lint.js: per-file words, section order check (Do This Now/The Craft/Thrive Hacks/Checklist), flags safety-number lines lacking [src:], TODO count; exit 1 on fail
- [x] _dev/build.js: manuscript/*.md → HTML (marked) → A5 PDF via playwright-core Chromium (executablePath /opt/pw-browsers/chromium*/chrome-linux/chrome) → page PNGs in _dev/shots/; per-chapter and whole-book; Do This Now starts a new page
- [x] print CSS: field-guide clean, generous whitespace, bold boxes for Village Hack etc, placeholder frames for [IMAGE:], tables legible at A5
- [x] 02-water.md: 3,000–5,500 words, all four parts, boxes used, lint 0 errors
- [x] Do This Now renders on exactly one page (probe: page count of that section)

## DONOR
The SAS Survival Handbook for density, crossed with The Dangerous Book for Boys for charm.

## OUT OF SCOPE
Other chapters. Final art. Printer spec.

## EVIDENCE

Harness: no pandoc on the box, so the pipeline is npm only — `marked` 18.0.14 for Markdown,
`playwright-core` 1.63.0 driving `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` for the
A5 PDF, and `pdfjs-dist` 4.10.38 re-rendering that same PDF page by page in the browser for the
PNGs. Test handle is `window.TS` in `_dev/viewer.html` (`TS.ready`, `TS.pages`, `TS.text[]`,
`TS.error`); `_dev/build.js` waits on it, screenshots `#p1..#pN`, and reads the section→page map
off the PDF's own text layer. Run both from the repo root: `npm run lint`, `npm run build`
(`npm run check` does both). Build products land in `_dev/out/` and `_dev/shots/`, both ignored
via the new `_dev/.gitignore`; `git status --porcelain` after a full clean build shows only the
8 intended new files and no `node_modules`.

- [x] _dev/lint.js — probe: `npm run lint` → `PROBE lint files=1 words=3859 errors=0 warnings=0
  todos=0 unsourced=0` · `LINT: PASS` · exit 0. Negative probe on a deliberately broken chapter,
  `node _dev/lint.js <scratch>/02-bad.md` → `PROBE lint files=1 words=26 errors=7 warnings=1
  todos=1 unsourced=1` · `LINT: FAIL` · **exit 1**, with all seven checks firing by name: missing
  part (Thrive Hacks), parts out of order, word count outside band, TODO marker on line 15,
  `line 7: safety number (water) with no [src:]`, no boxes used, checklist under 5 items.
- [x] _dev/build.js — probe: `npm run build` from a wiped `_dev/out` + `_dev/shots` →
  `PROBE build doc=02-water pages=16 bytes=227002 shots=16 px=840x1191 doThisNowPages=1 dtnPage=2`
  and `PROBE build doc=thirty-days-dark pages=17 bytes=231051 shots=17 px=840x1191
  doThisNowPages=1 dtnPage=3` · `LOGS: clean` · `BUILD: PASS`. 33 PNGs on disk (16 + 17), plus
  1.6× thumbnails in `_dev/shots/thumb/`; `file _dev/shots/02-water-p02.png` → `PNG image data,
  840 x 1191`. Chromium line printed by the run:
  `BUILD chromium=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- [x] print CSS — shots read at 672 × 953 px (`_dev/shots/thumb/`, 1.6× of the A5 page box; the
  full-size pass in `_dev/shots/` is 840 × 1191): `_dev/shots/thumb/02-water-p01.png` (chapter opener:
  eyebrow, 26pt title, rule, italic promise, dashed `[IMAGE:]` frame with its art brief as the
  caption), `_dev/shots/thumb/02-water-p04.png` (What I Wish I'd Stocked box, purple spine, label
  apostrophe correct after the double-escape fix), `_dev/shots/thumb/02-water-p05.png` (6-row
  house-water table plus a teal Village Hack box), `_dev/shots/thumb/02-water-p06.png`
  (4-column treatment table + inline `[src:]` tag at 6.9pt), `_dev/shots/thumb/02-water-p10.png`
  (Climate note (wet) and Village Hack boxes), `_dev/shots/thumb/02-water-p14.png` (Thrive Hacks
  opening its own page), `_dev/shots/thumb/02-water-p16.png` (16 drawn checkboxes, one page),
  `_dev/shots/thumb/thirty-days-dark-p01.png` (book plate). Full-resolution originals of the same
  pages are in `_dev/shots/`.
- [x] 02-water.md — probe: `npm run lint` → `words=3859 (band 3000-5500) doThisNow=222w src=8
  unsourced=0 todos=0 boxes=7[4/4 kinds] images=3 checklist=16` and
  `sections: Do This Now -> The Craft -> Thrive Hacks -> Checklist`, 0 errors, 0 warnings.
- [x] Do This Now on exactly one page — probe: `doThisNowPages=1` in both docs, computed from the
  PDF text layer as (first page carrying THE CRAFT) − (first page carrying DO THIS NOW), i.e.
  `sections{dtn=p2 craft=p3 ...}` for the chapter and `{dtn=p3 craft=p4 ...}` for the book ·
  shot: `_dev/shots/02-water-p02.png` — whole card, framed and tinted, items 1–9 and the closing
  line, with room to spare at the foot. Machine copy in `_dev/out/probe.json`
  (`docs[0].sectionPages`, `docs[0].doThisNowPages`).

## FINDINGS

- pdfjs-dist 6.x is unusable against the pinned Chromium: its worker calls `Map#getOrInsertComputed`
  and `Math.sumPrecise`, which build 1194 lacks, and the worker swallows the error — pages come back
  with 12 ops and render blank while still reporting success. Probed with `getOperatorList()`
  (page 1: 12 ops, no `beginText`; page 2: 984 ops) and pinned to `pdfjs-dist@4.10.38`.
- Injecting raw `<figure>` HTML into the Markdown before `marked` makes marked treat the next block
  as part of the HTML block: `## Do This Now` and `## Checklist` came out as literal text. The
  `[IMAGE:]` transform now runs on the rendered HTML instead.
- Chrome writes letter-spaced headings into the PDF text layer glyph by glyph
  (`T H E  C R A F T`), so any text-layer probe must compare with whitespace stripped. The
  section→page map does; anything else reading `probe.json.pageText` must too.
- The lint keys safety numbers on numerals, so a spelled-out figure escapes it by design; a warning
  now fires when a spelled-out figure sits in a dosing sentence. Two lines in 02-water are spelled
  out on purpose because they are physical arithmetic, not dosing (roof yield per square metre, the
  weight of a full jerrycan) — they need an editor's eye, not a citation.
- Root `.gitignore` has no `_dev/out/` line and is outside this sprint's file set, so build products
  are kept out of git by a new nested `_dev/.gitignore` (`out/`, `shots/`). The root file also
  ignores `*.pdf`, which will need a decision once the printer is chosen and a PDF has to ship.
- `findChrome()` deliberately skips `chromium_headless_shell-1194` in favour of the full Chromium;
  the shell build is unreliable for `printBackground`, and every box, tint and frame in this design
  is a background.
- Lint classifies `00-*.md` as front matter and exempts it from the word band and the four-part
  rule. That path is written but untested — nothing in `manuscript/` uses it yet.
- No second PDF renderer exists on the box (no poppler, mutool or ghostscript), so the page PNGs
  and the shipped PDF come from the same Chromium. An independent renderer would be a stronger
  check on the print output.

## NEEDS WALK

- **Verify the eight `[src:]` citations against the actual documents.** Every tag names an
  organisation and a document I am confident of (WHO, CDC, EPA, Sphere), but nothing was fetched
  or read in this sprint, and this is the safety-critical half of a HIGH-rigour chapter. One human
  verification pass before anything is printed.
- **Read the A5 PDF at actual size, on paper.** 10.4pt body and 6.9pt source tags look right on
  screen at 700 px; only a printed page settles whether the source tags are readable and whether
  the Do This Now card reads at arm's length in bad light.
- **Binding and printer spec.** Margins are a symmetrical 14mm with a 15mm foot; a bound A5 book
  usually wants a wider inner margin, and bleed is not set. Blocked on the printer choice already
  sitting in PAUL-TASKS.
