# 26 — Component Registry

40 registered components (**38 active, 2 retired** in LOCK1: CF-34, CF-35) plus **CF-41** (approved launch) added by LOCK1 — 39 active; overlays in `21`. Each component defines the thirteen interaction fields (§40): purpose, trigger, initial state, data dependency, action, loading, success, error, disabled, responsive variant, accessibility semantics, security boundary and owner. Every sprint example control is mapped:

| Sprint example | Component |
|---|---|
| SAVE YOUR FOUNDATION | CF-33 (CTA locked in LOCK1) |
| ~~DOWNLOAD ACCESS CARD~~ | **RETIRED** (LOCK1) — no replacement |
| REFRESH STATUS | CF-07 |
| VIEW INTAKE SUMMARY | CF-17 |
| VIEW PROPOSAL | CF-20 |
| ACCEPT QUOTE | CF-25 |
| REQUEST CLARIFICATION | CF-23 |
| CONTINUE TO CHECKOUT | CF-26 |
| OPEN ROADMAP | CF-10 |
| VIEW RECORDS | CF-18 |
| RETURN TO FOUNDATION | CF-36 |

Specimen implementations live in `boards/src/cf-kit.js`, `cf-pages.js` and `cf-access.js`. They are references for React, not code to import. The existing client components that Composer extends are named in `29`.

