# Sonnet batch: PUBLIC_EVOLVE_STATE

```json
{
  "batch_id": "PUBLIC_EVOLVE_STATE",
  "routes": [
    "/evolve/state",
    "/evolve/state/desktop"
  ],
  "components": [
    "evolveState",
    "unknown",
    "evolveStateDesktop"
  ],
  "archetypes": [
    "ROUTE_SELECTOR",
    "DESKTOP_BRANCH",
    "HUB"
  ],
  "authority_lineage_by_layer": {
    "HOST_SHELL": "SITE00_PUBLIC_GLOBAL",
    "ENVIRONMENT": "EVOLVE_*",
    "WORKING_SURFACE": "FAMILY_DEFAULT",
    "TYPOGRAPHY": "SITE00_PUBLIC_GLOBAL"
  },
  "shared_components_to_reuse": [
    "PublicRedesignShell",
    "Site00MobileShell",
    "IdentityDiagnosticFlow"
  ],
  "new_components_allowed": [
    "Batch-local wrappers only — no new visual grammar"
  ],
  "interaction_rules": [
    "Preserve existing data hooks",
    "No new routes",
    "Uppercase public UI"
  ],
  "state_rules": [
    "Persist intake state to existing storage keys",
    "No fake verification submit"
  ],
  "asset_slots": [
    "Use manifest slot ids — placeholders until Grok"
  ],
  "backend_boundaries": [
    "Do not add schema",
    "Call existing APIs only"
  ],
  "responsive_rules": [
    "Mobile authority viewport first",
    "Keep desktop branches untouched unless batch says otherwise"
  ],
  "uppercase_contract": "All public labels uppercase per SITE 00 contract",
  "do_not_invent_rules": [
    "Do not invent checkout or payment UI",
    "Do not blend IDNTY evolution with public EVOLVE",
    "Do not treat Build Ready verification as BLDR intake"
  ],
  "proof_requirements": [
    "Side-by-side authority vs render for representative screen per archetype"
  ]
}
```
