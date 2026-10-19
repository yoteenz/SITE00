# Contact number requirement (FD-2)

**Status:** APPROVED by the founder (FD-2). **Not implemented in this sprint.** This is the brief Composer implements in Phase 4 of [`OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md`](OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md).
**Boards:** 02 §05 (states), 05 §05 (validation and save), 04 §03 (P02 gate and resume), 06 (keyboard), 07 (typography and grammar).

## 1. Why

SITE 00 Digital Foundation configures business infrastructure by hand:
- domain registration and registrar access
- mailbox and MX/SPF/DKIM/DMARC changes
- email migration, account recovery and security verification
- provider coordination

During this work the client's primary email may be temporarily unavailable. The founder needs a reliable backup contact for urgent, service-related issues.

## 2. The field

| Item | Authority |
| --- | --- |
| Canonical name | CONTACT NUMBER |
| Label | `CONTACT NUMBER *`. The asterisk is ink, follows the label, and is `aria-hidden`; the input carries `aria-required="true"`. |
| Placeholder | `ENTER PHONE NUMBER` |
| Helper | `USED AS A BACKUP CONTACT FOR URGENT ACCOUNT, DOMAIN, OR EMAIL ISSUES.`, under the control, muted, linked by `aria-describedby` |
| Requirement | Required |
| Whose number | The client's own, or that of an authorized business representative. **Not** a third-party emergency contact; never ask for another person's number. |
| Typography | IDNTY uppercase rule; SITE 00 Display and Saira Semi Condensed only. The entered value keeps its own characters (digits and dashes). |
| Position | Unchanged: last field on P02, after EMAIL ADDRESS (`EntryIntake.tsx` 223–236 today) |
| Input attributes | `type="tel"`, `inputMode="tel"`, `autoComplete="tel"` (existing), `enterkeyhint="done"`, `aria-required="true"`, `aria-invalid` and `aria-describedby` (error id `df-phone-error`, helper id `df-phone-hint`) |
| Formatting | **Unchanged:** `formatUsPhoneDisplay` as you type (US, max 10 digits, `901-236-2647`) |
| Data key | **Unchanged:** `phone` in `DigitalFoundationIntake` (`shared/site00-digital-foundation/types.ts:135`), stored inside the `intake` jsonb column. Stored as the dashed display string (FC-007). No rename, migration or schema change. |

## 3. States

| State | Treatment | Board |
| --- | --- | --- |
| Empty | Placeholder, helper and the required asterisk. No error until CONTINUE is pressed. | 02 §05 |
| Focused | Approved active frame (2 px red) plus the red period before the label | 02 §05 |
| Formatting | Dashes appear as digits are typed (existing) | 02 §05 |
| Valid (10 digits) | No decoration. Nothing turns green; the formatted value is the confirmation. | 02 §05 |
| Missing on CONTINUE | Red field edge, red-period message `ENTER A CONTACT NUMBER`; focus moves here if it is the first invalid field | 02, 04, 05 |
| Incomplete (1–9 digits) | Same treatment, message `CHECK THIS CONTACT NUMBER` | 02, 05 |
| Invalid + refocused | Active frame plus the message | 02 |
| Saving | Status line `SAVING…` (implemented). **Never `SAVED` before `saveIntake()` resolves.** | 02, 05 |
| Saved | `SAVED <time>` only after server confirmation | 02, 05 |
| Save failed | `NOT SAVED — RETRY`; the typed value stays in the field | 05 |
| Restored | `draftFromPayload()` repopulates the saved value through `formatUsPhoneDisplay`; the status line stays empty (implemented resume, FD-5) | 02, 04 |
| Read-only | Intake complete or PAID: lock glyph, value readable (`readonly`) | 02 |
| Disabled | `editable = false`: existing disabled treatment | 02 |

The two error messages are written in the existing `validateBusinessInfo` voice (`ENTER YOUR BUSINESS NAME`, `CHECK THIS EMAIL ADDRESS`). They are **proposed copy (U-2)**: the founder approved the label, placeholder and helper, not these lines. Ship them only after the founder confirms them, or with founder-supplied wording.

## 4. Validation (client and server)

| Layer | Rule | Where |
| --- | --- | --- |
| Client, P02 CONTINUE | Add `phone` to `IntakeField`. In `validateBusinessInfo`: empty → `ENTER A CONTACT NUMBER`; digits ≠ 10 → `CHECK THIS CONTACT NUMBER`. `validateForRecommendation` inherits it (it calls `validateBusinessInfo`). | `src/site00/foundation-client/model.ts` |
| Client, field | Add `aria-invalid`, `aria-describedby` and the `Field` error (the phone input bypasses `input()` today and has no error wiring) | `src/site00/foundation-client/parents/EntryIntake.tsx` |
| Server, submission boundary | When `update-intake` arrives with `markComplete: true` and the merged intake's `phone` has fewer than 10 digits, reject with HTTP 400 `{ error: 'INTAKE_CONTACT_NUMBER_REQUIRED' }` **before** `completeIntake()` runs. The client maps that code to the P02 field error. | `api/site00/digital-foundation-artifact.ts` (`update-intake`) or `api/_lib/digitalFoundation/service.ts` `updateIntake` |
| Server, autosave | `update-intake` with `markComplete: false` is **never** rejected for a missing phone. Partial drafts keep saving. | same |

