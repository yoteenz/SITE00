# SITE 00 — Character Authority (P0.5E.4F)

Canonical NDX visual identity gate, downstream character injection authority, and pre-canon generation block.

## Module

`shared/site00-studio-world-production/characterAuthority/`

## Readiness layers (not interchangeable)

| Layer | Evaluator | Authorizes |
|-------|-----------|------------|
| Character truth | `evaluateNDXCharacterTruthReadiness` | Psychological/editorial NDX — **not** visual production |
| Visual identity | `evaluateNDXVisualIdentityReadiness` | Canonical face/hair/wardrobe/environment |
| Production | `evaluateNDXProductionReadiness` | Still / motion generation |

## Single source of visual truth

`buildCanonicalCharacterVisualAuthority` + `CanonicalCharacterVisualVersion` (`NDX_VISUAL_V1`, …)

## Downstream injection

`requestCharacterInjectionBundle` → `CharacterInjectionBundle` consumed by:

- Carousel / V2.3 (`compileV23PromptWithCharacterAuthority`)
- Film shot compiler (`characterInjectionBundle` param)
- Founder Creative Ingestion (pre-canon guard on FAL dispatch)
- Realism Lab (pre-canon benchmarks cannot become NDX canon)

## Pre-canon guard

`evaluatePreCanonCharacterGenerationGuard` — blocks final NDX photography when visual identity ≠ READY.

Reference-only surfaces (scripts, page roles, storyboards, shot lists) remain allowed.

## System audit

See `SYSTEM_CHARACTER_AUTHORITY_AUDIT` in `systemAudit.ts`.
