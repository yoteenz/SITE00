# 11 — Validation and Structural Stress Test

> **NONCANONICAL. PROPOSED — NOT APPROVED.** This file records structural validation and an editorial stress test. Stress verdicts are editorial judgments, held to the same PASS standard as BASELINE V1's stress test. PASS was not redefined to clear PARTIAL findings.

## 1. Structural validation (computed)

The gates below were run by script against both option maps, BASELINE V1 and the assembled package. Each result is computed, not asserted.

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | BASELINE V1 package preserved byte-for-byte | **PASS** | 9 files checked against the V1 manifest; changed: none |
| 2 | Option A: 86 unique IDs, V1 order kept | **PASS** | S1-01 to S1-86, same order as V1, no renumbering |
| 3 | Option B: unique sequential IDs, 80–82 releases | **PASS** | LN-01 to LN-81 |
| 4 | Every V1 release accounted for exactly once in Option B | **PASS** | 86 V1 releases → 81 Lean releases (5 merged entries absorb 10) |
| 5 | Every hybrid baseline release traced through all stages | **PASS** | LL-01 to LL-74 → V1 ID → Option A ID → Lean ID |
| 6 | Option A revisions exactly as declared | **PASS** | 13 revised; declared 13 |
| 7 | Unchanged Option A releases byte-identical to V1 | **PASS** | Differences: none |
| 8 | Unmerged Option B releases identical to Option A (IDs converted) | **PASS** | Differences: none |
| 9 | Merged releases keep every source's key lines and endings | **PASS** | Missing: none |
| 10 | Runtimes and counts reconcile | **PASS** | V1 125:50 → A 127:40 → B 126:35; arithmetic checked |
| 11 | Option A: timeline consistent | **PASS** | Backward steps: none; weekday/token issues: none |
| 12 | Option B: timeline consistent | **PASS** | Backward steps: none; weekday/token issues: none |
| 13 | Option A: ages intact, flashback 31 years, no foreign-project names | **PASS** | Age conflicts: none; flashback: [('Celestine', '33'), ('Vivienne', '34')]; avoid-list hits: none |
| 14 | Option B: ages intact, flashback 31 years, no foreign-project names | **PASS** | Age conflicts: none; flashback: [('Celestine', '33'), ('Vivienne', '34')]; avoid-list hits: none |
| 15 | No empty fields or placeholders in either map | **PASS** | Issues: none |
| 16 | Arcs valid and contiguous in both maps | **PASS** | Seven arcs in order |
| 17 | Four layers quantified per arc for V1, A and B | **PASS** | R/L/N/A counts per arc in 04, 05 and the comparison |
| 18 | Nights gap measured and repaired | **PASS** | Longest run without a Night: V1 44, A 19, B 18 |
| 19 | Both maps preserve the engine | **PASS** | All 10 scenarios keep their release count; every arc keeps at least 3 request releases |
| 20 | Failed proposal, refused request and shape-changing scenarios protected | **PASS** | PX-09 fails (S1-47), PX-10 declined (S1-19), PX-02 changes (S1-34), PX-06 changes (S1-24) unchanged and unmerged; PX-07 keeps its turn in S1-40; issues: none |
| 21 | S-1 dependent rows isolated and reversible | **PASS** | S1-10, S1-74, S1-80; revert these three to V1 text if the hybrid step-back is not chosen |
| 22 | All deliverables present | **PASS** | README, 01–12 Markdown and two CSVs present; 17 files in total with 13 and the manifest |
| 23 | Every Markdown file carries the PROPOSED — NOT APPROVED label | **PASS** | Missing: none |
| 24 | Nothing proposed is called approved canon | **PASS** | Lines naming approved canon refer only to existing face and age approvals or are negations; issues: none |
| 25 | No placeholders or unfilled markers | **PASS** | Issues: none |
| 26 | S-1: three alternatives, each with every required attribute, plus a hybrid | **PASS** | A1, A2, A3 × 12 attributes; Hybrid H assessed and recommended; missing: none |
| 27 | S-3: N1, N2, N3 (and N4) with all fourteen attributes; combinations compared | **PASS** | Missing: none; at least one option adds no release (N1, N2); one new venue (N1 Riverside Pavilion, N4 museum) |
| 28 | S-2: BASELINE V1, Option A and Option B compared side by side | **PASS** | Count, runtime, layers, patron coverage, Nights placement, character balance, load, pacing, sacrifices, finale effect, recommendation |
| 29 | All ten scenarios reviewed individually against fifteen criteria | **PASS** | 10 special notes, a 15-row score table, verdicts, cut analysis, C-11 to C-20 reviewed |
| 30 | Decision board: five groups and FD-01 to FD-20 dependencies | **PASS** | Missing FD rows: none; FD-01 dependency stated |
| 31 | Stress test: at least 25 questions, totals match, five prior PARTIALs revisited | **PASS** | 32 questions: 24 PASS, 8 PARTIAL, 0 FAIL; Q10, Q11, Q12, Q13, Q15 revisited |
| 32 | Nights gap measured and addressed in the prose | **PASS** | 44 → 19 (Option A), 18 (Option B) |
| 33 | Founder-selected ages stated correctly | **PASS** | Sloane 33, Gideon 44, Nadine 40, Richard 66, Vivienne died at 55 |
| 34 | No names or devices from other projects in the prose files | **PASS** | Found: none |
| 35 | Every file referenced in the package exists | **PASS** | 18 references; missing: none |
| 36 | Repository unchanged | **PASS** | `git status` clean at HEAD 159c0fa9b; no commit, branch, PR or file edit in the repository |

