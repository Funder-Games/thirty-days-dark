# SPRINT-002 — Front matter + Chapter 1 Day Zero

**MISSION:** A broad, practical field manual for the first 30 days after the grid and internet go down.
**Status:** DONE
**Marathon:** MARATHON-001   **Rigour:** HIGH
**Moves:** 1.1 #1 (chapters drafted, sourced, lint-clean)
**Max steps:** 50   **File set:** manuscript/00-front.md, manuscript/01-day-zero.md
**Cut:** 2026-09-26   **Green-lit:** 2026-09-26 by COA

## GOAL
Front matter + Chapter 1 Day Zero drafted to _dev/STYLE.md (read manuscript/02-water.md as the house example), lint-clean, rendered to A5.

## DONE WHEN
- [x] each file: 3,000–5,500 words (front matter exempt), four parts, boxes used, `npm run lint` 0 errors — probe: `node _dev/lint.js manuscript/00-front.md manuscript/01-day-zero.md` → `PROBE lint files=2 words=5522 errors=0 warnings=0 todos=0 unsourced=0` · `LINT: PASS`; 01-day-zero words=4186, sections `Do This Now -> The Craft -> Thrive Hacks -> Checklist`, boxes=5[4/4 kinds], images=2, checklist=18, src=8; 00-front words=1336 (front/back matter) · shot: `_dev/shots/01-day-zero-p01.png`
- [x] 00-front has How to Use This Book + The First Hour card; card renders on one page — probe: `PORT=8752 node _dev/build.js --only 00` → `PROBE build doc=00-front pages=5`; PDF text layer puts the `THE FIRST HOUR` heading, item 9 and the closing rule box all on p5, the last page, so the card is exactly one page · shot: `_dev/shots/00-front-p05.png` (read: heading, nine numbered items, CDC source tag, rule box, all above the folio)
- [x] `npm run build` renders it; Do This Now on one page; shots read — probe: `PORT=8752 node _dev/build.js --only 01` → `PROBE build doc=01-day-zero pages=15 shots=15 px=840x1191 doThisNowPages=1 dtnPage=2` · `LOGS: clean` · `BUILD: PASS` · shot: `_dev/shots/01-day-zero-p02.png` (the framed Do This Now card, 10 items, one page). All 15 chapter pages and all 5 front-matter pages opened and read at `_dev/shots/thumb/`; two layout defects found that way and fixed (below).

## DONOR
manuscript/02-water.md

## OUT OF SCOPE
Every file not in the file set. _dev/ (FINDINGS line if the tooling blocks you).

## EVIDENCE

Built: `manuscript/00-front.md` (1,336 words, 5 A5 pages) and `manuscript/01-day-zero.md` (4,186 words, 15 A5 pages). Donor followed: `manuscript/02-water.md` for voice, part order, box use, table shape and source-tag placement.

Commands run, in this order, from the repo root:
```
node _dev/lint.js manuscript/00-front.md manuscript/01-day-zero.md
  → PROBE lint files=2 words=5522 errors=0 warnings=0 todos=0 unsourced=0 · LINT: PASS
PORT=8752 node _dev/build.js --only 00
  → PROBE build doc=00-front pages=5 bytes=117478 shots=5 px=840x1191 · LOGS: clean · BUILD: PASS
PORT=8752 node _dev/build.js --only 01
  → PROBE build doc=01-day-zero pages=15 bytes=201953 shots=15 px=840x1191 doThisNowPages=1 dtnPage=2
    LOGS: clean · BUILD: PASS
```
`PORT=8752` because other sprints are building concurrently on the default port (see FINDINGS).

