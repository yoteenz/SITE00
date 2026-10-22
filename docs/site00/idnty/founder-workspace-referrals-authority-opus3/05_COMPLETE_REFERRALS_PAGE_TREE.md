# 05 · Complete REFERRALS page tree

Routes are **proposed** (the founder workspace route scheme from OPUS1 `COMPLETE_ROUTE_AND_PAGE_TREE.md`); none exist yet. Query parameters are UI state only and never carry identity or attribution evidence.

## 1. Founder workspace

```
/admin/idnty/workspace/referrals                        06 REFERRALS · OVERVIEW                 RF-010
│   states: default · loading · empty (no partners) · error (read-only snapshot) · stale
│
├── /partners                                           PARTNER REGISTRY                         RF-020
│   │   ?status=all|active|planned|invited|suspended|archived   ?q=   ?sel=<partnerRef>
│   │   states: default · loading · empty · filtered · error
│   │   overlays: RO-01 create · RO-06 link preview (row) · RO-04 status (row menu)
│   │
│   └── /partners/:partnerRef                           PARTNER DETAIL                           RF-030
│       ?section=overview|referrals|commissions|payouts|cards|terms|activity
│       ├── overview      metrics · referred clients · link + QR · card            (planned: checklist + conflict)
│       ├── referrals     attributed clients → FOUNDATIONS record
│       ├── commissions   ledger scoped to partner → RO-11
│       ├── payouts       ledger scoped to partner → RO-14
│       ├── cards         current card · versions · existing assets · print status
│       ├── terms         versioned terms → RO-05
│       └── activity      partner events
│       overlays: RO-02 edit · RO-03 invite · RO-04 status · RO-05 terms · RO-06 link · RO-08 share · RO-20 revoke
│
├── /attribution                                        ATTRIBUTION LEDGER                       RF-040
│   │   ?view=all|tracked|converted|exceptions
│   │   overlays: RO-18 exception · RO-19 correction
│   └── /attribution/:referralRef                       SOURCE TRACE                             RF-042
│
├── /commissions                                        COMMISSIONS LEDGER                       RF-050
│   │   ?state=pending|approved|scheduled|paid|adjusted|reversed|disputed|all
│   └── /commissions/:commissionRef                     → INSPECTOR RO-11 (sheet on phone/portrait)
│       overlays: RO-12 approve · RO-13 adjust
│
├── /payouts                                            PAYOUTS                                  RF-060
│   └── /payouts/:payoutRef                             → INSPECTOR RO-14
│       overlays: RO-15 record payment → RO-16 confirm · RO-17 reversal
│
├── /cards                                              CARD STUDIO                              RF-070
│   ?partner=<partnerRef>&template=A|B|C&side=front|back
│   overlays: RO-07 QR validation · RO-08 share · RO-09 export · RO-10 print proof
│
└── /activity                                           REFERRAL ACTIVITY                        RF-090
    ?filter=all|partners|attribution|commissions|payouts|cards
```

Workspace-level additions:

```
/admin/idnty/workspace/foundations/:clientRef           CLIENT RECORD + REFERRAL SOURCE block   RF-008
/admin/idnty/workspace/system                           + REFERRALS HEALTH module                 RF-007
(menu drawer) 06 · REFERRALS                            RO-M (phones, tablets)
(section sheet)                                         RO-S (phones)
```

`partnerRef`, `referralRef`, `commissionRef`, `payoutRef` are **display references** (e.g. `001`, `R-0015`, `C-0010`, `PO-0005`), resolved server-side to database ids; database UUIDs never appear in URLs.

## 2. Public (existing)

```
/invite/:code                                           InvitationEntryPage (existing)           RF-080
    states: valid · invalid · revoked · paused (partner suspended) · test (non-production)
    → BEGIN → existing DF activation / artifact creation (server-held referral context)
    → BEGIN WITHOUT A REFERRAL (invalid / revoked / paused)
```

No `/r/`, `?ref=` or UTM-based attribution route is introduced.

## 3. Partner portal (new, separate surface; FD-R12)

```
/partner                                                HOME          RF-082
/partner/card                                           MY CARD       RF-083
/partner/earnings                                       EARNINGS      RF-084
/partner/terms                                          TERMS         RF-085
/partner/sign-in · /partner/activate                    auth states INVITED → ACTIVATION PENDING → ACTIVE
```

## 4. API surface implied (detail in doc 26)

```
GET  /api/admin/referrals/summary
GET  /api/admin/referrals/partners            POST (create draft)   PATCH /:id (edit, status)
GET  /api/admin/referrals/partners/:id        POST /:id/invite      POST /:id/revoke-access
GET  /api/admin/referrals/partners/:id/terms  POST (new version)
GET  /api/admin/referrals/attribution         GET /:id/trace        POST /exceptions/:id/resolve
GET  /api/admin/referrals/commissions         POST /:id/approve     POST /:id/adjust
GET  /api/admin/referrals/payouts             POST (create)         POST /:id/record-payment   POST /:id/reverse
GET  /api/admin/referrals/cards               POST /qr/validate     POST /proofs   POST /print-package
GET  /api/admin/referrals/events
GET  /api/partner/summary | card | earnings | terms
```

## 5. Page × state coverage (specimens)

| Page | Default | Loading | Empty | Error | Selected / inspector | Overlays shown |
| --- | --- | --- | --- | --- | --- | --- |
| Overview | ✓ | ✓ | ✓ | ✓ | — | RO-M, RO-S |
| Partners | ✓ | ✓ | ✓ | — (shell error grammar) | ✓ | RO-01, RO-04, RO-06 |
| Partner detail × 7 sections | ✓ | — | AIO planned | — | — | RO-02, RO-03, RO-05, RO-20 |
| Attribution | ✓ | — | — | — | ✓ (row) | RO-18, RO-19 |
| Source trace | ✓ | — | — | — | — | — |
| Commissions | ✓ | — | — | — | ✓ | RO-11, RO-12, RO-13 |
| Payouts | ✓ | — | — | — | ✓ | RO-14…RO-17 |
| Card Studio × A/B/C × front/back | ✓ | — | — | — | — | RO-07…RO-10 |
| Activity | ✓ | — | — | — | — | — |
| Public entry | valid | — | — | invalid / revoked / test | — | — |
| Portal × 4 views | ✓ | — | — | — | — | — |

Loading / empty / error for pages without a dedicated specimen use the shared SC-12 / SC-13 / SC-15 grammar already approved in OPUS1/OPUS2 (doc 07 lists each).
