# PROJECT — THIRTY DAYS DARK
**Owner:** COA   **Signed by Paul:** 2026-09-26 (G1)
**Rigour:** HIGH   **Phase:** RP

## 0 · DELTAS
- The deliverable is a book manuscript (Markdown chapters), not code. It ships as a print-ready PDF to a printing company. No hosting.
- Probe: `_dev/lint.js` reports words per chapter, checks every safety-critical number carries a `[src:]` tag, and flags zero TODOs.
- Shot: a chapter rendered to PDF (pandoc), with page PNGs in `_dev/shots/`.
- Rigour is HIGH because the book contains safety-critical numbers (water dosing, rehydration, first aid) that people will act on.

## 1 · WHAT THIS IS
A broad, practical field manual for the first 30 days after the grid and internet go down. It is about thriving in a bad situation, not just surviving it: running a household, lifting a village, keeping morale up, and improvising clever fixes. It will exist as a printed book on Paul's shelf that works with no power and no net, and as an open-source manuscript anyone can read, print, and improve.

### 1.1 · DONE MEANS
1. Every chapter in §3.2 is drafted, sourced, lint-clean, and read by Paul.
2. A print-ready PDF (A5, text plus image placeholders) meets the chosen printer's spec.
3. A printed proof copy is in Paul's hands.

### 1.2 · OUT OF SCOPE
- Final illustration and photography. The book carries placeholders and one-line art briefs only.
- Weapons, violence, and tactical content.
- Medicine beyond first aid and home care.
- App or ebook editions.
- The offline digital kit (Kiwix, maps, local AI), which is a separate job.

## 2 · WHO IT IS FOR
Rural households and villages anywhere. Paul's household is the first reader. It is for any capable adult who wants a calm, clever plan instead of doom-prepping.
**Call to action:** Prepare
**Money:** none — open source, public repo (licence is a G4 decision; selling print copies later is G4)

## 3 · SHAPE
The book follows a time arc: the first hour, days 1–3, week 1, and weeks 2–4. Skill chapters hang off that arc.

Every chapter uses the same four parts:
- a **Do This Now** card that fits on one page;
- **The Craft**, the how-to itself;
- **Thrive Hacks**, creative ideas that make life easier or better;
- a **Checklist**.

Engagement is built in through Village Hack boxes, Day-X challenges, "what I wish I'd stocked" sidebars, and quick-glance tables. The voice is a calm manual: plain, steady, and reassuring, with no jokes carrying the weight. The fun comes from the ideas, not the tone.

### 3.1 · PILLARS
| Pillar | Needed | Marathon | Status |
|---|---|---|---|
| manuscript | yes | — | NO MARATHON |
| layout / print PDF | yes | — | NO MARATHON |
| illustration | later | — | out of scope v1 |
| marketing | no | — | n/a |

### 3.2 · COMPONENTS
**Front matter**
- How to use this book.
- The First Hour card.

**Chapters**
1. Day Zero: the first hour, the first day, and what to grab and shut off.
2. Water: finding, storing, and purifying it; rain catchment.
3. Power: solar, batteries, using the car as a generator, and what's worth powering.
4. Food: the pantry, cooking without gas, preserving, fast crops, and local foraging.
5. Heat and shelter: staying cool, bugs, storms, and the house as a system.
6. Health: first aid, wounds, fever, rehydration salts, and meds to stock.
7. Sanitation: toilets, washing, waste, and preventing disease.
8. Comms and information: radio, Meshtastic, noticeboards, and the offline AI and Kiwix kit.
9. Community and safety: neighbour networks, rosters, calming conflict, and shared resources.
10. Money and trade: cash, barter, and skills as currency.
11. Morale: routine, kids, games, music, and sleep.
12. Fix and make: the tool kit, repairs, and improvising.
13. The road back: signs things are stabilising, and restarting.

**Back matter**
- Pre-collapse prep list.
- Master checklists.
- Contact sheet to fill in.
- Glossary.
- Sources.
- Image-brief list.
- Index.

### 3.3 · LOOK AND FEEL
**Donor:** The SAS Survival Handbook for density, crossed with The Dangerous Book for Boys for charm.
- It is field-guide clean, with plenty of whitespace, bold cards, and hand-drawn-style diagram placeholders.
- It is not doom-prepper, not military, and not a textbook.

### 3.4 · CONTROLS AND CONSTANTS
- Target length is 45–60k words, roughly 4k per chapter.
- Format is A5.
- Every Do This Now card fits on one page.
- Every safety-critical number is sourced from WHO, CDC, Red Cross, or equivalent.

### 3.5 · CONSTRAINTS
- The book is in English.
- The printer is to be decided, and its spec will set the final PDF.
- The setting is generally rural (village scale, land, neighbours). The book is not region-specific; climate variants (hot, wet, cold) are given as side-notes.

## 5 · OPEN QUESTIONS — needs Paul
| # | Question | Options (never blank) | Blocking |
|---|---|---|---|

## 6 · FINDINGS OUTSTANDING
| Date | Finding | Queued into / rejected because |
|---|---|---|

## 7 · AUTHORISED WITHOUT PAUL
| Date | What was authorised | Marathon | Objective # | Seen |
|---|---|---|---|---|
| 2026-09-26 | Repo scaffold: live files, folders, README, CONTRIBUTING | — | — | |

## 8 · WORKING SET
**Code:** github.com/Funder-Games/thirty-days-dark (public)   **Entry point:** `manuscript/`   **Launch:** `node _dev/build.js`
**Live:** not deployed   **Docs:** project root
**Harness:** `_dev/`

## 9 · STATUS
SHIPPED:  repo scaffold (2026-09-26)
NEXT:     triage opens MARATHON-001 (manuscript)
PAUL:     choose licence — see PAUL-TASKS
PILLARS:  1·0  2·0  3·0
BUDGET:   none open
