# Opus handoff — client financial experience

Sprint: `P0.SITE00.PLATFORM-ECONOMICS.BUILDER-BLUEPRINT-AND-CLIENT-STATEMENTS-UX1`

Composer owns the numbers. Opus owns how they look and move. Do not invent a fee, a rate, or a net figure in the interface.

## What is already true

- The economics engine is `src/studioos/platform-economics/`. Version `1.0.0`. The default rate lives only in `rate.ts`.
- The Builder Blueprint is the spatial studio at `/bldr/studio`. Sections stay **OVERVIEW, STRUCTURE, PAGES, FEATURES, TIMELINE**. There is no sixth tab.
- The architectural stage stays `BuildObjectStage`. Financial copy sits in the OVERVIEW controls, under the existing metrics, via `blueprintEconomicsForSelection()`.
- The client account stays `/account`. A financial record is a section of that page, not a new product. The visual section is not built yet.
- Export is not implemented. Do not draw a download button.
- No live money movement. Stripe Connect stays off. Legal review is pending.

## Files Opus should read

| Need | Path |
|---|---|
| Blueprint sentences | `src/studioos/platform-economics/presentation.ts` |
| Binding from a Builder selection | `src/site00/builder-experience/spatialStudio/blueprintEconomics.ts` |
| Example transaction | `src/studioos/platform-economics/illustration.ts` |
| Statement, history, breakdown | `src/studioos/platform-economics/clientStatement.ts` |
| Account placement, interactions, AIO, legal gates | `src/studioos/platform-economics/clientExperience.ts` |
| Fixture data | `src/site00/builder-experience/spatialStudio/opusFinancialFixtures.ts` |
| Current overview mount | `src/site00/pages/bldr/BldrSpatialStudioPage.tsx` |
| Host typography | `docs/site00/ground-zero/SITE00_COMPONENT_VISUAL_RULES.json` |
| Spatial shell scaffold | `src/site00/components/bldr/spatial-studio/README.md` |

Call `buildOpusFinancialFixtures()` for sample data. The function runs the engine. Do not paste a rate into a component.

## Blueprint

Show four short blocks on OVERVIEW only:

1. What it costs to build — the estimator string already on the snapshot. It is a projection, not a quote. The platform share is not inside it.
2. What SITE 00 earns after launch — `platform.line`. A Builder with no agreement is `PROPOSED` or `NOT_APPLICABLE`. `deductionActive` is false.
3. What other companies may charge — `thirdParty.line`. SITE 00 is not the processor. Do not promise a settlement date.
4. What you agree to — `agreement.line`.

`illustration` is an example, labeled `EXAMPLE`, `notClientHistory: true`. If you show it, use `oneLine` or the display fields. Do not place a transaction table on the stage.

STRUCTURE, PAGES, FEATURES, and TIMELINE stay as they are. The stage views stay FRONT, SIDE, and EXPLODED.

## Agreement words

Stored status stays in the books. The screen uses:

| Stored | Screen | Active deduction |
|---|---|---|
| DRAFT, FOUNDER_REVIEW, OFFERED | PROPOSED | No |
| CLIENT_REVIEW, ACCEPTED | PENDING ACCEPTANCE | No |
| ACTIVE, and the fee applies | ACTIVE | Yes |
| SUPERSEDED | SUPERSEDED | No |
| ENDED | TERMINATED | No |
| SUSPENDED | SUSPENDED | No |

A superseded period can still show a posted share from when that agreement was active. That share is history. It is not a current deduction, and a later rate does not rewrite it.

## Statement fields

`clientStatement()` returns the client record. Use these fields and their `state`:

- Identity: `statementId`, `clientOrgId`, `projectId`, `periodStart`, `periodEnd`, `generatedAt`
- Terms: `agreementVersion`, `agreedRateLabel`, `agreementPresentation`, `deductionActive`
- Posted money: `gross`, `eligible`, `excluded`, `refundAdjustments`, `disputeAdjustments`, `platformShare`
- Processor: `processorFees` — separate from the platform share. It may be `UNAVAILABLE`.
- Client proceeds: `clientNetProceeds` — show it only when `state` is `POSTED`. If `UNAVAILABLE`, say the books cannot state a net yet.
- Payout: `payout.pendingMinor` is the same posted share sitting in a draft batch. `payout.settledMinor` is 0. Do not add pending on top of posted.
- `statementStatus`: `EMPTY`, `POSTED`, or `PENDING_PAYOUT`
- `sourceLedgerEntryIds`, `historicalVersions`
- `export.available` is false

`ESTIMATED` is reserved for the labeled example. Do not mix it into a statement total.

## Interactions

Specified in `STATEMENT_INTERACTIONS`.

- Period selection calls `clientStatementHistory()` with real periods.
- Detail calls `clientStatement()`.
- A transaction filter calls `clientTransactionBreakdown()`.
- Refund copy: the customer refund is `refundAdjustments`. The platform share is already net of the reversed fee.
- Empty: no posted transactions.
- Loading: the ledger read has not returned.
- Error: `ok: false`. `FORBIDDEN` is an access failure. Do not show the other client's records.
- Unavailable: the reason code is the explanation. Do not replace it with a zero.

## Account

Existing destinations on `/account`: Control Room, Intakes, Sign in & security.

Proposed section label: **FINANCIAL RECORD**. Surfaces, all contract-only until this visual pass:

- Financial overview
- Statement history
- Statement detail
- Transaction breakdown
- Platform agreement
- Payout information

Do not expose Studio OS portfolio, beneficiaries, or internal finance routes.

## AIO

`AIO_PLATFORM_PARTICIPATION_ACTIVATED` is false. Brokerage, permitting, dispatching, insurance, and bookkeeping are `NOT_ASSUMED`. Do not draw an AIO share as if it were on.

## Conflicts to preserve

- **Shipping** is not an exclusion code. Do not invent one in the UI. A pass-through is recorded only when the agreement says so.
- **Tips** are gratuities.
- The ledger field `clientNet` is not what the client keeps while processor treatment is `UNSPECIFIED`.

## Visual

Luminous white, architectural precision, SITE 00 red, black editorial type, subtle translucent materials, square-rounded controls, controlled motion. Host type is Martian Mono (`SITE00_COMPONENT_VISUAL_RULES.json`).

This should feel like a financial record inside SITE 00. It should not become a billing dashboard, a chart wall, or a stack of repeated billing cards. Do not flatten the Blueprint stage.

## Privacy

`canReadClientOrg()` is the server-side rule the statement functions already call. A client owner reads only their organization. Do not put processor secrets, account numbers, or Studio OS operations in the client view.

## Gates

Legal review: pending. Processor review: pending. Founder review: pending. Do not publish terms. Do not turn on collection.
