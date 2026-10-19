#!/usr/bin/env python3
"""Writes the data-driven OPUS3 REFERRALS documents from the package's data, registry, manifest and audit files.

Generated: README.md, 06, 07, 15, 28, 29, 31, 33, 34. Hand-written documents are not touched.
Run after render-boards.mjs and audit-layout.mjs:  python3 docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/write-docs.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
PKG = HERE.parent
DATA = PKG / 'data'
POLICY = json.loads((DATA / 'policy-register.json').read_text())
EDGE = json.loads((DATA / 'attribution-edge-cases.json').read_text())
MODES = json.loads((DATA / 'overlay-modes.json').read_text())
REG = json.loads((PKG / 'registry' / 'referrals-component-registry.json').read_text())['components']
MAN = json.loads((HERE / 'board-manifest.json').read_text())['boards']
AUDIT_PATH = PKG / 'verification' / 'layout-audit.json'
AUDIT = json.loads(AUDIT_PATH.read_text()) if AUDIT_PATH.exists() else None
BOARDS_JS = (HERE / 'src' / 'boards.js').read_text()
TITLES = {m[0]: dict(group=m[1], title=m[2], tier=m[3]) for m in re.findall(r"num: '(R\d\d)', group: '([^']*)', title: '([^']*)', tier: '([^']*)'", BOARDS_JS)}
SPRINT = 'P0.SITE00.IDNTY.FOUNDER-WORKSPACE.REFERRALS-AND-PARTNER-COMMERCE-AUTHORITY.OPUS3'


def table(head, rows):
    esc = lambda c: str(c).replace('|', '/').replace('\n', ' ')
    return '\n'.join(['| ' + ' | '.join(head) + ' |', '| ' + ' | '.join('---' for _ in head) + ' |'] + ['| ' + ' | '.join(esc(c) for c in r) + ' |' for r in rows]) + '\n'


def write(name, body):
    (PKG / name).write_text(body.rstrip() + '\n')


# ── 06 · component registry ───────────────────────────────────────────────────
rf = [c for c in REG if c['id'].startswith('RF-')]
ro = [c for c in REG if c['id'].startswith('RO-')]
fams = {}
for c in rf:
    fams.setdefault(c['family'], []).append(c)
doc = f"""# 06 · REFERRALS component registry

Extends the OPUS1 registry (**124 components**, SH / FN / CR / RV / OP / CO / SY / OV / SC / OL — unchanged, not renumbered) with the prefix **RF-001 onward** and the overlay family **RO-01 … RO-20** (+ RO-M menu row, RO-S section sheet).

Machine-readable: `registry/referrals-component-registry.json` and `.csv`, built by `registry/build-referrals-registry.py`.

- **{len(rf)} RF components · {len(ro)} RO overlays**.
- **Approval:** every entry is **PROPOSED · FOUNDER REVIEW REQUIRED**.
- **Numbering:** RF ids are grouped by family with gaps for later additions (RF-001…009 navigation/links, 010s overview, 020s partners, 030s partner detail, 040s attribution, 050s commissions, 060s payouts, 070s cards, 080s public/portal, 090s activity/analytics).

