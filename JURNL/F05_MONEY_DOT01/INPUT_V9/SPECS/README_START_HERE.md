# JURNL — F05 MONEY / DOT 01 ACCOUNTS — OPUS HANDOFF V9

## Scope and contents

- **37 mobile screen references** (01–37, preserved byte-for-byte from V7, organized by feature).
- **3 new text-free shared SIDEKICK scene candidates** (SK01 parent, SK02 account detail, SK03 receipt/overlay).
- **22 separate PNG motion-asset candidates**, in batches 10 + 10 + 2. Every image has an alpha channel with transparent and substantially opaque pixels.
- **Implementation contract and audit manifest**.

**No superseded archives, earlier failed SIDEKICK candidates, contact sheets, cropped closeups, or obsolete drafts** are included.

## Approval and fidelity boundary — read before coding

- These three SIDEKICKs were generated as new text-free variants. **They are NOT proven pixel-identical to the 37 original approved/reference screen renders.** Their statue, paper edges, scale and internal art may differ. Do not describe the SIDEKICKs as pixel-perfect extractions.
- The 22 transparent PNGs are separately generated or previously separated assets, **not verified same-pixel cutouts** from those SIDEKICKs. They require placement/scale/shadow alignment and the SIDEKICK underneath each moving object must be cleanly reconstructed (no duplicates or halos).
- Some generated PNGs combine scene and parchment, and should not be interpreted as four independent account-card extractions. Opus must use the source full-screen authorities for exact layout and must produce a source-to-layer mapping.
- The 37 screen designs are **founder-review references, not automatic approval of every financial control or text value**. Approved primary MONEY parent composition is the highest visual authority. Verify any new assets with founder before production substitution.
- Do **not** silently regenerate and replace original art; stop/fail fidelity QA when exact alignment is unavailable.

## Visual and functional rules

- Preserve permanent small blank JURNL torn parchment in the top-left corner of each SIDEKICK; render the actual JURNL lettering as live UI.
- All **non-cursive text uppercase** (including field values and buttons); any **cursive lowercase only**, sparingly (0–1 occurrence near main header ideally; no decorative cursive everywhere).
- Fixed bottom navigation **HOME / MONEY / ADD / PLAN / CREDIT**; MONEY active. No circular tappable controls.
- Live values and icons must not be baked into SIDEKICKs or decorative PNGs.
- Receipt-first purchase entry: capture or upload real receipt, extract fields, editable verification, duplicate/exception handling, user approval prior to canonical ledger mutation.
- PR #1706 financial stabilization controls balances, credit liabilities, pending vs in-transit transfer settlement, reservations and 30-day SAFE TO SPEND formula. Sample dollar amounts in visual references are fake.
- No page-level scroll on primary screens; contained intrinsic scroll only; respect iOS safe areas and reduced-motion.

## Suggested workflow

1. Compare every SIDEKICK to original reference at actual viewport coordinates; retain/repair upper-left parchment, paper edges, artwork and environmental composition.
2. Validate alpha, shadows and transparency of each of 22 assets; do not use checkerboard/black as baked background.
3. Identify whether moving any layer reveals a duplicate in the SIDEKICK. Rebuild underlayers before using parallax/lifts.
4. Produce a source-verified static reconstruction for **parent and one expanded account screen** (responsive mobile); verify against source screenshots.
5. Prototype parent paper settlement/card lift/four-dot carousel and expanded-account transition/overlay with working controls. Prefer transform/opacity, restrained timing, and reduced-motion equivalent.
6. Regression-test dynamic data bindings, ledger invariants, receipt capture, navigation, accessibility, performance. Send draft PR, proof images/video, QA, and report all fidelity mismatches. Do not merge or deploy.

See `04_IMPLEMENTATION_SPECS/MOTION_AND_FIDELITY_CONTRACT.md` and `04_IMPLEMENTATION_SPECS/ASSET_MANIFEST.json`.
