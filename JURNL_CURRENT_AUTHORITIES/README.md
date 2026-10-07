# JURNL current authority asset kits

Production ingredients for Opus. These are not pages.

Stack each screen as:

1. `environment-plate.jpg` — full-bleed photograph. No navigation, no buttons, no live numbers.
2. The signature object PNG — RGBA, same frame as the plate. Writable areas are blank.
3. The overlay PNG, when present.
4. Live HTML for type, values, buttons, and the dock.

`authority-source.jpg` is the founder reference for geometry. Do not mount it as the page.

Artboard authorities are 2016×3584 (9:16), matching the 941×1672 attachments. Phone-board authorities (Safe to Spend, Why This Number, Account profile, Account notifications) are 1632×3808 (9:21), the nearest Sunburst ratio to those taller crops.

Select an Account reuses the Select a Category plate. Account notifications reuses the Account profile plate. The menu sheet sits on the Account settings plate, dimmed in CSS.

Thumbnails live in `THUMBNAILS/CATEGORIES` and `THUMBNAILS/ACCOUNTS`.

Quick Add was not in this attachment set and was not fabricated.

Each folder has `manifest.json` with anchors and the live-UI strings that must stay in React.
