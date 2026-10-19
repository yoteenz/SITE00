# 02 · Foundations page specification

**Status:** PROPOSED. Boards 05, 06 (registry), 07, 08 (create), 24 (row menu), 25 (row variants). Registry FN-01…FN-10. Reference C (02 FOUNDATIONS).
**Route:** `/admin/site00/foundation` (R1 path kept).
**Question:** where is each client?

## 1. Registry

| Element | Phone | Desktop |
| --- | --- | --- |
| Title | `02 ——` FOUNDATIONS | FOUNDATIONS + "8 FOUNDATIONS · 6 ACTIVE · 3 NEED YOU" + red NEW FOUNDATION |
| Search | Field "SEARCH NAME, EMAIL, DOMAIN" + filter button | Field 300 px in the toolbar |
| Status views | ALL · INVITED · INTAKE · REVIEW (count) · QUOTE (scrolls; ACTIVE, COMPLETE beyond) | All seven inline |
| Filters | Sheet: whose move, phase, include test clients | FILTERS popover |
| Sort | In the filter sheet | SORT · NEEDS YOU FIRST (also: last activity, created, name) |
| Rows | Card rows | Table: CLIENT · PHASE · JOURNEY · WHOSE MOVE · NEXT ACTION · LAST ACTIVITY |
| Selection | Push to record | Inspector (client preview) |

**Row contract.** Each row answers WHO · STATUS · PROGRESS · NEXT:
- plate (red edge when the founder owes a decision; hatched for test)
- business name and category
- whose-move mark + status label + last activity
- eight-segment journey bar with "STEP n OF 8 · PHASE"

There is no photography and no percentage.

**Status views** map to display phases (DATA_CONTRACT_MAPPING.md §2). REVIEW shows the §4 founder-decision count.

## 2. Client preview inspector (desktop, tablet landscape)

Contents:
- header: plate, name, category, email (data);
- status and step;
- short-label journey;
- NEXT ACTION · whose move;
- personal link, last activity and quote;
- recent movement (three events);
- foot: OPEN FOUNDATION (ink), link, ⋯.

It closes with × or ESC. The selection is kept in `?sel=`.

## 3. Row actions (FN-10)

| Action | Availability | API |
| --- | --- | --- |
| OPEN RECORD | Always | — |
| COPY CLIENT LINK | Always | `list.public_token` (client-side copy) |
| OPEN CLIENT VIEW | Always | `/foundation/:token`, new tab |
| MESSAGE | Always; client replies only once PAID | `send-message` |
| RESEND INVITATION | **Unavailable · G-05** | none |
| ARCHIVE | **Unavailable · G-06** | none |

FD-W5 decides whether unavailable actions are shown disabled with their reason (recommended) or hidden.

## 4. Create foundation (FN-07)

| Step | Phone (board 07) | Desktop (board 08) |
| --- | --- | --- |
| Entry | CREATE sheet → NEW CLIENT FOUNDATION | NEW FOUNDATION → dialog 560 |
| Form | Full screen: kind choice (client foundation · synthetic test client), then BUSINESS NAME, CONTACT NAME, CONTACT EMAIL, REFERRAL SOURCE (DIRECT default); email and name keep case. Synthetic: DISPLAY NAME + TEST RECIPIENT (must be allowlisted) | Same client fields in a dialog over the registry |
| Validation | Inline: email format; required business and email | Same |
| Duplicate notice | Client-side match on email among loaded rows (API does not dedupe, G-11); "OPEN EXISTING" or "CREATE ANYWAY" | Same |
| Submit | CREATE FOUNDATION busy until the durable write confirms (no optimistic success; cannot be pressed twice) | Same |
| Success | LINK READY: the link from `personalized_url`, COPY LINK, OPEN CLIENT VIEW, OPEN RECORD; no email is sent | Dialog over the registry with the new row already present |
| Errors | `DfPersistenceError` codes: DATABASE_PERMISSION_DENIED, DATABASE_UNAVAILABLE, SAVE_FAILED, DATA_CONTRACT_INVALID, each with plain copy; form keeps values | Same |

This replaces R1's hard-coded `contact_email: 'prospect@example.com'` and the `window.prompt` copy.

## 5. States

| State | Presentation |
| --- | --- |
| Loading | Row-shaped skeletons (no spinner, no shimmer) |
| Empty (first use) | "NO FOUNDATIONS YET." + NEW FOUNDATION |
| Filtered empty | "NO MATCHES FOR ‘…’" + CLEAR FILTERS (search text keeps its case) |
| Error | Banner + RETRY; stale rows kept and labelled |
| With test clients | Hatched plates + TEST tag; removable "TEST CLIENTS" chip |
| Dev preview | The existing empty-list bootstrap (`/api/dev/site00-digital-foundation-preview-bootstrap`) stays a dev-only behaviour |

## 6. Data gap that limits the registry (G-01)

The `list` row has no business name, industry, intake state or quote total. Until `list` is extended (a separate backend change), the registry needs `detail` per row or the `pipeline` action. **The design does not fill missing names with sample data:** the plate shows "—" and the masked token stands in for the name.
