# Background Generation

## Flow

1. Slot identified as MISSING / CONTRACT_READY
2. Contract compiled → FAL job queued (non-blocking)
3. UI continues with reference crop
4. Job completes → validate → upload → record ACTIVE
5. Client poll (`/api/site00/astral-world-assets`) picks up new URL
6. AstralScene / AstralPortrait re-render without JSX edits

## Duplicate protection

- Active job set per slot key
- Skip dispatch if ACTIVE/READY unless `force: true`

## Failure

Failed jobs keep previous reference/fallback visual. Record stores error + receipt lineage.

## Concurrency

P0 batch limited to 2 concurrent jobs (`AW_GENERATION_MANIFEST_V1.maxConcurrentJobs`).
