# Opus mount map — eight global overlays

Native shell pixels are 2016×3584 (9:16). Foreground objects are 2048×2048. Scale with one uniform factor. Do not stretch torn edges. Do not install the founder JPEGs or the magenta source plates.

Short phone (393×660): `scale = min(393/2016, 660/3584)` so the shell fits the height with side margin. Tall phone (393×852): `scale = 393/2016` (drawn height ≈ 699) and center vertically in the overlay, or top-align under the status inset. The page does not scroll. Long lists scroll inside the safe region named below.

Close control is live code (square-rounded), not the round mark in the founder JPEG. Z-order bottom to top: blurred live screen (OV04 only) or sidekick, inner shell, live type and controls, foreground object.

Visible alpha bounds are inclusive pixel coordinates on the delivered PNG (`alpha > 16`).

## OV01 MONEY ACTION

- OVERLAY_ID: OV01
- SOURCE_AUTHORITY: founder money-action JPEG (941×1672), image-to-image history `HCqEEv9XKNKAd13vlVuk`
- OUTER_SIDEKICK: existing SK01 money collage. This shell already includes bust, arch, coast, and drapery, so do not stack a second SK01 under it or the sculpture doubles.
- INNER_SHELL_FILE: `OV01-IS-MONEY-ACTION-SHEET.png`
- FOREGROUND_ART_FILES: `FG01-AMPHORA.png`, `FG02-ROMAN-PORTRAIT-COIN.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–2015, y 0–3577
- RELATIVE_POSITION: full overlay, uniform scale, centered
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain as above
- CONTENT_SAFE_AREAS: headline parchment roughly y 0.22–0.40; upper action folio y 0.42–0.62 left 70%; lower action folio y 0.64–0.84 left 70%. Leave the amphora (right of upper folio) and coin (right of lower folio) clear of type.
- SCROLL_CONTAINER: none on 852; if 660 clips the lower folio, scroll the two action rows inside the shell, not the page
- BUTTON_REGIONS: the two blank action folios are the hit targets
- LIVE_INPUT_REGIONS: none
- OVERLAY_CLOSE_BEHAVIOR: live close control, top end
- Z_INDEX_ORDER: shell, live titles, FG01 and FG02 only if the shell's own amphora and coin are hidden. Default: do not double-place FG on top of the shell copies.
- RELEVANT_EXISTING_COMPONENT: editorial money action sheet (`MoneyOverlays` / action editorial)
- MOUNTING_WARNINGS: shell already contains amphora and coin. FG files are the isolated extracts for a later split, not a second copy.

## OV02 ADD A POCKET

- OVERLAY_ID: OV02
- SOURCE_AUTHORITY: founder add-pocket JPEG, history `bHqxXgFiWmLGe6JGhTfF`
- OUTER_SIDEKICK: shell includes oxblood and coast. Do not add a second environment plate behind it.
- INNER_SHELL_FILE: `OV02-IS-ADD-A-POCKET-FOLIO.png`
- FOREGROUND_ART_FILES: `FG03-MONEY-BAG-LAUREL-MEDALLION.png`, `FG04-BRONZE-COIN-STACKS.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–2015, y 0–3583
- RELATIVE_POSITION: full overlay, uniform scale
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain
- CONTENT_SAFE_AREAS: name well under the header; five blank type panels in the middle; opening-balance well above the coin stacks; two footer buttons. Do not cover the medallion (upper left) or coin stacks (lower right).
- SCROLL_CONTAINER: form body scrolls inside the folio on 660 and when the keyboard is open. Footer buttons stay visible.
- BUTTON_REGIONS: two blank footer shapes (cancel, create)
- LIVE_INPUT_REGIONS: name well, five type panels, balance well
- OVERLAY_CLOSE_BEHAVIOR: live close, top end; cancel button
- Z_INDEX_ORDER: shell, live form, FG03/FG04 only if shell ornaments are hidden
- RELEVANT_EXISTING_COMPONENT: `AddPlaceSheet`
- MOUNTING_WARNINGS: five type wells match the founder form. Do not bake rideshare copy into the art. Medallion and coins are already in the shell.

## OV03 MOVE MONEY

