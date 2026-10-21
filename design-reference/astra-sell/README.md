# SITE 00 — ASTRA SELL architectural reference handoff

**Status: ASSET UPLOAD PENDING.** This is a staging folder, not evidence that the ZIP is present. Do not start Blender construction until the file exists and is verified.

## Expected ZIP
`design-reference/astra-sell/SITE00_SELL_12_SHEET_ASTRA_PACKAGE.zip`

This archive was created in ChatGPT and contains **12 numbered visual architectural reference sheets (S01–S12) and a README**. The generated boards are artistic concept references, **not verified CAD or machine-precise dimensions**. Astra/Codex must reconcile geometry and conflicting labels.

## Upload protocol
Use the ZIP downloaded on an accessible device and upload it through GitHub's web interface to this branch at the exact expected path above. Keep this branch isolated; do not merge to main for reference handling.

Once uploaded, verify the file exists in GitHub and that the archive lists 12 PNGs and handoff notes:
```bash
git fetch origin
git switch assets/astra-sell-architecture-reference
unzip -t design-reference/astra-sell/SITE00_SELL_12_SHEET_ASTRA_PACKAGE.zip
unzip -l design-reference/astra-sell/SITE00_SELL_12_SHEET_ASTRA_PACKAGE.zip
```

## Astra contract
Use a separate working branch rooted in current Builder source. The above branch is an **asset source only**. Do not merge unrelated old main changes into in-flight Builder work. Prefer extracting or copying only this ZIP from the reference branch.

Before Blender: read all 12 boards, document conflicts, reconcile a coherent two-level cantilevered SELL model, and implement a **blockout only**. The final SELL camera must be straight-on and centered. Ground level: Offerings, Storefront, Checkout, Orders, Customers. Upper level: Revenue, Intelligence. Seven anchored regions; no extra camera zoom into the seven stations; selection changes the lower functional option panel while the 3D scene stays put. No fabricated pricing.

Do not modify the live WORK stage, pricing engine or IDNTY Foundation. Keep all changes in draft for founder review.