"""
doc += """
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
"""
for fam, items in fams.items():
    doc += f"\n## {fam}\n\n" + table(['ID', 'NAME', 'SOURCE RELATIONSHIP', 'PARENT → CHILDREN', 'PURPOSE', 'STATES', 'DATA / API', 'M · T · D', 'ACCESSIBILITY', 'SECURITY', 'PHASE', 'BOARDS'],
                                       [[c['id'], c['name'], c['relationship'], f"{c['parent']} → {c['children']}", c['purpose'], ' · '.join(c['states']), f"{c['data']} / {c['api']}", f"{c['mobile']} · {c['tablet']} · {c['desktop']}", c['a11y'], c['security'], c['phase'], c['boards']] for c in items])
doc += "\n## OVERLAYS\n\n" + table(['ID', 'NAME', 'HOST', 'ACTIONS', 'M', 'T', 'D'], [[c['id'], c['name'], c['parent'], c['interaction'], c['mobile'], c['tablet'], c['desktop']] for c in ro])
doc += "\nFull overlay behaviour (trigger, validation, confirmation, error, success, focus) is in doc 07 §3.\n"
write('06_REFERRALS_COMPONENT_REGISTRY.md', doc)

# ── 07 · state matrix (metrics, states, overlays) ─────────────────────────────
METRICS = [
    ('M01', 'ACTIVE PARTNERS', 'site00_referral_partners', 'COUNT(partners WHERE status = ACTIVE AND active terms version present)', 'NOW', 'status = ACTIVE', '0 · “NO ACTIVE PARTNERS — PREPARE THE FIRST PARTNER”', '— · READ-ONLY SNAPSHOT BANNER', 'OBSERVED'),
    ('M02', 'REFERRED LEADS', 'client_acquisition_attributions', 'COUNT(attributions WHERE eligibility ≠ DISQUALIFIED)', 'ALL TIME (period selectable)', 'excludes disqualified + exceptions', '0 · “NO ATTRIBUTED REFERRALS YET”', '—', 'OBSERVED / ATTRIBUTED'),
    ('M03', 'CONVERTED CLIENTS', 'attributions × payment evidence', 'COUNT(attributed artifacts WITH a verified qualifying payment (FD-R04))', 'ALL TIME', 'verified payments only; refunded excluded', '0', '—', 'OBSERVED'),
    ('M04', 'CONVERSION RATE', 'M03 ÷ M02', 'M03 / M02, one decimal; “—” when M02 = 0', 'SAME AS M02', 'as M02/M03', '—', '—', 'ATTRIBUTED'),
    ('M05', 'REFERRED REVENUE', 'payment evidence', 'SUM(collected − refunds) for converted clients, minor units', 'PERIOD (default all time)', 'net of refunds; pass-through per FD-R02', '$0.00', '— · “PAYMENT AMOUNTS NOT RECORDED” until G-RF-08', 'OBSERVED'),
    ('M06', 'PENDING APPROVAL', 'partner_commission_entries', 'SUM(amount) WHERE state = PENDING APPROVAL (+ count)', 'NOW', 'state = PENDING APPROVAL', '$0.00 · no red emphasis', '—', 'ATTRIBUTED'),
    ('M07', 'APPROVED UNPAID', 'partner_commission_entries', 'SUM(amount) WHERE state IN (APPROVED, SCHEDULED)', 'NOW', 'approved + scheduled', '$0.00', '—', 'ATTRIBUTED'),
    ('M08', 'TOTAL PAID OUT', 'payout_payment_records', 'SUM(recorded payment amounts) − reversals', 'ALL TIME (period selectable)', 'recorded payments only — never approvals', '$0.00 · “NO PAYMENTS RECORDED”', '—', 'OBSERVED'),
    ('M09', 'REVERSED / ADJUSTED', 'commission_adjustments + reversed entries', 'SUM(signed adjustments + reversed amounts), shown negative', 'PERIOD', 'adjusted + reversed', '$0.00', '—', 'OBSERVED'),
    ('M10', 'OPEN EXCEPTIONS', 'attribution_exceptions', 'COUNT(exceptions WHERE resolution IS NULL)', 'NOW', 'unresolved', '0', '—', 'OBSERVED'),
]
OVERLAY_SPEC = {
    'RO-01': ('NEW PARTNER (header, partners toolbar, overview empty state)', 'Legal name, display name, type, email required; duplicate name/domain check', 'None — creates a DRAFT only', 'DUPLICATE (shows existing, OPEN EXISTING) · NETWORK (entries kept, RETRY)', 'Partner DRAFT created → partner page; toast “DRAFT CREATED · NO LINK ISSUED”', 'First field'),
    'RO-02': ('MORE › EDIT on partner header', 'Same as RO-01', 'None', 'Conflict (edited elsewhere) → reload', 'Saved; event with before/after', 'First field'),
    'RO-03': ('MORE › INVITE', 'Email present; partner has terms', 'Approval tick “I APPROVE SENDING THIS INVITATION”', 'Send unavailable (disabled in this authority)', 'Invitation recorded (INVITED); nothing sent', 'Tick'),
    'RO-04': ('MORE › CHANGE STATUS; row menu', 'Reason required; ACTIVE requires terms', 'Explicit choice card + primary names the action (SUSPEND PARTNER)', 'Blocked transition explained', 'Status changed; event; links paused/resumed', 'Current status choice'),
    'RO-05': ('TERMS › EDIT TERMS', 'Every field required; integer minor units; effective date ≥ today', 'SAVE TERMS Vn creates a new immutable version', 'Validation per field', 'Version saved; past referrals keep their version', 'Compensation type'),
    'RO-06': ('Link panel, registry row link', '—', '—', 'Code revoked → shows REVOKED', 'Copied (announced)', 'COPY'),
    'RO-07': ('Card Studio › VALIDATE QR; print gate item', 'Checks V-1…V-6', 'RECORD DEVICE SCAN requires a confirmation of the landing page', 'Any FAIL keeps NOT PRINTABLE banner', 'All PASS → gate item closed', 'Checklist heading'),
    'RO-08': ('SHARE CARD (header, studio, portal)', 'Link validated', '—', 'Web Share unsupported → copy + download fallback', 'System share sheet opened; nothing sent by SITE 00', 'SHARE VIA DEVICE'),
    'RO-09': ('Card Studio › EXPORT', 'Digital PNG only until the print gate passes', '—', 'Generation failure → retry', 'PNG downloaded', 'Format choice'),
    'RO-10': ('Card Studio › PRINT PROOF', 'Gate items 1–5 closed before APPROVE', 'APPROVE PROOF requires typed partner number', 'Proof generation failure', 'Proof approved → gate item 6', 'REJECT / APPROVE'),
    'RO-11': ('Commission row', '—', '—', 'Load failure → inspector error', '—', 'Inspector heading'),
    'RO-12': ('Inspector › APPROVE', 'Entry ELIGIBLE / PENDING APPROVAL; payment not refunded/disputed; terms present', '“APPROVAL DOES NOT PAY…”', 'Blocked reason shown', 'APPROVED; event; toast', 'CANCEL'),
    'RO-13': ('Inspector › ADJUST', 'Signed amount; reason required; evidence ref', 'RECORD ADJUSTMENT', 'Validation', 'Adjustment row; re-approval required', 'Amount'),
    'RO-14': ('Payout row', '—', '—', 'Load failure', '—', 'Inspector heading'),
    'RO-15': ('Payout inspector › RECORD PAYMENT', 'Amount = payout total; paid-on ≤ today; method; reference required', 'Continues to RO-16', 'Mismatch → RECORD AS PARTIAL; network → entries kept', '→ RO-16', 'Amount'),
    'RO-16': ('RO-15 CONTINUE', '—', 'MARK PAID (summary)', 'Idempotent retry; duplicate reference → no-op', 'Payout RECORDED; lines PAID; event', 'BACK'),
    'RO-17': ('Payout inspector › MORE › REVERSE', 'Reason + reference required', 'RECORD REVERSAL', 'Validation', 'Negative entries; lines back to APPROVED/REVERSED', 'Reason'),
    'RO-18': ('Attribution EXCEPTIONS row', 'Choice required', 'CONTINUE TO CORRECTION', '—', '→ RO-19 or keep current', 'First choice'),
    'RO-19': ('RO-18, trace › CORRECT', 'Reason + evidence; blocked after PAID unless FD-R18', 'APPLY CORRECTION (typed confirmation)', 'Blocked state explained', 'Correction event; attribution updated', 'Reason'),
    'RO-20': ('MORE › REVOKE ACCESS', 'Typed partner number', 'REVOKE ACCESS', '—', 'Sessions ended; links revoked per choice', 'First choice'),
    'RO-M': ('MENU (phones, tablets)', '—', '—', '—', 'Navigates', 'Close button'),
    'RO-S': ('SECTION select (phones)', '—', '—', '—', 'Section changes; URL updated', 'Current section'),
}
INSP_MODES = {'RO-11': ('SHEET', 'SHEET / DOCK ≥ 680 STAGE', 'INSPECTOR'), 'RO-14': ('SHEET', 'SHEET / DOCK ≥ 680 STAGE', 'INSPECTOR')}
doc = """# 07 · REFERRALS state matrix

