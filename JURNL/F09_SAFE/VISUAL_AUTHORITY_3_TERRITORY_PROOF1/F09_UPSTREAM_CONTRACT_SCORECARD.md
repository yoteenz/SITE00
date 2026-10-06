# F09 SAFE TO SPEND — Upstream Contract Scorecard

This is the primary deliverable of the sprint. It records honestly whether the upstream system carried enough intelligence to produce three strong territories without legacy UI. It does not hide weakness behind attractive renders.

## Scorecard

| Contract | Score | Evidence |
|---|---|---|
| BRAND DNA | **PARTIAL** | **Encoded** (`jurnlProject.ts`, expression matrices): palette with roles, type pair, hard rules (uppercase, no circular controls, small logo, live UI), tagline, voice short form, world traits, forbidden departures. <br>**Not encoded anywhere** (both repos searched): the positioning lines *MONEY IN SERVICE OF LIFE* and *FINANCIAL LIFE, BEAUTIFULLY ORGANIZED*, the audience, the voice avoid list, and a mood statement. <br>The gate's `checkBrandContext` returns **BRAND_CONTEXT_REQUIRED (audience)**. |
| EXPERIENCE CONTRACT | **MISSING** | JURNL has **no** Workspace Experience Brain contract. `JURNL.SAFE_TO_SPEND` exists only as a non-material portability sample: "must not be used as build instructions". <br>The gate returns **EXPERIENCE_REQUIRED**. <br>Missing: actor perspectives, ranked information hierarchy, per-state visual relationships, interaction grammar, and an experience-level E2E path. |
| FAMILY CONTRACT | **PARTIAL** | **Strong:** the F09 brief and expression tree give the job, question, primary signal, emotional role, density, child jobs, and relationships to Plan, Purchases and Today. <br>**Weak:** its composition fields are plate-era ("left signal, right opening"; left-rail occupancy on all three viewports) and are superseded by CENTER_STAGE. <br>Parent catalog labels drift from the code: SEE THE HOLD vs SEE THE FULL BREAKDOWN. <br>Family registry status is still PLACEHOLDER. |
| STATE CONTRACT | **PARTIAL** | **Exact in code:** the five completeness values, their triggers and their state lines. <br>**Conflicts:** <br>• The brief's UNSTATED intent ("the signal cannot be said yet · one return") contradicts the runtime, which shows a number in every state. <br>• F03 hides the number in its own PARTIAL mode; F09 does not. <br>**Gaps:** <br>• No recovery action per state. <br>• LOADING and ERROR are planned but undefined. <br>• No per-state visual relationship. |
| INTERACTION CONTRACT | **PARTIAL** | **Exact:** triggers, routes, the hold sheet and its confirmation, Ask consent, Quick Add types. <br>**Intent:** "the answer is the parent, why stays closed" is the only parent-level interaction intent. <br>**Gaps:** <br>• No grammar for inspecting one held-back item. <br>• FF.SEE_WHY_VS_F09 is unresolved. <br>• Back is fixed to TODAY whatever the entry point. <br>• No live region for number changes. |
| DATA CONTRACT | **SUFFICIENT** | One formula owner, every field and source defined, and copy rules (only real values, zero bands hidden). Every value in the three candidates maps to a real field. <br>**Functional defects flagged, not blocking concepting:** <br>• The label BILLS BEFORE NEXT INCOME ≠ the formula (no date window). <br>• LOAN counts as cash. <br>• CARD ADDED expenses reduce cash. <br>• The purchase reserve is unreachable from UI. <br>• WHY omits the trip and purchase reserves. |
| RESPONSIVE CONTRACT | **PARTIAL** | **Exact for mobile:** CENTER_STAGE, safe zone, field = nav footprint, pagination, back. Tablet and desktop stage widths are defined. <br>**Gaps:** nothing F09-specific; the occupancy map's tablet and desktop entries copy the superseded mobile left rail. |
| EXPRESSION GUIDANCE | **PARTIAL** | **Strong on feeling and restraint:** "one open answer", "a single mark", "why stays closed", "still", "more air", and the named risks ("looking empty", "copying today's journal"). <br>**Weak on composition:** its spatial content describes an environment *photograph* (an open loggia, arch and sea on the right, one bench), not a page. <br>One matrix row contradicts F09's own job: `SAFE_TO_SPEND_FIGURE` is owned by F03, "do not repeat on F05+". <br>**Every primary object had to be invented.** |

