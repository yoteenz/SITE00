# 06 · REFERRALS component registry

Extends the OPUS1 registry (**124 components**, SH / FN / CR / RV / OP / CO / SY / OV / SC / OL — unchanged, not renumbered) with the prefix **RF-001 onward** and the overlay family **RO-01 … RO-20** (+ RO-M menu row, RO-S section sheet).

Machine-readable: `registry/referrals-component-registry.json` and `.csv`, built by `registry/build-referrals-registry.py`.

- **66 RF components · 22 RO overlays**.
- **Approval:** every entry is **PROPOSED · FOUNDER REVIEW REQUIRED**.
- **Numbering:** RF ids are grouped by family with gaps for later additions (RF-001…009 navigation/links, 010s overview, 020s partners, 030s partner detail, 040s attribution, 050s commissions, 060s payouts, 070s cards, 080s public/portal, 090s activity/analytics).


## Component tree

```
SH-01 FounderWorkspaceShell
├── SH-11 Sidebar / SH-10 IndexRail / SH-09 WorkspaceMenuDrawer ── RF-001 ReferralsDestination  (SH-08 BottomNav unchanged · RF-002)
├── SH-04 GlobalSearch ── RF-004 · SH-05 NotificationCenter ── RF-005 · RF-006 ReferralsPermissions
├── RF-010 ReferralsOverviewPage
│   ├── RF-003 ReferralsSectionNav ── RO-S (phones)
│   ├── RF-011 ReferralSignalsStrip ── RF-012 ReferralMetric ── RF-092 EvidenceAwareMetric
│   ├── RF-013 ReferralFocusCard
│   ├── RF-014 PartnersPanel ── RF-022 PartnerRow
│   ├── RF-015 MoneyPanel ── RF-052 CommissionRow
│   └── RF-016 CardStudioEntry ── RF-071 ReferralCard
├── RF-020 PartnersRegistryPage
│   ├── RF-021 PartnerStatusViews
│   ├── RF-022 PartnerRow ── RF-023 PartnerThumb · RF-024 PartnerStatusMark
│   ├── RF-025 PartnerInspector (SH-12)
│   └── RO-01 · RO-04 · RO-06
├── RF-030 PartnerDetailPage
│   ├── RF-031 PartnerHeader ── RO-02 · RO-03 · RO-04 · RO-08 · RO-20
│   ├── RF-032 PartnerOverviewSection ── RF-033 PlannedPartnerChecklist · RF-036 ReferralLinkBlock ── RF-072 QrMark
│   ├── RF-034 PartnerTermsSection ── RO-05
│   ├── RF-035 PartnerSectionPanels (REFERRALS · COMMISSIONS · PAYOUTS · CARDS · ACTIVITY)
│   └── RF-037 AccessStateBlock
├── RF-040 AttributionLedgerPage
│   ├── RF-041 AttributionRow
│   ├── RF-042 SourceTrace ── RF-043 EvidenceClassTag
│   └── RF-044 AttributionExceptionQueue ── RO-18 → RO-19
├── RF-050 CommissionsLedgerPage
│   ├── RF-052 CommissionRow ── RF-051 CommissionStateChip
│   └── RF-054 CommissionInspector = RO-11 (SH-12) ── RF-053 CommissionCalculation · RO-12 · RO-13
├── RF-060 PayoutsPage
│   ├── RF-061 PayoutPolicyBanner
│   ├── RF-062 PayoutRow
│   └── RF-063 PayoutInspector = RO-14 (SH-12) ── RF-064 PayeeRecord · RO-15 → RO-16 · RO-17
├── RF-070 CardStudioPage
│   ├── RF-071 ReferralCard ── RF-072 QrMark
│   ├── RF-073 TemplatePicker
│   ├── RF-074 PrintGate ── RF-076 QrValidator (RO-07) · RF-077 PrintProof (RO-10)
│   ├── RF-075 DigitalShareActions ── RO-08 · RO-09
│   └── RF-079 BatchRecord
├── RF-090 ReferralActivityPage ── RF-091 ReferralEventRow
├── CR-01 ClientRecordPage ── RF-008 ClientReferralSourceBlock · RF-009 ReferralBackLinks
└── SY System ── RF-007 ReferralsDiagnostics

SERVER  RF-045 AttributionResolver · RF-055 CommissionEngine · RF-078 PrintPackageExport
PUBLIC  RF-080 InvitationEntryStates (/invite/:code, existing page)
PORTAL  RF-081 PartnerPortalShell ── RF-082 PartnerHome · RF-083 PartnerCard (RF-071) · RF-084 PartnerEarnings · RF-085 PartnerTerms
```