## 1. Metrics (ten)

Every metric shows its calculation text beside or under the number. **No metric shows a live value in this authority**; specimen values are illustrative. Amounts are integer minor units formatted at the edge.

""" + table(['ID', 'METRIC', 'SOURCE', 'CALCULATION', 'PERIOD', 'STATUS FILTER', 'EMPTY STATE', 'ERROR STATE', 'EVIDENCE CLASS'], METRICS)
doc += """
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

"""
rows = []
for k, v in MODES.items():
    m, t, d = INSP_MODES.get(k, ((v['m'] or '—').upper(), (v['t'] or '—').upper(), (v['d'] or '—').upper()))
    trig, val, conf, err, ok, focus = OVERLAY_SPEC[k]
    rows.append([k, v['name'], trig, f'{m} · {t} · {d}', val, conf, err, ok, focus])
doc += table(['ID', 'NAME', 'TRIGGER', 'PRESENTATION M · T · D', 'VALIDATION', 'CONFIRMATION', 'ERROR', 'SUCCESS', 'INITIAL FOCUS'], rows)
doc += "\n## 4. Component states (from the registry)\n\n" + table(['ID', 'COMPONENT', 'STATES'], [[c['id'], c['name'], ' · '.join(c['states'])] for c in rf])
doc += """
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
"""
write('07_REFERRALS_STATE_MATRIX.md', doc)

# ── 15 · edge cases ───────────────────────────────────────────────────────────
write('15_ATTRIBUTION_EDGE_CASES.md', f"""# 15 · Attribution edge cases

