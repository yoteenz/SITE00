# 05 · Open gates and decisions

| Id | Gate or decision | State |
|---|---|---|
| FOUNDER_APPROVAL | The sectioned menu on OV08, its destination copy, ACCOUNT & PROFILE opening the approved F09 drawer | PENDING |
| FD-12 | OV06 vs the approved F09 AccountDrawer, and the `c34ef288f` re-skin (not carried) | PENDING |
| MOUNT-OV01–05/07 | Measured mount of the remaining six shells onto their live sheets | PENDING (installed, registered, runtime shells ready) |
| ASSET-RGBA | The handoff PNGs are palette-quantized; unquantized RGBA only on founder request (OpenArt re-export) | PENDING |
| OD-01 | Bank connection vendor; until then CONNECTED ACCOUNTS stays PROVIDER_UNAVAILABLE | OPEN (not authorized) |
| AI provider | ASK JURNL stays explanation-only | OPEN (not authorized) |
| FD-11 | A support channel for HELP & SUPPORT (no address was invented) | OPEN |
| Legal | Terms and privacy policy documents | OPEN |
| Billing | MANAGE MEMBERSHIP and add-on unlock remain non-actionable until billing exists | OPEN |
| IOS_SAFARI | Not verified: Chromium only in this environment | UNVERIFIED |

## Decisions taken in code (reversible)

* **ACCOUNT & PROFILE opens the approved F09 AccountDrawer.** It is the compact expression of the F09 ACCOUNT page (per the F09
  replica contract), and its ACCOUNT title and PROFILE card open the full page. This keeps the approved drawer reachable in one tap,
  where before it was hidden under PREFERENCES. Pointing the row straight at the page is a one-line change
  (`normalize()` in JurnlCornerChrome.tsx).
* **Security tools sit under PREFERENCES; privacy tools under PRIVACY & CONSENTS.** Each tool is reachable from exactly one place in
  the menu. The ACCOUNT page's SECURITY card opens the FACE ID tool directly.
* **The hamburger stays above the open menu as its toggle.** This keeps the V3 `aria-expanded` contract. On short phones it sits over
  the shell's top-left sculpture area.
* **Typecheck baseline.** `tsc --noEmit` reports 2 errors in F05 files this branch does not touch (`Dot01Frame.tsx:549`,
  `f05MotionLayout.ts:132`). The same 2 errors appear on the base `4ddbac6ce` and were left to their owner.
