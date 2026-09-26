# SPRINT-005 — Chapter 4 Food

**MISSION:** A broad, practical field manual for the first 30 days after the grid and internet go down.
**Status:** DONE
**Marathon:** MARATHON-001   **Rigour:** HIGH
**Moves:** 1.1 #1 (chapters drafted, sourced, lint-clean)
**Max steps:** 50   **File set:** manuscript/04-food.md
**Cut:** 2026-09-26   **Green-lit:** 2026-09-26 by COA

## GOAL
Chapter 4 Food drafted to _dev/STYLE.md (read manuscript/02-water.md as the house example), lint-clean, rendered to A5.

## DONE WHEN
- [x] each file: 3,000–5,500 words (front matter exempt), four parts, boxes used, `npm run lint` 0 errors — probe: `node _dev/lint.js manuscript/04-food.md` → `ok manuscript/04-food.md words=4121 (band 3000-5500) doThisNow=193w src=12 unsourced=0 todos=0 boxes=7[4/4 kinds] images=2 checklist=18` · `sections: Do This Now -> The Craft -> Thrive Hacks -> Checklist` · `PROBE lint files=1 words=4121 errors=0 warnings=0` · `LINT: PASS`
- [x] food-safety temperatures/times sourced; foraging carries a clear do-not-eat-unless-certain rule — probe: `PROBE lint … src=12 unsourced=0` (fridge 4 h / full freezer 48 h / half-full 24 h, danger zone 4–60 °C and the 2-hour rule, fridge ≤4 °C and freezer ≤−18 °C, poultry 74 °C / mince 71 °C / whole cuts 63 °C, jerky heated before drying, 10-minute boil for low-acid home-canned food, formula water cooled no more than 30 min) · shot: `_dev/shots/04-food-p11.png` — bold rule reads "if you are not completely certain what a plant or fungus is, you do not eat it", with "no reliable field test for edibility" and the umbellifer warning under it
- [x] `npm run build` renders it; Do This Now on one page; shots read — probe: `PORT=8744 node _dev/build.js --only 04` → `PROBE build doc=04-food pages=16 bytes=209873 shots=16 px=840x1191 doThisNowPages=1 dtnPage=2` · `LOGS: clean` · `BUILD: PASS` · shot: `_dev/shots/04-food-p02.png` — the whole Do This Now card, all nine items, inside one framed A5 page with room to spare

## DONOR
manuscript/02-water.md

## OUT OF SCOPE
Every file not in the file set. _dev/ (FINDINGS line if the tooling blocks you).

## EVIDENCE
- Wrote `manuscript/04-food.md` — Chapter 4 · Food, 4,121 words, 12 distinct `[src:]` citations (USDA ×4, FDA ×2, WHO ×2, CDC, NHS, Sphere), 7 boxes covering all 4 kinds, 2 `[IMAGE:]` briefs, 18-item checklist. Donor `manuscript/02-water.md` matched for voice, table shape, box cadence and checklist length.
- Lint probe (final run): `PROBE lint files=1 words=4121 errors=0 warnings=0 todos=0 unsourced=0` · `LINT: PASS`.
- Build probe (final run, own chapter only): `PROBE build doc=04-food pages=16 bytes=209873 shots=16 px=840x1191 doThisNowPages=1 dtnPage=2` · `LOGS: clean` · `BUILD: PASS`. Section map `{dtn=p2 craft=p3 thrive=p14 checklist=p16}`.
- Shots read (9 of 16, via `_dev/shots/thumb/`): p01 opener — eyebrow "CHAPTER 4", title, promise line, illustration frame with caption. p02 Do This Now — one page, card frame closed, nine items. p03 The Craft — the fridge/freezer table renders with its Source column, source spans inline and grey. p06 — Climate note (wet) and Village Hack boxes render with correct labels and left rule. p07 — Sphere calorie figure, bullet block, Village Hack box. p10 — bottling/botulism section, both USDA canning cites in place. p11 — foraging rule bold and prominent, Climate note (cold) above it. p12 — hands/water and infant-feeding sections, NHS cite in place. p16 Checklist — 18 checkbox items, all on one page.
- Sources are UK/intl-safe and use only approved orgs; no line carries a safety-critical number without a tag (`unsourced=0`).

## FINDINGS
- `_dev/build.js` always emits the whole-book target, even under `--only`: this run overwrote the shared `_dev/out/thirty-days-dark.{html,pdf}` and `_dev/shots/thirty-days-dark-pNN.png` with a "book" containing chapter 04 alone. Under parallel sprint agents those book artefacts are a race and are not trustworthy until a full `npm run build` is re-run at close. (Out of my file set — no edit.)
- `_dev/build.js` hard-defaults to port 8732, so two parallel builds collide on EADDRINUSE. I ran with `PORT=8744`. A `--no-book` flag plus an ephemeral port would make per-chapter builds safe to run concurrently. (Out of my file set — no edit.)
- The sauerkraut ratio is given as "roughly 2 per cent salt by weight" against the USDA Complete Guide to Home Canning, whose tested sauerkraut recipe works out near that figure rather than stating the percentage; softened with "roughly" for that reason. Worth confirming against the document.
- Wrote nothing outside `manuscript/04-food.md` and this sprint file. Build outputs under `_dev/out/` and `_dev/shots/` are generated artefacts of the named probe, not hand edits.

## NEEDS WALK
- Verify the 12 `[src:]` citations against the source documents (no network access was used in this environment; titles, years and figures are written from public guidance as known, not fetched). Same standing item as SPRINT-001.
- Read `_dev/out/04-food.pdf` at actual A5 size on paper: type size, the Do This Now card at arm's length, and whether the source spans are legible without being loud.
- Paul's taste call on scope boundaries: foraging is deliberately conservative (no mushroom identification guidance at all, umbellifers ruled out wholesale) and home canning tells the reader not to bottle low-acid food without a pressure canner rather than giving times or pressures.
