# 05 — Visual and video pipeline assessment

## Audit D — Visual authority and character locking

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Canonical character face | **TESTED** | Casting locks, `characterAuthority/readiness.ts`, reference-driven casting tests P05E4D–E |
| Multiple refs per character | **TESTED** | `CharacterReferencePack`, asset pack generation |
| Facial identity across generations | **PARTIAL** | FAL reference routes; pre-casting gate blocks prod (`preCastingMode.ts`) |
| Multi-angle refs | **TESTED** | Character bible asset pack slots (tests describe 17 slots) |
| Family resemblance | **PARTIAL** | Architecture mentions; not Exchange-specific |
| Age / flashback | **PARTIAL** | Variation governance types; no episode-era timeline binding |
| Wardrobe / hair / makeup continuity | **TESTED** | Scene contract + continuity bible compilers |
| Environment association | **TESTED** | Scene contract, reference pack scoping |
| Visual drift detection | **PARTIAL** | `continuityQA.ts`; post-gen QA taxonomy in realism lab |
| Casting exploration vs identity lock | **RUNTIME_CONNECTED** | Discovery vs lock flows in casting engine |
| Sloane Lockwood import | **ADAPT** | Use **new project slug** + founder-supplied refs; **do not** store under NDXBOOK namespace |

**Visual source of truth today:** Founder-approved assets under project-specific paths (e.g. `public/assets/expression-engine/entry-002/` for NDX) + casting lock state + continuity pipeline run records.

## Audit E — Cinematic preproduction

| Capability | Status | Notes |
|------------|--------|-------|
| Screenplay → scene parsing | **MISSING** | |
| Shot planning | **TESTED** | `entry002ReelShotPlan.ts`, film planner |
| Storyboarding + gates | **RUNTIME_CONNECTED** | Structural + final cinematic storyboard |
| Keyframe generation | **PARTIAL** | FAL stills path; blocked until gates satisfied |
| Performance / blocking direction | **PARTIAL** | Prompt fields in shot contracts (Entry 002); not generic screenplay import |
| Three-part episode assembly | **MISSING** | |
| Hierarchy SERIES→…→DELIVERY | **PARTIAL** | Film: film→scenes→shots; Expression: entry→reel shots; **no PART** layer |

**Chain break points:** Screenplay ingest; PART entity; automated video dispatch; durable receipt lineage to edit.

## Audit F — Kling and video (verified on `main`)

| Question | Finding |
|----------|---------|
| Kling models supported | Logical ids `fal-kling`, `fal-kling-character` → mapped to `kling-v2*` in `entry002ReelProviderRouting.ts` |
| Kling 4.0 integrated on main? | **No** — draft work on branch #1683 only |
| Provider route | FAL-style ids in expression routing; FAL endpoints declared in `generationCapability.ts` (`fal-ai/kling-video/v1.6/...`, `SCHEMA_REVIEW_REQUIRED`) |
| Implemented vs documented | **Routing + blocked bootstraps** = implemented policy; **not** production-validated motion |
| Image-to-video / start-end | Task classes `VIDEO_START_END_FRAME`, `VIDEO_CHARACTER_CONTINUITY` in `productionRouting.ts` |
| Reference character consistency | Declared for `fal-kling-character`; blocked by casting/pre-casting |
| autoDispatch | **`false`** in `routeProductionTool` (`productionRouting.ts:76`) |
| Job tracking / retries | Film + casting background jobs; expression video **blocked** |
| Cost / credits | `runProductionProviderRequest` + spend authorization |
| Output storage | ASSTS paths, expression receipts schema |

**No paid provider calls** were made in this audit.

## Audit G — Provider summary (creative + media)

See matrix in `02_CAPABILITY_MATRIX.md`. **Secrets:** only variable **names** documented (`ANTHROPIC_API_KEY`, `FAL_KEY`, etc.).

**Disconnected until configured:** Anthropic (no key → deterministic fallback), FAL casting (throws without `FAL_KEY`), Elevenlabs/music entries in routing table without verified live wiring in expression path.