## NAVIGATION

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-001 | ReferralsDestination | EXTENDS SH-11 Sidebar · SH-10 IndexRail · SH-09 WorkspaceMenuDrawer | SH-01 → — | Registers REFERRALS as destination 06 (SYSTEM 07) in sidebar, rail and menu drawer | default · hover · focus-visible · current · badge | Static destination table + badge count / GET referrals summary (badge) | Menu drawer row (bottom bar unchanged) · Rail item “REFERRALS” · Sidebar row “06 REFERRALS” | aria-current="page" on the active row; badge has text alternative | Founder session (requireAdminFounder); no preview bypass for financial actions | P1 | R01 R02 R04 R42 |
| RF-002 | BottomNavInvariant | CONSTRAINS SH-08 BottomNav | SH-01 → — | Keeps HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM; shows no selected tab while REFERRALS is open | no-selection while REFERRALS active | Destination table / — | Five items, CREATE centre · — · — | aria-current only on a real bottom destination | — | P1 | R01 R42 |
| RF-003 | ReferralsSectionNav | NEW · composes SC-10 Tabs | RF-010 → RO-S | OVERVIEW · PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS · CARD STUDIO · ACTIVITY | default · current · badge · focus-visible | Route / — | Section select button → sheet RO-S · Tab row (scrolls if needed) · Tab row | role=tablist on ≥ 640; a native-like listbox sheet on phones (FD-1…FD-6) | — | P1 | R01 R09 |
| RF-004 | ReferralsSearchProvider | EXTENDS SH-04 GlobalSearch | SH-04 → — | Adds partners, referral ids, commission ids, payout ids to workspace search | idle · results · no-results · error | Server search over partner + referral tables / GET /api/admin/referrals/search?q= | Search sheet · Search sheet · ⌘K palette | Results announced via live region | Never returns banking data; masks emails beyond founder scope | P13 | R42 |
| RF-005 | ReferralsNotifications | EXTENDS SH-05 NotificationCenter | SH-05 → — | Commission awaiting approval, attribution exception, partner activation, QR validation failure | unread · read | referral_business_events / GET notifications (existing) + referral event types | Sheet · Popover · Popover | Each item is a link with time + verb | Notification text carries no amounts for other partners | P13 | R04 R39 |
| RF-006 | ReferralsPermissions | NEW · guards | SH-01 → — | Who may view, approve, record, correct, revoke (FD-R18) | allowed · disabled-with-reason · hidden | Admin session claims / resolveAdminAuth | Same · Same · Same | Disabled controls keep an accessible reason (aria-describedby) | Server re-checks every mutation; client checks are cosmetic | P1 | R20 R25 |
| RF-007 | ReferralsDiagnostics | EXTENDS SY System page | SY-01 → — | Shows persistence mode (IN_MEMORY vs SUPABASE), webhook coverage, QR origin checks | healthy · degraded · unknown | invitationSystem persistence flag; webhook config / GET /api/admin/referrals/health | Card · Card · Module row | Status text, not colour alone | No secret values displayed | P13 | R42 |

## FOUNDATIONS LINK

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-008 | ClientReferralSourceBlock | EXTENDS CR-02 RecordHeader / CR-10 RecordsSection | CR-01 → — | FOUNDATIONS → CLIENT → REFERRAL SOURCE: partner, via, attribution state, link to trace | attributed · unattributed · exception · disqualified | artifact.referral_source_id + client_acquisition_attributions / GET artifact detail (extended) | Row in RECORDS section · Row · Context column block | Link text names the partner | Client-facing projection never includes this block (clientProjection strips referral) | P5 | R43 |
| RF-009 | ReferralBackLinks | NEW | — → — | REFERRALS → PARTNER → CLIENT opens the canonical record; no duplicated client pages | default | Route params / — | Same · Same · Same | — | Uses opaque refs in URLs, never DB ids of partners in public routes | P5 | R43 |

