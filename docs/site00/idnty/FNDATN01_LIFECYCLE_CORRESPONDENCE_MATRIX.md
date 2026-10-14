# FNDATN-01 Digital Foundation — lifecycle correspondence matrix

**Pack:** `FNDATN-01` (seven client-facing templates)  
**Source composers:** `shared/site00-correspondence-studio/fndatn01/emails.ts`  
**Orchestration (production):** `shared/site00-correspondence-studio/manifests/digital-foundation-lifecycle.ts` + `api/_lib/digitalFoundation/communications/dispatch.ts`  
**Founder test map:** `shared/site00-digital-foundation/communications/fndatnTestEventMap.ts`  
**Prior sprint baseline:** CLIENT-EMAIL-VOICE-AND-PRESENTATION1 (internal labels removed; this sprint adds lifecycle voice + subject system)

---

## Complete template inventory

| ID | Slug | Template ID | Role | Sprint stage |
| --- | --- | --- | --- | --- |
| 01 | `01_invitation` | `personal-foundation-invitation` | lifecycle | A — Invitation |
| 02 | `02_intake_received` | `intake-completed` | lifecycle | B — Intake received |
| 06 | `06_resume_intake` | `intake-resume-reminder` | conditional_recovery | B — Intake reminder |
| 03 | `03_recommendation_quote` | `quote-ready` | lifecycle | C + D — Recommendation & quotation |
| 07 | `07_quote_expiry` | `quote-expiry-reminder` | conditional_recovery | D — Quote deadline reminder |
| 04 | `04_payment_received` | `payment-confirmed` | lifecycle | E (+ F when activated) |
| 05 | `05_foundation_complete` | `foundation-complete` | lifecycle | J — Completion |

**Not in FNDATN-01 pack (separate contracts / future):** `intake-started`, `project-activated`, `records-available`, progress micro-updates, client-action-required, final verification-only, build-opportunity (Stage K). Documented as orchestration gaps below.

---

## Lifecycle correspondence matrix

| Template | Trigger | Eligible state (summary) | Client purpose | Voice emphasis | Primary CTA |
| --- | --- | --- | --- | --- | --- |
| 01 Invitation | `ARTIFACT_CREATED` | Token + founder send authorized; intake not complete | Personal invite to begin intake | Warm, aspirational | `BEGIN YOUR FOUNDATION` → `/foundation/{token}?step=intake` |
| 02 Intake received | `INTAKE_COMPLETED` | Persisted completion event | Confirm receipt; set review expectations | Reassuring, attentive | `VIEW YOUR INTAKE STATUS` → `/foundation/{token}` |
| 06 Resume intake | `INTAKE_RESUME_REMINDER_DUE` (derived) | In progress, saved answers, delay elapsed | Gentle continue-intake nudge | Respectful, no guilt | `RESUME YOUR INTAKE` → intake URL |
| 03 Recommendation & quote | `QUOTE_CREATED` | Founder-commercial-ready quote, not expired | Present proposal + scope + price | Consultative, transparent | `REVIEW YOUR RECOMMENDATION & QUOTE` → foundation URL |
| 07 Quote expiry | `QUOTE_EXPIRY_REMINDER_DUE` (derived) | Unpaid quote inside reminder window | Factual deadline reminder | Direct, not alarmist | `REVIEW YOUR QUOTE` → foundation URL |
| 04 Payment confirmed | `PAYMENT_CONFIRMED` | Verified payment + paid quote | Receipt; activation copy only if `PROJECT_ACTIVATED` persisted | Secure, clear | `OPEN YOUR FOUNDATION` / `OPEN YOUR PROJECT` |
| 05 Foundation complete | `FOUNDATION_COMPLETED` | All five scope items verified + ownership record | Milestone handoff | Celebratory restraint | `VIEW YOUR COMPLETED FOUNDATION` |

### Suppression / duplicate prevention (implemented)

- **Eligibility:** Each `derive0N()` in `contracts.ts` returns reasons; renderer refuses send when ineligible.
- **Idempotency:** `buildSendIdempotencyKey()` in dispatch (artifact + event + template + purpose + milestone key).
- **Reminders:** `derive06` / `derive07` enforce delay/window, paid/accepted/expired guards, `reminderAlreadySentForActivity`.
- **Payment vs activation:** `compose04` uses `activation: 'active' | 'pending'` from persisted `PROJECT_ACTIVATED` only.
- **Completion:** `derive05` blocks if any verification item pending.

