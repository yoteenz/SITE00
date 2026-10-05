# Capability Genome audit — shared brief (read fully)

Repo: /home/claude/site00 at main 6f63aaa (branch cursor/site00-capability-genome-4f59). READ-ONLY. Do NOT edit any repo file, do NOT run git commands that change state, do NOT call any paid/provider API. npm install is blocked; don't try.

Goal: determine what SITE 00 (a studio that takes a client from IDEA → BUSINESS UNDERSTANDING → IDENTITY → OFFER → CUSTOMER JOURNEY → DIGITAL LOCATION/WORLD → PRODUCT SYSTEM → MARKETING SYSTEM → LIVE OPERATIONS → MEASUREMENT → MAINTENANCE → EVOLUTION) actually HAS in code today, vs what only exists in docs/concepts, vs missing. AUDIT THE ACTUAL CODE (src/, api/, server/, supabase/migrations/, scripts/, tests, .github/workflows, docs/, motherboard/). Prior forensic docs in docs/site00/ground-zero/, docs/site00/client-project-room/, docs/site00/ground-zero/navigation/ and raw JSON in /tmp/claude-0/gz/findings/ and /tmp/claude-0/gz/nav/ may be used as leads, but verify against code. motherboard/MEMORY.md is 1.4MB — grep it, don't read whole.

Known facts (verified earlier, reuse): review loop broken (no send, client fetch lacks Bearer → 401); client role tamper via body.role/roleOverride; ~20 unauthenticated API endpoints; 2 tables with policy using(true) w/o TO service_role (migrations 20260910180000, 20260921120000); getSupabaseAdmin anon-key fallback; ≥7 hard-coded project registries; no membership/invites; no payments; OpenArt manual ledgers; site00_project_events has no migration; courtesy codes memory-only (site00_courtesy_codes tables unused); "control plane" in code = design handoff bridge; CI main mostly failing (last green 2026-09-28). Recent main: JURNL family expression briefs (#1364), family environment distinctness (#1363), F03/F04 parent repair (#1361), one provider project per family (#1359), reference-binding pre-dispatch guard + contracts (#1357) — these are repo truth.

## Output
Write ONE JSON file at the path given in your task: `{"domain": "...", "capabilities": [...], "graveyard": [...], "duplications": [...], "notes": "..."}`.

Each capability record (aim 12–30 per domain, real granularity — one per meaningful capability, not per file):
```
{
 "capability_id": "CAP.<DOMAIN>.<SHORT_SNAKE>",   // e.g. CAP.CRM.LEAD_CAPTURE
 "name": "...", "description": "...",
 "mature_endpoint_role": "which stage of IDEA→EVOLUTION it serves and how",
 "current_status": one of EXISTS_CONNECTED | EXISTS_PARTIAL | EXISTS_DISCONNECTED | CONCEPT_ONLY | DUPLICATED_COMPETING | MISSING | DEPRECATED | SUPERSEDED,
 "implementation_maturity": 0-5  (0 none, 1 concept/doc only, 2 stub/prototype code, 3 working but partial/unwired, 4 working+wired with gaps, 5 production-grade, tested, monitored),
 "current_locations": ["path:line", ...], "routes": [], "components": [], "shared_modules": [], "services": [], "apis": ["api/..."], "database_tables": [], "docs": [], "tests": [], "visual_surfaces": [],
 "current_owner": "who/what owns it today (e.g. founder workspace, client app, JURNL pipeline, none)",
 "correct_product_layer": one of PUBLIC_LOCATION | PRODUCTS_IDNTY | PRODUCTS_BLDR | PRODUCTS_EVOLVE | CLIENT_PROJECT_ROOM | CLIENT_SITES | FOUNDER_PRODUCTION_WORKSPACE | FOUNDER_CONTROL_ROOM | CLIENT_CONTROL_ROOM | MOVEMENT_LAYER | CONTROL_PLANE | PROJECT_RUNTIME_LAYER | STUDIO_OS | STUDIO_WORLD | SHARED_PLATFORM_SERVICE,
 "audience": "founder|client|public|internal-agent|mixed",
 "dependencies": [capability_id...], "upstream_dependencies": [], "downstream_dependencies": [],
 "client_visible": bool, "founder_visible": bool, "runtime_required": bool, "data_required": bool,
 "security_class": "PUBLIC|AUTHENTICATED|PROJECT_SCOPED|FOUNDER_ONLY|SECRET_BEARING",
 "commercial_relevance": "HIGH|MEDIUM|LOW",
 "metrics_required": ["..."],
 "existing_duplicates": [], "conflicts": [],
 "original_intent": "what it was built/planned for",
 "current_truth": "what is actually true in code now (be precise)",
 "gap": "what's missing to reach mature endpoint",
 "disposition": KEEP | CONNECT | EXPAND | MERGE | REPAIR | REBUILD | RECLASSIFY | DEPRECATE | ADD,
 "priority": CLIENT_READY_BLOCKER | GROUND_ZERO_FOUNDATION | POST_FIRST_CLIENT_HIGH_PRIORITY | MATURE_PLATFORM | FUTURE_OPTIONAL,
 "client_ready_mvp_required": bool, "post_client_allowed": bool,
 "evidence": ["path:line — what it shows", ...]   // REQUIRED, concrete. For MISSING, list the greps you ran that returned nothing.
 "confidence": "HIGH|MEDIUM|LOW",
 "effort_days_estimate": number (focused engineering days to reach the disposition target),
 "root_engine": optional — name of a shared root engine this would be built on (e.g. PROJECT_REGISTRY, EVENT_LEDGER, PERMISSION_ENGINE, ASSET_GRAPH, COST_LEDGER, NOTIFICATION_BUS, CANON_REGISTRY)
}
```
Rules: DO NOT make every mature capability a CLIENT_READY_BLOCKER — blockers are only things without which one real paying client cannot safely go through review→approval→launch. Prefer CONNECT/EXPAND/MERGE of existing code over ADD. Mark DUPLICATED_COMPETING when ≥2 implementations compete. Be honest: docs-only = CONCEPT_ONLY.

graveyard entries: `{"concept":"...","where":["doc/path"],"recommendation":"REVIVE|MERGE|DEPRECATE|IGNORE","reason":"...","merge_into":"capability_id or null"}` — ideas found in docs/motherboard/code comments that were never built or were abandoned.
duplications entries: `{"theme":"...","implementations":["path..."],"canonical_choice":"...","action":"MERGE|DEPRECATE_OTHERS|KEEP_BOTH","reason":"..."}`.

Return in your final message only: file path written, number of capabilities, and a 5-line summary of the most important findings. Keep it short.
