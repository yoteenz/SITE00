# MASTER PRODUCTION AUTHORITY TREE

Audit project slug: **ndxbook** (canonical crawl slug; pattern generalizes to `:projectSlug`).

```
PRODUCTION (persistent shell: ProductionAuthorityFrame .pxa)
├── SHELL
│   ├── HEADER (mobile: ph-top 864-space | tablet/desktop: pxh-top)
│   ├── SCROLL BODY (pxa-scroll / pxa-body)
│   └── BOTTOM NAV (7 tabs — ProductionWorkspaceNav)
│
├── HUB (/production)
│   ├── ROOT — HubBody (authority)
│   │   ├── HERO (crystal chamber plate)
│   │   ├── STATUS BAR (attention · activity links)
│   │   ├── OVERVIEW
│   │   ├── ENTRIES (Entry 002 → Expression)
│   │   ├── COMPONENTS (graph nodes)
│   │   ├── OPERATIONS → queue
│   │   └── ACTIVITY PREVIEW → /production/activity
│   ├── INTERACTION — OPEN HUB MACHINE (?view=machine)
│   └── TEMPORARY / LEGACY — ProductionHub (?view=machine | panel | node | scene)
│
├── INBOX (/production/queue)
│   ├── ROOT — InboxBody
│   ├── TABS — needs | watching | resolved
│   ├── ATTENTION / APPROVAL CARD (approve · revision)
│   ├── QUEUE LIST (device-held requests)
│   ├── RESOLVED FEED (activity-derived)
│   └── STATES — empty needs · decision footnote
│
├── DESIGN (/production/:slug/design)
│   ├── ROOT — DesignChamber + DesignModeBar (?mode=)
│   │   ├── BRAND
│   │   ├── EXPERIENCE (design lens — not Experience tab)
│   │   ├── SURFACES
│   │   ├── COMPILER
│   │   ├── ASSETS
│   │   └── VIEWPORT (device stage · zoom · safe · validation sheet link)
│   ├── CHILD ROUTES (twin-opus overlay shell)
│   │   ├── workspace (DesignProductionWorkspaceLayout) [LEGACY bench]
│   │   ├── references
│   │   ├── assets
│   │   ├── pages
│   │   ├── skins
│   │   ├── history
│   │   └── more
│   └── TEMPORARY — ProductionChromeOverlay on child routes
│
├── EXPERIENCE (/production/:slug/experience)
│   ├── ROOT — ExperienceBody (capsules: WORLD…ACCESS)
│   └── CHILDREN (ExperienceProductionShellPage + PwFrame)
│       ├── world
│       ├── zones
│       ├── environments  (canon label PATHS)
│       ├── modules       (canon INTERACTIONS)
│       ├── simulations   (canon INHABITANTS)
│       ├── assets        (canon STATES)
│       └── review        (canon ACCESS)
│       └── each child: CAPSULE NAV · world crop plate · UNMOUNTED empty
│
├── EXPRESSION (/production/:slug/expression?entry=)
│   ├── ROOT — ExpressionBody (floors · making · active · travel table)
│   ├── CHILD ROUTES
│   │   ├── narrative → tabs: story | structure | momentum (NME embed)
│   │   ├── character-fabrication → CharacterFabrication [CF authority]
│   │   ├── casting → tab: actors
│   │   ├── wardrobe
│   │   ├── performance
│   │   ├── sets
│   │   ├── storyboard
│   │   └── review
│   ├── SHELL LIST (HubReturnBar + pw-list) when deep-linked without root frame body
│   └── EXTERNAL LEGACY — /projects/:slug/content-operations/expression-engine
│
├── LIBRARY (/production/libraries)
│   ├── ROOT — LibraryBody
│   ├── CANON TABS — canonical | in review | superseded | archive
│   ├── VAULT / LINEAGE
│   ├── CATEGORIES — authorities · assets · characters · … · archive
│   ├── COLLECTIONS (+ expand panel)
│   └── RECENT STRIP
│
└── ACTIVITY (/production/activity)
    ├── ROOT — ActivityBody
    ├── FILTERS (workspace chips)
    └── LOG ROWS (+ empty)
```

## Cross-tab links (not separate tabs)

- Hub → Expression / Queue / Activity / Design / Experience via in-body links
- Expression engine buttons → legacy content-ops route (outside Production shell)
- Design viewport → `/design/workspace` validation sheet

## Classification snapshot (161 nodes)

See [NODE_MATRIX.md](./NODE_MATRIX.md) and [MANIFEST_SUMMARY.json](./MANIFEST_SUMMARY.json).
