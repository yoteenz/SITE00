# 10 · Receipt extraction architecture

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

**On-device and real.** No extraction provider is used, so no provider-side processing and no paid spend. Nothing is simulated, and nothing is saved automatically.

```
TAKE PHOTO ─ live preview in the SK03 frame (getUserMedia, rear camera) ─ CAPTURE (frame → JPEG)
           └ camera unavailable / denied → the device camera app (file input, capture=environment)
UPLOAD PHOTO ─ file input (JPG / PNG / WebP / HEIC; PDF refused with a plain message; ≤ 12 MB)
        │
        ▼ normalizeImage (decode, long side ≤ 1800 px, JPEG)  ·  sha256 (duplicate key)
        ▼ readReceiptText — tesseract.js 7.0.0 (Apache-2.0) in a web worker, English model (best_int, MIT/Apache-2.0)
        │   self-hosted under /jurnl/ocr (worker, relaxed-SIMD / SIMD / plain cores, eng.traineddata.gz; 11 MB, loaded
        │   only when a receipt is scanned) · real progress events drive the scan steps · 45 s timeout → failure
        ▼ parseReceiptText → merchant · date · total · subtotal · tax · tip · items · warnings
        │   uncertainty is kept: a value that cannot be read stays empty (never guessed) and is flagged
        │   (NO_MERCHANT / NO_DATE / NO_TOTAL / CONFLICTING_TOTALS / LOW_CONFIDENCE / NO_TEXT)
        ▼ REVIEW PURCHASE (28) — every value editable; uncertain fields highlighted; SUBTOTAL + TAX offered, not filled
        ▼ previewPurchase — duplicates (29) stop here: USE EXISTING ENTRY · SAVE AS NEW · FIX DETAILS · ENTER MANUALLY
        ▼ TRANSACTION REVIEW (33) — the canonical balance impact
        ▼ SAVE TRANSACTION — the image to IndexedDB on this device, then exactly one ledger entry with entry.receipt
          { receipt_id, stored: DEVICE, source, mime, captured_at, image_sha256, extracted (as read), edited[], ocr_confidence }
```

## Failure recovery (34)

The photo is kept, nothing is saved, and the screen offers TRY AGAIN / UPLOAD PHOTO / ENTER MANUALLY. The failure cases:

- an unreadable image (no text, blur, glare, cut off);
- a decode failure (HEIC outside Safari);
- an engine that cannot start;
- a timeout;
- an unsupported file.

## Proven in the browser (`jurnl-f05-dot01.e2e.ts`, `jurnl-f05-dot01-camera.e2e.ts`)

The test receipt is synthetic: a canvas-drawn receipt photo with paper texture, tilt and noise, whose date follows the test's own clock. It is uploaded through the real file input, and the app's own engine reads it. Nothing is stubbed.

- **Read correctly:** merchant `OSTERIA DEL PORTO`, total `84.20`, date yesterday.
- **Nothing saved early:** neither extraction nor review writes anything.
- **One save:** the save writes one entry, with `receipt.stored = DEVICE`, a 64-hex SHA-256 and `extracted.total = 84.20`. IndexedDB then holds 1 image.
- **Nothing leaves the device:** no request carries a body larger than 20 kB, the OCR files come from the same origin, and no console line contains receipt text.
- **Recovery and refusals:** a duplicate TRATTORIA receipt stops at 29 and saves nothing; a blank photo fails honestly, and ENTER MANUALLY then saves exactly one entry; a PDF is refused.
- **Live camera:** Chromium's fake camera gives a live preview, the frame is captured, the engine reads it, and the result is a failure or a review, never a save. The camera is released afterwards.

This is a real OCR run on synthetic images in Chromium. It is **not** a test with a printed receipt and a phone camera, and not iOS Safari (unavailable here).

## Not done (needs a founder decision)

- **Cloud receipt storage** would need a private storage bucket with row-level security and signed URLs. It is not built, and the images stay on the device: a receipt photo is not available on the user's other devices.
- **A paid OCR / AI provider** for better accuracy on hard receipts would need founder approval before any spend. The architecture would put it behind the same review step.