- OVERLAY_ID: OV03
- SOURCE_AUTHORITY: founder move-money JPEG, history `dOIl5QrHPyejsEI0XbV1`
- OUTER_SIDEKICK: shell includes bust, arch, lemons, coast. Do not restack SK01 under it.
- INNER_SHELL_FILE: `OV03-IS-MOVE-MONEY-FOLIO.png`
- FOREGROUND_ART_FILES: `FG05-OXBLOOD-DIRECTIONAL-WAX-SEAL.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–2015, y 0–3583
- RELATIVE_POSITION: full overlay, uniform scale
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain
- CONTENT_SAFE_AREAS: header parchment; from-well and to-well (illustration insets stay); amount well; date well; two footer buttons. Wax seal sits between the wells.
- SCROLL_CONTAINER: folio body on 660 and with keyboard; footer stays put
- BUTTON_REGIONS: two footer buttons; the two account wells open pickers
- LIVE_INPUT_REGIONS: amount, date, from account, to account
- OVERLAY_CLOSE_BEHAVIOR: live close; cancel
- Z_INDEX_ORDER: shell, live values, FG05 only if the shell seal is hidden
- RELEVANT_EXISTING_COMPONENT: `TransferSheet`
- MOUNTING_WARNINGS: seal is already in the shell between the wells.

## OV04 MANAGE POCKET

- OVERLAY_ID: OV04
- SOURCE_AUTHORITY: founder manage-pocket JPEG, history `jYe03OpxiQMRc2Zlzg9Z`
- OUTER_SIDEKICK: none in the PNG. Blur the live account screen in code (`backdrop-filter`). The shell's outside is transparent.
- INNER_SHELL_FILE: `OV04-IS-MANAGE-POCKET-POPOVER.png`
- FOREGROUND_ART_FILES: `FG06-COPPER-PAPERCLIP.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584, opaque card only inside bounds below
- VISIBLE_ALPHA_BOUNDS: x 37–1941, y 871–2587
- RELATIVE_POSITION: place the PNG full-frame (same 9:16 as the phone) so the card lands in that band. Do not crop to the bbox and then recenter or the card jumps.
- RESPONSIVE_SCALE_BEHAVIOR: same uniform scale as the phone frame. Card stays about 85% of width.
- CONTENT_SAFE_AREAS: upper sheet for pocket name and kind; two horizontal strips. The lower strip is salmon paper (material, not a label).
- SCROLL_CONTAINER: none
- BUTTON_REGIONS: upper strip rename, lower strip delete
- LIVE_INPUT_REGIONS: none on this card; rename opens the next sheet
- OVERLAY_CLOSE_BEHAVIOR: tap outside the card bounds, or a live close
- Z_INDEX_ORDER: blurred screen, shell, live labels. Paperclip is already on the shell. Do not add FG06 on top of it.
- RELEVANT_EXISTING_COMPONENT: pocket manager popover in `dot01/PocketManager`
- MOUNTING_WARNINGS: salmon strip is blank paper for the delete action. Do not key it out.

## OV05 SEARCH

- OVERLAY_ID: OV05
- SOURCE_AUTHORITY: founder search JPEG, history `d02Sw3Z0iAw6mWhUQfJ0`
- OUTER_SIDEKICK: shell includes arch, sea, velvet, and blank ledgers. Do not stack another arch behind it.
- INNER_SHELL_FILE: `OV05-IS-SEARCH-FOLIO.png`
- FOREGROUND_ART_FILES: `FG07-ARCHIVAL-LEDGER-STACK.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–1995, y 0–3583
- RELATIVE_POSITION: full overlay, uniform scale
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain
- CONTENT_SAFE_AREAS: header; search well; three filter chips; result list on the right of the ledgers. Ledger spines are blank.
- SCROLL_CONTAINER: result list only
- BUTTON_REGIONS: three filter chips; result rows are live
- LIVE_INPUT_REGIONS: search field
- OVERLAY_CLOSE_BEHAVIOR: live close, top end
- Z_INDEX_ORDER: shell, live search UI. FG07 only if shell ledgers are hidden.
- RELEVANT_EXISTING_COMPONENT: `SearchDrawer`
- MOUNTING_WARNINGS: do not print ACCOUNT / TRANSACTIONS / CATEGORIES on the books.

## OV06 ACCOUNT SETTINGS

- OVERLAY_ID: OV06
- SOURCE_AUTHORITY: founder account JPEG used as the connected folio for the approved F09 account drawer. History `rFIcyqylgky4YFHDQybE`. This does not replace the F09 sidekick plate.
- OUTER_SIDEKICK: keep the approved F09 account environment if the drawer already has one. This shell is the folio, not a new room.
- INNER_SHELL_FILE: `OV06-IS-ACCOUNT-SETTINGS-DRAWER.png`
- FOREGROUND_ART_FILES: `FG08-CLASSICAL-HEAD-LAUREL-MEDALLION.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–2015, y 0–3583
- RELATIVE_POSITION: full overlay, uniform scale
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain
- CONTENT_SAFE_AREAS: header; three row bands (profile, currency, privacy); dark sign-out strip. Medallion stays upper left.
- SCROLL_CONTAINER: row stack if more account rows are added later; current three rows fit 852
- BUTTON_REGIONS: three rows and the sign-out strip
- LIVE_INPUT_REGIONS: none on the drawer face
- OVERLAY_CLOSE_BEHAVIOR: live close; sign-out is a row, not the close
- Z_INDEX_ORDER: shell, live labels. FG08 only if the shell medallion is hidden.
- RELEVANT_EXISTING_COMPONENT: `AccountDrawer` in `AccountScreens.tsx`
- MOUNTING_WARNINGS: do not swap this folio for an unapproved alternate layout. Row copy is live.

