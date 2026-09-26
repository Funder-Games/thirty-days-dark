# SPRINT-001 — Build pipeline + Chapter 2 Water

**MISSION:** A broad, practical field manual for the first 30 days after the grid and internet go down.
**Status:** GREEN-LIT
**Marathon:** MARATHON-001   **Rigour:** HIGH
**Moves:** 1.1 #1 (chapters drafted, sourced, lint-clean); 1.1 #2 (A5 PDF)
**Max steps:** 80   **File set:** _dev/, manuscript/02-water.md, package.json, package-lock.json
**Cut:** 2026-09-26   **Green-lit:** 2026-09-26 by COA

## GOAL
`npm run lint` and `npm run build` work end to end, and Chapter 2 (Water) is drafted to _dev/STYLE.md, lint-clean, and renders to A5 PDF with page PNGs.

## DONE WHEN
- [ ] _dev/lint.js: per-file words, section order check (Do This Now/The Craft/Thrive Hacks/Checklist), flags safety-number lines lacking [src:], TODO count; exit 1 on fail
- [ ] _dev/build.js: manuscript/*.md → HTML (marked) → A5 PDF via playwright-core Chromium (executablePath /opt/pw-browsers/chromium*/chrome-linux/chrome) → page PNGs in _dev/shots/; per-chapter and whole-book; Do This Now starts a new page
- [ ] print CSS: field-guide clean, generous whitespace, bold boxes for Village Hack etc, placeholder frames for [IMAGE:], tables legible at A5
- [ ] 02-water.md: 3,000–5,500 words, all four parts, boxes used, lint 0 errors
- [ ] Do This Now renders on exactly one page (probe: page count of that section)

## DONOR
The SAS Survival Handbook for density, crossed with The Dangerous Book for Boys for charm.

## OUT OF SCOPE
Other chapters. Final art. Printer spec.

## EVIDENCE

## FINDINGS

## NEEDS WALK