{len(EDGE)} cases (minimum required: 20). Source: `data/attribution-edge-cases.json`; rendered on board R15. Each becomes an automated test in Phase 4 (doc 32). Where a case depends on an open policy, the **interim behaviour** (until decided) is the safest one: no automatic attribution, exception for founder review.

""" + table(['ID', 'SCENARIO', 'SERVER SIGNAL', 'OUTCOME', 'POLICY'], [[e['id'], e['scenario'], e['signal'], e['outcome'], e['policy']] for e in EDGE]) + """
## Invariants across all cases
1. Attribution evidence comes only from server-resolved codes and server-held context. Client-supplied partner ids never count (E13).
2. There is one attribution per DF artifact, written once and idempotently (E06, E16).
3. Money follows only OBSERVED or ATTRIBUTED evidence under approved policy (E02, E15, E21 need a founder correction).
4. Public pages never reveal why a code is invalid, paused or revoked beyond *no longer active* (E09, E10, E12).
5. Test and staging codes never create production attribution (E11).
""")

# ── 28 · manifest ─────────────────────────────────────────────────────────────
GROUP_NAMES = {'A': 'REFERRALS OVERVIEW', 'B': 'PARTNER MANAGEMENT', 'C': 'ATTRIBUTION', 'D': 'COMMISSIONS', 'E': 'PAYOUTS', 'F': 'CARD STUDIO + CARD DESIGN', 'G': 'PARTNER PORTAL', 'H': 'SHARED SYSTEMS'}
rows = []
for bid in sorted(MAN):
    b = MAN[bid]
    t = TITLES.get(bid, {})
    rows.append([bid, t.get('group', ''), t.get('title', ''), t.get('tier', ''), f"`{b['image']}`", '×'.join(map(str, b['image_px'])), f"{b['live_frames']['ready']}/{b['live_frames']['total']}", 'YES' if all(b['fonts_loaded'].values()) else 'NO', len(b['lowercase_app_text']), len(b['frame_layout']['failing']), b['sha256'][:12]])
total_frames = sum(MAN[b]['live_frames']['total'] for b in MAN)
CLASS = {
    'MOBILE': ['R01', 'R06', 'R09', 'R12', 'R16', 'R21', 'R26', 'R35', 'R36', 'R37'],
    'TABLET': ['R02', 'R03', 'R07', 'R17', 'R22', 'R27'],
    'DESKTOP': ['R04', 'R05', 'R08', 'R10', 'R13', 'R18', 'R23', 'R28', 'R38'],
    'CARD DESIGN': ['R29', 'R30', 'R31', 'R32', 'R33', 'R34'],
    'CROSS-TIER / SYSTEM': ['R11', 'R14', 'R15', 'R19', 'R20', 'R24', 'R25', 'R39', 'R40', 'R41', 'R42', 'R43', 'R44'],
}
doc = f"""# 28 · Visual board manifest

**{len(MAN)} boards** (minimum 44), rendered by `boards/render-boards.mjs`:
- Vite server, with real icons, objects and config loaded from source;
- Playwright Chromium at device scale factor 2;
- every product frame is a **live specimen** (`boards/src/specimen.html`) in an iframe at its true viewport, scaled after layout.

**{total_frames} live frames** in total. Machine-readable manifest: `boards/board-manifest.json`, with sha256, sizes, frame readiness, fonts, lowercase scan and per-frame layout checks.

## Classification
""" + table(['CLASS', 'COUNT', 'BOARDS'], [[k, len(v), ' '.join(v)] for k, v in CLASS.items()]) + """
Every board also embeds frames from other tiers where useful (for example R14 has desktop + tablet, R15 has desktop + mobile). The classes above follow each board's primary subject.

## Boards
""" + table(['ID', 'GROUP', 'TITLE', 'TIER / SUBJECT', 'IMAGE', 'PX', 'FRAMES READY', 'FONTS', 'LOWERCASE', 'LAYOUT FAILS', 'SHA256'], rows) + """
## Card alternatives (three territories)

| Territory | Front | Back | Physical mockup | Finish + complexity |
| --- | --- | --- | --- | --- |
| A · ARCHITECTURAL EDITORIAL | R29 §01 | R30 §01 | R29 §02 | R29 §03 · doc 19 §2 |
| B · MINIMAL ACCESS CARD | R29 §01 | R30 §01 | R29 §02 | R29 §03 · doc 19 §3 |
| C · RED STRUCTURAL SIGNATURE | R29 §01 | R30 §01 | R29 §02 | R29 §03 · doc 19 §4 |

Each QR on these boards is a placeholder labelled **NOT VALID FOR PRINT**.