**36 of 36 gates pass.** Gates 1–21 check the maps and BASELINE V1; gates 22–36 check the documents and the repository.

## 2. Stress test: thirty-two questions

Verdicts are PASS, PARTIAL or FAIL. They apply to Option A unless a question names Option B. Questions are numbered T01 to T32 so they don't collide with V1's Q1 to Q20.

### Audience comprehension

**T01. Can a new viewer understand what The Exchange is by the end of Arc 1? PASS.** S1-09 teaches the mechanics in one breath: sponsor, request, offering, and who decides. S1-03 shows a door Royce can't pass, and S1-05 shows a request Sloane can't easily grant.

**T02. Is the central mystery comprehensible without overexplaining? PARTIAL.** The audience must hold several strands at once:
- Royce's inference (S1-43), which is right for the wrong reasons.
- The real disclosure chain: Richard to Bunny to Marcus (S1-54, S1-55).
- The unsealing clock (S1-27).
- The Ember's history (S1-58).

Each beat is clear where it lands. Together they are a lot, and N2 adds a layer: the disclosure now happens at Sloane's own party. *Mitigation:* keep Richard's whisper visibly playful at S1-20, so S1-55 recontextualizes a remembered image instead of introducing a new one.

### Protagonist agency

**T03. Does Sloane drive the season? PASS.** She designs the Living Legacy (S1-08), petitions for Kai, files and withdraws the unsealing (S1-27, S1-52), hosts both new Nights (S1-20, S1-40), recuses herself (S1-60, S1-61) and finally asks for help (S1-61).

**T04. Does Hybrid H leave her an active facilitator? PASS.** She still hosts, still takes impossible requests (S1-75, S1-80), and opens the door to a stranger (S1-83).

### Narrative variety

**T05. Do the ten requests differ in shape? PASS.** They succeed, fail (PX-09), are declined (PX-10), or change shape (PX-02, PX-06, PX-07). Option A protects all three non-standard outcomes (gate 20).

**T06. Are the two new Nights distinct from each other and from the Grand Exchange? PASS.** A 1986 hand-dance hall on a Saturday night, a 2 a.m. breakfast dance that ends in a dawn race, and a river hall of lanterns. They differ in era, hour, music, food and dress.

### Season momentum

**T07. Does every arc end on a hook? PASS.** See `07_WONDER_FASHION_CULTURE_AUDIT.md`, item F for each arc.

**T08. Does Option A's runtime increase hurt momentum? PARTIAL.** +1:50 overall, concentrated in Arc 3 (S1-40 grows from 1:30 to 2:15) and Arc 2 (S1-20). Arc 3 now carries a party and a race in one release. The short releases around it (S1-38 at 1:15, S1-39 at 0:55) help, but this needs checking in an edit.

### Institutional credibility

**T09. Are the Exchange's rules consistent? PASS.** Standing, sponsorship, Threshold and notice (FD-10, FD-11) are unchanged. The new Private Exchanges bend no rule; each exists for an accepted request.

