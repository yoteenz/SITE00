# 31 · Responsive component mapping

Every RF component and RO overlay with its mobile / tablet / desktop variant (registry columns), followed by the container rules that select them (doc 08 §2). Board R41 shows the commissions ledger at the four tiers side by side.

| ID | COMPONENT | MOBILE < 768 | TABLET 768–1279 | DESKTOP ≥ 1280 | BOARDS |
| --- | --- | --- | --- | --- | --- |
| RF-001 | ReferralsDestination | Menu drawer row (bottom bar unchanged) | Rail item “REFERRALS” | Sidebar row “06 REFERRALS” | R01 R02 R04 R42 |
| RF-002 | BottomNavInvariant | Five items, CREATE centre | — | — | R01 R42 |
| RF-003 | ReferralsSectionNav | Section select button → sheet RO-S | Tab row (scrolls if needed) | Tab row | R01 R09 |
| RF-004 | ReferralsSearchProvider | Search sheet | Search sheet | ⌘K palette | R42 |
| RF-005 | ReferralsNotifications | Sheet | Popover | Popover | R04 R39 |
| RF-006 | ReferralsPermissions | Same | Same | Same | R20 R25 |
| RF-007 | ReferralsDiagnostics | Card | Card | Module row | R42 |
| RF-008 | ClientReferralSourceBlock | Row in RECORDS section | Row | Context column block | R43 |
| RF-009 | ReferralBackLinks | Same | Same | Same | R43 |
| RF-010 | ReferralsOverviewPage | Single column + menu entry | 2 columns | 2 → 3 columns (≥ 1440 stage) | R01–R05 |
| RF-011 | ReferralSignalsStrip | 2-up | 3/4/5-up by container | 5-up | R04 |
| RF-012 | ReferralMetric | Cell | Cell | Cell | R04 |
| RF-013 | ReferralFocusCard | Card | Card | Hidden ≥ 1100 (signals carry it) | R01 |
| RF-014 | PartnersPanel | Rows | Rows | Rows | R04 |
| RF-015 | MoneyPanel | Rows | Rows | Rows | R04 |
| RF-016 | CardStudioEntry | Card | Card | Card | R04 |
| RF-020 | PartnersRegistryPage | Two-line rows | 4 columns ≥ 600 | 7 columns ≥ 900 | R06–R08 |
| RF-021 | PartnerStatusViews | Scrolling tabs | Tabs | Tabs | R06 |
| RF-022 | PartnerRow | Thumb + 2 lines + count | PARTNER · TYPE · REFERRALS | + CONVERTED · OWED · CARD | R06–R08 |
| RF-023 | PartnerThumb | 40 | 40 | 40 | R06 |
| RF-024 | PartnerStatusMark | Mark + label | Same | Same | R06 |
| RF-025 | PartnerInspector | Sheet | Sheet (portrait) / dock (landscape ≥ 680 stage) | Docked | R07 R08 |
| RF-030 | PartnerDetailPage | Stacked sections | Main + context | Main + context column | R09 R10 |
| RF-031 | PartnerHeader | Stacked, actions wrap | Inline | Inline | R10 |
| RF-032 | PartnerOverviewSection | Stacked | 2 col | 2 col | R10 |
| RF-033 | PlannedPartnerChecklist | List | List | List | R10 |
| RF-034 | PartnerTermsSection | kv list | kv | kv + history | R10 R11 |
| RF-035 | PartnerSectionPanels | Composite rows | Ledger | Ledger | R09 R10 |
| RF-036 | ReferralLinkBlock | QR above facts | QR beside facts ≥ 460 | Same | R10 |
| RF-037 | AccessStateBlock | Row | Row | Row | R35 |
| RF-040 | AttributionLedgerPage | Composite rows | 4 columns | 7 columns | R12 R13 |
| RF-041 | AttributionRow | Client + partner · via / state | 4 col | 7 col | R13 |
| RF-042 | SourceTrace | Timeline | Timeline + linked | Timeline + linked records | R14 |
| RF-043 | EvidenceClassTag | Tag | Tag | Tag | R14 |
| RF-044 | AttributionExceptionQueue | List | List | List | R15 |
| RF-045 | AttributionResolver (server) | — | — | — | R43 |
| RF-050 | CommissionsLedgerPage | Composite rows | 4 columns | 7 columns | R16–R18 |
| RF-051 | CommissionStateChip | Chip | Chip | Chip | R18 R19 |
| RF-052 | CommissionRow | 2-line + amount/state | 4 col | 7 col | R16–R18 |
| RF-053 | CommissionCalculation | Stacked | Stacked | Stacked | R19 |
| RF-054 | CommissionInspector | Sheet | Sheet / dock | Docked | R19 |
| RF-055 | CommissionEngine (server) | — | — | — | R18 R44 |
| RF-060 | PayoutsPage | Composite rows | 4 col | 7 col | R21–R23 |
| RF-061 | PayoutPolicyBanner | Banner | Banner | Banner | R21 |
| RF-062 | PayoutRow | 2-line | 4 col | 7 col | R23 |
| RF-063 | PayoutInspector | Sheet | Sheet / dock | Docked | R24 |
| RF-064 | PayeeRecord | Row | Row | Row | R25 |
| RF-070 | CardStudioPage | Stacked | Stage / controls (TL) | Picker / stage / controls | R26–R28 |
| RF-071 | ReferralCard | Full width ≤ 520 | ≤ 520 | ≤ 520 | R29 R30 |
| RF-072 | QrMark | — | — | — | R31 |
| RF-073 | TemplatePicker | 3-up | 3-up | 3-up | R28 |
| RF-074 | PrintGate | Checklist | Checklist | Checklist | R26 R33 |
| RF-075 | DigitalShareActions | Sheet | Popover | Popover | R32 |
| RF-076 | QrValidator | Full screen | Dialog | Dialog | R31 |
| RF-077 | PrintProof | Full | Dialog | Dialog | R33 R34 |
| RF-078 | PrintPackageExport (server) | — | — | — | R34 |
| RF-079 | BatchRecord | Row | Row | Row | R10 |
| RF-080 | InvitationEntryStates | Full page | Centered | Centered | R32 R43 |
| RF-081 | PartnerPortalShell | 4-tab bottom bar | Top nav | Top nav | R35–R38 |
| RF-082 | PartnerHome | Stacked | 2 col | 3 col | R35 R38 |
| RF-083 | PartnerCard | Stacked | 2 col | 2 col | R36 |
| RF-084 | PartnerEarnings | Stacked | 2 col | 2 col | R37 |
| RF-085 | PartnerTerms | kv | kv | kv | R37 |
| RF-090 | ReferralActivityPage | Timeline | Timeline | Timeline | R39 |
| RF-091 | ReferralEventRow | Row | Row | Row | R39 |
| RF-092 | EvidenceAwareMetric | — | — | — | R04 |
| RO-01 | CREATE PARTNER | full | dialog | dialog | R40 |
| RO-02 | EDIT PARTNER | full | dialog | dialog | R40 |
| RO-03 | INVITE PARTNER | sheet | dialog | dialog | R40 |
| RO-04 | PARTNER STATUS CHANGE | sheet | dialog | dialog | R40 |
| RO-05 | COMMISSION TERMS EDITOR | full | dialog | dialog | R40 |
| RO-06 | REFERRAL LINK PREVIEW | sheet | popover | popover | R40 |
| RO-07 | QR VALIDATION RESULT | full | dialog | dialog | R40 |
| RO-08 | CARD SHARE SHEET | sheet | popover | popover | R40 |
| RO-09 | CARD EXPORT DIALOG | full | dialog | dialog | R40 |
| RO-10 | PRINT PROOF | full | dialog | dialog | R40 |
| RO-11 | COMMISSION DETAIL | sheet | sheet / dock | inspector | R40 |
| RO-12 | COMMISSION APPROVAL | sheet | dialog | dialog | R40 |
| RO-13 | COMMISSION ADJUSTMENT | full | dialog | dialog | R40 |
| RO-14 | PAYOUT DETAIL | sheet | sheet / dock | inspector | R40 |
| RO-15 | RECORD PAYMENT | full | dialog | dialog | R40 |
| RO-16 | CONFIRM PAYMENT | sheet | dialog | dialog | R40 |
| RO-17 | PAYOUT REVERSAL | full | dialog | dialog | R40 |
| RO-18 | ATTRIBUTION EXCEPTION | full | dialog | dialog | R40 |
| RO-19 | MANUAL ATTRIBUTION CORRECTION | full | dialog | dialog | R40 |
| RO-20 | PARTNER ACCESS REVOCATION | sheet | dialog | dialog | R40 |
| RO-M | WORKSPACE MENU · REFERRALS | drawer | drawer | none | R40 |
| RO-S | SECTION SELECT (PHONE) | sheet | none | none | R40 |

## Selection mechanism
| Mechanism | Used by |
| --- | --- |
| Viewport tier (shell) | Sidebar / rail / header + bottom bar; overlay `data-m/t/d` mode |
| Stage container query | Overview grid, Card Studio grid, portal grid, section nav |
| Component container query | Partner registry (`prt`), ledgers (`ldg`), link + QR split (`qs`), signals strip, referral card (`card`, type in `cqw`) |
| Inspector docking rule | Partner / commission / payout inspectors (dock when stage ≥ 680) |