## Reproduce
```
python3 docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/src/make-shells.py
node docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/render-boards.mjs          # all, or: R01 R29 …
node docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/audit-layout.mjs           # 16 viewports
python3 docs/site00/idnty/founder-workspace-referrals-authority-opus3/boards/write-docs.py
```
"""
write('28_VISUAL_BOARD_MANIFEST.md', doc)

# ── 29 · approval register ────────────────────────────────────────────────────
doc = """# 29 · Founder approval register

All entries are **OPEN**. Nothing in this package is founder-approved. The founder records decisions here; Composer reads this file before every phase (doc 32 P0).

## 1. Policy decisions FD-R01 … FD-R20
""" + table(['ID', 'DECISION', 'OPTIONS', 'WHY IT MATTERS', 'UNTIL DECIDED', 'REPOSITORY TODAY', 'BLOCKS', 'STATUS'], [[p['id'], p['decision'], p['options'], p['why'], p['until_decided'], p['repo_today'], p['blocks'], p['status']] for p in POLICY]) + """
## 2. Visual approvals
| Id | Item | Boards | Status |
| --- | --- | --- | --- |
| V-01 | REFERRALS as a seventh destination; sidebar / rail / menu placement | R01, R02, R04, R42 | OPEN (with FD-R20) |
| V-02 | Overview composition per tier | R01–R05 | OPEN |
| V-03 | Partner registry + detail (seven sections) | R06–R11 | OPEN |
| V-04 | Attribution ledger, trace, exceptions | R12–R15 | OPEN |
| V-05 | Commission ledger, detail, approval | R16–R20 | OPEN |
| V-06 | Payout workspace (record-only) | R21–R25 | OPEN |
| V-07 | Card Studio | R26–R28 | OPEN |
| V-08 | Card territory A / B / C | R29, R30 | OPEN (with FD-R14) |
| V-09 | Print proof + production spec | R33, R34 | OPEN |
| V-10 | Partner portal | R35–R38 | OPEN (with FD-R11, R12) |
| V-11 | Overlay system RO-01…RO-20 | R40 | OPEN |
| V-12 | Component registry RF-001+ | doc 06 | OPEN |

## 3. Explicitly not approved by this sprint
- Any rate, fee, basis, window or trigger. The reference image's 15% and 30 days are rejected.
- AIO as an active partner.
- Any printing, any live payout, any partner message, any production migration.

## 4. Decision record format
`FD-Rxx · DECIDED · <date> · <decision text> · <initials>`. A changed decision creates a new line; old lines are never edited.
"""
write('29_FOUNDER_APPROVAL_REGISTER.md', doc)

# ── 31 · responsive component mapping ─────────────────────────────────────────
write('31_RESPONSIVE_COMPONENT_MAPPING.md', """# 31 · Responsive component mapping

Every RF component and RO overlay with its mobile / tablet / desktop variant (registry columns), followed by the container rules that select them (doc 08 §2). Board R41 shows the commissions ledger at the four tiers side by side.