**T10. Is it plausible that The Exchange borrows the Crescent Room and the Riverside Pavilion? PASS.** Clarence's relationship with Sloane is established in S1-09, and he sponsors Tad in S1-33. Borrowing a room for one night fits the invitation culture the founder supports.

### Patron access and consent

**T11. Do patrons arrive through varied, legitimate routes? PASS.** Referral (S1-19), sponsorship (S1-45, S1-62), a Recall token (S1-12), a pastor's referral (S1-18), and a proper door after a refused one (S1-09). The Breach route is deliberately unused in Season 1 (U-9).

**T12. Is consent handled without becoming a lecture? PASS.** The word appears in 10 of 86 releases, mostly in Arc 5, where the Ember's history is the story. Most inventions are about delight, privacy, memory or style (07, section 3).

### Cultural authenticity

**T13. Is Black cultural specificity rich without stereotype? PARTIAL.** It is rich: hand-dancing, a big band, the breakfast dance, spades, church hats and a homegoing, a cookout, a barbershop, a sewing circle, a dining-car chef's menu. The risk is density. Spades, church hats, a cookout, a barbershop and soul food could read as a checklist if executed generically. Each needs its specific detail on screen, such as Lorna's Boston, the homegoing hat, or Grace's terrible potato salad.

**T14. Do the new Nights have a lineage rather than a generic party? PASS.** *Nineteen Eighty-Six* has a period dress code, hand-dancing and a debt of honour. *The Breakfast Dance* draws on a real after-hours tradition and its food.

### Humor and warmth

**T15. Is the season funny? PASS.** Spades (S1-24), Tad and Yaz (S1-33, S1-50), *"I bought it"* (S1-64), the dessert on Royce's tab (S1-43), and Gideon's *"Four minutes"* (S1-50).

**T16. Is warmth protected against trauma? PASS.** The darkest material (Vivienne's act, Kai's exclusion, the failed proposal) is bracketed by joy: *The Hush* follows S1-49, and the 1986 night precedes the disclosure's fallout.

### Fashion specificity

**T17. Does every arc have a fashion moment? PARTIAL.** Arcs 1, 2, 3, 5 and 6 do. Arc 4's is weak (a barbershop line), and Arc 7 has none. Two one-line fixes are proposed (NR-8) but not built into either map.

**T18. Are the principals' styles specified? PARTIAL.** Sloane's is specified: the dance test, the orange suit, the 1986 jacket, a gown with sneakers in hand. Nadine's, Gideon's and Richard's are not designed, and the founder's reference accounts have not been reviewed (U-4).

### Relationship chemistry

**T19. Do Sloane and Nadine have an arc with a payoff? PASS.** They move from *"I get told last"* (S1-31) to *"Nadine. I need you."* (S1-61) to Nadine asking her to dance, properly (S1-74).

**T20. Does Gideon stay platonic, independent and 44? PASS.** See `08_CHARACTER_LIFE_AND_RELATIONSHIPS.md`, section 4.

**T21. Does the Emmett romance have presence without being forced? PASS.** Four releases (S1-41, S1-42, S1-65, S1-84). It is thin by design, and FD-09 leaves his identity open.

### Exchange Nights cadence

**T22. Does every arc before the finale contain an Exchange-hosted gathering? PARTIAL.** Arcs 1 to 4 do: the opening, *Nineteen Eighty-Six*, *The Breakfast Dance* and *The Hush*. Arc 5's only N release is the first full rehearsal (S1-67), a gathering of makers, not a party for guests. This was true in V1 too, and this package does not fix it (U-2).

**T23. Is the longest run without a Night acceptable? PASS.** 19 releases in Option A and 18 in Option B, down from 44. The next longest is 16 (S1-51 to S1-66).

### Mystery integrity

**T24. Does the breach chain stay fair play under N2? PASS.** Richard's whisper still happens in plain sight at S1-20. Bunny's laugh is the rewatchable clue, and S1-54 and S1-55 pay it off. The chain itself (FD-08) is unchanged.

**T25. Does any change leak a mystery early? PASS.** Option A removes one possible early signal: V1's *"Consider it an apology for the toast"* (S1-45). Nadine's 1986 realization concerns her birth, not the disclosure.

### Visual spectacle

**T26. Does every arc have a signature visual? PASS.** See 07, item A for each arc.

**T27. Is spectacle over-concentrated in the finale? PASS.** Arcs 2 and 3 now have large set pieces (S1-20, S1-40). Arc 4 has the rooftop, and Arc 5 has the garage memory.

