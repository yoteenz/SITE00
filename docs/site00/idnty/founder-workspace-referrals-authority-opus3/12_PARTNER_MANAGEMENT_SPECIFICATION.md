# 12 · Partner management specification

Boards: R06, R07, R08, R11. Components: RF-020…RF-025, RF-037. Overlays: RO-01…RO-04, RO-20.

## 1. What a partner is

A business or person approved by the founder to introduce prospects to the Digital Foundation. The partner receives a durable referral link and cards, and is eligible for compensation only under a signed, versioned terms record. **AIO (All In One Enterprises Inc) is the first PLANNED partner.** The founder's sister is a prospective partner type (*SISTER_REA* already exists as a DF referral kind).

## 2. Partner lifecycle

| UI status | Meaning | Repository `PartnerStatus` | Link / cards | May accrue commission |
| --- | --- | --- | --- | --- |
| PLANNED | Intended partner; nothing issued; no agreement | DRAFT | none | No |
| INVITED | Invitation recorded (sending gated) | DRAFT (+ access INVITED) | none | No |
| ACTIVATION PENDING | Accepted; terms / identity / payee incomplete | DRAFT (+ access ACTIVATION PENDING) | none | No |
| ACTIVE | Terms signed; founder approved | ACTIVE | issued, ACTIVE | Yes, per terms |
| SUSPENDED | Paused by founder | PAUSED | codes PAUSED; public entry says begin unattributed | Existing per FD-R19; none new |
| REVOKED | Access removed (partner portal) | PAUSED / TERMINATED | REVOKED | Per FD-R19 |
| ARCHIVED | Relationship ended; read-only records | TERMINATED | RETIRED | No |

The partner relationship status and the portal access state (doc 22 §2) are separate fields, shown together on the partner page.

**AIO conflict:** the repository fixture is `ACTIVE` with `agreement_version: null`. The UI must not show ACTIVE for any partner without a terms version. A server invariant follows: `status = ACTIVE ⇒ active_terms_version IS NOT NULL` (doc 25).

## 3. Partner types (proposed, not final enums)

STRATEGIC PARTNER (business that serves many SMBs, e.g. AIO) · BUSINESS PARTNER (bookkeeper, permit service) · INDIVIDUAL REFERRER (person) · CLIENT REFERRER (existing DF client — governed by FD-R09). Type changes no rules by itself; the terms do.

## 4. Registry (R06–R08)

- **Columns:** PARTNER (thumbnail, name, contact) · TYPE / STATUS · REFERRALS (attributed artifacts) · CONVERTED (verified qualifying payments) · OWED (approved + scheduled, unpaid) · CARD (current card version + approval) · ›.
- **Views:** ALL · ACTIVE · PLANNED · INVITED · SUSPENDED · ARCHIVED with counts.
- **Search** across name and email. Sort by name, referrals or owed. **Keyboard:** J / K / ↵.
- **Inspector:** status, link (masked), counts, OPEN PARTNER, COPY LINK.
- **Footer note:** *PARTNER TYPES ARE PROPOSED, NOT FINAL ENUMS · OWED = APPROVED + SCHEDULED, UNPAID*.
- **States:** loading skeleton; empty (*NO PARTNERS YET — ADD THE FIRST PARTNER AS A DRAFT*); filtered; error (shell grammar, read-only stale data).

## 5. Creating and editing (RO-01, RO-02, R11)

- **Fields:** legal name*, display name*, partner type*, contact email*, relationship owner (founder), notes.
- **Result:** a **DRAFT (PLANNED)** partner. Creation **never** issues a link, generates a QR, sends an invitation, creates terms, or asserts an agreement.
- **Validation:** required fields; email format; duplicate check on legal name and email domain (error state shows the matching partner and offers OPEN EXISTING).
- **Identity:** the server assigns the database id and `partner_number`; the client never supplies ids.
- **Edit:** the same fields, plus partner type. Changes are recorded as events with before and after values.

## 6. Invitation and access (RO-03, RO-20)

- **INVITE PARTNER:**
  - shows the email, the access method (`FD-R12`) and a tick *I APPROVE SENDING THIS INVITATION*;
  - **SEND INVITATION is disabled** in this authority. No partner messages are triggered.
- **REVOKE PARTNER ACCESS:**
  - choices: revoke portal access · revoke referral link(s) · archive partner;
  - requires typing the partner number;
  - ends sessions server-side; printed cards degrade to the public *no longer active* page.

## 7. Status change (RO-04)

- **ACTIVE:** links resolve and new referrals attribute.
- **SUSPENDED:**
  - links pause, and prospects can still begin unattributed;
  - existing commissions follow FD-R19.
- **ARCHIVED:** read-only.

A reason is required and an event is written.

## 8. Controls
- Only the founder can create, edit, invite, change status or revoke (FD-R18 may add a second reviewer).
- Partner email and notes are founder-only. They never appear on cards, public pages or other partners' views.
- Partner thumbnails are decorative architecture imagery. Partner logos are not used until supplied and approved (asset need A-03, doc 33).
