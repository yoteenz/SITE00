# Production lifecycle, pipeline and agent roles

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

| State | Meaning | Founder required |
|---|---|---|
| PLANNED | Named in the email ontology; no contract yet. | — |
| CONTRACT_READY | Message contract complete: purpose, trigger, consent class, personalization, copy fields, components. | — |
| CREATIVE_READY | Creative territory chosen inside the family grammar; ready for an authority design. | — |
| AUTHORITY_IN_REVIEW | A full email authority (mobile + desktop) is with the founder. | — |
| AUTHORITY_APPROVED | The founder approved the full authority. | YES |
| ASSETS_READY | Assets decomposed from the approved authority and fabricated; founder approved them. | YES |
| IMPLEMENTATION_READY | Template spec, assets and fixtures complete for implementation. | — |
| IMPLEMENTED | Email-safe HTML template exists and renders with fixtures. | — |
| RESPONSIVE_QA | Client matrix, image-blocked and dark-mode checks pass. | — |
| DELIVERY_QA | Provider delivery, links, suppression and idempotency verified with test recipients. | — |
| APPROVED | Founder approved the implemented email for release. | YES |
| LIVE | Sending to real recipients. | YES |
| SUPERSEDED | Replaced by a newer approved template; kept as a record. | — |
| ARCHIVED | Retired; never sent. | — |

**Founder approval is never inferred. A state that requires the founder can only be set from an explicit founder decision recorded with a date.**

## Pipeline
| Step | Name | Owner | Output |
|---|---|---|---|
| 01 | MESSAGE CONTRACT | OPUS | contract in shared/jurnl-email-engine/contracts.ts |
| 02 | EMAIL FAMILY | OPUS | family + lineage group assignment |
| 03 | CREATIVE TERRITORY | OPUS + GROK_OPENART | artifact, primary gesture, secondary detail, contrast anchor |
| 04 | FULL EMAIL AUTHORITY | GROK_OPENART + OPUS | one complete email image per viewport, with sample copy, for review only |
| 05 | FOUNDER REVIEW | FOUNDER | approve / revise |
| 06 | RESPONSIVE AUTHORITY | OPUS | mobile and desktop authorities + image-blocked plan |
| 07 | ASSET DECOMPOSITION | OPUS | asset list: class, lineage action, live-content zones removed |
| 08 | SIDEKICK / ARTIFACT GENERATION | GROK_OPENART | clean shells, inserts, environments — no live content |
| 09 | FOUNDER APPROVAL | FOUNDER | assets approved |
| 10 | TEMPLATE IMPLEMENTATION | COMPOSER | email-safe HTML template + plain-text fallback |
| 11 | PROVIDER INTEGRATION | COMPOSER | delivery through the provider-neutral contract |
| 12 | EMAIL CLIENT QA | COMPOSER + OPUS | client matrix pass |
| 13 | DELIVERY QA | COMPOSER | test-recipient delivery, links, suppression |
| 14 | LIVE | FOUNDER | founder releases |

**FULL EMAIL AUTHORITY BEFORE ASSET DECOMPOSITION. Do not generate random plates in advance.**

## Agent responsibilities
| Role | Owns | Never |
|---|---|---|
| GROK_OPENART | creative visual generation; full email authorities (images); asset fabrication: shells, inserts, environments | live copy inside final assets; final copy decisions; template code |
| OPUS | creative architecture; email authority methodology; UX / composition; asset decomposition; visual QA; contract authoring | repetitive production code across many templates; provider migrations |
| COMPOSER | HTML / template engineering; trigger wiring; provider integration; tests; rendering QA; repetitive propagation across templates | changing families, doctrine or approved authorities; inferring approval |
| FOUNDER | authority approval; asset approval; release to LIVE; final copy approval | — |

## Analytics
| Event | Note |
|---|---|
| DELIVERED | Provider acceptance / delivery webhook. |
| BOUNCED | Hard bounces suppress the address for non-critical classes. |
| OPENED | Only where the provider reports it and it is meaningful; Apple Mail Privacy Protection inflates opens, so never optimize on it. |
| CTA_CLICKED | Tagged per component (EC07 / EC08 / EC15). |
| DEEP_LINK_OPENED | The app route opened from the email link. |
| UNSUBSCRIBED | Per preference category; applied immediately. |
| PREFERENCE_CHANGED | From the preference centre once it exists. |
| CONVERSION_EVENT | Only a product-truth event (e.g. setup completed after A03), never a proxy. |

- No open-rate or click-rate targets for E06 (security) — success is the user completing the action.
- No re-send loops on non-open; cooldowns are fixed by contract, not tuned for engagement.
- No streaks, scores or urgency mechanics.
- Analytics never changes what a TRANSACTIONAL email says.
- Link tracking must not break security links: verification and reset links are never wrapped by click tracking.
