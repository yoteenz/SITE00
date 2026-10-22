# 07 · REFERRALS state matrix

## 1. Metrics (ten)

Every metric shows its calculation text beside or under the number. **No metric shows a live value in this authority**; specimen values are illustrative. Amounts are integer minor units formatted at the edge.

| ID | METRIC | SOURCE | CALCULATION | PERIOD | STATUS FILTER | EMPTY STATE | ERROR STATE | EVIDENCE CLASS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M01 | ACTIVE PARTNERS | site00_referral_partners | COUNT(partners WHERE status = ACTIVE AND active terms version present) | NOW | status = ACTIVE | 0 · “NO ACTIVE PARTNERS — PREPARE THE FIRST PARTNER” | — · READ-ONLY SNAPSHOT BANNER | OBSERVED |
| M02 | REFERRED LEADS | client_acquisition_attributions | COUNT(attributions WHERE eligibility ≠ DISQUALIFIED) | ALL TIME (period selectable) | excludes disqualified + exceptions | 0 · “NO ATTRIBUTED REFERRALS YET” | — | OBSERVED / ATTRIBUTED |
| M03 | CONVERTED CLIENTS | attributions × payment evidence | COUNT(attributed artifacts WITH a verified qualifying payment (FD-R04)) | ALL TIME | verified payments only; refunded excluded | 0 | — | OBSERVED |
| M04 | CONVERSION RATE | M03 ÷ M02 | M03 / M02, one decimal; “—” when M02 = 0 | SAME AS M02 | as M02/M03 | — | — | ATTRIBUTED |
| M05 | REFERRED REVENUE | payment evidence | SUM(collected − refunds) for converted clients, minor units | PERIOD (default all time) | net of refunds; pass-through per FD-R02 | $0.00 | — · “PAYMENT AMOUNTS NOT RECORDED” until G-RF-08 | OBSERVED |
| M06 | PENDING APPROVAL | partner_commission_entries | SUM(amount) WHERE state = PENDING APPROVAL (+ count) | NOW | state = PENDING APPROVAL | $0.00 · no red emphasis | — | ATTRIBUTED |
| M07 | APPROVED UNPAID | partner_commission_entries | SUM(amount) WHERE state IN (APPROVED, SCHEDULED) | NOW | approved + scheduled | $0.00 | — | ATTRIBUTED |
| M08 | TOTAL PAID OUT | payout_payment_records | SUM(recorded payment amounts) − reversals | ALL TIME (period selectable) | recorded payments only — never approvals | $0.00 · “NO PAYMENTS RECORDED” | — | OBSERVED |
| M09 | REVERSED / ADJUSTED | commission_adjustments + reversed entries | SUM(signed adjustments + reversed amounts), shown negative | PERIOD | adjusted + reversed | $0.00 | — | OBSERVED |
| M10 | OPEN EXCEPTIONS | attribution_exceptions | COUNT(exceptions WHERE resolution IS NULL) | NOW | unresolved | 0 | — | OBSERVED |

Where they appear:
- **Overview:** M01 · M02 · M03 · M06 · M08.
- **Attribution:** M02 · M03 · M04 · M05 · M10.
- **Commissions:** M06 · M07 · M08 · M09.
- **Payouts:** M07 · M08 · M09 · M06.

**Loading:** every metric shows `—` in its slot, never 0.

## 2. Domain state machines

| Object | States | Terminal | Doc |
| --- | --- | --- | --- |
| Partner | PLANNED · INVITED · ACTIVATION PENDING · ACTIVE · SUSPENDED · REVOKED · ARCHIVED | ARCHIVED | 12 §2 |
| Portal access | INVITED · ACTIVATION PENDING · ACTIVE · SUSPENDED · REVOKED · ARCHIVED | REVOKED / ARCHIVED | 22 §2 |
| Link (code) | ACTIVE · PAUSED · REVOKED · EXPIRED | REVOKED / EXPIRED | 21 |
| Attribution | UNATTRIBUTED · ATTRIBUTED · EXCEPTION · DISQUALIFIED · CORRECTED | — | 14 §4 |
| Commission | TRACKED · NOT YET ELIGIBLE · ELIGIBLE · PENDING APPROVAL · APPROVED · SCHEDULED · PAID · ADJUSTED · REVERSED · DISPUTED | REVERSED | 16 §2 |
| Payout | SCHEDULED · RECORDED (PAID) · FAILED · REVERSED | REVERSED | 17 |
| Card | DESIGN ONLY · DIGITAL READY · PRINT BLOCKED · PRINT READY · RETIRED | RETIRED | 18 §3 |
| Batch print status | NOT_PRINTED · PROOF · PRINTED · DISTRIBUTED · RETIRED | RETIRED | 18 #15 |
| QR validation | PENDING · PASS · FAIL | — | 21 §3 |