## OVERVIEW

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-010 | ReferralsOverviewPage | NEW | SH-01 → RF-011…RF-016 | Command centre for the referral programme | default · loading · empty · error · stale | Referral summary read model / GET /api/admin/referrals/summary | Single column + menu entry · 2 columns · 2 → 3 columns (≥ 1440 stage) | h1 “REFERRALS”; landmarks | Founder session (requireAdminFounder); no preview bypass for financial actions | P2 | R01–R05 |
| RF-011 | ReferralSignalsStrip | NEW · pattern of OV signals | RF-010 → RF-012 | Up to five metrics with definitions | value · loading · unavailable · attention | Summary read model (doc 07 metric contract) / GET summary | 2-up · 3/4/5-up by container · 5-up | Each cell: label, value, definition text; attention not colour-only | Amounts only for founder | P2 | R04 |
| RF-012 | ReferralMetric | NEW | RF-011 → — | One metric: icon, label, number, calculation | value · — · error | Metric contract / — | Cell · Cell · Cell | Number has full text equivalent (e.g. “$55.00 pending approval”) | — | P2 | R04 |
| RF-013 | ReferralFocusCard | NEW · pattern of OV focus | RF-010 → — | The single most urgent founder action | needs-you · clear | Derived from queue / GET summary | Card · Card · Hidden ≥ 1100 (signals carry it) | Heading + button | — | P2 | R01 |
| RF-014 | PartnersPanel | NEW | RF-010 → RF-022 | Top partners with thumbnails and referral counts | default · loading · empty · error · stale | Partner list (limit 5) / GET partners | Rows · Rows · Rows | List with links | — | P2 | R04 |
| RF-015 | MoneyPanel | NEW | RF-010 → RF-052 | Latest commission/payout rows | default · loading · empty · error · stale | Commission ledger (limit) / GET commissions | Rows · Rows · Rows | Table semantics | Founder only | P6 | R04 |
| RF-016 | CardStudioEntry | NEW | RF-010 → RF-071 | Card preview + OPEN STUDIO / COPY LINK | default · no-card | Card templates / GET cards | Card · Card · Card | Preview has text alternative | QR placeholder in preview | P9 | R04 |

## PARTNERS

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-020 | PartnersRegistryPage | NEW · pattern of FN-01 | SH-01 → RF-021…RF-025 | All partners with status and performance | default · loading · empty · error · stale · filtered | site00_referral_partners (reconciled, doc 25) / GET /api/admin/referrals/partners | Two-line rows · 4 columns ≥ 600 · 7 columns ≥ 900 | role=table; J/K row cursor | Founder session (requireAdminFounder); no preview bypass for financial actions | P3 | R06–R08 |
| RF-021 | PartnerStatusViews | EXTENDS FN-03 | RF-020 → — | ALL · ACTIVE · PLANNED · INVITED · SUSPENDED · ARCHIVED | default · current | Counts by status / GET partners?status= | Scrolling tabs · Tabs · Tabs | tablist | — | P3 | R06 |
| RF-022 | PartnerRow | NEW · pattern of FN-05 | RF-020 → RF-023 | Thumbnail, name, type, status, referrals, converted, owed, card | default · hover · selected · focus-visible | Partner + aggregates / GET partners | Thumb + 2 lines + count · PARTNER · TYPE · REFERRALS · + CONVERTED · OWED · CARD | Row link names the partner | Email shown to founder only | P3 | R06–R08 |
| RF-023 | PartnerThumb | NEW · reuses approved environment imagery | RF-022 → — | Architectural thumbnail (decorative) — never a partner logo until supplied | default | Static asset set / — | 40 · 40 · 40 | aria-hidden | — | P3 | R06 |
| RF-024 | PartnerStatusMark | EXTENDS SC-02 | RF-022 → — | PLANNED · INVITED · ACTIVATION PENDING · ACTIVE · SUSPENDED · REVOKED · ARCHIVED | 7 states | Partner status / — | Mark + label · Same · Same | Label always visible, never truncated | — | P3 | R06 |
| RF-025 | PartnerInspector | NEW · hosted by SH-12 | SH-12 → — | Selected partner summary, link, actions | default · loading · error | Partner detail / GET partner | Sheet · Sheet (portrait) / dock (landscape ≥ 680 stage) · Docked | Focus moves into sheet; Esc closes | Founder session (requireAdminFounder); no preview bypass for financial actions | P3 | R07 R08 |

