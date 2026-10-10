# Business Growth V1 — client experience inside the Foundation link

Sprint: `P0.SITE00.BUSINESS-GROWTH-INTELLIGENCE.V1-CLIENT-EXPERIENCE-AND-ROADMAP-OPUS1` · BGI baseline PR #1540.

Status: **behind flags, founder review pending.** Public activation is not authorized. Growth checkout is disabled. Commercial approval is pending.

## Where it lives

Business Growth runs inside the original Digital Foundation journey at `/foundation/:token`. It uses the same URL, shell and visual language. It is not a standalone page and it does not come only after purchase.

| Index | View | When it shows |
|---|---|---|
| G1 | BUSINESS AMBITION (`AMBITION`) | After P02 business information, before P03. Can be reopened from G2 until payment. |
| G2 | GROWTH PATH (`GROWTH`) | After the P04 recommendation, when ambition has goals. Also reachable from the P04 invite card. |
| G3 | INVESTMENT + DELIVERY (`PLAN`) | After G2, before P05 review. |
| G4 | GROWTH ROADMAP (`ROADMAP`) | From G3, during checkout, and from the project overview after payment. |

Connectors on existing parents:

- **P04:** a Growth invite card.
- **P05:** a note that Growth services are not part of this checkout.
- **Overview:** a Business Growth panel.

When Growth is off, routing is identical to the PR #1527 Foundation journey, and a unit test enforces this.

## Data authority

- The server computes all Growth logic with the canonical BGI engines: recommendations, unified quote, delivery and roadmap. The engines use `node:crypto`, so none of this runs in the browser. The client receives a `business_growth` context on every Foundation payload. That context is `null` unless `SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1=1`. Growth screens also need `SITE00_BUSINESS_AMBITION_INTAKE_V1=1`.
- `POST update-growth` takes sanitized ambition (canonical goal IDs and context keys only) and explicit opt-in selections, and persists them to the artifact intake (`business_ambition`, `business_growth_selection`).
- Selections lock once the Foundation scope is accepted (`GROWTH_SELECTION_LOCKED`). Ambition locks after payment (`GROWTH_AMBITION_LOCKED`).
- HIDDEN services such as `BGI.BUSINESS_GROWTH_PACKAGE` are never sent to the client. FUTURE services such as Growth Ops recurring are shown as not yet available and rejected server-side. SALES_SYSTEMS shows honest empty copy.
- The frontend does no pricing math:
  - The Foundation checkout total is the server's Foundation quote.
  - Draft Growth prices are shown as "PLANNING RANGE · PRICING PENDING APPROVAL", never as payable values.
  - The $500 base is unchanged.
- Two distinct milestones, FOUNDATION READY and FULL PROJECT DELIVERY, both come from `projectGrowthDelivery`. Business-day Foundation windows are never rounded to weeks. BLDR is excluded from the business-day rail and handed to the BLDR estimator at `/bldr`. Interest is recorded through the canonical `build-interest` action.
- Readiness is qualitative (in place, gap, assessment pending, and so on), with no numeric score. Opportunity matching is always `ASSESSMENT_PENDING`, with no fabricated grants.
- AIO appears as information only:
  - It is described as a separate company with separate billing.
  - No client data is shared with AIO, and no AIO charge lines exist.
  - AIO-attributed clients get the same SITE 00 base.

## Founder review

`GET /api/admin/site00-foundation?action=growth-review&id=…` is behind admin auth. It returns pricing reviews, delivery assumptions, specialist reviews, AIO referrals and governance (`growth_checkout_enabled:false`, `auto_approval:false`). The admin detail page renders this as a read-only "Business Growth review" section. Nothing in it approves anything.

## Verification

- `tests/businessGrowthClientExperience.test.ts` has 21 tests. They cover:
  - flags
  - skip
  - multiple goals
  - adaptive follow-ups
  - recommendations without auto-add
  - HIDDEN and FUTURE refusal
  - draft pricing
  - quote and delivery recalculation for Foundation-only, one service, multiple services and BLDR
  - locks and lifecycle
  - no numeric score
  - pending opportunities
  - the AIO boundary
  - founder review and admin auth
- `scripts/site00/df-client-qa/df-growth-flow.cjs` runs the live browser flow against the real handler. It passed 17/17 on 390×844, 393×852, 834×1194 and 1440×900. Screenshots are in `qa/<viewport>/`. The scenarios are:
  - Foundation + Growth end to end
  - Foundation-only (skip)
  - one service and multiple services
  - unapproved pricing
  - a returning client
  - portal after the real webhook path (test mode, no live Stripe)
  - an AIO-attributed client with BLDR handoff
  - a network-failure save (reverted and reported as NOT SAVED)
  - a console-error check

## Known blockers

1. **Stacked on unmerged visual authority.** PR #1527 (P01–P06, "Do not merge yet") is the Foundation visual authority. This work is a draft PR on top of it and must not merge until the founder approves #1527. `main` still has the older Foundation page.
2. P07–P15 of the 15-screen Foundation set are not built anywhere. The project overview is the interim P07 from #1527, which hosts the Growth panel.
3. Growth lifecycle stops at "awaiting scope + pricing approval". Approval, Growth checkout and delivery tracking are not built, by design for V1.
4. AIO handoff is informational only. There is no consented data-sharing flow.
5. Founder visual approval is pending.
