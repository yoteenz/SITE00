# 23 — Typography and Design Tokens

All tokens are the live client's (`src/site00/styles/site00-df-client.css`, the `--df-*` set). This authority adds **no new palette**.

## Colour

| Token | Value | Use |
|---|---|---|
| `--df-bg` | `#f3f2ef` | page, sheets, theme-color, icon background |
| `--df-card` | `#f9f8f6` | rows, panels |
| `--df-field` | `#f6f5f2` | inputs, code boxes |
| `--df-ink` | `#0c0c0c` | type, ink CTAs, dark card |
| `--df-ink-2` | `#2f2f2e` | lede, secondary type |
| `--df-muted` | `#75736e` | captions |
| `--df-faint` | `#a3a19c` | struck / empty |
| `--df-rule` | `#dcdad5` | hairlines |
| `--df-rule-strong` | `#c9c7c2` | section rules, upcoming dots |
| `--df-red` | `#ce1017` | threshold red: CTAs, current, needs you, period |
| `--df-red-ink` | `#b30f17` | hover / busy |
| `--df-red-tint` | `rgba(206,16,23,.07)` | alert fill |
| glass gradient | `#f0474d → #d3121b → #a80c13` | `objects.tsx` RedGlass, icon bar, card bar |

Note: `DF_VISUAL_FIDELITY_ASSET_ICON_V1.md` names `#E50107`. The code does not use it for the threshold red, and this authority follows the code (OD-02).

## Fonts

| Family | Weights loaded | Use |
|---|---|---|
| 'SITE 00 Display' | 400–900 | headlines (900), rail index (600), big figures (800/900), card title |
| 'Saira Semi Condensed' | 300–600 | everything else. **Max 600**: there is no 700 face, so 700 would be synthesized |

## Type scale

| Role | M | TP | TL | D | UW | Tracking | Weight |
|---|---|---|---|---|---|---|---|
| Headline (display) | `min(54px, 13.6vw)` | 76 | 78 | 92 | 108 | 0 | 900 |
| Line-height | `0.86em − 1px` | | | | | | |
| Lede | 10 | 11 | 11 | 12 | 13 | 0.19em | 400 (bold 600) |
| Rail index (display) | 17 | | | | | 0.06em | 600 |
| Rail label | 10.5 | | | | | 0.25em | 600 |
| Row title | 11 | 11 | 11 | 12 | 12.5 | 0.19em | 600 |
| Row sub | 10 | 10 | 10 | 10.5 | 11 | 0.16em | 500 |
| Section label | 10.5 | | | | | 0.24em | 600 |
| CTA | 11.5 | | | | | 0.28em | 600 |
| Chip / caption minimum | 10 | | | | | 0.18em | 600 / 500 |
| Quote figure (display) | 20 / total 34 | | | | | 0.02em | 800 / 900 |

All client copy is uppercase (`text-transform: uppercase`), as in the live client. The headline ends with a red square period: 0.15em, `--df-red`.

## Geometry

Radius 1px on CTAs and 0 on rows, panels and sheets. The exception is the app icon (platform mask). The access card is retired. Hairlines are 1px; section/total rules are 1.5px; the current-stage inset is 3px. CTA height is 50 (min 44 in the live client).
