# JURNL on-device receipt OCR (F05 DOT 01)

Self-hosted so a receipt image never leaves the device and no third-party CDN is contacted.

| File | From | Licence |
|---|---|---|
| `worker.min.js` | tesseract.js 7.0.0 `dist/` | Apache-2.0 |
| `core/tesseract-core-relaxedsimd-lstm.wasm.js`, `core/tesseract-core-simd-lstm.wasm.js`, `core/tesseract-core-lstm.wasm.js` (the engine picks relaxed SIMD, then SIMD, then plain, by what the browser supports) | tesseract.js-core 7.0.0 | Apache-2.0 |
| `lang/eng.traineddata.gz` | @tesseract.js-data/eng 1.0.0 (4.0.0_best_int) | MIT (data: Apache-2.0, Google tessdata) |

Loaded only when the user scans a receipt (lazy import of `tesseract.js`).
