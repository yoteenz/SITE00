# Public Assessment → Lore → Personality Boundary

## PUBLIC ASSESSMENT (15 questions)

| Attribute | Truth |
|-----------|--------|
| Purpose | Pre-project discovery; branch-specific operational answers; recommendation display |
| When entered | `/idnty/state` → `/idnty/{slug}` |
| Who | Anonymous or signed-in (guest email optional on `/complete`) |
| Routes | `/idnty`, `/idnty/state`, `/idnty/{slug}/*` |
| Persistence | `localStorage` `site00_idnty_assessment_v1`; server `site00_idnty_submissions` draft via `useIntakeSync` |
| Outputs | `diagnoseIdentityNeed`, `compileProjectRecommendation` (desktop discovery-result); draft rows |
| Recommendation role | Commercial/discovery guidance — **not** production canon |
| Project dependency | **None required** to start or finish public assessment |

**Ends at:** `/idnty/{slug}/discovery-result` (happy path) or user leaves via CTA links.

## LORE (19 questions)

| Attribute | Truth |
|-----------|--------|
| Purpose | Brand world / creative intelligence canon |
| Route | `/projects/{projectSlug}/calibrate` |
| Persistence | Project API + project-scoped resume; optional mirror in `loreAnswers` on same localStorage key if ever written |
| Adaptive | `resolveActiveLoreSteps` / project calibrate flow |
| Output | Brand lore profile (server synthesis on submit when lore in draft — `intakeService.ts`) |
| Public `/idnty/.../world/*` | **PostPurchaseIntelligenceRedirect** — not live lore intake |

## PERSONALITY (15 questions)

| Attribute | Truth |
|-----------|--------|
| Purpose | Behavioral personality canon (validation / creative direction pipeline) |
| Route | `/projects/{projectSlug}/personality-replay/*` |
| Persistence | `PersonalityReplayIntakeContext` per project |
| Public `/idnty/.../personality/*` | **PostPurchaseIntelligenceRedirect** |

## Boundary answers

1. **Does public assessment create the project for Lore?** **NO** on happy path (no auto project bootstrap from review).
2. **Can Lore start before assessment submitted?** **YES** if user has project slug — independent routes.
3. **Can Personality start independently?** **YES** — project route.
4. **Assessment → Lore/Personality prefill?** **No automatic pipeline.** BLDR reads `loreAnswers` from localStorage if present. Assessment answers do not auto-populate lore steps.
5. **Semantic duplication:** Audience (assessment textarea) vs Lore `role`/`feeling`/`belief` — **different depth** (triage vs world-building). Personality overlaps **voice/behavior** with messaging pathways — deeper in personality layer.
6. **Must NOT move to public assessment:** 19 lore + 15 personality prompts (DiscoveryResultPanel states this explicitly).
7. **“Brand World” in code/UI:** Mobile review CTA `CONTINUE TO BRAND WORLD` navigates to **`discovery-result`**, not lore. Historical lore routes under `/idnty/{slug}/world/*` are gated. **Canonical public concept today:** misleading label; **canonical depth** = project calibrate.
8. **Still meaningful?** As **project Lore module** — yes. As **public post-assessment step** — **no** (not wired).