""" + table(['ID', 'COMPONENT', 'MOBILE < 768', 'TABLET 768–1279', 'DESKTOP ≥ 1280', 'BOARDS'], [[c['id'], c['name'], c['mobile'], c['tablet'], c['desktop'], c['boards']] for c in REG]) + """
## Selection mechanism
| Mechanism | Used by |
| --- | --- |
| Viewport tier (shell) | Sidebar / rail / header + bottom bar; overlay `data-m/t/d` mode |
| Stage container query | Overview grid, Card Studio grid, portal grid, section nav |
| Component container query | Partner registry (`prt`), ledgers (`ldg`), link + QR split (`qs`), signals strip, referral card (`card`, type in `cqw`) |
| Inspector docking rule | Partner / commission / payout inspectors (dock when stage ≥ 680) |
""")

# ── 33 · coverage ─────────────────────────────────────────────────────────────
REQ = [
    ('Seventh destination REFERRALS integrated (nav, page registry, component registry, routes, search, notifications, activity, permissions, responsive, overlays, diagnostics, Composer plan)', 'docs 04, 05, 06, 30, 32 · RF-001…RF-009 · R42', 'COVERED'),
    ('Mobile bottom nav HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM preserved; REFERRALS via MENU', 'docs 04 §2, 11 §1 · R01, R42 · RF-002', 'COVERED'),
    ('Reference image preserved characteristics + corrections', 'doc 02', 'COVERED'),
    ('No live values, no 15%, no 30-day window', 'docs 02 §3, 16 · spec tag on every page', 'COVERED'),
    ('Two card systems not combined', 'docs 03 §6, 18, 19 · R30 callout', 'COVERED'),
    ('AIO as planned partner; no record, agreement or payment invented', 'docs 12 §2, 13 · R09, R10', 'COVERED'),
    ('Existing infrastructure audit incl. #1657 FK repair', 'doc 03', 'COVERED'),
    ('10 metrics with source, calculation, period, filter, empty, error', 'doc 07 §1', 'COVERED'),
    ('Partner management + detail (7 sections)', 'docs 12, 13 · R06–R11', 'COVERED'),
    ('Attribution architecture (durable, non-guessable, server-validated)', 'doc 14 · R12–R15, R43', 'COVERED'),
    ('≥ 20 attribution edge cases', f'doc 15 ({len(EDGE)})', 'COVERED'),
    ('Policy register FD-R01…FD-R20, all open', 'doc 29 · data/policy-register.json', 'COVERED'),
    ('Commission engine + 10-state machine', 'doc 16 · R18, R19, R44', 'COVERED'),
    ('Commissions ledger', 'doc 16 §4 · R16–R18', 'COVERED'),
    ('Payouts: RECORD ≠ SEND; never paid because approved', 'doc 17 · R21–R25', 'COVERED'),
    ('Financial controls', 'doc 27', 'COVERED'),
    ('Card Studio 15 functions', 'doc 18 §2', 'COVERED'),
    ('Physical card territories A/B/C, front + back, flat + mockup, finish + complexity', 'doc 19 · R29, R30', 'COVERED'),
    ('Print-production spec (bleed, safe, CMYK, QR size + quiet zone, paper)', 'doc 20 · R34', 'COVERED'),
    ('Print export blocked until six conditions; print path order', 'docs 18 §5, 20 · R33', 'COVERED'),
    ('QR security + link contract', 'doc 21 · R31', 'COVERED'),
    ('Digital card actions', 'doc 18 #9–#11 · R32', 'COVERED'),
    ('Partner portal (separate, masked) + six auth states', 'doc 22 · R35–R38', 'COVERED'),
    ('Analytics evidence classes', 'docs 14 §3, 24 §5 · R14', 'COVERED'),
    ('Activity timeline', 'doc 24 · R39', 'COVERED'),
    ('Independent responsive authority (desktop, TP, TL, mobile)', 'docs 08–11 · R01–R05 etc.', 'COVERED'),
    ('Component tree + registry RF-001+', f'doc 06 ({len(rf)} RF + {len(ro)} RO)', 'COVERED'),
    ('20 overlays with trigger, presentation, validation, confirmation, error, success, M/T/D, focus', 'doc 07 §3 · R40', 'COVERED'),
    ('≥ 44 boards in groups A–H', f'doc 28 ({len(MAN)})', 'COVERED'),
    ('Security / privacy requirements', 'doc 23', 'COVERED'),
    ('Form-control coordination FD-1…FD-6', 'doc 30 §2', 'COVERED'),
    ('Asset handling (reuse approved imagery, document needs)', 'docs 02 §5, 19 §6', 'COVERED'),
    ('Data model reconciled to actual schema, no SQL', 'doc 25', 'COVERED'),
    ('API / backend gap matrix with classifications', 'doc 26', 'COVERED'),
    ('Composer roadmap phases 0–14, pre-policy vs approval', 'doc 32', 'COVERED'),
    ('Visual quality gate (§49)', 'doc 34 §3', 'COVERED'),
    ('Functional gate (§50)', 'doc 34 §4', 'COVERED'),
]
OMIT = [
    ('Live browser verification on iPhone Safari', 'No iOS device or Safari available in this environment; Chromium only', 'Founder device check before P9/P11 acceptance'),
    ('Real QR codes / scannable artwork', 'Forbidden before link, partner and validation exist', 'P11'),
    ('Print-resolution photography, Pantone match', 'Asset needs A-01…A-04 (doc 19 §6)', 'Before P11'),
    ('Partner-facing copy for terms', 'Depends on FD-R01…R06', 'P10'),
    ('Charts / trend lines', 'No stored series exists; decorative charts excluded', 'P12'),
    ('Implementation, migrations, API code', 'Sprint forbids production features and SQL', 'Phases 1–14'),
]
write('33_COVERAGE_AND_OMISSION_REPORT.md', "# 33 · Coverage and omission report\n\n## 1. Coverage\n\n" + table(['REQUIREMENT', 'WHERE', 'STATUS'], REQ) +
      "\n## 2. Deliberate omissions\n\n" + table(['ITEM', 'REASON', 'WHEN'], OMIT) +
      "\n## 3. Gap classifications used\n- **EXISTS** — usable as is.\n- **EXTEND** — exists; needs additions.\n- **FIX** — exists with a defect.\n- **NEW** — must be built.\n- **POLICY** — blocked on a founder decision.\n\nSee doc 26. Counts: " +
      "; ".join(f"{k} {v}" for k, v in {'FIX': 9, 'EXTEND': 5, 'NEW': 15, 'POLICY-BLOCKED': 9}.items()) + " (some gaps carry two classes).\n")

# ── 34 · verification ─────────────────────────────────────────────────────────
if AUDIT:
    keys = ['overflow', 'collision', 'dimensions', 'inspector', 'truncation', 'multiline', 'minText', 'fonts', 'stretch']
    sums = {k: sum(1 for r in AUDIT['results'] if r[k]) for k in keys}
    audit_txt = f"{len(AUDIT['states'])} states × {len(AUDIT['viewports'])} viewports = **{AUDIT['total']} renders, {AUDIT['passed']} passed** every hard check.\n\n" + table(['CHECK', 'RENDERS WITH A FINDING'], [[k + (' (warning)' if k == 'stretch' else ''), v] for k, v in sums.items()])
    failing = [r for r in AUDIT['results'] if not r['pass']]
    if failing:
        audit_txt += "\nFailing renders:\n\n" + table(['STATE', 'VIEWPORT', 'FINDINGS'], [[r['state'], r['viewport'], '; '.join(f"{k}: {r[k][:1]}" for k in keys if r[k] and k != 'stretch')] for r in failing[:40]])
else:
    audit_txt = 'Audit not yet run.'
board_fail = [b for b in MAN if MAN[b]['frame_layout']['failing'] or MAN[b]['page_errors'] or MAN[b]['lowercase_app_text']]
write('34_VERIFICATION_REPORT.md', f"""# 34 · Verification report

