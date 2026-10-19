# 14 · Attribution architecture

Boards: R12–R15, R43. Components RF-040…RF-045, RF-080. Edge cases: doc 15.

## 1. Requirements (from the sprint)
- **Durable:** survives restarts and is persisted in the database. Never in-memory only, and never a per-process random id (the #1657 lesson).
- **Non-guessable:** public codes have ≥ 96 bits of entropy. They are not derived from names or sequences.
- **Server-validated:** the server resolves the code to a partner. A partner id supplied by the client (query, form, local storage, header) is **never evidence**.
- **Write-once:** one attribution per DF artifact, idempotent. Later touches cannot overwrite it.
- **Explainable:** every step carries an evidence class and can be traced (source trace).

## 2. Flow

```
1  CARD / LINK      https://site00.com/invite/<code>          code = opaque, ≥ 96 bits, base64url (existing newPersonalizedInvitationCode: 128 bits)
2  RESOLVE          GET /api/site00/invitation?code=…          server: code → {campaign, partner, status}; never returns partner id or terms
3  VISIT            recordInvitationVisit                      anonymous_visit_key, traffic_class, dedupe_bucket; rate-limited
4  CONTEXT          server-side referral context               opaque context id in an httpOnly, Secure, SameSite=Lax first-party cookie;
                                                               the cookie holds no partner id; the server maps context → visit → code
5  BEGIN            existing activation (beginSecureActivation → completeVerifiedActivation)
6  ARTIFACT         createArtifactForLeadDurable               DF artifact persisted first (the #1657 durable path)
7  ATTRIBUTE        attributionResolver (RF-045)               applies FD-R07 window, FD-R08 touch model, FD-R09 existing/self rules;
                                                               writes ONE row (idempotency key = artifact id) with policy_version
8  EVENTS           referral_business_events                   INVITATION_SCANNED … ATTRIBUTION_CAPTURED, each idempotent
9  PAYMENT          webhook → payment evidence                 amount + ids recorded (gap G-RF-08) → commission engine (doc 16)
```

## 3. What counts as evidence

| Evidence | Class | Can attribute? |
| --- | --- | --- |
| Code resolved server-side in the same session that created the artifact | OBSERVED | **Yes** |
| Server context still valid on the same browser within the approved window | OBSERVED | Yes, once FD-R07 is set |
| Collision of two partners' contexts | OBSERVED | No — exception (RO-18) |
| Founder correction with a written reason and evidence | ATTRIBUTED (manual) | Yes, via RO-19 (FD-R18) |
| Card handed out, verbal referral | UNAVAILABLE | Only through RO-19 |
| Partner id in a URL, form field or client storage | — | **Never** (tamper signal logged) |
| UTM / `?ref=` parameters | — | Not captured (no such route; none added) |
| Projected conversions / next payout | ESTIMATED | Never drives money |

**OBSERVED and ATTRIBUTED may drive money once policy is approved. ESTIMATED and UNAVAILABLE never do.**

## 4. Attribution states

| State | Meaning | Repository |
| --- | --- | --- |
| UNATTRIBUTED | No valid referral context | — (no row) |
| ATTRIBUTED | One partner, rules satisfied | `ClientAcquisitionAttribution.eligibility = CANDIDATE` |
| EXCEPTION | Needs founder review (collision, cross-device claim, duplicate artifact) | new `attribution_exceptions` (doc 25) |
| DISQUALIFIED | Existing client, self-referral, related party, tamper | `eligibility = DISQUALIFIED` + `disqualification_reason` |
| CORRECTED | Founder changed the partner or removed attribution | correction event + new row version (original kept) |

## 5. Ledger and trace (UI)

- **Ledger:** REFERRAL · CLIENT · PARTNER · VIA (CARD Vn · QR / LINK · SHARED) · INTAKE · CONVERSION · COMMISSION. Rows open the trace; the client cell opens FOUNDATIONS.
- **Trace:** timestamped steps, each tagged with its evidence class, plus linked records (client, artifact, link, commission, payout).
- **Exceptions:** a queue with RESOLVE → RO-18 (keep current / reassign / no partner) → RO-19 correction (reason required, blocked after PAID unless FD-R18).

## 6. Privacy
- **Visit records:** the user agent is kept only as a coarse class. IP addresses are not stored in the attribution record; abuse monitoring uses rate-limit counters with a short retention.
- **Partner view:** the partner sees masked client labels only (FD-R11).
- **Client view:** the client never sees the partner, the terms or the attribution (`clientProjection.ts` invariant).

## 7. What is deliberately not built
- No client-side attribution cookie containing the partner.
- No fingerprinting.
- No cross-device stitching beyond the client's own private DF link.
- No automatic attribution from email-domain guesses.
