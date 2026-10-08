# Responsive email rules

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

| Viewport | Range (px) | Canonical | Note |
|---|---|---|---|
| MOBILE | 320–480 | 375 | Phone mail apps (Apple Mail iOS, Gmail iOS / Android, Outlook mobile). |
| DESKTOP | 600–700 | 640 | Desktop and webmail reading panes; content never wider than 640 px. |

- **Max content width:** 640 px. L0 canvas colour fills the client width; the 640 px container is centred.
- **Gutters:** desktop 40 px, mobile 20 px.
- **Text:** body ≥ 16 px, legal ≥ 12 px, line height 1.55–1.65 for body. Never shrink body below 16 px on mobile; iOS enlarges small text unpredictably.
- **CTA:** ≥ 44 px desktop, ≥ 48 px mobile, 100% of the content column on mobile. Bulletproof table button; the whole cell is the link.
- **Edge-safe:** No live content within 20 px of the container edge on mobile, 40 px on desktop; torn / deckled edges sit in that margin.
- **Column collapse:** Columns collapse at 480 px; a collapsed column keeps its heading above its rows.
- **Fallback background:** Every image cell has a background colour matching the paper or canvas, so an image-blocked email still reads as paper on stone.
- **Image-blocked:** With images off, the email must read completely: headline, body, figures, CTA, notice and footer are all HTML on HTML colours, and the alt text of meaningful images says what they show.

### Stacking
- Single column below 480 px: every two-column module (EC04, EC08, EC10, EC11) stacks in reading order.
- Stacking uses fluid-hybrid tables (inline-block columns with max-width), so clients without media-query support still stack.

### Images
- Every image has explicit width / height attributes, max-width: 100% and height: auto.
- Hero / environment art is exported at 2× (1280 px) for 640 px display.
- A separate mobile crop is allowed when the desktop crop would lose the artifact (art-direction swap via <picture> is not reliable in email; use a hidden-by-default mobile image only where the client matrix allows).

### Crop rules
- The artifact (L2) is never cropped off; environment (L1) crops first.
- Classical fragments may crop dramatically; faces are never cut through the eyes.

### Dark mode
- Declare color-scheme light dark and supported-color-schemes; provide [data-ogsc] / prefers-color-scheme overrides where supported.
- Paper cells keep a light paper colour in dark mode where the client allows (the artifact is an object, not UI chrome); text colour must still pass on both.
- Transparent PNG edges are designed against both the light canvas and #1C1A16.
- Logos and dark ink marks get a light paper backing, never sit directly on the canvas.

## Email-safe implementation doctrine
- Robust email HTML: table layouts for structure where client compatibility needs them (Outlook desktop renders with Word).
- Inline styles for everything that must survive; a <style> block only for progressive enhancement (media queries, dark mode).
- Real text, real links, meaningful alt text; no critical message only inside an image.
- Readable fallback backgrounds behind every image; graceful image-blocked state.
- Touch-safe CTAs (≥ 44 px, ≥ 48 px on mobile) built as bulletproof buttons.
- Dark-mode aware, never dark-mode dependent.
- No JavaScript, no forms, no web fonts that the layout depends on, no background-image as the only carrier of a design element that matters, no CSS grid / flex for structure.
- multipart/alternative with a plain-text part on every send.
- Total HTML under 102 KB so Gmail does not clip the message.
- Do not require bleeding-edge browser CSS to preserve the authority.

## Accessibility gates
| Gate | Requirement |
|---|---|
| READING_ORDER | Source order equals visual order on both viewports; layout tables carry role="presentation". |
| CONTRAST | Body and CTA text ≥ 4.5:1; large display text ≥ 3:1; checked on the paper and canvas colours in light and dark. |
| ALT_TEXT | Decorative images alt=""; meaningful images describe their meaning; no image carries text the reader needs. |
| NOT_VISUAL_ONLY | No message, status or figure is conveyed only by colour, position or imagery. |
| TAP_TARGETS | Links and buttons ≥ 44 × 44 px; inline links separated by at least 8 px. |
| BODY_READABILITY | Body ≥ 16 px, sentence case, ≤ 70 characters per line on desktop. |
| DESCRIPTIVE_CTA | CTA text names the action (VERIFY MY EMAIL), never CLICK HERE. |
| HEADING_HIERARCHY | One h1 (the headline); section labels are headings or table headers in order. |
| SCREEN_READER_LAYOUT | lang attribute set; preheader hidden from view but not from the summary; decorative regions aria-hidden. |

## Client matrix

Apple Mail iOS (light / dark) · Apple Mail macOS · Gmail iOS · Gmail Android · Gmail web · Outlook iOS · Outlook desktop (Windows) · Outlook.com · Yahoo Mail web
