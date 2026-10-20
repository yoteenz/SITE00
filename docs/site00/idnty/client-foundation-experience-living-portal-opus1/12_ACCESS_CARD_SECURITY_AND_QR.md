# 12 — Access Card Security and QR — RETIRED

> **RETIRED · NOT FOR IMPLEMENTATION.** With the access card retired (LOCK1 L-05), the card QR, the `?card=` parameter, card ids, card hashing, revocation and file contracts are all out of scope. **G-11 is retired.**

**What survives, because it was never card-specific:**
- the bearer-token threat model (the token must never appear in any shortcut, icon, file, log or analytics payload);
- rate limits on `/foundation/return` and on email challenges;
- non-enumerating reentry responses;
- general link revocation (the "LINK REPLACED" state).

These now live in [LOCK1 06 — Secure reentry contract](../client-foundation-digital-access-authority-lock1/06_SECURE_REENTRY_CONTRACT.md) and in `28`.

Historical text: [archive/12_ACCESS_CARD_SECURITY_AND_QR.ARCHIVED.md](archive/12_ACCESS_CARD_SECURITY_AND_QR.ARCHIVED.md).
