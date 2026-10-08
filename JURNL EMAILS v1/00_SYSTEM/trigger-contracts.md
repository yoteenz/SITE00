# Trigger contracts

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

Each email contract specifies: EMAIL_ID · FAMILY · PURPOSE · TRIGGER_EVENT · ELIGIBILITY · SUPPRESSION_RULES · COOLDOWN · PERSONALIZATION_INPUTS · CTA_DESTINATION · CONSENT_CLASS · PRIORITY · DUPLICATE_GUARD · DELIVERY_STATE.

## Trigger events (against repository truth)
| Event | Brief name | Status | Source | Fires | Needs |
|---|---|---|---|---|---|
| AUTH_EMAIL_CONFIRMED | account_created | STATE_EXISTS_EVENT_NOT_EMITTED | Supabase Auth user.email_confirmed_at → JurnlAccount.emailVerified (supabaseAuthAdapter.ts). | The first time a JURNL account becomes verified (the person has arrived; not at sign-up, which only sends A02). | Production auth mounted (mode="production"); Server-side hook on auth.users email_confirmed_at, or a first-verified-session check |
| AUTH_SIGNUP_CONFIRMATION_REQUESTED | email_verification_required | EXISTS_PROVIDER_OWNED | supabase.auth.signUp and supabase.auth.resend({ type: "signup" }) in supabaseAuthAdapter.ts; Supabase sends its "Confirm signup" template. | On sign-up and on RESEND EMAIL (F01.02). | Supabase custom email template or Send Email Hook to apply the JURNL authority; emailRedirectTo pointing at the JURNL verify route |
| SETUP_INCOMPLETE | setup_incomplete | PROPOSED | Setup draft (src/projects/jurnl/data/f02/setupDraft.ts): started / resumeAt. There is no "setup finished" flag; repository SETUP_COMPLETED fires on every patch. | Setup started but not finished 48 hours after AUTH_EMAIL_CONFIRMED, evaluated by a scheduled job. | A real setup-finished flag in the setup draft / snapshot; Scheduled job reading jurnl_user_snapshots |
| SAFE_TO_SPEND_READY | safe_to_spend_ready | STATE_EXISTS_EVENT_NOT_EMITTED | computeSafeToSpend (src/projects/jurnl/data/f09/safeToSpend.ts) completeness COMPLETE; repository emits SAFE_TO_SPEND_RECALCULATED in memory. | The first time completeness becomes COMPLETE with a positive value. | Server-side recomputation or a persisted first-ready marker in the snapshot |
| WEEKLY_BRIEF_READY | weekly_brief_ready | PROPOSED | Scheduled weekly job over jurnl_user_snapshots (upcoming projection F07, activity F04, Safe to Spend F09). | Weekly at the person’s chosen day / time zone (settings.timezone). | FINANCIAL_BRIEFS preference stored and on; Scheduler; Server-side derivations of upcoming / moved / Safe to Spend |
| PURCHASE_ATTENTION_DETECTED | purchase_attention_detected | STATE_EXISTS_EVENT_NOT_EMITTED | Saved purchases: purchasesStore.purchaseAffordability NOW / WAIT / NOT_YET; check tone classifyPurchaseCheck FIT / CHECK_IN / OVER (src/projects/jurnl/data/f10). | A saved purchase the person planned moves from FITS NOW to CLOSE or NOT YET because their plan changed (never for a check they just ran in the app). | Server-side affordability evaluation on snapshot change; REMINDERS_NUDGES preference |
| GOAL_REACHED | milestone_reached | STATE_EXISTS_EVENT_NOT_EMITTED | Goal status COMPLETE with completed_at set by setGoalAside (src/projects/jurnl/data/f14); repository emits GOAL_UPDATED. | When a goal’s set-aside reaches its target for the first time. | Server-side transition detection (status → COMPLETE) |
| AUTH_PASSWORD_RESET_REQUESTED | password_reset_requested | EXISTS_PROVIDER_OWNED | supabase.auth.resetPasswordForEmail in supabaseAuthAdapter.ts (F01.05 SEND RESET LINK); Supabase sends its "Reset password" template. | When a reset is requested. | Supabase custom template or Send Email Hook; redirectTo pointing at entry/new-password; Handling the PASSWORD_RECOVERY auth event (not handled today) |

