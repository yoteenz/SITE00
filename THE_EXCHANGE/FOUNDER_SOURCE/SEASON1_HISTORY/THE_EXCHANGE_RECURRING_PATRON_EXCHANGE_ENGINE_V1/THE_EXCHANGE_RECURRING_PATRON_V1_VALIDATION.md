# THE EXCHANGE — Validation and Completion
## Recurring Patron-Exchange Engine V1

> **NONCANONICAL. PROPOSED — NOT APPROVED.** A development proposal for THE EXCHANGE. It changes no canon, no approval record, no Series Bible, no repository, no database record and no production system.

## Appendix A — Validation Report and Day-by-Day Chronology

> **PROPOSED — NOT APPROVED.** All gates are computed by script from the release data and the documents.

### A.1 Build gates on the release map (B1–B19)

| # | Gate | Result | Evidence |
|---|---|---|---|
| B1 | Unique, sequential release IDs | **PASS** | 86 releases, S1-01 to S1-86, no duplicates |
| B2 | All 74 baseline releases accounted for | **PASS** | Every LL-01 to LL-74 has a change code (A–G) and a destination ID |
| B3 | Release count explained | **PASS** | 74 baseline − 1 replaced (LL-28) + 13 new-written (12 additions + 1 replacement) = 86; net +12 |
| B4 | Scenario IDs map to valid releases | **PASS** | All 10 scenarios appear; invalid: none |
| B5 | Scenario key releases tagged | **PASS** | Mismatches: none |
| B6 | Every exchange has a request, an offering and an outcome | **PASS** | 10 of 10 |
| B7 | Every new release carries a request (layer R) | **PASS** | 13 of 13 |
| B8 | Chronology non-decreasing in release order | **PASS** | Backward steps: none |
| B9 | Weekdays in settings match the fictional day | **PASS** | All weekday mentions consistent; note: LL-20's "Sunday light" describes light, not the day (GE−66 is a Wednesday) |
| B10 | Setting day tokens match the day column | **PASS** | Mismatches: none |
| B11 | Ages match founder ages and proposed ages | **PASS** | Conflicts: none |
| B12 | Flashback ages consistent | **PASS** | [('S1-58', 'Celestine', 33), ('S1-58', 'Vivienne', 34)]; years back: [31] (Vivienne would be 65: died at 55, ten years ago) |
| B13 | No WORD OF MOUTH or Lantern names or devices | **PASS** | Found: none |
| B14 | No empty fields or placeholders | **PASS** | Empty: none; placeholders: none |
| B15 | Arcs valid and contiguous | **PASS** | Seven arcs in order |
| B16 | Leak chain consistent | **PASS** | Disclosure GE−70 → barbershop GE−44 → refusal GE−38 → confession GE−31 → Bunny GE−30 → 'It can now' GE−23 |
| B17 | Unchanged (A) releases are byte-identical to the baseline | **PASS** | Differences: none |
| B18 | Key baseline lines preserved in changed releases | **PASS** | Missing: none (15 checked) |
| B19 | Step-back revision present where proposed | **PASS** | LL-09 and LL-63 keep Sloane taking requests |

### A.2 Package gates on the documents (P1–P11)

