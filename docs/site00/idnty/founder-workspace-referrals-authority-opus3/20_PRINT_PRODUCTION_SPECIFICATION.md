# 20 · Print-production specification

Boards: R33 (proof + print path), R34 (proof canvases B/C, TEST-marked file, spec table).

**No final printer file may be produced with a placeholder or staging QR destination.** Export is blocked until all six gate items pass (doc 18 §2 #13).

## 1. Geometry
| Item | Value |
| --- | --- |
| Trim | 3.5 × 2 in (88.9 × 50.8 mm) |
| Bleed | 0.125 in on each side → 3.75 × 2.25 in canvas |
| Safe area | 0.125 in inside trim (3.25 × 1.75 in); QR, URL, partner line and all type inside |
| Corner | Square (rectilinear SITE 00 geometry); rounded corners not proposed |

The proof canvas in R33/R34 draws bleed (red dash), trim (black) and safe (green dash). Its bleed fill is an **approximation** (the artwork stretched about the trim centre). Final files must extend photographs natively into the bleed.

## 2. Colour
- Deliver CMYK PDF/X-1a or PDF/X-4 (printer's choice).
- **Red:** proofed against SITE 00 `#CE1017`. Territory C may use spot red (Pantone to be matched — asset A-04).
- **Black:** 100 K for type and the QR; rich black (60/40/40/100) only for large solid areas and never under small type.
- No RGB images in the final file. Images ≥ 300 ppi at print size.

## 3. Typography
- SITE 00 Display and Saira Semi Condensed, embedded or outlined.
- Minimum 6 pt; the URL ≥ 7 pt; the partner name ≥ 7 pt.

## 4. QR
| Item | Value |
| --- | --- |
| Payload | `https://site00.com/invite/<code>` only |
| Size | ≥ 0.8 in (20 mm) square; module ≥ 0.5 mm |
| Quiet zone | 4 modules on every side, white |
| Error correction | H (existing `renderInvitationQrSvg`) or M if density requires; decided at proof |
| Rendering | Vector, 100 K on white, never over a photograph, never red-on-red |

## 5. Stock and finish (FD-R14)
| Territory | Proposed |
| --- | --- |
| A | 16 pt matte, soft-touch laminate front |
| B | 32 pt uncoated duplex, optional red edge paint |
| C | 16 pt matte, spot red |

## 6. Files
- One PDF per side per partner per template version.
- The filename carries a hash of the partner code and the template version, e.g. `SITE00-DF-REFERRAL_A_v1_FRONT_<code-hash8>.pdf`. It never carries an admin id, a database UUID or a partner email.
- A sidecar JSON (not sent to the printer) records the partner ref, template version, QR validation id, device-scan record, proof approval, and operator.

## 7. Pre-approval marking
Every file produced before the gate passes carries:
- the **STAGING TEST · NOT FOR PRINT** band across the top of both sides (R34 §02);
- the NOT VALID FOR PRINT label on the QR.

These marks are removed only by the export step after the gate.

## 8. Printer workflow
Export → printer's digital proof → founder approval (RO-10) → **physical proof** (one sheet; scan the QR on two phones, iOS and Android) → print run → batch status PRINTED → DISTRIBUTED when handed to the partner.