Shots opened and read: all 5 of `_dev/shots/thumb/00-front-p0[1-5].png` and all 15 of `_dev/shots/thumb/01-day-zero-p*.png`. Reading them caught two defects that no probe reported, both since fixed and re-shot:
- the First Hour card overflowed onto a second page (the closing rule box sat alone on p6); the card was tightened and now ends on p5 — `PROBE build doc=00-front pages=6` became `pages=5`;
- the closing illustration of Ch1 was orphaned alone on a blank p13; the placeholder was moved up into the ledger-and-rota section — `pages=16` became `pages=15`.

Sourcing (rigour HIGH): 8 `[src:]` tags in Ch1, 1 in the front matter, 0 unsourced safety numbers. Figures carried: USDA fridge 4 h / full freezer 48 h / half freezer 24 h and the 4 °C discard rule; CDC generator at least 6 m (20 ft) from any opening, and the CO symptom list; NFPA 30 cm candle clearance; WHO 18 °C minimum indoor room temperature; WHO ~3 litres per person per day for drinking. See NEEDS WALK on verification.

Style conformance checked by eye against `_dev/STYLE.md`: UK English, calm manual voice, no jokes carrying weight, no weapons/violence/tactics, medicine limited to first aid and home care (Ch1 defers all treatment to Ch6), no personal details.

## FINDINGS

- `npm run lint` over the whole manuscript currently FAILs, but not on my files: `manuscript/06-health.md` line 180 has a safety number with no `[src:]`, plus 3 warnings on lines 170/182/196. That file belongs to another live sprint and was not touched. My two files report `ok` both individually and inside the full run.
- `_dev/build.js` always emits the shared `thirty-days-dark` book target even under `--only`, and serves on a fixed port 8732. Concurrent sprints therefore race on `_dev/out/thirty-days-dark.pdf`, `_dev/shots/thirty-days-dark-p*.png` and the port itself (the second build would die on EADDRINUSE). A `--no-book` flag plus an ephemeral port would fix it. `_dev/` is out of scope for this sprint, so not changed.
- `_dev/out/probe.json` is one shared file rewritten by every build, so a parallel run destroys the previous sprint's probe record. Per-slug probe files would make hand-backs reproducible.
- The First Hour card in the front matter gets no framed `.cardbody`: `build.js parts()` frames only the part whose slug is `do-this-now`. It reads as a card because the part starts a fresh page and closes with a rule box, but it does not match the chapter cards. Framing any part on a small allow-list of slugs would close the gap.
- `lint.js` flags any numeral on a line that also contains a safety-domain word, so a cross-reference like "(Chapter 4)" beside the word "freezer" is a hard error. It is a sensible false positive to keep, but it shapes prose: the First Hour card names chapters ("*(Water)*", "*(Food)*") rather than numbering them.
- `_dev/build.js` never clears stale shots, so a rebuild that shortens a document leaves the old trailing page PNGs on disk looking current. My earlier 6-page and 16-page runs left `00-front-p06.png` and `01-day-zero-p16.png` behind; I deleted those four files (full and thumb) so QC does not open a page that no longer exists. `_dev/shots/` now holds exactly 5 + 15 pages for my two documents. Clearing a document's shots at the top of its build would prevent it.
- The lint word count treats front and back matter as exempt from the band, which is right, but it also skips the part-order, box and checklist checks for any `00-` file. Front matter is therefore unlinted on structure; the First Hour card's one-page rule had to be proved from the PDF text layer instead.

## NEEDS WALK

- **Verify the citations before print.** Every `[src:]` figure in these two files was written from the agent's knowledge of the source document, not fetched and read in this environment. The eight numbers listed under EVIDENCE need a human to confirm against the current published document. This is the same walk already open on Ch2's citations.
- **Read the A5 pages on paper.** Body type is 10.4 pt serif on A5, and the source tags print as 6.9 pt grey mid-sentence — on screen they read as a useful murmur, on paper they may read as clutter or may be too small. Paul's call.
- **Decide whether the First Hour card should be framed** like the chapter Do This Now cards. It is a design call, not a bug, and it drives whether `_dev/build.js` needs the tooling change above.
