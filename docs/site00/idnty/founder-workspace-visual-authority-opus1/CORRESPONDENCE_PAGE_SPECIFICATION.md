# 05 · Correspondence page specification

**Status:** PROPOSED. Boards 19 (mobile), 20 (desktop), 23 (test sends). Registry CO-01…CO-08. No Correspondence reference screen was attached.
**Route:** `/admin/site00/foundation/communications` (R6 path kept).
**Question:** what has been said and sent, and what can be sent?

## 1. Two channels, never confused

| Channel | State on staging | API | Persisted |
| --- | --- | --- | --- |
| **Portal messages** (founder ↔ client inside the client experience) | Working | `messages` (GET), `send-message` (POST, ≤ 8000 chars); the client can send only once PAID | Yes |
| **Lifecycle email** (Resend) | **Disabled by policy.** Every event in `communications/eventMap.ts` is `enabled:false`; `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` off → DRY_RUN | `email-timeline`, `prepare-test-invitation`, `dispatch-test-email` | Intents are memory-only (G-09) |

A policy banner leads the page: "EMAIL SENDING IS DISABLED BY POLICY ON STAGING (SITE00_DF_TRANSACTIONAL_EMAIL_SEND OFF). LIFECYCLE EMAILS ARE RECORDED AS DRY RUN. PORTAL MESSAGES ARE UNAFFECTED."

## 2. Tabs

| Tab | Content |
| --- | --- |
| MESSAGES | Threads by client: last line, who sent, status (YOU · SENT, AWAITING REPLY, READ), age. Thread: founder messages ink, client white, bodies keep case; composer with the PAID rule as a hint |
| INVITATIONS | Personal foundation invitation per client: prepare (renders the preview), recipient masked, link validity, the gate result |
| LIFECYCLE EMAIL | Every send intent: CLIENT · TEMPLATE · TRIGGER · STATUS · CHANNEL · WHEN; the lifecycle map (event → template id → enabled) |
| DELIVERY | Status per intent: DRY RUN, SIMULATED, QUEUED, ACCEPTED, SENT, DELIVERED, FAILED, BOUNCED, COMPLAINED, SUPPRESSED, SKIPPED (`SendIntentStatus`). **DELIVERED is only shown from the Resend webhook** |
| TEMPLATES ↗ | Opens Correspondence Studio (unchanged). No second editor |

## 3. The send gate (one rule for every send)

A send renders as available only when the specific intent passes gates 1–5 (`deliveryWorker.ts:127-207`):
1. not a DRY_RUN intent;
2. a synthetic artifact or test mode;
3. recipient on the allowlist;
4. send flag on;
5. a renderer exists.

Gate 6 (no Resend key → SIMULATED) and gate 7 (Resend → ACCEPTED or FAILED) follow. Otherwise the control reads `SEND DISABLED · <REASON>` with policy hatching.

When a send is possible (synthetic clients in TEST LAB), every send uses the same sheet: preview, recipient (masked), template id, link validity, gates, and the **FOUNDER APPROVES RESEND SEND** tick. The tick is required for every send, including queued lifecycle emails.

**This fixes an R7 inconsistency:** "Send lifecycle email (approved)" today posts `founder_approved_send=true` without the tick (FD-W16).

## 4. Inspector / preview (desktop)

The preview shows:
- template name and rendered FNDATN-01 preview;
- TO (masked, data), FROM (data), SUBJECT;
- LINK (valid · configured origin) and STATUS;
- the blocking gate as a policy banner;
- foot: SEND DISABLED BY POLICY (or SEND TEST when gates pass).

## 5. What stays in Correspondence Studio

- Templates, campaigns, automations (the DF trigger map, all OFF), pack review, and REVISE / APPROVE → MARK READY.
- Studio review state remains in localStorage (`site00-correspondence-review-v1`).
- The Studio cannot send ("SEND TEST OFF" is permanent).

None of this is moved or duplicated. The workspace links to it from 05 and the menu.

## 6. States

| State | Presentation |
| --- | --- |
| No messages | "NO MESSAGES YET" (portal messaging opens after PAID for clients) |
| Send blocked | Hatched control + gate reason |
| Intent failed / bounced | Red chip + provider reason in detail |
| Timeline lost on restart (G-09) | Note in DELIVERY: "SEND HISTORY RESETS ON API RESTART UNTIL PERSISTED" |
| Loading / error | Skeleton rows; banner + RETRY |
