# 07 · Mobile overview recovery contract (< 768)

| Region | Authority (OPUS1 mobile, kept by OPUS2) | Implemented |
| --- | --- | --- |
| Header 52 px | SITE 00 / FOUNDER + env tag · search · alerts · menu | ✓. The env tag is derived from the host (PREVIEW on dev/tunnel, STAGING, LIVE) and never hard-coded |
| Page header | `01` index rail, DIGITAL FOUNDATION 50 px with red period, sub line, crown object right | ✓. The sub line is computed: `n ACTIVE · n NEED YOU · UPDATED …` |
| Focus | Red-edged card: status, plate + name + state, Display statement, black CTA with arrow, “1 OF N DECISIONS” | ✓. CTA opens the client record. With no decisions it shows a plain card, “NO DECISIONS WAITING ON YOU” |
| Signals | 4-up strip: ACTIVE · NEEDS REVIEW (red) · AWAITING CLIENT · COMPLETE with bars | ✓. 2 × 2 at 320 (container rule) |
| Needs you | Hidden on phones (container composition) | ✓ (same CSS) |
| Active work | Registry rows: plate, name, sub, status + age, segments, chevron | ✓ (6 rows) |
| Recent movement | Activity rows | ✓ |
| Bottom bar 72 px + safe area | HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM | ✓. REFERRALS via MENU; nothing selected on menu destinations |
| Empty | NO FOUNDATIONS YET · CREATE THE FIRST FOUNDATION · NEW FOUNDATION | ✓ |
| Error | Red banner, RETRY, technical detail (no secrets) | ✓ |

Viewports verified: 320 × 700, 375 × 812, 390 × 844, 430 × 932. No overflow, 0 blue controls.

**Known P2:** at 320 the focus time label wraps to two lines.