The founder said not to rely only on client-side validation. The server rule is the enforcement point, and the client rule gives the immediate message.

**The server check changes a backend contract** (`update-intake` gains a 400 path). It is limited to the completion transition, which already exists. It needs its own reviewed PR, and it must not touch persistence (`persistArtifactGraph`), public token handling or lifecycle transitions (§7).

## 5. Existing data compatibility

| Case | Behaviour |
| --- | --- |
| **Partial intake, no phone** (draft saved before FD-2) | Loads normally. CONTACT NUMBER shows as required and empty; other answers stay. CONTINUE asks for the number. Nothing is discarded or rewritten. |
| **Saved drafts with a phone** | Repopulate exactly (formatted by `formatUsPhoneDisplay`). No re-save is triggered on load. |
| **Completed intakes without a phone** (`intake_state = COMPLETE`) | **Not invalidated.** Completion state, quote, recommendation and the permanent artifact link are untouched; no historical data is rewritten. The founder sees `CONTACT NUMBER · NOT PROVIDED` in the admin detail (R2) and in the founder workspace record, as a follow-up flag. If the client returns before payment and presses CONTINUE on P02, the client gate asks for the number. |
| **Paid intakes without a phone** | Intake is locked after payment (`INTAKE_LOCKED_AFTER_PAYMENT`) and the client cannot add it. The founder follows up through portal messages or email. Same founder-side flag. |
| **Founder-created records** | `create-artifact` has no phone field and does not gain one. The client supplies the number in the intake. |
| **Synthetic test clients** | `advanceSyntheticIntakeSubmitted()` (`api/_lib/digitalFoundation/founderReadiness.ts:449`) completes the intake without a phone today, so the server rule would break the test journey. When the stored phone is empty, supply a fictional number from the reserved 555-01XX range, e.g. `202-555-0143`. Never a real person's number. No call or SMS is ever made (none exists in the product). |
| **Fixtures** | `materialize-fixture` scenarios that complete an intake need the same fictional number. |
| **Intake resumption** | Unchanged: `draftFromPayload()` reads `intake.phone`; `useIntakeDraft` autosave timing (900 ms), `saveIntake` and `retry` are untouched. |
| **Permanent artifact links** | Unaffected: the rule never touches tokens, `public_token` or link resolution. |

## 6. Communication and consent boundary

- Email and the client portal remain the default channels for routine service communication.
- The number may be used for urgent service-related issues, especially when normal communication is unavailable. Examples:
  - account access interruption
  - domain ownership verification problem
  - critical mailbox configuration issue
  - time-sensitive provider authorization
  - security-related account problem
- **Not** consent to marketing, promotional SMS, or automated calls or texts. Collecting it must not:
  - set any `CommunicationPrefs` key;
  - enrol the client in anything;
  - appear in any marketing or lifecycle-email audience.
- Portal communication preferences (FC-036) stay exactly as they are, and remain separate.
- Any future SMS or automated-call feature needs its own explicit consent design and founder approval. That is out of scope here.

## 7. What must not change

- The intake JSON shape, other than the existing `phone` key now being populated more often.
- `formatUsPhoneDisplay` and its tests.
- Autosave timing, `saveIntake`, `retry`, `draftFromPayload`.
- Supabase schema, grants and persistence.
- Public token behaviour, lifecycle states and payment logic.
- The persistence repair from PR #1657 (`a99d914d`): durable artifact creation, referral-source handling, token continuity, save/resume error reporting.

## 8. Regression tests (Phase 4)

| Test | Expectation |
| --- | --- |
| `validateBusinessInfo` | Empty → `phone` error; `901-236-26` → error; `901-236-2647` → no error; other messages unchanged |
| `validateForRecommendation` | Inherits the phone error |
| `intakeFromDraft` snapshot | Unchanged output shape (phone trimmed, as today) |
| Server: autosave | `update-intake`, `markComplete: false`, no phone → 200, saved |
| Server: completion | `markComplete: true`, no phone → 400 `INTAKE_CONTACT_NUMBER_REQUIRED`, state unchanged; with a phone → completes as today |
| Synthetic journey | `advance-test-intake` still completes and supplies the fictional number when none is stored |
| Restore | A saved phone reloads formatted; nothing re-saves on load |
| Completed artifact without a phone | Payload loads; state stays COMPLETE; the founder-side flag shows |
| Consent | No `CommunicationPrefs` change after saving a phone |
| Existing suites | `foundationClientPhoneFormat`, `digitalFoundationClientBoard0102`, `digitalFoundationCriticalRepair`, `founderReadinessE2e`, `digitalFoundationArtifactHandler` stay green |
| Manual (iPhone Safari) | Tel keypad opens; DONE submits; the error sits above the keyboard; VoiceOver reads "CONTACT NUMBER, required, …, used as a backup contact…" |
