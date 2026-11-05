# 10 · Icon variant source map

Probe `ICONS=1` census, 471 × 836, every visible icon in the 37 states, by real source (method of OPUS3 report 19, which
holds the per-icon table; not duplicated here).

| Source class | Before | After |
|---|---|---|
| AUTHORITY_LIFT | 2 | 2 |
| DOCK_COMPONENT | 15 | 15 |
| INLINE_SVG | 250 | 239 |
| MICRO | 48 | 47 |

Changes this sprint: 16's scan block now shows the authority's own receipt illustration (`SCANART_16`, counted with the
surfaces, not the icons) instead of the Batch 04 camera micro-asset; 16–20 show their own lifted seals (layers, not
icons). The Batch 01 framed plus stays on the amber `+` chip; the Batch 04 reorder grip stays the drag handle of 32 and is not
substituted for 06's engraved arrows. INLINE_SVG counts fall because fewer controls render in the measured states (the
button glyphs are unchanged inline line glyphs: camera, pencil, check, archive — the authorities draw them as thin cream /
ink line glyphs on the pills, which the inline vectors match in silhouette; they are counted as fallbacks, not as matches).

ICONS_MATCHING_AUTHORITY (strict, as OPUS3): AUTHORITY_LIFT icons only = 2 of 303; approved-source candidates (MICRO) = 47.