- Use existing event names where source truth has them; never start a competing event system.
- Auth emails stay owned by the auth provider (Supabase) until the founder approves moving them; the JURNL authority is applied through the provider’s template or hook.
- Every trigger is evaluated server-side from persisted truth (jurnl_user_snapshots, auth.users). Device-local preview state never sends email.
- Design-preview accounts (EMMA@EXAMPLE.COM, LOCKED@EXAMPLE.COM) and fixture data are never recipients.
- Suppression always includes: unverified address (except A02), hard bounce, complaint, account deleted, category off.

## Per email
| Email | Event | Consent | Priority | Cooldown | Personalization | CTA route | Duplicate guard | Delivery |
|---|---|---|---|---|---|---|---|---|
| A01 WELCOME TO JURNL | AUTH_EMAIL_CONFIRMED | LIFECYCLE_SERVICE | NORMAL | ONCE | P1 | setup | A01:{userId} | NOT_WIRED |
| A02 VERIFY YOUR EMAIL | AUTH_SIGNUP_CONFIRMATION_REQUESTED | TRANSACTIONAL | CRITICAL | PT60S (provider rate limit governs resends) | P1 | entry/verify-email | Provider-owned (Supabase Auth); one active confirmation link per address | PROVIDER_OWNED |
| A03 FINISH SETTING UP JURNL | SETUP_INCOMPLETE | LIFECYCLE_SERVICE | NORMAL | P7D (maximum two sends) | P1 | setup | A03:{userId}:{sendNumber} | NOT_WIRED |
| A04 YOUR SAFE TO SPEND IS READY | SAFE_TO_SPEND_READY | LIFECYCLE_SERVICE | NORMAL | ONCE | P2 | safe/why | A04:{userId} | NOT_WIRED |
| A05 YOUR WEEK IN JURNL | WEEKLY_BRIEF_READY | LIFECYCLE_SERVICE | LOW | P7D | P3 | today | A05:{userId}:{isoWeek} | NOT_WIRED |
| A06 A PURCHASE MAY NEED A SECOND LOOK | PURCHASE_ATTENTION_DETECTED | LIFECYCLE_SERVICE | NORMAL | P14D per purchase | P2 | purchases/{purchaseId} | A06:{userId}:{purchaseId}:{affordability} | NOT_WIRED |
| A07 YOU REACHED A MILESTONE | GOAL_REACHED | LIFECYCLE_SERVICE | NORMAL | ONCE per goal | P2 | goals/{goalId} | A07:{userId}:{goalId} | NOT_WIRED |
| A08 RESET YOUR ACCESS | AUTH_PASSWORD_RESET_REQUESTED | TRANSACTIONAL | CRITICAL | PT60S (provider rate limit governs) | P1 | entry/new-password | Provider-owned (Supabase Auth); one active recovery link per address | PROVIDER_OWNED |

## Personalization levels
| Level | Name | Allows | Rules |
|---|---|---|---|
| P0 | NONE | product name, fixed copy | Generic account / security communication. |
| P1 | IDENTITY | firstName, recipientEmail, account context needed for the action | Fall back to no greeting when the name is missing; never “Hi there, user”. |
| P2 | FINANCIAL CONTEXT | Safe to Spend value and date, upcoming amounts, goal name and amount, purchase amount and category | Values come from persisted source truth at send time, with an as-of date. If a value is missing or stale, use the honest incomplete variant; never a placeholder number. |
| P3 | INTELLIGENT NARRATIVE | a contextual explanation derived from real data | Only where source truth permits and the inputs are logged with the send. Never fabricate financial facts or personalized observations. Respect AI consent (AI_PERSONALIZED / AI_NATURAL_LANGUAGE) for any generated narrative. |
