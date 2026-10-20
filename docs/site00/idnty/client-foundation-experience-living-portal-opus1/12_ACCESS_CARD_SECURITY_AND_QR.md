# 12 — Access Card Security and QR

Boards: **AH09**, AH06, M09, D11, X08.

## Threat model

The card will be printed, photographed, shared in chats and left on desks. Therefore:

1. **Possession of the card is not authentication.** Scanning never signs anyone in by itself.
2. **The QR is not the bearer link.** `/foundation/:token` is a non-expiring bearer capability today (finding 3). Putting it on a printable image would hand full read and write access to anyone who sees the card. **It must never appear in card pixels, file names, image metadata, share payloads, logs or analytics.**
3. **The card carries no secret.** There are no passwords, API tokens, service-role keys, session ids, unrestricted links or email addresses on it. A printable card never has a password.
4. **The card is revocable.** Replacing the card voids the old code immediately.

## QR payload

```
https://site00.com/foundation/return?card=<card_id>
```

| Property | Rule |
|---|---|
| `card_id` | 10 characters from an unambiguous alphabet (≥ 50 bits) via CSPRNG, displayed nowhere else, distinct from `public_token`, `client_ref` and referral codes |
| Storage | Stored **hashed** (SHA-256 with a server pepper) with `artifact_id`, `version`, `issued_at`, `revoked_at` |
| Grants | Nothing. It only tells `/foundation/return` which foundation the scanner is probably trying to reach, so the reentry page can say "CONFIRM IT'S YOU" and send the email to the address on file **without revealing it** |
| Session present + same artifact | Open the portal (the session authenticates, not the card) |
| Session present + different artifact | WRONG IDENTITY state (`13`) |
| No session | VERIFY: the client enters their email; the server sends a link and code only if it matches. The response is identical either way |
| Revoked id | REVOKED: "THIS CARD WAS REPLACED", then email verification |
| Unknown id | NOT FOUND, worded the same as an invalid link |
| Rate limit | Per IP and per card_id on `/foundation/return` and on email-send |
| Logging | Log `card_id_hash` and the outcome. Never the bearer token or the email entered |

The client-safe reference printed on the card (for example `DF-7Q4M-K2`) is a display identifier for support conversations. It is **not** accepted by any endpoint as a credential.

## File contract

| File | Contains | Must not contain |
|---|---|---|
| PNG / share image / wallet-style | rendered pixels only | EXIF, XMP, PNG `tEXt`/`iTXt` chunks with URLs, the token, email, session |
| PDF | card artwork, steps, footer | Document metadata beyond the title "SITE 00 ACCESS CARD"; any URL other than the QR payload; JavaScript |
| File names | `my-foundation-card.png`, `my-foundation-card.pdf` | business name, ids |

Rendering happens client-side from the verified session's card data, or server-side from `card_id`. Either way the input never includes `public_token`.

## Validation (performed — see `32`)

- The board pipeline generates the specimen QR from the documented payload with the repository's `qrcode` dependency. The validator decodes the payload back from the rendered specimen and confirms it equals `https://site00.com/foundation/return?card=AC9T2W7HKX` and contains no `/foundation/<32-char token>` pattern.
- The validator scans every board source and specimen file for bearer-token-shaped strings (`/foundation/[A-Za-z0-9_-]{32}`) and finds none.

## Open

OD-06 (Wallet passes). OD-07 (whether the card can be issued before payment; recommended **after INTAKE_COMPLETE with a verified email**, because the client returns during review).
