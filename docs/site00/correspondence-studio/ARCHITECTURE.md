# SITE 00 Correspondence Studio — architecture (V1 extension)

Correspondence Studio is the email creative production, review, and delivery workspace. It is not a generic campaign dashboard, not an inbox, and not a template marketplace.

## Three connected systems

| System | Responsibility |
|---|---|
| Studio World / NDX | Creative intelligence, editorial intention, art direction |
| Correspondence Studio | Composition, responsive preview, campaign organization, versioned review |
| Client delivery | Approved ZIP packages, copy, previews, manifests — not the founder workspace |

## Canonical pipeline

Repository-backed lifecycle (full automation deferred):

`PROJECT → BRAND INTELLIGENCE → CAMPAIGN BRIEF → EDITORIAL STRATEGY → COMPOSITIONS → PREVIEWS → QA → FOUNDER REVIEW → APPROVAL → EXPORT → CLIENT DELIVERY → ARCHIVE`

Implementation: `shared/site00-correspondence-studio/types.ts` (`CORRESPONDENCE_PIPELINE_STAGES`).

## Hierarchy

`ORGANIZATION → BRAND → PROJECT → CAMPAIGN → EMAIL FAMILY → TEMPLATE → VERSION → DEVICE PREVIEW → REVIEW RECORD → DELIVERY PACKAGE`

Digital Foundation V1 manifest: `shared/site00-correspondence-studio/manifests/digital-foundation-lifecycle.ts` (20 template IDs).

## Data boundary

Supabase is in post-incident recovery. V1 uses versioned TypeScript manifests and browser `localStorage` for review (`APPROVAL_PERSISTENCE_MODE = repository-backed-session`). Production DDL for durable approvals is documented but not applied in this sprint.

## Routes

Founder review: `/admin/site00/correspondence-studio`

Legacy engineering gallery (preserved): `/admin/site00/debug/email-pack`