## 3. Overlays (twenty + menu + section)

Presentation is read from the live specimens (`data/overlay-modes.json`). Overlays follow the OPUS2 grammar:
- **Focus:** focus moves into the overlay on open and returns to the trigger on close. Esc closes, except while a write is in flight.
- **Writes:** primary actions show a spinner and lock the fields until the server confirms.
- **Success:** shown only after the durable write (the #1657 principle).

| ID | NAME | TRIGGER | PRESENTATION M · T · D | VALIDATION | CONFIRMATION | ERROR | SUCCESS | INITIAL FOCUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RO-01 | CREATE PARTNER | NEW PARTNER (header, partners toolbar, overview empty state) | FULL · DIALOG · DIALOG | Legal name, display name, type, email required; duplicate name/domain check | None — creates a DRAFT only | DUPLICATE (shows existing, OPEN EXISTING) · NETWORK (entries kept, RETRY) | Partner DRAFT created → partner page; toast “DRAFT CREATED · NO LINK ISSUED” | First field |
| RO-02 | EDIT PARTNER | MORE › EDIT on partner header | FULL · DIALOG · DIALOG | Same as RO-01 | None | Conflict (edited elsewhere) → reload | Saved; event with before/after | First field |
| RO-03 | INVITE PARTNER | MORE › INVITE | SHEET · DIALOG · DIALOG | Email present; partner has terms | Approval tick “I APPROVE SENDING THIS INVITATION” | Send unavailable (disabled in this authority) | Invitation recorded (INVITED); nothing sent | Tick |
| RO-04 | PARTNER STATUS CHANGE | MORE › CHANGE STATUS; row menu | SHEET · DIALOG · DIALOG | Reason required; ACTIVE requires terms | Explicit choice card + primary names the action (SUSPEND PARTNER) | Blocked transition explained | Status changed; event; links paused/resumed | Current status choice |
| RO-05 | COMMISSION TERMS EDITOR | TERMS › EDIT TERMS | FULL · DIALOG · DIALOG | Every field required; integer minor units; effective date ≥ today | SAVE TERMS Vn creates a new immutable version | Validation per field | Version saved; past referrals keep their version | Compensation type |
| RO-06 | REFERRAL LINK PREVIEW | Link panel, registry row link | SHEET · POPOVER · POPOVER | — | — | Code revoked → shows REVOKED | Copied (announced) | COPY |
| RO-07 | QR VALIDATION RESULT | Card Studio › VALIDATE QR; print gate item | FULL · DIALOG · DIALOG | Checks V-1…V-6 | RECORD DEVICE SCAN requires a confirmation of the landing page | Any FAIL keeps NOT PRINTABLE banner | All PASS → gate item closed | Checklist heading |
| RO-08 | CARD SHARE SHEET | SHARE CARD (header, studio, portal) | SHEET · POPOVER · POPOVER | Link validated | — | Web Share unsupported → copy + download fallback | System share sheet opened; nothing sent by SITE 00 | SHARE VIA DEVICE |
| RO-09 | CARD EXPORT DIALOG | Card Studio › EXPORT | FULL · DIALOG · DIALOG | Digital PNG only until the print gate passes | — | Generation failure → retry | PNG downloaded | Format choice |
| RO-10 | PRINT PROOF | Card Studio › PRINT PROOF | FULL · DIALOG · DIALOG | Gate items 1–5 closed before APPROVE | APPROVE PROOF requires typed partner number | Proof generation failure | Proof approved → gate item 6 | REJECT / APPROVE |
| RO-11 | COMMISSION DETAIL | Commission row | SHEET · SHEET / DOCK ≥ 680 STAGE · INSPECTOR | — | — | Load failure → inspector error | — | Inspector heading |
| RO-12 | COMMISSION APPROVAL | Inspector › APPROVE | SHEET · DIALOG · DIALOG | Entry ELIGIBLE / PENDING APPROVAL; payment not refunded/disputed; terms present | “APPROVAL DOES NOT PAY…” | Blocked reason shown | APPROVED; event; toast | CANCEL |
| RO-13 | COMMISSION ADJUSTMENT | Inspector › ADJUST | FULL · DIALOG · DIALOG | Signed amount; reason required; evidence ref | RECORD ADJUSTMENT | Validation | Adjustment row; re-approval required | Amount |
| RO-14 | PAYOUT DETAIL | Payout row | SHEET · SHEET / DOCK ≥ 680 STAGE · INSPECTOR | — | — | Load failure | — | Inspector heading |
| RO-15 | RECORD PAYMENT | Payout inspector › RECORD PAYMENT | FULL · DIALOG · DIALOG | Amount = payout total; paid-on ≤ today; method; reference required | Continues to RO-16 | Mismatch → RECORD AS PARTIAL; network → entries kept | → RO-16 | Amount |
| RO-16 | CONFIRM PAYMENT | RO-15 CONTINUE | SHEET · DIALOG · DIALOG | — | MARK PAID (summary) | Idempotent retry; duplicate reference → no-op | Payout RECORDED; lines PAID; event | BACK |
| RO-17 | PAYOUT REVERSAL | Payout inspector › MORE › REVERSE | FULL · DIALOG · DIALOG | Reason + reference required | RECORD REVERSAL | Validation | Negative entries; lines back to APPROVED/REVERSED | Reason |
| RO-18 | ATTRIBUTION EXCEPTION | Attribution EXCEPTIONS row | FULL · DIALOG · DIALOG | Choice required | CONTINUE TO CORRECTION | — | → RO-19 or keep current | First choice |
| RO-19 | MANUAL ATTRIBUTION CORRECTION | RO-18, trace › CORRECT | FULL · DIALOG · DIALOG | Reason + evidence; blocked after PAID unless FD-R18 | APPLY CORRECTION (typed confirmation) | Blocked state explained | Correction event; attribution updated | Reason |
| RO-20 | PARTNER ACCESS REVOCATION | MORE › REVOKE ACCESS | SHEET · DIALOG · DIALOG | Typed partner number | REVOKE ACCESS | — | Sessions ended; links revoked per choice | First choice |
| RO-M | WORKSPACE MENU · REFERRALS | MENU (phones, tablets) | DRAWER · DRAWER · NONE | — | — | — | Navigates | Close button |
| RO-S | SECTION SELECT (PHONE) | SECTION select (phones) | SHEET · NONE · NONE | — | — | — | Section changes; URL updated | Current section |

## 4. Component states (from the registry)

| ID | COMPONENT | STATES |
| --- | --- | --- |
| RF-001 | ReferralsDestination | default · hover · focus-visible · current · badge |
| RF-002 | BottomNavInvariant | no-selection while REFERRALS active |
| RF-003 | ReferralsSectionNav | default · current · badge · focus-visible |
| RF-004 | ReferralsSearchProvider | idle · results · no-results · error |
| RF-005 | ReferralsNotifications | unread · read |
| RF-006 | ReferralsPermissions | allowed · disabled-with-reason · hidden |
| RF-007 | ReferralsDiagnostics | healthy · degraded · unknown |
| RF-008 | ClientReferralSourceBlock | attributed · unattributed · exception · disqualified |
| RF-009 | ReferralBackLinks | default |
| RF-010 | ReferralsOverviewPage | default · loading · empty · error · stale |
| RF-011 | ReferralSignalsStrip | value · loading · unavailable · attention |
| RF-012 | ReferralMetric | value · — · error |
| RF-013 | ReferralFocusCard | needs-you · clear |
| RF-014 | PartnersPanel | default · loading · empty · error · stale |
| RF-015 | MoneyPanel | default · loading · empty · error · stale |
| RF-016 | CardStudioEntry | default · no-card |
| RF-020 | PartnersRegistryPage | default · loading · empty · error · stale · filtered |
| RF-021 | PartnerStatusViews | default · current |
| RF-022 | PartnerRow | default · hover · selected · focus-visible |
| RF-023 | PartnerThumb | default |
| RF-024 | PartnerStatusMark | 7 states |
| RF-025 | PartnerInspector | default · loading · error |
| RF-030 | PartnerDetailPage | default · loading · empty · error · stale |
| RF-031 | PartnerHeader | default · planned · suspended |
| RF-032 | PartnerOverviewSection | default · loading · empty · error · stale |
| RF-033 | PlannedPartnerChecklist | open · done |
| RF-034 | PartnerTermsSection | no-terms · draft · active · superseded |
| RF-035 | PartnerSectionPanels | default · loading · empty · error · stale |
| RF-036 | ReferralLinkBlock | not-issued · active · paused · revoked · unverified |
| RF-037 | AccessStateBlock | 6 states |
| RF-040 | AttributionLedgerPage | default · loading · empty · error · stale |
| RF-041 | AttributionRow | default · selected · exception |
| RF-042 | SourceTrace | default · partial · error |
| RF-043 | EvidenceClassTag | 4 classes |
| RF-044 | AttributionExceptionQueue | open · resolved |
| RF-045 | AttributionResolver (server) | attributed · unattributed · exception · disqualified |
| RF-050 | CommissionsLedgerPage | default · loading · empty · error · stale |
| RF-051 | CommissionStateChip | 10 states |
| RF-052 | CommissionRow | default · selected |
| RF-053 | CommissionCalculation | locked · provisional · not-calculable |
| RF-054 | CommissionInspector | default · loading · error |
| RF-055 | CommissionEngine (server) | 10 states |
| RF-060 | PayoutsPage | default · loading · empty · error · stale |
| RF-061 | PayoutPolicyBanner | default |
| RF-062 | PayoutRow | default · selected |
| RF-063 | PayoutInspector | scheduled · recorded · reversed · failed |
| RF-064 | PayeeRecord | missing · on-file |
| RF-070 | CardStudioPage | default · loading · empty · error · stale |
| RF-071 | ReferralCard | front · back · test · void |
| RF-072 | QrMark | placeholder · validated · revoked |
| RF-073 | TemplatePicker | default · selected · focus-visible |
| RF-074 | PrintGate | blocked · ready |
| RF-075 | DigitalShareActions | idle · shared · unsupported |
| RF-076 | QrValidator | pass · fail · pending |
| RF-077 | PrintProof | draft · approved · rejected |
| RF-078 | PrintPackageExport (server) | blocked · generated |
| RF-079 | BatchRecord | 5 states |
| RF-080 | InvitationEntryStates | valid · invalid · revoked · paused · test |
| RF-081 | PartnerPortalShell | signed-out · signed-in · suspended |
| RF-082 | PartnerHome | default · loading · empty · error · stale |
| RF-083 | PartnerCard | active · paused |
| RF-084 | PartnerEarnings | default · loading · empty · error · stale |
| RF-085 | PartnerTerms | active · none |
| RF-090 | ReferralActivityPage | default · loading · empty · error · stale |
| RF-091 | ReferralEventRow | default |
| RF-092 | EvidenceAwareMetric | 4 classes |

## 5. Page states shown in specimens

| Page | default | loading | empty | error | selected / inspector | other |
| --- | --- | --- | --- | --- | --- | --- |
| Overview | R01, R04 | R01, R04 | R01, R04 | R01, R04 | — | short / wide R04, R05 |
| Partners | R06–R08 | R06 | R06 | — | R07, R08 | — |
| Partner detail | R09, R10 (7 sections) | — | AIO planned R09, R10 | — | — | terms R10 |
| Attribution / trace | R12–R14 | — | — | — | R13 | exception R15 |
| Commissions | R16–R18 | — | — | — | R16–R19 | approval R20 |
| Payouts | R21–R23 | — | — | — | R21–R24 | record R25, keyboard R21 |
| Card Studio | R26–R28 | — | DESIGN ONLY (AIO) | QR FAIL R31 | — | A/B/C × front/back R28–R30 |
| Public entry | R32 valid | — | — | invalid / revoked / test R32 | — | — |
| Portal | R35–R38 | — | — | — | — | access states R35 |