| # | Gate | Result | Evidence |
|---|---|---|---|
| P1 | Every selected scenario has all 20 fields, in order, non-empty | **PASS** | 10 scenarios; incomplete: none |
| P2 | All 20 stress questions answered with a verdict and release evidence | **PASS** | answered 20; table 20; without release refs: none; table/text mismatches: none; totals 15/5/0 match |
| P3 | Every section carries the PROPOSED — NOT APPROVED label | **PASS** | missing: none |
| P4 | No placeholders or empty sections | **PASS** | found in: none |
| P5 | CSV and markdown map agree (86 rows, 18 columns, same IDs) | **PASS** | CSV 86 rows × 18 columns; map entries 86 |
| P6 | Every S1, PX and C reference in the prose is a valid ID | **PASS** | 61 distinct S1 refs, 10 PX, 20 C; invalid: none |
| P7 | Roster placements cite the releases the map tags for each scenario | **PASS** | untagged citations: none |
| P8 | No WORD OF MOUTH or Lantern names or devices in the prose | **PASS** | found: none (the header's sentence naming the avoided names is excluded) |
| P9 | Ages stated in the prose match the founder's and the map's ages | **PASS** | conflicts: none |
| P10 | Headline numbers in the prose match the computed map | **PASS** | map: 86 releases, 125:50; prose claims present: {'86 releases': True, '125:50': True} |
| P11 | Repository untouched (no files written to the repo) | **PASS** | git status lines: 0 |

### A.3 The sprint's §16 checklist

| §16 check | Gates | Result |
|---|---|---|
| Every exchange has a request and an offering | B6 | **PASS** |
| Every selected exchange has an outcome | B6, P1 | **PASS** |
| Every release is accounted for | B2, B3 | **PASS** |
| Release IDs are unique | B1, P5 | **PASS** |
| Scenarios map to valid release IDs | B4, B5, P6, P7 | **PASS** |
| Chronology is internally consistent | B8, B9, B10, B12, B16 | **PASS** |
| Character ages match founder selections | B11, P9 | **PASS** |
| Founder-approved material remains intact | B17, B18 | **PASS** |
| Proposed elements remain explicitly provisional | P3 | **PASS** |
| No contradictory names or leak chains | B13, B16, P8 | **PASS** |
| No empty sections or placeholder entries | B14, P4 | **PASS** |
| All 20 stress-test questions are answered | P2 | **PASS** |
| Production risks are candidly reported | Editorial (not automatable) | **MET**: §10 weaknesses, §11 risks, §13 serious weaknesses, five PARTIAL verdicts in §14 |

### A.4 Day-by-day chronology (for wardrobe and appearance continuity)

| Fictional day | Releases | Characters on screen (wardrobe continuity) |
|---|---|---|
| GE−92 (Fri) | S1-01 Dusk; S1-02 Getting Ready; S1-03 The Door; S1-04 The Host; S1-05 Unusual Request | City residents; a woman on a balcony; her neighbour (no principals) / Sloane, Gideon / Gideon, Kai Fontaine, Royce Bell, guests / Sloane, guests, the house band / Sloane, Gideon |
| GE−91 (Sat) | S1-06 Morning After | Sloane, Wendell Ames (on the phone), Tina Grandison (a message) |
| GE−90 (Sun) | S1-07 Sunday at Richard's | Richard, Nadine, Andre, Imara (15), Jalen (11), Sloane |
| GE−89 (Mon) | S1-08 The Ledger | Sloane, Ada Whitfield |
| GE−88 (Tue) | S1-09 Through the Door | Royce Bell, Sloane, Gideon, Clarence Moody, the Crescent Room Orchestra |
| GE−84 (Sat) | S1-10 First Person | Sloane, Gideon |
| GE−83 (Sun) / GE−81 (Tue) | S1-11 Unopened | Sloane, Celestine (seen through glass), a courier |
| GE−80 (Wed) | S1-12 Paused | Sloane; Mr. Daniels, a jazz club owner and longtime sponsor (on the phone); Mavis Odom (79), a fruit seller |
| GE−77 (Sat) | S1-13 Standing | Sloane, Ada, Kai |
| GE−76 (Sun) | S1-14 Sunday Breakfast | Richard, Sloane |
| GE−75 (Mon) | S1-15 Hand-Rolled | Sloane, Tina Grandison, a vintage dealer |
| GE−74 (Tue) | S1-16 Ezekiel's Menu | Clementine Hollis (80), Sloane, Clementine's great-niece Dara (the nominator) |
| GE−73 (Wed) | S1-17 Makers' Terms | Exchange couriers; Rashid Bello; Femi Adeyemi; Clarence Moody (all in passing) |
| GE−72 (Thu) | S1-18 Undefeated | Lorna Shaw (70), Gideon, Sloane, Nadine, night-shift nurses |
| GE−71 (Fri) | S1-19 The Coat | Sloane, Cyrus Wainwright, Gideon |
| GE−70 (Sat) | S1-20 The Crescent Room; S1-21 Date Night | Richard, Bunny Okafor, Clarence Moody and the Crescent Room Orchestra, dancers, Noelle Baptiste (16, glimpsed), Mavis Odom, Ada Whitfield / Gideon; his partner (unseen face, provisional) |
| GE−68 (Mon) | S1-22 Kai's Workshop | Kai; four neighbourhood kids |
| GE−67 (Tue) | S1-23 Three Doors Left; S1-24 Spades | Kai, Honora Vance (behind a door) / Lorna Shaw, her deacon partner, Nadine, Ada, Sloane, Gideon, church members |
| GE−66 (Wed) | S1-25 The 1981 Sketch | Inez Carter (70), Talia Carter (19), Rashid Bello (31) |
| GE−65 (Thu) | S1-26 The Lost State | Celestine Rhodes, students, Sloane |
| GE−64 (Fri) | S1-27 Unsealing | Sloane, Ada |
| GE−63 (Sat) | S1-28 The Salon; S1-29 Who Told You | Royce Bell, Sloane, Salon members, Marcus Okafor, Clarence Moody and the Crescent Room Orchestra, Kai (at the bar) / Sloane, Gideon |
| GE−62 (Sun) | S1-30 From Outside; S1-31 First, Last | Nadine, Dr. Akers (a chief of surgery), hospital staff / Nadine, Sloane |
| GE−60 (Tue) | S1-32 Again | Sloane, Kai |
| GE−59 (Wed) | S1-33 Both Stations | Tad Monroe, Yaz Adebayo, night listeners, Sloane, Gideon |
| GE−59 (Wed) to GE−57 (Fri) | S1-34 The Number 9 | Ophelia Grant (61), the sewing circle, Inez Carter (in passing), Tina |
| GE−57 (Fri) | S1-35 Noelle's Song | Noelle Baptiste (16), Clarence Moody (74) |
| GE−55 (Sun) | S1-36 Objection | Honora Vance, Ada, Sloane |
| GE−54 (Mon) | S1-37 Lane Four | Dee Whitlock (58), Honora Vance (by referral card), Sloane, Gideon, Zuri Bankole (19) |
| GE−53 (Tue) | S1-38 Makers Waver | Sloane, Femi, Rashid, Clarence, Inez, Clementine |
| GE−52 (Wed) | S1-39 Lead Like You're Not Guarding the Door | Richard, Gideon |
| GE−50 (Fri) | S1-40 Dawn | Dee Whitlock, Zuri Bankole, Sloane, Honora Vance, Gideon, early joggers |
| GE−47 (Mon) | S1-41 First Design | Sloane, Emmett Hale |
| GE−46 (Tue) | S1-42 Fire Escape | Emmett, Bea (15) |
| GE−45 (Wed) | S1-43 The Duel; S1-44 Two Names | Sloane, Royce / Sloane |
| GE−44 (Thu) | S1-45 The Chair Next to Gideon | Royce, Gideon, the barber, Marcus Okafor (through the window) |
| GE−42 (Sat) | S1-46 The Ward | Kai, Celestine, a child and her mother, Nadine (passing) |
| GE−38 (Wed) | S1-47 Sunset | Marcus Okafor, Renée Coker, Abena Mensah (a recorded Interval message), Sloane, Gideon, a string trio |
| GE−37 (Thu) | S1-48 Notice | Celestine, Sloane |
| GE−36 (Fri) | S1-49 Ask Me; S1-50 The Hush | Gideon, Sloane / Sloane, Gideon, Tad Monroe (52), Yaz Adebayo (38), Unannounced Exchange guests, a DJ |
| GE−35 (Sat) | S1-51 Market Day | Sloane, Mavis Odom (80 today), vendors, a drumline, neighbours |
| GE−34 (Sun) | S1-52 What Do You Want | Sloane, Ada |
| GE−33 (Mon) | S1-53 Kitchen, After Ten | Nadine, Andre |
| GE−30 (Thu) | S1-54 Bunny; S1-55 My Baby's Coming Home | Bunny Okafor, Richard / Richard, Sloane |
| GE−29 (Fri) | S1-56 Properly; S1-57 C. R.; S1-58 The Garage | Sloane, Kai / Sloane, Richard / Richard (telling); Vivienne (34) and Celestine (33) in memory |
| GE−27 (Sun) | S1-59 Ferry Street | Riggers, neighbourhood kids, residents |
| GE−26 (Mon) | S1-60 Denied | Ada, Kai, Sloane |
| GE−24 (Wed) | S1-61 Threshold | Celestine, Sloane, Nadine |
| GE−23 (Thu) | S1-62 A Night Off | Delphine Rowe (31), Tina Grandison, Sloane, Gideon, Bunny Okafor (on the phone) |
| GE−21 (Sat) | S1-63 The Judge on the Ward | Nadine, Honora, a mother and child |
| GE−20 (Sun) | S1-64 Potato Salad | Delphine Rowe (as "Della"), Grace Okafor, Bunny Okafor, Marcus Okafor, the Okafor family, Sloane (at the gate) |
| GE−17 (Wed) | S1-65 Second Design | Emmett, Sloane, Celestine |
| GE−14 (Sat) | S1-66 Knee; S1-67 Without Her | Richard, Sloane, Nadine, nurses / Celestine, Kai, the makers, Ada, Gideon |
| GE0 (Sat) | S1-68 Breakfast; S1-69 Keys; S1-70 Pinning; S1-71 Shorter; S1-72 Arrivals; S1-73 Ezekiel's Supper; S1-74 Noelle's Song; S1-75 On the Record; S1-76 Almost; S1-77 The Yes; S1-78 The Rest Is Mine; S1-79 Afterparty; S1-80 Pie | Sloane, Gideon / Couriers, invited guests, strangers, Ophelia Grant, Mavis Odom, Dee Whitlock, Zuri Bankole / Inez, Talia, Rashid / Richard, Gideon / Sloane, Gideon, Gideon's mother Lorna Shaw, Royce, Honora, Kai, Celestine, Emmett, Nadine and family, guests, Tina Grandison, Mavis Odom, Delphine Rowe (unrecognized) / Clementine, Femi, Dara, Sloane, guests / Noelle, Clarence, the Crescent Room Orchestra, dancers (including Gideon and his mother, and Talia in the gown), Dee Whitlock, Zuri Bankole, Tad Monroe, Yaz Adebayo / Sloane, the room, Nadine, Royce / Celestine, Kai / All principals, guests, the city across the river / Sloane, Celestine / Honora and Kai; Emmett and Gideon; Sloane and Emmett / Sloane, Nadine, Richard, Andre, Imara, Jalen, Gideon and his mother |
| GE+1 (Sun) | S1-81 Gold on the River | City residents, Tad Monroe and Yaz Adebayo (voices), Renée Coker, Marcus Okafor |
| GE+3 (Tue) | S1-82 Public, If They Say So | Clementine, Femi, Inez, Rashid, Noelle, Clarence, Celestine |
| GE+5 (Thu) | S1-83 The Makers' Table; S1-84 A Plant | The four makers, Ada, Sloane, Gideon / Emmett, Sloane |
| GE+8 (Sun) | S1-85 Offer | Gideon, Sloane, Nadine |
| GE+9 (Mon) | S1-86 The Seal | Celestine; Vivienne's handwriting |

## Appendix B — Completion Report

> **PROPOSED — NOT APPROVED.** Status of this package against the sprint.

**Status: COMPLETE.** Every build gate (19) and package gate (11) passes. Complete here means the deliverables exist and validate; it does not mean the season is proven on screen. The five PARTIAL stress-test verdicts (§14) are open creative risks, not missing deliverables.

| Sprint deliverable | Where | Delivered |
|---|---|---|
| 01 Recovered source findings | §01 | Yes |
| 02 The recurring exchange engine | §02 | Yes, with six step-back interpretations (none canonized) |
| 03 Candidate scenarios (at least 15) | §03 | 20 candidates, scored |
| 04 Selected roster | §04 | 10 scenarios × 20 fields |
| 05 Invention and experience roster | §05 | 2 new, 4 refined, 1 shown by its limit, 2 held |
| 06 Recurring patron and guest map | §06 | 6 recurring patrons, 5 recurring guests, 5 one-time guests |
| 07 Sloane character and fashion | §07 | Yes; the reference accounts were not viewable |
| 08 Release-map changelog | §08 | All 74 baseline releases coded; no silent deletions |
| 09 Complete revised map with fictional day | §09, CSV, Appendix A.4 | 86 releases, 125:50 |
| 10 Four-layer coverage | §10 | Yes, with gaps stated |
| 11 Production feasibility | §11 | All ten required topics |
| 12 Founder decision board | §12 | Five groups, with dependencies and tradeoffs |
| 13 Final editorial recommendation | §13 | Yes |
| §14 Stress test | §14 | 20 of 20 answered: 15 PASS, 5 PARTIAL, 0 FAIL |
| §16 Executive summary, Markdown, CSV, ZIP | Package files | Yes |

**Unresolved, by design:** the founder's choices S-1 to S-7 (§12); visual, wardrobe and identity tests (§11); name clearance; review of the five style references; the unavailable Lantern draft and founder V2 document.

**Safety (§17), confirmed:** the official Series Bible, the approval matrix and canon were not modified. Nothing was committed to GitHub and no pull request was opened for this package. No Supabase records and no SITE 00 production systems were changed. No character visuals or wardrobe images were generated. SHAW was not launched. No brand partnerships were created. Nothing assumes the founder has approved the hybrid. Season 2 was not developed.
