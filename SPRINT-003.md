# SPRINT-003 — Chapter 6 Health

**MISSION:** A broad, practical field manual for the first 30 days after the grid and internet go down.
**Status:** DONE
**Marathon:** MARATHON-001   **Rigour:** HIGH
**Moves:** 1.1 #1 (chapters drafted, sourced, lint-clean)
**Max steps:** 50   **File set:** manuscript/06-health.md
**Cut:** 2026-09-26   **Green-lit:** 2026-09-26 by COA

## GOAL
Chapter 6 Health drafted to _dev/STYLE.md (read manuscript/02-water.md as the house example), lint-clean, rendered to A5.

## DONE WHEN
- [x] each file: 3,000–5,500 words (front matter exempt), four parts, boxes used, `npm run lint` 0 errors — probe: `node _dev/lint.js manuscript/06-health.md` → `ok manuscript/06-health.md words=4878 ... boxes=5[4/4 kinds] images=3 checklist=16`, `sections: Do This Now -> The Craft -> Thrive Hacks -> Checklist`, `PROBE lint files=1 words=4878 errors=0 warnings=0 todos=0 unsourced=0`, `LINT: PASS` · shot: _dev/shots/06-health-p01.png
- [x] ORS recipe, wound care, fever, dehydration signs all sourced; first aid only — probe: same lint run, `src=14 unsourced=0` (lint errors on any digit-bearing safety line with no `[src:]`) · shot: _dev/shots/06-health-p07.png (home ORS table: half a level teaspoon salt, six level teaspoons sugar, one litre, WHO 2005) and _dev/shots/06-health-p08.png (ml per loose stool by age, zinc, adult + infant dehydration signs, all tagged)
- [x] `npm run build` renders it; Do This Now on one page; shots read — probe: `PORT=8736 node _dev/build.js --only 06` → `PROBE build doc=06-health pages=19 bytes=226552 shots=19 px=840x1191 doThisNowPages=1 dtnPage=2`, `LOGS: clean`, `BUILD: PASS` · shot: _dev/shots/06-health-p02.png (whole Do This Now card, 8 items + closing line, one A5 page with room to spare)

## DONOR
manuscript/02-water.md

## OUT OF SCOPE
Every file not in the file set. _dev/ (FINDINGS line if the tooling blocks you).

## EVIDENCE
- Lint, final run: `ok manuscript/06-health.md words=4878 (band 3000-5500) doThisNow=197w src=14 unsourced=0 todos=0 boxes=5[4/4 kinds] images=3 checklist=16` → `PROBE lint files=1 words=4878 errors=0 warnings=0 todos=0 unsourced=0 / LINT: PASS`.
- Build, final run (`PORT=8736 node _dev/build.js --only 06` — the same script `npm run build` runs, scoped to my chapter because other SAs build in parallel): `BUILD 06-health: pages=19 bytes=226552 shot=840x1191 sections{dtn=p2 craft=p3 thrive=p17 checklist=p19} doThisNowPages=1`, `LOGS: clean`, `BUILD: PASS`. PDF at _dev/out/06-health.pdf, 19 page PNGs at 840x1191 in _dev/shots/.
- Shots read (thumbs): p01 opener — eyebrow/title/promise/illustration frame match the donor. p02 Do This Now — framed card, all 8 items on one page. p06 — burns block plus Climate note (hot) box. p07/p08 — both source-tagged tables render whole, no mid-table break. p10 — fever red flags plus Day-X Challenge box. p15 — Village Hack box plus sick room. p19 — Checklist, 16 boxed items, one page.
- All four box kinds render with their own styling and a correct label: What I Wish I'd Stocked (p05, apostrophe escaping clean), Climate note (hot) (p06), Day-X Challenge (p10), Village Hack (p15).
- Voice and structure taken from the donor manuscript/02-water.md: same four parts, same source-column table pattern, same box cadence, same checklist length (16 items).

## FINDINGS
- `_dev/build.js` always appends the whole-book target, so a scoped `--only NN` run also overwrites `_dev/out/thirty-days-dark.pdf/.html` and `_dev/shots/thirty-days-dark-pNN.png` from that one chapter. Parallel SA builds race on those paths; chapter-named outputs are unaffected. A `--no-book` flag would fix it. (_dev/ is out of my file set — reporting only.)
- `_dev/build.js` binds PORT 8732 with an env override only; a second concurrent build fails to bind unless PORT is set. I used PORT=8736.
- `_dev/lint.js` treats a cross-reference like "See Chapter 2" as an unsourced safety number, because the chapter numeral lands on a line matching the water/first-aid domain regex. It cost three false-positive errors. I worked round it by naming chapters in words ("see the water chapter"); that is worth making the house convention, or the lint should skip `Chapter \d+`.
- The chapter is 4,878 words against the donor's 3,860 — inside the band but at the top of it, because Health carries more safety-critical ground than any other chapter (wounds, burns, ORS, fever, heat/cold, collapse, fractures, medicines). If PROJECT §3.4's 45–60k ceiling starts to bind, this is a chapter to cut rather than one that grew loosely.
- Two WIP commits landed mid-sprint (88b9b8a 10:26, eab57fa 10:29) and snapshotted my chapter while it was still drafting, so HEAD carries an older 5,038-word cut of manuscript/06-health.md. The final 4,878-word version is uncommitted in the working tree (23 insertions / 25 deletions) — I did not commit, per the sprint. git should land the working tree, not assume HEAD is current.
- Deliberately excluded to stay inside PROJECT §1.2: tourniquets and trauma tactics, antibiotic selection or dosing, anything invasive (suturing, lancing, injections), and paediatric paracetamol/ibuprofen doses in figures — children's dosing is pointed at the packet's own age bands instead of printed here.

## NEEDS WALK
- Human verification of the 14 sourced safety figures against the cited documents before any print run. The lint proves every figure carries a source tag; it cannot prove the tagged document states that number, and this environment has no copies of the source documents to check against. Every figure is standard published public-health guidance (WHO ORS and zinc, NHS burns/fever/analgesia/hypothermia/heatstroke/CPR/choking/sprains, CDC hand-washing), but a clinician or librarian read is the right last gate on a book people will act on.
- Paper judgement Paul should make on a printed proof: whether 19 A5 pages is the right weight for one chapter, and whether the small grey inline source tags stay readable at arm's length where several land in one paragraph (p08 is the densest case).