## OV07 ARCHIVE BLOCKED

- OVERLAY_ID: OV07
- SOURCE_AUTHORITY: founder archive-blocked JPEG, history `rLEPKDpEhazPakzrosnY`
- OUTER_SIDEKICK: shell includes oxblood, bust, column, and coast.
- INNER_SHELL_FILE: `OV07-IS-ARCHIVE-BLOCKED-CAUTION.png`
- FOREGROUND_ART_FILES: `FG09-CAUTION-LAUREL-MEDALLION.png`
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–2015, y 0–3583
- RELATIVE_POSITION: full overlay, uniform scale
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain
- CONTENT_SAFE_AREAS: warning header; two blocker rows; two footer buttons (resolve, close). Caution medallion upper left.
- SCROLL_CONTAINER: blocker list, required on 660
- BUTTON_REGIONS: each blocker row, resolve, close
- LIVE_INPUT_REGIONS: none
- OVERLAY_CLOSE_BEHAVIOR: close button and live close
- Z_INDEX_ORDER: shell, live blocker text. FG09 only if the shell medallion is hidden.
- RELEVANT_EXISTING_COMPONENT: no dedicated screen yet; mount as a blocking overlay from account archive
- MOUNTING_WARNINGS: amounts and statuses are live. Do not bake $1,260 or “1 scheduled”.

## OV08 GLOBAL MENU

- OVERLAY_ID: OV08
- SOURCE_AUTHORITY: founder menu JPEG for materials only. The seven baked labels are retired. History `35Tf54UFja4FjgVwZf2I`
- OUTER_SIDEKICK: shell includes bust, lemons, arch, coast, and oxblood. Do not stack a second arch.
- INNER_SHELL_FILE: `OV08-IS-GLOBAL-MENU-DRAWER.png`
- FOREGROUND_ART_FILES: none
- NATIVE_ASSET_DIMENSIONS: 2016×3584
- VISIBLE_ALPHA_BOUNDS: x 0–2015, y 0–3583
- RELATIVE_POSITION: full overlay, uniform scale
- RESPONSIVE_SCALE_BEHAVIOR: uniform contain
- CONTENT_SAFE_AREAS: small headline parchment at the top; deep olive field from about y 0.28 to y 0.92, inset from the arch on the right. That field is the scrollport.
- SCROLL_CONTAINER: the olive field only. Sections, in order: YOUR FINANCES (Connected accounts & sync, Currency & exchange, Safe to spend buffer); YOUR INTELLIGENCE (Ask Jurnl, Classification & learning rules); YOUR ACCOUNT (Account & profile, Preferences, Privacy & consents, My membership, Explore add-ons, Help & support, Sign out). No page scroll.
- BUTTON_REGIONS: one live row per item above
- LIVE_INPUT_REGIONS: none
- OVERLAY_CLOSE_BEHAVIOR: live close, top end
- Z_INDEX_ORDER: shell, section labels, rows
- RELEVANT_EXISTING_COMPONENT: global menu opened from corner chrome. Account rows can route into `AccountDrawer`. Ask Jurnl routes to `AskJurnlSheet`.
- MOUNTING_WARNINGS: the olive field is intentionally empty. Do not draw the old seven-row artwork back in.

## SK04

- File: `SK04-INTELLIGENCE-STUDY.png`
- Opaque 2016×3584 environment candidate. Not an overlay shell. Not a replacement for SK01, SK02, or SK03.
- UI-safe region: the dark desk, center and lower middle. Keep the bust, books, arch, and armillary at the margins.
- Uniform contain. Do not stretch.
