# Batch B — Records and approvals (founder review)

Open each full-resolution PNG. Mark each screen: **APPROVED**, **APPROVED WITH REVISIONS**, **REVISION REQUIRED**, or **REJECTED**.

## Batch A handoff (for Opus — do not regenerate plates)

See `../batch-a/BATCH_A_OPUS_HANDOFF_CORRECTIONS.md`.

## B01 — Records library (expanded)

**Purpose:** Client sees every foundation record in one secure archive.

**Components:** Back control, category chips (ALL, DOMAIN, EMAIL, SECURITY, PAYMENTS), record rows, BACK TO OVERVIEW.

**Contract:** `RecordsLibrary` + `buildClientRecords()` — categories match live filters; list rows match `ClientRecordRow`.

**Design proposed:** SEARCH RECORDS field (no search in live UI). OPEN chevron per row (live uses full-row tap). PROJECT category omitted from chips (live includes PROJECT in data but sprint preferred categories listed).

## B02 — Record detail (domain)

**Purpose:** Inspect one ownership record with metadata and linked documents.

**Components:** BACK TO RECORDS, status chip, tabs, metadata block, documents list, download, security note.

**Contract:** `RecordDetail` today shows status, summary, date only — no tabs, document list, or download.

**Design proposed:** OVERVIEW / DOCUMENTS / HISTORY tabs, document rows, DOWNLOAD AUTHORIZED COPY, related approval row. Fixture registrar name is design-only.

## B03 — Document preview

**Purpose:** Review a PDF-style summary before download.

**Components:** Document meta, large preview panel, DOWNLOAD, VIEW RELATED RECORD, secure-download note.

**Contract:** **NOT IMPLEMENTED** — no document preview route or storage UI in client today.

**Design proposed:** Entire screen is a candidate surface for future authorized downloads.

## B04 — Decision history

**Purpose:** Trustworthy audit trail of approvals and revision requests.

**Components:** Summary chip, chronological events, statuses REQUESTED / APPROVED / CHANGES REQUESTED, version and actor lines.

**Contract:** `ApprovalRecord` statuses are `REQUESTED | APPROVED | REVISION_REQUESTED` (map CHANGES REQUESTED visually to REVISION_REQUESTED). No dedicated history screen in React today — data exists on payload.

**Design proposed:** Full history page and cross-links to records. Pending DNS row must stay REQUESTED, not APPROVED.
