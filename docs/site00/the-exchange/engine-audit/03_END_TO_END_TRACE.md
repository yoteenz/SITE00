# 03 — End-to-end trace (hypothetical THE EXCHANGE)

**No execution performed.** Status per stage based on `main` wiring.

```text
NEW PROPERTY → … → FINAL THREE-PART EPISODE
```

| Stage | Entry point | Required inputs | Outputs | Persistence | Next handoff | Approval gate | Status |
|-------|-------------|-----------------|---------|-------------|--------------|---------------|--------|
| **NEW PROPERTY** | `projects.ts` / project resolver | Org, slug, capabilities | Project record + capability manifest | Supabase projects | Identity or Expression | Founder creates project | **PARTIAL** — no `the-exchange` slug; capability model supports new slugs |
| **SERIES BIBLE** | Identity `projectBibleCompiler`, brand lore | Origin, territories | Compiled project bible JSON | `site00_identity_*`, lore profiles | Creative direction | Founder promotion | **ADAPT** — brand-oriented, not fiction series bible schema |
| **CREATIVE ANALYSIS** | C1.4 / narrative QA / creativeReasoningProvider | NarrativeSynthesisInput-shaped payload | Scores, QA flags, optional LLM text | In-memory synthesis | Treatment / entry compile | Founder judgment | **PARTIAL** — needs **new input compiler** for Exchange bible |
| **EPISODE TREATMENT** | Film planner / narrative treatment handoff | Beat seeds, spine | Treatment artifacts | Film plan or entry record | Screenplay | Founder | **PARTIAL** — no episode/part entity |
| **APPROVED SCREENPLAY** | **None** | Screenplay text | — | — | Storyboard | — | **MISSING** |
| **STORYBOARD** | Expression storyboard gates | Approved authorities | Board JPGs / manifests | Public assets + manifests | Keyframes | LOVE_IT gates | **RUNTIME_CONNECTED** for **Entry-shaped** work only |
| **CHARACTER REFERENCES** | Casting + continuity pipeline | Founder uploads, locks | Reference pack, bible assets | Casting state / methodology runs | Generation | Visual identity lock | **TESTED** — **pre-casting / blocked** until cast |
| **KEYFRAMES** | Entry keyframe dispatch (FAL stills) | Approved storyboard | Raster keyframes | ASSTS paths | Video | Founder + gates | **PARTIAL** — Entry 002 proven; reel KFs missing from repo per prior audit |
| **KLING GENERATION** | `routeProductionTool` → fal-kling* | Keyframes + refs | Video job | Receipts (schema) | QA | Spend auth + flags | **BLOCKED** — `autoDispatch: false`, klingBlocked bootstraps, no Kling4 on main |
| **QUALITY REVIEW** | Continuity QA, expression QA modules | Output assets | QA reports | Receipt metadata | Rough cut | Founder | **PARTIAL** — stills > video |
| **FINAL THREE-PART EPISODE** | Film rough cut + editorial | Clips + EDL | Rough cut object | Film state | Campaign board | Founder | **PARTIAL** — structural rough cut, **no** tri-part assembly model |

## First genuine blocking dependency

**Property-isolated, durable fiction canon store** (series / season / episode / part + bible versioning) **wired to Expression or Film APIs**, replacing or supplementing **in-memory** `entryStore.ts` for long-running serialized work.

Without that, downstream stages can only reuse **patterns** (gates, casting, routing) by **copying NDX Entry 002**, which violates THE EXCHANGE separation requirement.

## Secondary blockers (ordered)

1. **Screenplay → scene → shot** ingest (no Fountain/scene parser found).  
2. **Three-part release** entity and edit assembly (not in schema).  
3. **Automated Kling path** with reference binding at runtime (routing exists; dispatch blocked).  
4. **Opus-oriented fiction critique prompt pack** bound to Exchange namespace (Anthropic path exists; content does not).