## PARTNER DETAIL

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-030 | PartnerDetailPage | NEW · pattern of CR-01 | SH-01 → RF-031…RF-039 | One partner across seven sections | default · loading · empty · error · stale | Partner + related ledgers / GET partner | Stacked sections · Main + context · Main + context column | h1 = partner name | Founder session (requireAdminFounder); no preview bypass for financial actions | P3 | R09 R10 |
| RF-031 | PartnerHeader | NEW · pattern of CR-02 | RF-030 → — | Plate, name, status, type, owner, contact, actions | default · planned · suspended | Partner / GET partner | Stacked, actions wrap · Inline · Inline | Buttons have visible labels | MESSAGE opens composer; never sends automatically | P3 | R10 |
| RF-032 | PartnerOverviewSection | NEW | RF-030 → RF-036 | Metrics, referred clients, link + QR, card | default · loading · empty · error · stale | Aggregates / GET partner | Stacked · 2 col · 2 col | — | — | P3 | R10 |
| RF-033 | PlannedPartnerChecklist | NEW | RF-032 → — | “BEFORE AIO CAN REFER CLIENTS” — policy, terms, agreement, link, QR, card | open · done | Policy register + partner state / GET partner | List · List · List | Checklist role=list with state text | Surfaces fixture conflicts (aioInvitation001.ts) | P3 | R10 |
| RF-034 | PartnerTermsSection | NEW | RF-030 → RO-05 | Versioned terms; nothing pre-filled | no-terms · draft · active · superseded | partner_terms_versions (proposed) / GET/POST terms | kv list · kv · kv + history | — | Terms are never shown on cards or public pages | P6 | R10 R11 |
| RF-035 | PartnerSectionPanels | NEW | RF-030 → — | REFERRALS · COMMISSIONS · PAYOUTS · CARDS · ACTIVITY scoped to the partner | default · loading · empty · error · stale | Ledgers filtered by partner / GET …?partner= | Composite rows · Ledger · Ledger | — | — | P5–P9 | R09 R10 |
| RF-036 | ReferralLinkBlock | EXTENDS SC-18 LinkBlock | RF-032 → RF-076 | Masked public URL, route, target, status, scan check, QR | not-issued · active · paused · revoked · unverified | invitation_codes / GET link | QR above facts · QR beside facts ≥ 460 · Same | Copy announces success | Displays masked code; full code only on explicit copy by founder | P4 | R10 |
| RF-037 | AccessStateBlock | NEW | RF-030 → RO-03 RO-20 | INVITED · ACTIVATION PENDING · ACTIVE · SUSPENDED · REVOKED · ARCHIVED | 6 states | partner_access (proposed) / POST invite/revoke | Row · Row · Row | — | Revocation ends sessions server-side | P10 | R35 |

## ATTRIBUTION

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-040 | AttributionLedgerPage | NEW | SH-01 → RF-041…RF-044 | Who referred whom, via what, with what result | default · loading · empty · error · stale | client_acquisition_attributions / GET /api/admin/referrals/attribution | Composite rows · 4 columns · 7 columns | role=table | Founder session (requireAdminFounder); no preview bypass for financial actions | P5 | R12 R13 |
| RF-041 | AttributionRow | NEW | RF-040 → — | Referral id, client, partner, via, intake, conversion, commission state | default · selected · exception | Attribution + artifact / GET | Client + partner · via / state · 4 col · 7 col | — | Never shows client-provided partner ids | P5 | R13 |
| RF-042 | SourceTrace | NEW | SH-01 → RF-043 | Card → scan → entry → artifact → intake → payment → eligibility | default · partial · error | referral_business_events / GET trace | Timeline · Timeline + linked · Timeline + linked records | Ordered list; times in founder TZ | Visit keys never displayed | P5 | R14 |
| RF-043 | EvidenceClassTag | NEW | RF-042 → — | OBSERVED · ATTRIBUTED · ESTIMATED · UNAVAILABLE | 4 classes | Event metadata / — | Tag · Tag · Tag | Text label, not colour | — | P5 | R14 |
| RF-044 | AttributionExceptionQueue | NEW | RF-040 → RO-18 RO-19 | Collisions, existing clients, self-referrals, cross-device | open · resolved | attribution exceptions (proposed) / GET/POST exceptions | List · List · List | — | Resolution requires reason; event written | P5 | R15 |
| RF-045 | AttributionResolver (server) | EXTENDS api/_lib/invitationSystem service.ts | — → — | Resolves code → partner, applies window/touch/existing-client rules, writes once | attributed · unattributed · exception · disqualified | Codes, visits, artifacts / Internal | — · — · — | — | Ignores any client-supplied partner id; idempotent per artifact | P4 | R43 |

