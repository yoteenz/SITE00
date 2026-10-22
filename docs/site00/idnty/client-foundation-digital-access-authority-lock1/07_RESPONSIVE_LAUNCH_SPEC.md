# 07 — Responsive Launch Spec

## Composition rule (pure CSS; no image editing)

```css
.ln { position: fixed; inset: 0; background: var(--df-bg); }           /* #f3f2ef field — light, never dark */
.ln__frame { position: absolute; inset: 0; }
.ln__img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 49.3%; }
@media (min-aspect-ratio: 67/100) {                                       /* wider than 0.67 */
  .ln__frame { inset: 0 auto; left: 50%; height: 100%; aspect-ratio: 941 / 1672; transform: translateX(-50%); }
  .ln__img { object-fit: contain; }
}
```

| Viewport aspect (w ÷ h) | Mode | Why it is safe |
|---|---|---|
| ≤ 0.5628 (all phones in portrait) | **cover**, scaled by height | Visible width = A ÷ 0.5628. The text zones need x 22.8–77.7 %, which stays visible down to A ≈ 0.34. Phones are ≥ 0.43 |
| 0.5628 – 0.67 | **cover**, scaled by width | Visible height = 0.5628 ÷ A ≥ 84 %, centred at 49.3 %; the zones need y 9.3–89.3 % |
| > 0.67 (tablet, desktop, ultrawide, landscape phone) | **portrait panel**: full height, centred, exact aspect, in the `--df-bg` field | The whole image is visible. No stretching and no invented side content |

The rule is CSS-only and needs no device sniffing.

## Measured (Chromium; see `12`)

| Viewport | Mode | All safe zones visible | Pixel scale on device |
|---|---|---|---|
| 320 × 700 @3 | cover | ✓ | 1.26× (soft) |
| 360 × 740 @3 | cover | ✓ | 1.33× |
| 375 × 812 @3 | cover | ✓ | 1.46× |
| 390 × 844 @3 | cover | ✓ | 1.51× |
| 412 × 915 @2.6 | cover | ✓ | 1.42× |
| 430 × 932 @3 | cover | ✓ | 1.67× |
| 768 × 1024 @2 | panel | ✓ | 1.22× |
| 820 × 1180 @2 | panel | ✓ | 1.41× |
| 834 × 1112 @2 | panel | ✓ | 1.33× |
| 1024 × 768 @2 | panel | ✓ | 0.92× |
| 1194 × 834 @2 | panel | ✓ | 1.00× |
| 1280 × 800 @2 | panel | ✓ | 0.96× |
| 1440 × 900 @2 | panel | ✓ | 1.08× |
| 1920 × 1080 @1 | panel | ✓ | 0.65× |
| 2560 × 1440 @1 | panel | ✓ | 0.86× |
| 3440 × 1440 @1 | panel | ✓ | 0.86× |
| 844 × 390 @3 | panel (veil skipped, see below) | ✓ | 0.70× |
| 932 × 430 @3 | panel (veil skipped) | ✓ | 0.77× |

**Limitations, documented rather than invented around:**
- **Phones are upscaled 1.26–1.67×.** A higher-resolution master is needed for crisp 3× output (founder action FR-03).
- **Landscape phones (height < 480).** The baked-in headline would render about 10 px tall, so the veil is **skipped** and the client goes straight to the portal or reentry.
- **No side extension.** On wide screens the side fields are plain `--df-bg`. A blurred-image backdrop was considered and **not** adopted: it would be derived content the founder has not approved (OD-12).

## Behaviour (SITE 00-controlled launch, CF-41)

| Event | Behaviour |
|---|---|
| Cold start from home screen (`src=home`) or email (`src=email`) | Veil painted immediately (continuity with the OS splash); the image is preloaded with `<link rel="preload" as="image">` on `/foundation/return` only |
| Session + payload ready | Fade out 240 ms (reduced motion: instant). **Never held after ready**; no minimum duration |
| Ready in < 150 ms (warm resume) | Veil not shown at all |
| ≥ 3 s | Chip "OPENING YOUR FOUNDATION…". Every chip is a single line, never overlaps a safe zone (validated at 320, 390 and 1440 px) and sits in the bottom safe area |
| ≥ 10 s | Chip "STILL OPENING" + TRY AGAIN |
| Offline | Chip "YOU'RE OFFLINE" + TRY AGAIN |
| Session restore fails | Cross-fade to CONFIRM IT'S YOU / YOUR SESSION ENDED (`06`) |
| In-app navigation, refresh within the session (`sessionStorage` flag), deep links from inside the portal | Never shown |
| `prefers-reduced-motion: reduce` | No fade; instant swap |

## Accessibility

- `img alt` = "SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS."
- `aria-busy="true"` on `main` while veiled.
- Chips are `role="status"`.
- Focus goes to the portal `h1` (or the reentry form) on exit.
- The veil never traps focus for more than its loading time.