| ID | Component (control) | Purpose | Trigger | Initial | Data dependency | Action | Loading | Success | Error | Disabled | Responsive | Accessibility | Security boundary | Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CF-01 | Header | Identity, business, session state, menu | render | brand; business + REF + SECURE SESSION on TL+ | payload.lead.business_name, client_ref, session | menu opens OL-C01 | — | — | — | — | M: brand + menu · TL+: + account cluster | `header` landmark; menu `aria-expanded` | shows masked data only inside session | Composer |
| CF-02 | Area bar (M) | Four areas one tap away | tap | current area marked | views list | history-state view change | — | view renders, focus h1 | — | never hidden; pre-surface areas show pre-payment content | M only, fixed bottom, safe-area | `nav` + `aria-current=page`; badge has text count | none | Composer |
| CF-03 | Area tabs (TP) | Same as CF-02 | tap | current tab underlined red | views list | view change | — | focus h1 | — | — | TP only | `nav`, `aria-current` | none | Composer |
| CF-04 | Area rail / sidebar (TL·D·UW) | Areas + utilities | click | current item red bar | views list | view change / open utility | — | focus h1 | — | — | TL icon rail 112 · D 272 · UW 312 | `nav`, `aria-current` | none | Composer |
| CF-05 | Hero | State headline | route render | posture from `04` | lifecycle posture | — | DfLoading before payload | — | system panel | — | M absolute object · TP+ framed grid | one `h1` per view; object `aria-hidden` | none | Composer |
| CF-06 | Truth strip | Facts: stage, received, reference | render | — | artifact, events | — | — | — | fields omitted if unknown (never guessed) | — | wraps on M | `dl`-like text pairs | reference is display-only | Composer |
| CF-07 | REFRESH STATUS | Re-fetch payload; show as-of | tap REFRESH; visibilitychange (≤1/60 s) | STATUS AS OF h:mm | last fetch time (G-19) | GET payload | CHECKING FOR UPDATES… | new time | OL-C13 toast, keep last state | while busy | TP+ in strip · M at bottom | `aria-live=polite` on time | none | Composer |
| CF-08 | Progress ticks (M) | 7-stage summary | render | current stage | clientStage() | — | — | — | — | — | M only | text caption carries meaning | none | Composer |
| CF-09 | Stage strip | 7-stage summary | render | current cell red top bar | clientStage(), markers | — | — | — | — | — | TP+ | `role=list`; each cell has a text state | none | Composer |
| CF-10 | OPEN ROADMAP · stage list | All stages with state + sub-line | area 02 / strip tap | current row white + red inset | clientStage(), stages | opens STAGE detail (existing P09) on tap | — | — | — | upcoming rows not tappable | all tiers; D/UW side workstreams | `ol`; state text per row | none | Composer |
| CF-11 | Next-step panel | The one thing that happens next | render | from posture | lifecycle + open actions | optional CTA | — | — | — | — | D/UW status column; inline on M/TP via NEEDS YOU | `aside` region labelled | none | Composer |
| CF-12 | Come-back-anytime panel | Return methods (LOCK1) | render | SAVE YOUR FOUNDATION › EMAIL | platform, standalone | opens OL-C02 / COMM_PREFS | — | — | — | home row hidden when standalone | inline (M/TP), status column (D) | list of buttons | none | Composer |
| CF-13 | Needs-you summary row | Surface open steps on overview | render | red border if OPEN | client_actions | opens ACTION | — | — | — | — | all | button with title + sub | session | Composer |
| CF-14 | Action card | One client step with state | render | state chip | client_actions + G-04/05/06 | START / CONTINUE / VIEW WHAT YOU SENT | — | — | — | BLOCKED / RESOLVED have no CTA | all | `li` + button; chip text not colour only | session | Composer · API |
| CF-15 | SUBMIT (action step) | Complete a client action | tap SUBMIT APPROVAL | disabled until fields + consent | request_id, response | POST complete-client-action | SUBMITTING… | SUBMITTED + toast | alert, input kept | missing fields / consent | form full width M; row CTAs TP+ | labels, error `aria-describedby` | session; never asks for passwords | Composer · API |
| CF-16 | Spec block | Fact rows with value column | render | — | varies | — | — | — | — | — | same grid all tiers; values wrap | text pairs | sensitive values only in verified view | Composer |
| CF-17 | VIEW INTAKE SUMMARY | What the client submitted | RECORDS row / review page | read-only | payload.intake | opens record | — | — | RECORD NOT FOUND panel | — | all | list | session | Composer |
| CF-18 | VIEW RECORDS · record row | Records ready vs pending | area 04 | READY then NOT CREATED YET | buildClientRecords + intake summary (G-03) | open RECORD or OL-C04 | — | — | — | pending rows not actionable | all | `li` with state text | sensitive rows require step-up | Composer · API |
| CF-19 | Verified record view | Sensitive detail | after step-up | — | record detail | DOWNLOAD PDF | — | — | OL-C12 when expiring | — | all | heading + spec | step-up session 30 min idle (G-10) | Composer · API |
| CF-20 | VIEW PROPOSAL · quote table | Scope and total | OVERVIEW CTA / NEEDS YOU | current version | quote (after G-02) | REVIEW MY OPTIONS / ACCEPT | — | — | — | superseded versions struck | D/UW with WHY column | table semantics | none | Composer |
| CF-21 | Version chip + notice | Versioning made visible | render | V# · date | quote_version, previous versions | — | — | — | — | — | all | text, strikethrough + “CAN NO LONGER BE ACCEPTED” | none | Composer |
| CF-22 | Recommendation card | Five answers + include/decline | render | server selection | quote lines + G-25 reasons | toggle → update-quote / remove-addon; required → OL-C05 | “UPDATING…” on total | new total | alert, reverts toggle | required-declined blocks accept | 1/1/2/3/3 cols | segmented control `role=radiogroup` | none | Composer · API |
| CF-23 | REQUEST CLARIFICATION | Ask about the proposal | tap link | closed | G-18 channel | send message | SENDING… | SENT · SITE 00 WILL REPLY BY EMAIL | alert, text kept | — | sheet/dialog | dialog semantics | session | Composer · API |
| CF-24 | Disclosure checklist | Three verbatim acknowledgments | tap | unchecked | DF_DISCLOSURES | check | — | count n OF 3 | — | — | all | native checkboxes with labels | server re-validates text | Composer |
| CF-25 | ACCEPT QUOTE | Record exact-version acceptance | tap | disabled < 3 | quote_version | POST accept-quote | ACCEPTING… | ACCEPTED panel | checkoutErrorCopy; CHANGED re-render | <3 · expired · superseded · founder pricing | all | button `aria-disabled` | server version check (exists) | Composer · API |
| CF-26 | CONTINUE TO CHECKOUT · pay CTA | Open Stripe hosted checkout | tap | READY_FOR_CHECKOUT | accepted quote | POST start-checkout → location.assign | OPENING STRIPE… | redirect | checkoutErrorCopy | not payable / pending pricing | full width M · auto TP+ | button with lock icon | no card data in portal; server creates session | Composer · API |
| CF-27 | Payment confirmation panel | Truthful verification | ?checkout=return | VERIFYING | payment_state via polling (exists) | CHECK AGAIN | CHECK n OF 10 | UNDERWAY when PAID | STILL CONFIRMING / ERROR | while polling | all | `role=status` | redirect never writes state | Composer |
| CF-28 | Workstream card | Real state per workstream | render | chip from projection | G-07 projection | — | — | — | — | — | 1/2/2/4/4 cols | text chip | CLIENT_SAFE only | Composer · API |
| CF-29 | Verification check row | Each final check | render | state + date | G-07 | REVIEW MY HANDOFF RECORD when ready | — | — | — | — | all | list | none | Composer |
| CF-30 | Build interest line | Opt-in only | tap I’M INTERESTED | quiet link | build_interest | POST build-interest (exists) | SENDING… | INTEREST SENT | alert | after sent | column on D | link → status text | none | Composer · API |
| CF-31 | Activity timeline | Recorded events only | ACTIVITY view / UW column | newest first | G-08 client_activity | — | — | — | “ACTIVITY ISN’T AVAILABLE RIGHT NOW” | — | column on UW | `ol` with times | allow-list only | Composer · API |
| CF-32 | Updates by email | Email preferences | COMM_PREFS | server prefs | communication_preferences (exists) | POST update-communication-preferences | SAVING… | SAVED toast | alert | essentials locked | all | switches `role=switch` | marketing consent explicit | Composer · API |
| CF-33 | SAVE YOUR FOUNDATION (home sheet) | One-tap way back | tap SAVE YOUR FOUNDATION (contextual, optional) | platform detected | UA, beforeinstallprompt, display-mode | Android prompt() / instructions | — | appinstalled toast | prompt dismissed → steps | hidden when standalone | sheet M/TP · dialog TL+ | dialog + focus trap | no token in start_url/icon | Composer |
| CF-34 | ~~Access card face~~ | RETIRED (LOCK1) | — | — | — | — | — | — | — | — | — | — | — | do not build |
| CF-35 | ~~DOWNLOAD ACCESS CARD (+ share / PDF / replace)~~ | RETIRED (LOCK1) | — | — | — | — | — | — | — | — | — | — | — | do not build |
| CF-36 | RETURN TO FOUNDATION (reentry panel) | Public entry + 12 states | `/foundation/return` | session check | session cookie, card param, link token | email link / code / sign out-continue | busy | session → portal | state panels | rate limited | system panel all tiers | form labels, `role=alert` on errors | non-enumerating; G-09 | API · Composer |
| CF-37 | Email code entry | Finish sign-in inside home-screen app | after link requested | 6 boxes | code | verify | CHECKING… | session | “THAT CODE DIDN’T WORK · n TRIES LEFT” | after 5 tries | all | one input with `autocomplete=one-time-code`, visual boxes | 10 min, 5 tries | Composer · API |
| CF-38 | System panel | Errors / closed / paused | error | — | error code | TRY AGAIN / contact | — | — | — | — | corner object TP+ | `role=alert` | no internal codes shown | Composer |
| CF-39 | Footer + trust line | Grammar + reassurance | render | posture-specific trust copy | posture | — | — | — | — | — | all | `footer` | none | Composer |
| CF-40 | Status chip | State label | render | — | state | — | — | — | — | — | all | text label + shape (not colour alone) | none | Composer |
| CF-41 | Approved launch veil (LOCK1) | Continuity on cold entry while the foundation opens | cold start `/foundation/return?src=home\|email` | approved launch image (exact) | session + payload readiness | none (informational) | chips at 3 s / 10 s | fade to portal (240 ms; instant with reduced motion) | restore fails → reentry; offline chip + TRY AGAIN | skipped if ready < 150 ms, height < 480, or in-session | cover ≤ 0.67 aspect · portrait panel > 0.67 | img alt = launch copy; `aria-busy` on main; chips `role=status` | shows no client data until the session resolves | Composer |