## COMMISSIONS

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-050 | CommissionsLedgerPage | NEW | SH-01 → RF-051…RF-055 | All commission entries and their states | default · loading · empty · error · stale | partner_commission_entries (reconciled) / GET /api/admin/referrals/commissions | Composite rows · 4 columns · 7 columns | role=table; amounts right-aligned with text equivalents | Founder session (requireAdminFounder); no preview bypass for financial actions | P6 | R16–R18 |
| RF-051 | CommissionStateChip | NEW · pattern of SC-04 | RF-052 → — | TRACKED · NOT YET ELIGIBLE · ELIGIBLE · PENDING APPROVAL · APPROVED · SCHEDULED · PAID · ADJUSTED · REVERSED · DISPUTED | 10 states | Entry state / — | Chip · Chip · Chip | Never truncated; shape + text | — | P6 | R18 R19 |
| RF-052 | CommissionRow | NEW | RF-050 → RF-051 | Client, partner, amount, state, date, terms | default · selected | Entry / GET | 2-line + amount/state · 4 col · 7 col | — | — | P6 | R16–R18 |
| RF-053 | CommissionCalculation | NEW | RF-054 → — | Collected → deductions → refunds → basis → terms → commission | locked · provisional · not-calculable | Calculation snapshot / GET entry | Stacked · Stacked · Stacked | Each line has label + signed amount | Integer minor units only | P6 | R19 |
| RF-054 | CommissionInspector | NEW · hosted by SH-12 (= RO-11) | SH-12 → RF-053 RO-12 RO-13 | Detail, calculation, history, APPROVE / ADJUST | default · loading · error | Entry + events / GET entry | Sheet · Sheet / dock · Docked | Focus management per SH-12 | Founder session (requireAdminFounder); no preview bypass for financial actions | P7 | R19 |
| RF-055 | CommissionEngine (server) | EXTENDS commissionLedger.ts / eligibility.ts | — → — | Applies approved terms version at eligibility; state machine transitions with evidence | 10 states | Payments, refunds, terms versions / Webhook-driven + founder actions | — · — · — | — | Fixes agreement_version bug (commissionLedger.ts:45); idempotent transitions | P6 | R18 R44 |

## PAYOUTS

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-060 | PayoutsPage | NEW | SH-01 → RF-061…RF-064 | Payouts paid outside SITE 00, recorded here | default · loading · empty · error · stale | partner_payouts (proposed) / GET /api/admin/referrals/payouts | Composite rows · 4 col · 7 col | role=table | Founder session (requireAdminFounder); no preview bypass for financial actions | P8 | R21–R23 |
| RF-061 | PayoutPolicyBanner | EXTENDS SC-15 Banner (policy tone) | RF-060 → — | States that SEND PAYMENT does not exist (FD-R16) | default | Config / — | Banner · Banner · Banner | role=note | — | P8 | R21 |
| RF-062 | PayoutRow | NEW | RF-060 → — | Payout id, partner, amount, method type, state, date | default · selected | Payout / GET | 2-line · 4 col · 7 col | — | Method shows type + last four only | P8 | R23 |
| RF-063 | PayoutInspector | NEW · hosted by SH-12 (= RO-14) | SH-12 → RO-15 RO-16 RO-17 | Commissions in the payout, totals, RECORD PAYMENT; SEND disabled | scheduled · recorded · reversed · failed | Payout + entries / GET payout | Sheet · Sheet / dock · Docked | — | Separation of duties FD-R18 | P8 | R24 |
| RF-064 | PayeeRecord | NEW | RF-063 → — | Payee documentation status (FD-R10) | missing · on-file | payee docs (proposed, encrypted at rest) / GET payee status | Row · Row · Row | — | Status only; documents never rendered inline; no banking data in workspace | P8 | R25 |

