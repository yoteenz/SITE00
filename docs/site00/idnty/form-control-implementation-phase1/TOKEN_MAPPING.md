# Token mapping — Phase 1

Tokens are scoped to `.df-root`, `.df-screen`, `.df-drawer`, `.df-portal` in `site00-df-components.css` unless noted.

| Token | Value / alias | Use |
| --- | --- | --- |
| `--df-input-value-size` | `14px` | Desktop / fine-pointer field values |
| `--df-input-touch-size` | `16px` | Coarse-pointer editable controls (NF-01) |
| `--df-focus-ring` | `2px solid var(--df-red)` | Solid focus (replaces low-contrast rgba ring) |
| `--df-check-edge` | `#8f8d88` | Unchecked checkbox border color (NF-06) |
| `--df-check-border` | `1.5px solid var(--df-check-edge)` | Checkbox shell |

Existing tokens preserved: `--df-display`, `--df-text`, `--df-red`, control heights, radii, disabled palette.

Intake-specific geometry in `site00-df-client.css` (`--df-card`, `--df-field`, etc.) unchanged.