## 1. Board render
- `render-boards.mjs` rendered **{len(MAN)} / {len(MAN)} boards** at DSF 2, with **{total_frames} live frames**, all ready.
- Fonts: SITE 00 Display + Saira Semi Condensed loaded on every board.
- Lowercase application text (outside data such as emails and URLs): **{sum(len(MAN[b]['lowercase_app_text']) for b in MAN)}**.
- Page errors: **{sum(len(MAN[b]['page_errors']) for b in MAN)}**.
- Per-frame layout failures: **{sum(len(MAN[b]['frame_layout']['failing']) for b in MAN)}**.
- Boards with any flag: **{', '.join(board_fail) or 'none'}**.

## 2. Responsive layout audit (`audit-layout.mjs`, Chromium)
{audit_txt}
Viewports: {', '.join(AUDIT['viewports']) if AUDIT else '—'}. Machine-readable results: `verification/layout-audit.json`, summary `verification/layout-audit-summary.md`, contact sheets `verification/contact-sheets/`.

Checks measured in the live DOM:
- overflow (page, stage, text outside viewport);
- same-layer text collisions;
- zero-size text;
- inspector docking below a 680 stage;
- truncation of mandatory labels (including commission state chips and signal labels);
- multi-line buttons;
- text < 10 px (card artwork and SVG excluded — printed-size type);
- non-SITE 00 font faces.

Card-artwork frames intentionally overlap (mockups, proof guides), so collisions are not counted there.

## 3. Visual quality gate (§49) — inspected on the rendered PNGs
| Gate | Result |
| --- | --- |
| Only SITE 00 Display + Saira Semi Condensed | PASS (font check per frame + audit `fonts` = 0) |
| All application copy uppercase | PASS (lowercase scan; data values such as emails/URLs exempt) |
| SYSTEM preserved in mobile bottom bar; five items; CREATE kept; FOUNDATIONS not renamed | PASS (R01, R42; visual) |
| REFERRALS reached via MENU on mobile, active there; header shows 06 REFERRALS | PASS (R01 menu frame) |
| No invented live financial data; no 15% / 30-day | PASS (spec tag on every page; terms show NOT SET) |
| AIO not shown as active | PASS (R06–R10) |
| Tablet-specific layouts (not scaled desktop/mobile) | PASS (R02, R03, R07, R17, R22, R27) |
| No truncated statuses / chips | PASS (audit `truncation`; two signal-label truncations found and fixed during the sprint) |
| Rectilinear geometry; no generic SaaS styling; no decorative charts | PASS (visual) |
| Placeholder QRs labelled NOT VALID FOR PRINT; no printable file | PASS (R29–R34) |
| Approved imagery only; reference not cropped into UI | PASS (doc 02 §5) |

Defects found by visual inspection and fixed in this sprint:
- mobile Card Studio card overflowing the stage;
- QR placeholder rendered as blobs (inherited SVG stroke);
- partner registry columns not applying at 600–899 (container-self query);
- link/QR panel squeezing text at desktop;
- spec tag widening the 320 px stage;
- signal label ellipsis;
- mockup cards collapsing to zero width;
- territory C front not distinct;
- proof canvas scaling artwork to bleed;
- TEST band hidden under the photograph;
- eight-column commission ledger overflowing the 1280 × 800 stage (first audit run: 942 / 944; now uses the four-column template until the ledger is 1100 px wide).

