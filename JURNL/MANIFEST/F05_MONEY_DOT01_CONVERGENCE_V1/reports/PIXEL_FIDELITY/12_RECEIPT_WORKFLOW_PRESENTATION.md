# 12 · Receipt workflow presentation (26–29, 33, 34)

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

Unchanged functionally (on-device OCR, review before save, duplicates stop, failures keep the photo). Presentation: overlay headings, paper chips, serif review fields, JURNL select / date in REVIEW PURCHASE (28). The scan block on 16 / 18 / 19 now opens the receipt flow from the founder's scan art.

| Screen | After | Remaining |
|---|---|---|
| 26 CAPTURE RECEIPT | heading geometry; paper back tile (SK03 pixel pair) | the sample receipt printed in the authority (the runtime shows the camera) |
| 27 SCANNING RECEIPT | heading | scan corners / beam await Batch 06; step list falls below the fold at 393 × 852 (internal scroll) |
| 28 REVIEW EXTRACTED PURCHASE | heading; JURNL select / date; serif | receipt preview beside the read values (structural) |
| 29 RECEIPT EXCEPTION / DUPLICATE | heading | duplicate comparison papers + red notice await Batch 06 (OVERLAY.RECEIPT.DUPLICATE, STATUS.RED) |
| 33 TRANSACTION REVIEW | heading; serif rows | receipt preview left, totals paper (structural) |
| 34 RECEIPT CAPTURE FAILURE | heading | caution surface (Batch 06) |
