# Astral World — Asset Contracts

Contracts live in `shared/site00-astral-world/generation/`.

| Module | Contents |
|--------|----------|
| `types.ts` | VisualAssetContract, lifecycle states, receipts |
| `environmentContracts.ts` | P0/P1 environment heroes |
| `portraitContracts.ts` | Reader + friend portrait templates |
| `artifactContracts.ts` | Journal, daily card, deck, avatar, circle |
| `promptCompiler.ts` | Master + asset + reference + negative compilation |
| `assetSlotRegistry.ts` | Canonical slot keys + crop mapping |
| `generationManifest.ts` | AW_VISUAL_FOUNDATION_V1 batch |

Each contract specifies: slot, aspect ratio, reference sources, prompt template, negative UI constraints, priority (P0/P1/P2).
