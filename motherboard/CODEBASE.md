# Codebase Snapshot — SITE 00

**Last updated:** 2026-08-18 (initial motherboard setup). Refresh with **"Snapshot codebase to motherboard"**.

---

## Repo layout

```
SITE00/
├── api/                    # Serverless API routes (Node; not cPanel static)
│   ├── admin/              # site00-production, site00-assts admin
│   └── _lib/               # site00Production, site00Assts shared libs
├── docs/
│   ├── DEPLOYMENT.md
│   └── MOTHERBOARD_COMMANDS.md
├── motherboard/            # Agent persistent context (this folder)
├── public/
│   ├── .htaccess           # SPA rewrites (copied to dist/ on build)
│   └── site00/             # Static loader assets
├── scripts/
│   └── vite-site00-assts-local-api.mjs
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── routes/             # Site00Routes, Site00AdminRoutes
│   ├── site00/             # All SITE 00 product code
│   ├── utils/              # supabase, api, auth helpers
│   └── hooks/
├── supabase/migrations/    # *site00* schema migrations
├── vite.config.ts          # port 5174, SITE00_ROOT define, cloud preview plugins
├── package.json
└── .env.example
```

---

## Frontend entry

| File | Role |
|------|------|
| `src/main.tsx` | React mount |
| `src/App.tsx` | Router shell |
| `src/routes/Site00Routes.tsx` | Public route table |
| `src/routes/Site00AdminRoutes.tsx` | Admin route table |

---

## SITE 00 product code (`src/site00/`)

| Area | Path | Notes |
|------|------|-------|
| Config | `config/` | routes, identity, idnty-assessment, builder, evolve, environments |
| Pages | `pages/` | IdntyStatePage, BldrStatePage, idnty/assessment/* |
| Components | `components/` | shell, workflow cards, idnty-assessment UI, loader |
| Admin | `admin/` | Production OS admin pages |
| ASSTS | `assts/` | Asset factory UI |
| State | `state/` | Site00Context (preview mode, selections) |
| Styles | `styles/` | site00.css, typography, idnty-assessment |

---

## Key config files

| File | Purpose |
|------|---------|
| `config/routes.ts` | Route constants, assessment slug lists, desktop path helpers |
| `config/identity.ts` | `IDNTY_BRAND_STATES` (4 states), `IDNTY_INVESTMENT_TIERS` |
| `config/idnty-assessment.ts` | Assessment engine per state, diagnostic options, legacy migration helpers |
| `config/environments.ts` | Background assets per route/environment |
| `config/idnty-assessment-brand-map.ts` | Brand state card id → assessment slug |

---

## API (`api/`)

| Route area | Purpose |
|------------|---------|
| `api/admin/site00-production.ts` | Production OS admin API |
| `api/admin/site00-assts.ts` | ASSTS admin |
| `api/_lib/site00Production/` | Seed, operations, readiness |
| `api/_lib/site00Assts/` | Asset generation, post-process |

Requires Node runtime + server env secrets. Proxied in dev via Vite plugin when not using external API.

---

## Hooks

| Hook | Storage key | Purpose |
|------|-------------|---------|
| `useIdntyAssessment` | `site00_idnty_assessment_v1` | IDNTY onboarding progress; migrates legacy `needs-cohesion` |
| `useBldrAssessment` | (bldr key) | BLDR assessment |
| `useSignedInFromStorage` | — | Auth session restore |

---

## Styling conventions

- Workflow state pages: `site00-state-page`, `site00-state-page-layout`
- IDNTY 4-column desktop grid: `site00-idnty-state-grid`, `site00-idnty-investment-grid` in `site00.css`
- State cards: `site00-state-card` in `WorkflowCards.tsx`

---

## When to refresh this file

- New top-level route namespace or major folder restructure
- Assessment state model changes
- API route additions
- After founder says **"Snapshot codebase to motherboard"**
