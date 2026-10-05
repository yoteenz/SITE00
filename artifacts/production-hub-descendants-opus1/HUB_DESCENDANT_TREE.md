# HUB descendant tree: final classification

Source of truth: `artifacts/production-authority-tree/` (COMPOSER1). The tree assigns 12 nodes to HUB: the root, 9 sections and states, the machine link, and the legacy machine. This sprint audits those nodes, plus every shell interaction reachable from HUB (project selector, ITEMS NEED YOU, menu) and every state the HUB body can render.

Inheritance order: explicit descendant reference → HUB root authority → Production shell authority → existing function.

```
HUB  /production                                         REFERENCE_LOCKED (HUB.RECONSTRUCTION.OPUS1)
├── SHELL (reachable from HUB, shared by the 7 roots)
│   ├── project selector  → /production                  REFERENCE_LOCKED      (link; no switching UI exists)
│   │   └── project-switching dropdown                    UNMOUNTED             (not implemented; not invented)
│   ├── ITEMS NEED YOU    → /production/queue            FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   └── MENU (temporary: MENU)                           PARENT_INHERITED      (rebuilt this sprint)
├── HERO / WORLD PANEL                                   REFERENCE_LOCKED      (no interaction exists)
├── STATUS STRIP                                         REFERENCE_LOCKED
│   ├── LIVE STATUS (+ LOADING: SYNCING LIVE STATE)      PARENT_INHERITED
│   ├── VIEW NOW          → /production/queue            FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   └── BLOCKERS · VIEW   → /production/activity         FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
├── PRODUCTION OVERVIEW                                  REFERENCE_LOCKED
│   ├── VIEW ALL          → expression root              FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   ├── featured entry    → expression root              FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   └── no-production slot (EMPTY)                       PARENT_INHERITED      (new honest empty slot)
├── ACTIVE ENTRIES                                       REFERENCE_LOCKED
│   ├── VIEW ALL / active entry → expression root        FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   └── NEW ENTRY         → expression root              FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│       └── creation flow                                 UNMOUNTED             (no flow exists; not simulated)
├── PROJECT COMPONENTS                                   REFERENCE_LOCKED
│   ├── VIEW ALL          → expression root              FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   ├── 7 tiles           → expression sub-routes        FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED ×7
│   └── components empty (EMPTY)                         PARENT_INHERITED
├── CURRENT OPERATIONS                                   REFERENCE_LOCKED
│   ├── VIEW ALL + rows   → /production/queue            FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED ×3
│   └── hub-operations-empty (EMPTY)                     PARENT_INHERITED
├── RECENT ACTIVITY                                      REFERENCE_LOCKED
│   ├── VIEW ALL          → /production/activity         FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED
│   └── hub-activity-empty (EMPTY)                       PARENT_INHERITED
├── interaction states (hover · focus · pressed)         PARENT_INHERITED      (added this sprint)
├── error state                                           UNMOUNTED             (HUB data has no error channel)
└── CHILD — OPEN HUB MACHINE → /production?view=machine  LEGACY_LOCKED
    └── hub machine (FULLSCREEN_TEMPORARY_VIEW, 864 spec) LEGACY_LOCKED         (untouched; founder decision)
```

Grandchild routes: none. The machine's internal chamber, inspector and scene panels belong to the legacy surface and were not expanded.

## Counts

| CLASS | COUNT | NODES |
|---|---|---|
| REFERENCE_LOCKED | 9 | root, hero, status strip, overview, entries, components, operations, activity, project selector |
| PARENT_INHERITED | 7 | menu, loading, operations-empty, activity-empty, no-production slot, components-empty, interaction states |
| FUNCTIONALLY_CORRECT_VISUALLY_CONVERGED | 20 | ITEMS NEED YOU, VIEW NOW, BLOCKERS VIEW, overview VIEW ALL, featured entry, entries VIEW ALL, active entry, NEW ENTRY, components VIEW ALL, 7 tiles, operations VIEW ALL, 2 operation rows, activity VIEW ALL |
| LEGACY_LOCKED | 2 | open-hub-machine link target, hub machine surface |
| UNMOUNTED | 3 | project-switching dropdown, new-entry creation flow, error state |
| BLOCKED | 0 | — |
| **TOTAL** | **41** | |