## Verdict

**DID THE UPSTREAM SYSTEM PRODUCE ENOUGH INTELLIGENCE TO CREATE THREE STRONG TERRITORIES WITHOUT RELYING ON LEGACY UI? — PARTIAL.**

**What upstream did well.** It fixed *what the page must say, feel and refuse*:
- the decision
- the five-second content
- what stays closed
- the emotional target
- the world
- the forbidden directions, including the vault
- the F03 boundary

It was also enough to firewall the legacy UI completely. Zero legacy visual facts were needed. The functional forensic gave every value, state and action.

**What upstream did not do.** It did not supply *composition intelligence*. None of the three primary objects is encoded anywhere:
- **T01, plan-view room:** architectural drafting as an information language is invented from "luxury architectural lifestyle" + the loggia's openness.
- **T02, inscribed sentence:** the generated-sentence grammar, inline word disclosure and the inscription are invented from the voice + "one word or figure".
- **T03, open / sealed envelopes:** the envelope system is invented from "one open answer / why stays closed / what is held back" + paper and textile.

They are *derived* (each traces to canonical abstractions), but the leap from abstraction to object was made by the territory author, not by the contracts.

The three territories are strong because the brief's **abstractions** are strong and the **data contract** is exact. They are not strong because any contract told the author what the page is.

## Per-territory sufficiency

S = SUFFICIENT · P = PARTIAL · M = MISSING

| Dimension | T01 OPEN FLOOR | T02 PLAIN ANSWER | T03 OPEN ENVELOPE |
|---|---|---|---|
| FUNCTION | S | S | S |
| HIERARCHY | P | P | P |
| USER INTENT | S | S | S |
| COMPOSITION | **M** | P | **M** |
| EMOTIONAL TARGET | S | S | S |
| BRAND EXPRESSION | P | P | P |
| DATA PRIORITY | P | P | P |
| INTERACTION | P | P | P |
| RESPONSIVE BEHAVIOR | P | P | P |

T02 scores composition PARTIAL rather than MISSING because the brief's typographic line ("One word or figure. Wide tracking. Short.") nearly prescribes a type-led page. It still did not prescribe a sentence.

## What upstream needs so the next family does not depend on the territory author's invention

1. **A canonical JURNL Experience Brain contract per material family, starting with F09.** It needs: actor perspective, a *ranked* information hierarchy (what is seen in five seconds vs on inspection), per-state visual relationships (including UNSTATED / BELOW_ZERO), interaction grammar for inspecting a factor, and experience-level E2E.
2. **A composition-centric rewrite of each family expression brief.** Replace plate fields (camera, arch, sea, left rail) with page fields:
   - primary object
   - spatial logic
   - data metaphor
   - what the blur test must still show
   Mark the superseded left-rail fields explicitly.
3. **Brand DNA completion:**
   - positioning (the two sprint lines, if canonical)
   - audience
   - the voice avoid list
   - a mood statement
   - a logo-vs-wordmark chrome rule
4. **State conflicts settled at contract level:** UNSTATED number display (F03 vs F09), and recovery actions per completeness value.
5. **Matrix cleanup.** `SAFE_TO_SPEND_FIGURE` belongs to F09 (owner) and is *previewed* by F03, not the reverse.
6. **Copy / formula truth.** BILLS BEFORE NEXT INCOME must match what the formula counts. WHY must list every factor.
