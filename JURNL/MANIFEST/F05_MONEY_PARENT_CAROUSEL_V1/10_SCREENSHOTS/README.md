# 10 — Mobile, tablet and desktop screenshots

Captured by the carousel E2E suite (`e2e/jurnl/jurnl-f05-carousel.e2e.ts`) at each project size. All data is synthetic, from the CAROUSEL, APPROVED or NONE worlds. The images are WebP conversions of the raw captures.

| Folder | Viewport | Device emulation |
|---|---|---|
| `small/` | 360 × 780 | Pixel 5, touch |
| `mobile/` | 393 × 852 | Pixel 5, touch |
| `tablet/` | 834 × 1194 | Desktop Chrome |
| `desktop/` | 1440 × 900 | Desktop Chrome |

| File | State |
|---|---|
| `01-accounts` | first collection, APPROVED world |
| `02-04-swiped-to-{transfers,commitments,outlook}` | after real swipes (touch on phones, mouse elsewhere) |
| `13-{transfers,accounts-with-transfers,commitments,outlook}` | canonical figures with transfers in transit, pending and scheduled |
| `14-{transfers-empty,outlook-empty,no-places}` | honest empty states |
| `22-reduced-motion-commitments` | reduced motion |
| `25-{accounts,transfers,commitments,outlook}` | the responsive check: every control on screen, no page scroll |