### Production feasibility

**T28. Can the HIGH and VERY HIGH releases be produced convincingly with the current workflow? PARTIAL.** Option A has 15 (10 HIGH, 5 VERY HIGH). Crowds, partner dancing and multi-speaker lip-sync are untested. See `12_PRODUCTION_FEASIBILITY.md`.

**T29. Does Option B reduce the burden meaningfully? PARTIAL.** Weighted load drops from 151 to 145 (4 per cent). It means five fewer title cards, thumbnails and captions. No HIGH or VERY HIGH release is removed, and merged releases mean longer continuous scenes.

### Continuity

**T30. Are the timeline, weekdays, ages and wardrobe days consistent? PASS.** Gates 11 to 14 pass in both maps. S1-40 spans two fictional days, Thursday night into Friday, and every character stays in one outfit from the party to the track.

### Renewability

**T31. Does Season 1 end with an active, renewable series? PASS.** Sloane is still facilitating, and *"Show her in"* (S1-83) brings a stranger to the door. Gideon's offer, Nadine's sabbatical and the reserve Night (C-11) seed Season 2.

**T32. Does Hybrid H create Season 2 material rather than spend it? PASS.** A protagonist who can now be asked things is a new engine: people ask *her*, and she has to decide what she wants.

### Totals

**24 PASS, 8 PARTIAL, 0 FAIL** across 32 questions. The PARTIAL findings are T02, T08, T13, T17, T18, T22, T28 and T29.

## 3. The five PARTIAL outcomes from BASELINE V1

| V1 question | V1 verdict | Now | Why |
|---|---|---|---|
| Q10 Do Life Moments still feel spontaneous? | PARTIAL | **PARTIAL, under slightly more pressure** | V1's fix was to keep one unarranged Life release per arc in the market or the Crescent Room. N2 makes the Crescent Room's Saturday an arranged Exchange night. *Noelle's Song* (S1-35), an unarranged afternoon in the empty room, now matters more and must stay. In Option B, Arc 5 has only one unarranged Life release (LN-56 *Ferry Street*) |
| Q11 Do Exchange Nights remain joyous and legendary? | PARTIAL | **PASS** | V1's stated fix was decision S-3. N1 + N2 implements it: Arcs 2 and 3 each gain a joyous Exchange-hosted night, and the 44-release gap is gone. Arc 7 still has no Night; that is deliberate, since it is the morning after the season. T22 records Arc 5's rehearsal-only Night as its own PARTIAL |
| Q12 Does fashion feel natural to Sloane? | PARTIAL | **PARTIAL** | Better on paper (the 1986 jacket, a gown with sneakers), but still undesigned and untested, and the reference accounts are unreviewed |
| Q13 Are inventions intuitive and entertaining? | PARTIAL | **PARTIAL** | The Echo Track now has a party around it, but no invention has been visually tested and none has its Bible 06 dossier |
| Q15 Are recurring guests memorable? | PARTIAL | **PARTIAL, improved** | Mavis gains a whole night, Dee and Zuri a party, Grace a real choice. Ophelia and Wendell remain thin, and no patron has been cast or identity-tested |

## 4. New weaknesses introduced by the recommended changes

1. **Runtime.** Option A runs 1:50 longer than V1 (127:40). Option B runs 0:45 longer than V1 (126:35).
2. **S1-20 is overloaded.** In 2:00 it carries Mavis's Recall, a period night, Nadine's birth-night realization, Richard's disclosure and Noelle's plant.
3. **FD-08 context.** The breach now starts at a night Sloane threw (NR-5).
4. **Request-driven Nights.** Every mid-season Night exists for a request; none exists purely for joy (U-2).
5. **Hybrid H depends on FD-06** (U-1).
6. **PX-04's disguise comedy is smaller**, traded for credibility.
7. **Q10 pressure.** The Crescent Room's Saturday is now arranged.
8. **Production load.** S1-20 rises from MED to HIGH, and S1-40 adds a night-interior crowd to its dawn exterior.
9. **Wardrobe continuity.** S1-40 holds about thirty characters in one outfit across two fictional days.
10. **Option B only.** Three releases run 3:00 or longer (*From Mine* 3:00, *The Garage* 3:15, *The Yes* 3:30). Arc 5 has one unarranged Life release. Richard is featured in two fewer releases, though none of his scenes is lost.