## CARD STUDIO

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-070 | CardStudioPage | NEW | SH-01 → RF-071…RF-079 | System B referral cards: preview, templates, link, share, print gate | default · loading · empty · error · stale | Card templates + partner link / GET /api/admin/referrals/cards | Stacked · Stage / controls (TL) · Picker / stage / controls | — | Founder session (requireAdminFounder); no preview bypass for financial actions | P9 | R26–R28 |
| RF-071 | ReferralCard | NEW | RF-070 → RF-072 | 3.5 × 2 in card, territories A/B/C, front/back | front · back · test · void | Template + partner + link / — | Full width ≤ 520 · ≤ 520 · ≤ 520 | role=img with full text alternative | Contains no terms, rates, ids or secrets | P9 | R29 R30 |
| RF-072 | QrMark | EXTENDS shared/site00-invitation-system/qr.ts | RF-071 → — | Real QR only after validation; otherwise a non-scannable placeholder labelled NOT VALID FOR PRINT | placeholder · validated · revoked | Validated public URL / GET qr-asset (existing admin route) | — · — · — | Alt text states validity | Payload is the public URL only | P11 | R31 |
| RF-073 | TemplatePicker | NEW · FD-1…FD-6 radio grammar | RF-070 → — | A · B · C | default · selected · focus-visible | Templates / — | 3-up · 3-up · 3-up | radiogroup | — | P9 | R28 |
| RF-074 | PrintGate | NEW | RF-070 → — | Six conditions; export disabled until all pass | blocked · ready | Gate evaluation (server) / GET gate | Checklist · Checklist · Checklist | Each condition has state text | Server-enforced; client cannot bypass | P11 | R26 R33 |
| RF-075 | DigitalShareActions | NEW | RF-070 → RO-08 RO-09 | Share via device · copy link · download PNG | idle · shared · unsupported | Validated link / — | Sheet · Popover · Popover | — | SITE 00 sends nothing | P9 | R32 |
| RF-076 | QrValidator | NEW | RF-070 → RO-07 | HTTPS, resolution, target, production origin, no admin path/secret, device scan | pass · fail · pending | Validation record / POST /api/admin/referrals/qr/validate | Full screen · Dialog · Dialog | — | Validation runs server-side against the production origin allowlist | P11 | R31 |
| RF-077 | PrintProof | NEW | RF-070 → RO-10 | Bleed/trim/safe proof; approve or reject | draft · approved · rejected | Proof record / POST proof | Full · Dialog · Dialog | — | — | P11 | R33 R34 |
| RF-078 | PrintPackageExport (server) | EXTENDS scripts/invitation001/render-invitation001.ts | — → — | Generates per-side PDF with real QR after the gate | blocked · generated | Gate + template / POST export | — · — · — | — | Refuses placeholder or staging QR; filenames carry no admin ids | P11 | R34 |
| RF-079 | BatchRecord | EXTENDS invitation_batches.print_status | RF-070 → — | NOT_PRINTED · PROOF · PRINTED · DISTRIBUTED · RETIRED | 5 states | invitation_batches / PATCH batch | Row · Row · Row | — | — | P11 | R10 |

## PUBLIC ENTRY

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-080 | InvitationEntryStates | EXTENDS src InvitationEntryPage (/invite/:code) | — → — | Valid · invalid · revoked · test landing for prospects | valid · invalid · revoked · paused · test | resolveInvitationCode / GET /api/site00/invitation (existing) | Full page · Centered · Centered | Single h1; button labels explicit | Shows partner display name only; never terms, ids or email | P4 | R32 R43 |

## PARTNER PORTAL

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-081 | PartnerPortalShell | NEW · separate surface | — → RF-082…RF-085 | Partner-facing app: HOME · MY CARD · EARNINGS · TERMS | signed-out · signed-in · suspended | Partner session (FD-R12) / Partner auth | 4-tab bottom bar · Top nav · Top nav | Landmarks; current tab | Partner sees only own records; RLS by partner | P10 | R35–R38 |
| RF-082 | PartnerHome | NEW | RF-081 → — | Summary + masked referrals + card | default · loading · empty · error · stale | Partner reporting projection / GET /api/partner/summary | Stacked · 2 col · 3 col | — | Masked client labels (FD-R11) | P10 | R35 R38 |
| RF-083 | PartnerCard | NEW | RF-081 → RF-071 | Own card, share, copy, download | active · paused | Card + link / GET /api/partner/card | Stacked · 2 col · 2 col | — | No print ordering by partner | P10 | R36 |
| RF-084 | PartnerEarnings | NEW | RF-081 → — | Pending, approved, paid, next payout (ESTIMATED), history | default · loading · empty · error · stale | Own commission + payout projection / GET /api/partner/earnings | Stacked · 2 col · 2 col | Amounts with text equivalents | Method type only | P10 | R37 |
| RF-085 | PartnerTerms | NEW | RF-081 → — | Own active terms version | active · none | Terms version / GET /api/partner/terms | kv · kv · kv | — | — | P10 | R37 |

