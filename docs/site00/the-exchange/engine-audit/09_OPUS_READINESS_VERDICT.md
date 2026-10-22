# 09 — Opus readiness verdict

## Question

Can the **existing engine** receive THE EXCHANGE’s complete creative context and support a **rigorous Claude Opus** evaluation (premise, world, season, episodes, three-part serialization, romance, reveals)?

## Verdict: **BLOCKED** (engine-native ingestion)

| Criterion | Status |
|-----------|--------|
| Load complete series + world + character + continuity bibles into structured store | **BLOCKED** — no fiction bible schema + hot path in-memory |
| Run Opus critique with canon firewall | **PARTIAL** — Anthropic API path exists; default **Sonnet**; no Exchange prompts |
| Preserve approvals across sessions | **BLOCKED** for Expression entries until DB wired |
| Evaluate 10 episodes × 3 parts | **BLOCKED** — no part entity |
| Compare against world rules / reveal pacing | **PARTIAL** — QA patterns exist for NDX entries only |

## What works without engine changes

Founder can run **Opus outside SITE 00** (Claude project / manual) using bible documents — **not** engine integration.

## Minimum technical work before **engine-hosted** Opus review

1. Persisted project-scoped bible documents (structured JSON or markdown sections with version + approval).  
2. Single API or script route: `compileExchangeCreativeContext()` → Anthropic messages (no NDX fixtures).  
3. Env: `ANTHROPIC_CREATIVE_MODEL=claude-opus-*` (exact id per founder account) + `ANTHROPIC_API_KEY` on Railway.  
4. Founder judgment capture for Opus recommendations (approve/reject without auto-mutating canon).

**Estimated scope:** Small **adapter layer** + persistence wiring — **not** full production pipeline.

## Opus review scope (when authorized later)

The sprint brief lists evaluation dimensions (originality, alternate history, privacy culture, technology plausibility, Lockwood family, ten episode concepts, three-part serialization, romance pacing, etc.). **None** of these were executed in this audit. **No Opus call was made.**

## Fabricated review?

**None.** This document is readiness only.
