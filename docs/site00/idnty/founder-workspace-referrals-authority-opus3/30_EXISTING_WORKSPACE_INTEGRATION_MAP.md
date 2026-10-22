# 30 · Existing workspace integration map

How REFERRALS plugs into the approved founder workspace authorities without changing them:
- **OPUS1** — b82ca64e4: 124 components, 20 OL overlays.
- **Form-control authority** — c5a773381: FD-1…FD-6, Phases 1–2 implemented in #1659 / #1660; Phases 3–5 (System B checkboxes, contact phone) in #1661.
- **OPUS2 responsive** — 81407c694.

## 1. Shell and shared components reused

| OPUS1 component | Use in REFERRALS | Change |
| --- | --- | --- |
| SH-01 FounderWorkspaceShell | Hosts the REFERRALS pages | Destination table +1 (RF-001) |
| SH-04 GlobalSearch | Partners / refs in results | Provider added (RF-004) |
| SH-05 NotificationCenter | Referral notifications | Event types added (RF-005) |
| SH-08 BottomNav | **Unchanged**; no item selected while REFERRALS is active | Invariant test (RF-002) |
| SH-09 WorkspaceMenuDrawer | Row `06 · REFERRALS` | Row added |
| SH-10 IndexRail | Item `REFERRALS` | Item added |
| SH-11 Sidebar | Row `06 REFERRALS`; SYSTEM → 07 | Row added; index shift (FD-R20) |
| SH-12 InspectorHost | Partner / commission / payout inspectors | None |
| SH-13 OverlayHost | RO-01…RO-20 | None |
| SH-16 PageTitle | `06 / REFERRALS.` headers | None |
| SC-02 / SC-04 Status + Chip | Partner status, commission state chips | New tones only |
| SC-05 ActivityRow | Referral events | None |
| SC-06 Button · SC-07 Field · SC-09 Sheet · SC-10 Tabs · SC-11 Dialog | All overlays and forms | None |
| SC-12 Empty · SC-13 Loading · SC-14 Toast · SC-15 Error | All states | None |
| SC-17 KeyValue · SC-18 LinkBlock | Terms, link panel | LinkBlock extended to RF-036 |
| CR-02 / CR-10 / CR-12 (client record) | REFERRAL SOURCE block; referral events in client activity | Block added (RF-008) |
| SY System page | REFERRALS HEALTH module | Module added (RF-007) |

## 2. Form controls (FD-1…FD-6)

| Control in REFERRALS | Grammar |
| --- | --- |
| Partner type (RO-01), method (RO-15), basis / trigger (RO-05), section select (RO-S) | Phones: **editorial selection sheet** (square, 2 px red edge, FD-1…FD-6). Desktop: **anchored listbox** (`IdntySelect`, Phase 2 #1660) |
| Compensation type (RO-05), status choice (RO-04), exception resolution (RO-18) | Radio cards (System B, square) |
| Template picker A/B/C | radiogroup of card thumbnails |
| Amount / date / reference fields | Field (SC-07) with label above, red required mark, error text below; values uppercase except data (emails, URLs, references) |

Mobile pickers are never native-styled dropdowns with rounded corners. Phases 1–2 (#1659, #1660) and Phases 3–5 (#1661: System B checkbox visuals — used for the approval ticks in RO-03 and the print-gate checklist) are reused, not overwritten.

## 3. Responsive (OPUS2)
- Tiers, stage container, inspector docking rule and overlay modes are reused verbatim (doc 08 §1).
- REFERRALS adds container rules only for its own components (doc 08 §2).

## 4. Data integrations

| Existing module | Integration |
| --- | --- |
| `shared/site00-digital-foundation` (artifacts, leads, referral sources) | Attribution references the DF artifact; `referral_source_id` stays the coarse label; client projection keeps stripping referral data |
| `api/_lib/digitalFoundation/service.ts` | `createArtifactForLeadDurable` used by activation (G-RF-03) |
| `api/_lib/invitationSystem/*` | Becomes the referrals backend (persisted) |
| `shared/site00-invitation-system/qr.ts` | Card Studio QR |
| Stripe webhook (`api/site00/digital-foundation-stripe-webhook.ts`) | Payment / refund / dispute evidence → engine (later, separately approved; not changed now) |
| `api/_lib/adminAuth.ts` | `requireAdminFounder` on all admin referral routes; no preview bypass for mutations |
| Correspondence | MESSAGE PARTNER opens the composer (OL-14). Sending stays gated (OL-15); no live partner messages |
| `aioReferralBoundaries.ts` | AIO services are never bundled into DF quotes |

## 5. Not touched
- Persistence repair #1657 / a99d914d.
- Form-control Phases 1–2 (#1659, #1660) and Phases 3–5 (#1661).
- Payment webhooks.
- Supabase production.
- Application bundle: no production code changed in this sprint.