## ACTIVITY

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-090 | ReferralActivityPage | NEW · pattern of CR-12 | SH-01 → RF-091 | Recorded referral events only | default · loading · empty · error · stale | referral_business_events / GET /api/admin/referrals/events | Timeline · Timeline · Timeline | Ordered list | Append-only source | P12 | R39 |
| RF-091 | ReferralEventRow | EXTENDS SC-05 ActivityRow | RF-090 → — | Time, verb, subject, actor tag | default | Event / — | Row · Row · Row | — | — | P12 | R39 |

## ANALYTICS

| ID | NAME | SOURCE RELATIONSHIP | PARENT → CHILDREN | PURPOSE | STATES | DATA / API | M · T · D | ACCESSIBILITY | SECURITY | PHASE | BOARDS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-092 | EvidenceAwareMetric | NEW | RF-011 → — | Metrics labelled OBSERVED / ATTRIBUTED / ESTIMATED / UNAVAILABLE | 4 classes | Read models / GET summary | — · — · — | — | No decorative charts; no sparklines without a defined series | P12 | R04 |

## OVERLAYS

| ID | NAME | HOST | ACTIONS | M | T | D |
| --- | --- | --- | --- | --- | --- | --- |
| RO-01 | CREATE PARTNER | SH-13 | CANCEL · CREATE DRAFT | full | dialog | dialog |
| RO-02 | EDIT PARTNER | SH-13 | CANCEL · SAVE CHANGES | full | dialog | dialog |
| RO-03 | INVITE PARTNER | SH-13 | CANCEL · SEND INVITATION (DISABLED) | sheet | dialog | dialog |
| RO-04 | PARTNER STATUS CHANGE | SH-13 | CANCEL · SUSPEND PARTNER | sheet | dialog | dialog |
| RO-05 | COMMISSION TERMS EDITOR | SH-13 | CANCEL · SAVE TERMS V3 (DISABLED) | full | dialog | dialog |
| RO-06 | REFERRAL LINK PREVIEW | SH-13 | COPY · OPEN PREVIEW · REVOKE… | sheet | popover | popover |
| RO-07 | QR VALIDATION RESULT | SH-13 | RE-RUN CHECKS · RECORD DEVICE SCAN | full | dialog | dialog |
| RO-08 | CARD SHARE SHEET | SH-13 | SHARE VIA DEVICE · COPY LINK · DOWNLOAD PNG | sheet | popover | popover |
| RO-09 | CARD EXPORT DIALOG | SH-13 | CANCEL · EXPORT PNG | full | dialog | dialog |
| RO-10 | PRINT PROOF | SH-13 | REJECT PROOF · APPROVE PROOF (DISABLED) | full | dialog | dialog |
| RO-11 | COMMISSION DETAIL | SH-12 | Navigate | sheet | sheet / dock | inspector |
| RO-12 | COMMISSION APPROVAL | SH-13 | CANCEL · APPROVE | sheet | dialog | dialog |
| RO-13 | COMMISSION ADJUSTMENT | SH-13 | CANCEL · RECORD ADJUSTMENT | full | dialog | dialog |
| RO-14 | PAYOUT DETAIL | SH-12 | Navigate | sheet | sheet / dock | inspector |
| RO-15 | RECORD PAYMENT | SH-13 | CANCEL · CONTINUE | full | dialog | dialog |
| RO-16 | CONFIRM PAYMENT | SH-13 | BACK · MARK PAID | sheet | dialog | dialog |
| RO-17 | PAYOUT REVERSAL | SH-13 | CANCEL · RECORD REVERSAL | full | dialog | dialog |
| RO-18 | ATTRIBUTION EXCEPTION | SH-13 | CANCEL · CONTINUE TO CORRECTION | full | dialog | dialog |
| RO-19 | MANUAL ATTRIBUTION CORRECTION | SH-13 | CANCEL · APPLY CORRECTION (DISABLED) | full | dialog | dialog |
| RO-20 | PARTNER ACCESS REVOCATION | SH-13 | CANCEL · REVOKE ACCESS (DISABLED) | sheet | dialog | dialog |
| RO-M | WORKSPACE MENU · REFERRALS | SH-13 | Navigate | drawer | drawer | none |
| RO-S | SECTION SELECT (PHONE) | SH-13 | Navigate | sheet | none | none |

Full overlay behaviour (trigger, validation, confirmation, error, success, focus) is in doc 07 §3.