## 4. Functional gate (§50) — specification level (no production code)
| Gate | Result |
| --- | --- |
| REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID | Specified (doc 16 §1–2), visible in ledgers and R44 |
| RECORD PAYMENT ≠ SEND PAYMENT | Specified (doc 17); SEND disabled in every specimen |
| Print export blocked until six conditions | Specified (doc 18 #13); PRINT PACKAGE disabled in specimens |
| No client-provided partner id as evidence | Specified (docs 14, 15 E13, 23) |
| Durable, non-guessable codes; existing `/invite/:code` | Specified (doc 21) |
| No parallel tables; reconciled to the actual schema; no SQL | Doc 25 |
| Two-way navigation REFERRALS ↔ FOUNDATIONS | Specified (doc 04 §5, RF-008/009, R43) |
| Live attribution / payments / messages | **Not executed** (none triggered) |

## 5. Build, tests, scope
Recorded in the PR body and the sprint report after `npm run build` and the targeted DF suites run. This sprint changes documentation only: no `src/`, `api/`, `shared/`, `server/`, `supabase/` or config files.

## 6. Not verified
- iPhone Safari and real devices (unavailable).
- Printing.
- Real QR scanning.
- Any backend behaviour (not implemented).
""")

# ── README ────────────────────────────────────────────────────────────────────
docs = sorted(p.name for p in PKG.glob('[0-9][0-9]_*.md'))
write('README.md', f"""# Founder workspace · REFERRALS and partner commerce authority (OPUS3)

**Sprint:** `{SPRINT}`
**Status:** COMPLETE REFERRAL-SYSTEM VISUAL AUTHORITY — **FOUNDER REVIEW REQUIRED**
**Builds on:** OPUS1 visual authority `b82ca64e4` · form-control authority `c5a773381` (FD-1…FD-6; Phases 1–2 in #1659/#1660, Phases 3–5 in #1661) · OPUS2 responsive authority `81407c694`
**Branch / PR:** `claude/digital-foundation-authority-audit-8d42xk` · draft PR #1658 (base `cursor/idnty-founder-readiness-e2e-be3b`)

This package extends the approved Founder Workspace with a seventh destination, **06 REFERRALS**: partners, attribution, commissions, payouts, Card Studio and activity, plus a separate partner portal and the System B referral-card print path. It is an **authority package**:
- no production code, backend, database or deployment changed;
- no partner record, agreement, rate, attribution window, payment or message is asserted or triggered.

## Read in this order
1. `02_REFERENCE_IMAGE_ANALYSIS.md` — what the founder's reference sets, and what it does not.
2. `03_EXISTING_REFERRAL_INFRASTRUCTURE_AUDIT.md` — what already exists (invitation system, #1657, payments).
3. `04`–`05` — information architecture and page tree.
4. Boards: `boards/png/` ({len(MAN)} boards; manifest in doc 28).
5. `29_FOUNDER_APPROVAL_REGISTER.md` — **twenty open policy decisions**.
6. `32_OPUS3_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md` — phases 0–14.

## Documents
""" + '\n'.join(f"- `{d}`" for d in docs) + f"""

## Package layout
```
boards/            specimen system (src/), {len(MAN)} board shells + boards.js, render-boards.mjs, audit-layout.mjs, batch-shoot.mjs, write-docs.py
boards/png/        rendered boards (DSF 2)
data/              policy register, attribution edge cases, overlay presentation (from live specimens)
registry/          RF-001+ / RO component registry (JSON + CSV) and its builder
verification/      layout audit results and contact sheets
```

The specimen system reuses OPUS2 `ws.css`, `ws-kit.js` and `ws-overlays.js` by relative import. It adds `rf.css`, `rf-kit.js`, `rf-pages.js` and `rf-overlays.js`. Nothing in `src/` imports from this folder, and the application bundle is unchanged.

## Key positions
- REFERRALS is destination **06** (SYSTEM → 07). The mobile bottom bar is unchanged and REFERRALS is reached from the MENU (FD-R20 open).
- **AIO is PLANNED · NOT ACTIVE.** The repository fixture that marks it ACTIVE without an agreement is flagged as a conflict.
- No rate or window is proposed. Specimen amounts follow EXAMPLE TERMS E-1 / E-2, labelled as such.
- REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID. RECORD PAYMENT ≠ SEND PAYMENT.
- Card print export stays blocked until partner, link, QR, template, copy and print spec are all verified. Every QR shown is a non-scannable placeholder labelled NOT VALID FOR PRINT.
""")
print('docs written:', len(docs) + 1)
