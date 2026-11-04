# 12 · Security and privacy

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

| Area | Status | Evidence |
|---|---|---|
| Receipt photos stay on the device | ✔ IndexedDB `jurnl-receipts`, keyed per user (`<user>::<receipt id>`); never uploaded | browser test: no request body > 20 kB during scan → save; OCR files same-origin |
| No receipt contents in logs / analytics | ✔ | browser test: no console line contains receipt text (merchant, items, card digits) |
| No third-party OCR / CDN | ✔ tesseract.js worker, cores and model are self-hosted under `/jurnl/ocr` (licences in `public/jurnl/ocr/README.md`) | network list in the receipt test |
| Camera | ✔ only after the user taps TAKE PHOTO; preview stays in the page; the stream stops after CAPTURE or close | browser test: no `<video>` left after capture |
| No private receipt URLs exposed | ✔ object URLs only, revoked when the page leaves | `receiptStore.ts`, `DetailPages.tsx` |
| Card number | ✔ only the last 4, as `•••• 1234`; never a full number | `AddAccountOverlay` refuses anything but 4 digits |
| Row-level security | unchanged; no migration, no policy touched | diff contains no SQL |
| Live RLS proof (cross-user read / write) | **PREREQUISITE_BLOCKED**: QA secrets are not available in this environment; the test did not run, so it is not reported as failed | as in #1706 |
| Production database | no mutation; synthetic local data only | — |
| Secrets | none added, printed or committed; the evidence ZIPs were scanned for secret patterns | ZIP build log |
| Paid providers | none called; $0 | — |

## Not built (needs a founder decision)

Cloud receipt storage would need a private bucket with RLS by owner, signed URLs with a short expiry, and a retention policy. Until then a receipt photo exists only on the device that scanned it. The transaction says so.
