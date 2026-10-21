# 13 · Approved asset and font audit

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


- Fonts in use across all 168 page captures and 116 overlay captures (computed `font-family` of every `.ws` element):
  **SITE 00 Display** and **Saira Semi Condensed** only. Font gate (`ws--fonts-pending`) awaited before capture.
- Tokens: all colours / spacing / type sizes come from `ifw-authority.css` custom properties; `ifw-recovery2.css` and
  `ifw-referrals.css` add no new palette (the foil gradient is built from the authority reds `#ce1017` / ink tints).
- Icons: DF monoline glyph set (`WsIcon`) — no emoji icons.
- Imagery: approved environment plates already in `public/` (`cs-env-pavilion.webp`, `cs-env-doorway.webp`,
  `cs-env-red-glass-tall.webp`, FNDATN-01 invitation hero) — referenced by the OPUS3 `rf-img` classes; DF architecture objects
  (crown, corner fragment). No new images generated; no image-generation credits spent.
- Absent by audit: default blue links / controls (0), native select / checkbox / radio (0 rendered; source test forbids
  them), Bootstrap-like buttons, pill cards, colourful charts.

APPROVED_TOKENS: YES · APPROVED_FONTS: YES · APPROVED_ASSETS: YES · BLUE_DEFAULT_CONTROLS_ABSENT: YES
