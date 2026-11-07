# 22 · Next integration handoff

**Branch** `claude/jurnl-f05-dot01-authority-scenes-um0u93` = #1713 `f7e2739c` + OPUS1 (`3604d2e7`, same patch as #1707
`0e930112`) + this sprint. No PR opened (not requested); nothing merged or deployed.

## Suggested order (founder decides)

1. Founder review of 03 / 04 / 05 against their authorities (`priority/*_ENLARGED.webp`, `*_SOURCE_MAP.webp`).
2. If accepted: open a draft PR from this branch **into #1713's branch** (or the integration branch the founder names),
   so the financial-safety candidate and the visual reconstruction land together. Do **not** stack it on #1707 — #1707
   lacks #1713's overpay guard / cabinet safety.
3. #1712 (MONEY type −2 px, `7752eae2`) is **not** in this base. It changes global type; integrate it **after** this
   branch and re-run `compare_dot01_account_scenes.py` (the 03–05 slot sizes are calibrated in authority px and will
   need one recalibration pass if the family's type scale changes).
4. When native layers for keychain / amphora / coin arrive (report 07 recovery request), add them as layers in
   `accountScenes.ts` over an object-free plate; no page code changes.

## Files that carry the change (see 21)

`runtime/screens/f05/dot01/accountScenes.ts` (new), `AccountPage.tsx`, `Dot01Frame.tsx` (content clamp),
`jurnl-f05-dot01.css`, `families/F05_MONEY/DOT01/SCENES/*` (new), three scripts, one unit test file.

## Conflicts to expect

* `AccountPage.tsx` against any branch that edits the account page (e.g. #1712's sizes): take this branch's structure,
  re-apply size intents as composition data.
* `Dot01Frame.tsx`: the content clamp (a few lines) and the overlay first-focus selector; trivial.