### Orchestration gaps (founder approval / engineering follow-up)

| Gap | Impact |
| --- | --- |
| Derived triggers `INTAKE_RESUME_REMINDER_DUE` / `QUOTE_EXPIRY_REMINDER_DUE` | Eligibility exists; **no production scheduler** evaluates cadence yet |
| `PROJECT_ACTIVATED` | Separate template contract; **not merged into 04** (by design) |
| Progress / client-action / verification-only emails | **No FNDATN templates** — stages F, G, H, I not individually messaged |
| Stage K build opportunity | **No template**; completion email mentions portal, not upsell |
| Production lifecycle map | Still `enabled: false` for broad dispatch; founder test mode uses `fndatnTestEventMap` |
| End-to-end Resend delivery | Requires merged API + flags + verified webhook; **not claimed operational in this sprint** |
| `intake-started` | Preserved separate from 02 / 06 |

---

## Subject & preheader system (client-facing)

| ID | Subject | Preheader |
| --- | --- | --- |
| 01 | YOUR INVITATION TO BEGIN | LET'S ESTABLISH THE ESSENTIALS FOR WHAT'S NEXT. |
| 02 | WE'VE RECEIVED YOUR INTAKE | WE'RE REVIEWING WHAT YOU SHARED AND WILL FOLLOW UP WITH YOUR RECOMMENDATION. |
| 06 | CONTINUE YOUR FOUNDATION INTAKE | YOUR PROGRESS IS SAVED WHENEVER YOU ARE READY. |
| 03 | YOUR FOUNDATION RECOMMENDATION IS READY | WE'VE PREPARED A DIRECTION BASED ON YOUR BUSINESS NEEDS. |
| 07 | REMINDER: YOUR QUOTE EXPIRES SOON | YOUR QUOTE IS VALID UNTIL {date}. REVIEW YOUR PROPOSAL WHEN YOU ARE READY. |
| 04 (active) | YOUR DIGITAL FOUNDATION IS UNDERWAY | HERE'S WHAT HAPPENS NEXT ON YOUR FOUNDATION. |
| 04 (pending activation) | YOUR PAYMENT IS CONFIRMED | YOUR PAYMENT IS CONFIRMED. ACTIVATION FOLLOWS SHORTLY. |
| 05 | YOUR DIGITAL FOUNDATION IS COMPLETE | YOUR ESSENTIALS ARE IN PLACE. HERE IS YOUR HANDOFF. |

Dynamic dates (`validUntil`, etc.) come from artifact/quote records only.

---

## Personalization (data-bound)

| Field | Source | Fallback |
| --- | --- | --- |
| First name kicker | `lead.contact_name` / intake name | Omitted |
| Client name on card | contact or business name | Row omitted |
| Quote amount / expiry | `DigitalFoundationQuote` | Email ineligible |
| Scope lines | `FNDATN01_BASE_SCOPE` + quote addons | Add-ons section omitted when empty |
| Payment amount / date | `PAYMENT_CONFIRMED` event + paid quote | Ineligible |
| Progress steps (06) | Artifact events + intake state | Ineligible |
| URLs | `siteOrigin` + `public_token` | Ineligible without token |

No invented placeholders in **send** mode; demo fixtures isolated to **review** mode.

---

## Correspondence Studio

- Previews: `public/site00-correspondence-studio/fndatn-01/*.html` via `render-previews.ts`
- Demo scenarios: `fixtures.ts` / `FNDATN01_DEMO_*` — labelled **DEMO DATA** in review renders
- Pack metadata: `pack.ts` (`FNDATN01_EMAILS`) — triggers, eligibility strings, CTA destinations
- Founder readiness UI: `/admin/site00/foundation-readiness` (send gates unchanged)

---

## Scope accuracy notes (copy)

- Base scope band reflects contracted Digital Foundation essentials (domain, email, security, device, records).
- **Optional enhancements** label distinguishes paid add-ons from included scope.
- Recommendation/quote copy states proposal is not commitment until acceptance + payment.
- Quote reminder states website build is not included unless added separately.
- Third-party/registrar fees remain on quote breakdown (amount from quote record).
