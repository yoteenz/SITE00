# 08 — Minimum reuse roadmap

No implementation authorized in this sprint. Sequencing for founder approval.

## P0 — Required before Opus creative ingestion (engine-hosted)

1. **Property registration plan** — New slug (e.g. `the-exchange`) with capability manifest; **no** NDX entry bootstrap routes.  
2. **Canon persistence decision** — Wire `site00_creative_entries` **or** new `site00_fiction_*` tables; retire in-memory-only canon for Exchange work.  
3. **Ingest package for Opus** — Markdown/JSON series bible **outside** NDX namespaces (can be founder files first); map which sections feed `creativeReasoningProvider` vs human-only.  
4. **Model env** — Confirm `ANTHROPIC_CREATIVE_MODEL` for Opus vs Sonnet before paid review session.  
5. **Explicit separation checklist** — Asset paths, prompts, and retrieval scopes must not reference NDXBOOK entries.

**Avoid:** Rebuilding Expression UI or new video pipeline before Opus evaluates premise.

## P1 — Required before episode script development

1. **Fiction ontology** — Series, season, episode, **part**, scene, beat; link to chapter-continuity **patterns** but do not reuse NDX entry IDs.  
2. **Screenplay/treatment storage** + founder approval states.  
3. **Reveal / continuity registry** (character belief vs audience knowledge vs historical truth).  
4. **Adapt narrative synthesis QA** for long-form fiction critique prompts (extend, not fork NDX Entry 002 compiler).

## P2 — Required before keyframe / video production

1. **Sloane visual identity** — Founder reference import via casting/continuity pipeline under Exchange project only.  
2. **Unlock dispatch policy** — Founder-approved cast + storyboard gates + spend authorization (reuse guardrails).  
3. **Kling path** — Merge/evaluate Kling 4 manual packet branch or FAL v1.6 reference-video after schema review.  
4. **Shot execution contract** pattern (reference binding) — reuse from unmerged Kling 4 module when approved.

## P3 — Optional long-term

- Semantic bible retrieval (RAG) with canon conflict detection.  
- Automated tri-part publish packaging (vertical/social derivatives).  
- Generation run ledger persistence (audit MA-019).  
- Opus-native multi-session memory beyond Supabase versioning.

## Smallest safe reuse strategy (summary)

**Reuse:** capability guards, spend authorization, character continuity **architecture**, film rough-cut **planning**, founder judgment gates, FAL casting for **locked** identities.  

**Adapt:** narrative synthesis / senior judgment **prompts and inputs** for fiction.  

**Extend:** episode/part model, persistence, Exchange asset tree.  

**Do not reuse as-is:** Entry 002 bootstraps, NDX public assets, in-memory entry store for Exchange canon.
