# 11 — Founder Approval Record

## Approved by the founder (LOCK1)

| ID | Item | Evidence |
|---|---|---|
| L-01 | Home-screen icon (attachment 01) | sprint LOCK1 §00–§07; master sha256 `4dccf2ae…` |
| L-02 | Light architectural launch (attachment 02) | §09; master sha256 `f8855565…` |
| L-03 | Copy "YOUR DIGITAL SPACE AWAITS." | §09 |
| L-04 | Home screen + verified email are the return methods | §04, §12 |
| L-05 | Client access card retired from V1; no digital card download or QR | §04, §05 |
| L-06 | CTA "SAVE YOUR FOUNDATION" | §13 |
| L-07 | Install is contextual and optional | §17 |
| L-08 | Secure sessions mandatory | §15 |
| L-09 | Commercial pipeline and pricing unchanged | §19 |

## Superseded OPUS1 items

| OPUS1 ID | Item | Now |
|---|---|---|
| FA-08 | App icon composed from existing grammar (placeholder) | **SUPERSEDED** by L-01 |
| FA-09 | Access card design (dark, printable, wallet-style) | **SUPERSEDED / RETIRED** by L-05. Not awaiting approval |
| OD-06 | Apple / Google Wallet passes | **CLOSED** (no card) |
| OD-07 | When the access card is issued | **CLOSED** (no card) |
| — | Access priority "home › card › email" | **SUPERSEDED** by "home › email" |

## Still awaiting founder review (not inferred as approved)

| ID | Item | Recommendation |
|---|---|---|
| **FR-01** | Icon derivative D1 (face crop; content-to-frame 55 % → 65.5 %) for `any` + Apple | approve: it is the minimum change that avoids double rounding |
| **FR-02** | Icon derivative D2 (maskable; mirrored blank face texture) | approve, or ship without a maskable entry (Android then letterboxes the `any` icon) |
| **FR-03** | Higher-resolution launch master (the current 941 × 1672 is upscaled 1.26–1.67× on 3× phones) | supply one if it exists |
| OD-11 | Optional iOS `apple-touch-startup-image` cover crops of the launch master | optional; low value, flaky across iOS versions |
| OD-12 | Wide-screen side field: plain `--df-bg` (current) vs blurred backdrop of the same image | keep plain |
| FA-01…FA-07, FA-10…FA-14 | All other OPUS1 visual approvals | **unchanged: still pending.** LOCK1 approves only the items above |
| OD-01…OD-05, OD-08…OD-10 | OPUS1 open decisions | unchanged |
