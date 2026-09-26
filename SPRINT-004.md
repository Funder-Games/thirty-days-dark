# SPRINT-004 — Chapter 7 Sanitation

**MISSION:** A broad, practical field manual for the first 30 days after the grid and internet go down.
**Status:** DONE
**Marathon:** MARATHON-001   **Rigour:** HIGH
**Moves:** 1.1 #1 (chapters drafted, sourced, lint-clean)
**Max steps:** 50   **File set:** manuscript/07-sanitation.md, manuscript/02-water.md (fix only: hygiene/cooking litres line → WHO 2–6 L hygiene, 3–6 L cooking)
**Cut:** 2026-09-26   **Green-lit:** 2026-09-26 by COA

## GOAL
Chapter 7 Sanitation drafted to _dev/STYLE.md (read manuscript/02-water.md as the house example), lint-clean, rendered to A5.

## DONE WHEN
- [x] each file: 3,000–5,500 words (front matter exempt), four parts, boxes used, `npm run lint` 0 errors — probe: `node _dev/lint.js manuscript/02-water.md manuscript/07-sanitation.md` → `PROBE lint files=2 words=8380 errors=0 warnings=0 todos=0 unsourced=0` · `LINT: PASS`; 07-sanitation words=4520, sections `Do This Now -> The Craft -> Thrive Hacks -> Checklist`, boxes=6[4/4 kinds], checklist=17; 02-water words=3860, boxes=7[4/4 kinds]
- [x] latrine distances, handwashing, disinfection ratios sourced — probe: `grep -o "\[src: [^]]*\]" manuscript/07-sanitation.md | sort | uniq -c` → 9 tags, 6 distinct: Sphere 2018 ×4 (30 m to any water source · pit bottom 1.5 m above water table · 50 m to homes · 20 people per toilet), CDC 2022 (20-second handwash), CDC 2021 (≥60% alcohol rub), CDC 2011 norovirus (1,000–5,000 ppm = 20–100 ml of 5% bleach per litre), WHO 2006 Excreta Vol 4 (55 °C for a week, else a year's storage), WHO 2013 (2–6 L/person/day hygiene). Lint `unsourced=0` · shot: `_dev/shots/07-sanitation-p06.png` (distance table), `_dev/shots/07-sanitation-p10.png` (disinfection ratio)
- [x] `npm run build` renders it; Do This Now on one page; shots read — probe: `PORT=8747 node _dev/build.js --only 07` → `PROBE build doc=07-sanitation pages=17 bytes=218216 shots=17 px=840x1191 doThisNowPages=1 dtnPage=2` · `LOGS: clean` · `BUILD: PASS`; shot: `_dev/shots/07-sanitation-p02.png` (Do This Now card, whole of page 2, 214 words)

## DONOR
manuscript/02-water.md

## OUT OF SCOPE
Every file not in the file set. _dev/ (FINDINGS line if the tooling blocks you).

## EVIDENCE
- Built: `manuscript/07-sanitation.md` — 4,520 words, four parts in order, 17 pages A5, 3 `[IMAGE:]` briefs, 6 boxes covering all 4 kinds (Village Hack, Day-X Challenge, What I Wish I'd Stocked, Climate note hot/wet/cold), 17-item checklist. Donor `manuscript/02-water.md` matched for voice, table density and card shape.
- Fix in scope: `manuscript/02-water.md` "How much you actually need" table — the single row "Basic hygiene and cooking | 4–6 litres" is now two rows, "Basic hygiene | 2–6 litres" and "Basic cooking | 3–6 litres", both [src: WHO — Technical Notes…, 2013]; lead-in changed from "three numbers" to "these four numbers". Nothing else in that file touched. Rebuilt: `PROBE build doc=02-water pages=16 shots=16 doThisNowPages=1` · `LOGS: clean`; shot read: `_dev/shots/thumb/02-water-p03.png` shows the four-row table.
- Shots read (all 17 of chapter 7, at thumb scale): p01 opener + art frame · p02 Do This Now card on one page with room to spare · p03 F-diagram table · p04 first-toilet + stocked box · p05 toilet-options table · p06 distance table + digging safety · p07 art frame + Village Hack box · p08 latrine rules + Climate note (hot) · p09 handwashing + Day-X box · p10 disinfection ratios · p11 Climate note (wet) + waste · p12 dignity section · p13 Climate note (cold) + composting · p14 sewer restart · p15 Thrive Hacks · p16 art frame · p17 Checklist with rendered boxes. No orphan headings, no broken box or table markup, no literal markdown leaking through.
- Two lint errors were hit and fixed during the loop, both false positives from incidental digits: "…and Chapter 6 covers…" on a line containing "diarrhoea" and "…Chapter 12 has plenty to say…" on a line containing "burnables". Cross-references are now named, not numbered, which reads better anyway.
- Console clean on every build run; no `npm run build` full-book run was made, per the parallel-sprint instruction.

## FINDINGS
- `_dev/build.js --only NN` still renders the whole-book target from the filtered set, so `_dev/out/thirty-days-dark.*` and `_dev/shots/thirty-days-dark-pNN.png` now hold a one-chapter book. Harmless to this sprint but it makes the book artefact meaningless while sprints run in parallel; a `--no-book` flag or skipping the book when `--only` is set would fix it. `_dev/` is outside my file set — not touched.
- `_dev/build.js` hardcodes `PORT` default 8732, so two sprint agents building at once collide on the port. Worked around with `PORT=8747`. Same file, not touched.
- `_dev/lint.js` fires the "safety number" rule on any digit sharing a line with a domain word, so a plain chapter cross-reference ("Chapter 6") next to "diarrhoea" is an error. Cheap fix would be to ignore `Chapter \d+`. Same file, not touched.
- `_dev/lint.js` `src=N` in the per-file line counts *sourced safety lines*, not citations: chapter 7 shows `src=2` while carrying 9 `[src:]` tags. Reads as a regression to anyone scanning the output.

## NEEDS WALK
- Citation check against the source documents. I can assert the shape of every figure but cannot open the PDFs from here, so Paul or a reader with the documents should verify: Sphere 2018 — 30 m toilet-to-water-source, pit bottom 1.5 m above the water table, 50 m toilet-to-dwelling, 20 people per toilet; CDC 2011 norovirus guideline — 1,000–5,000 ppm chlorine for faeces/vomit spills; WHO 2006 Excreta Vol 4 — thermophilic composting above 55 °C for a week, otherwise a year or more of storage; CDC 2021 — ≥60% alcohol hand rub, weak against norovirus. The 02-water figures (2–6 L hygiene, 3–6 L cooking, WHO 2013) want the same walk.
- The A5 page read on paper: whether the Do This Now card and the four-column Sphere table hold up at real size, and whether the repeated long source tag in that table is acceptable in print or wants a numbered endnote scheme across the book.
