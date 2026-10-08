# Provider-neutral implementation contract

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

Types live in `shared/jurnl-email-engine/provider.ts`. A real adapter implements `EmailProvider` and calls `deliveryGuard` first; nothing in the creative system depends on a vendor.

| Type | Role |
|---|---|
| EmailDefinition | Which email: id, family, consent class, preference category, personalization, template version. |
| EmailRecipient | Supabase auth user id, address, verified flag, first name, time zone, locale. |
| EmailPayload | Live L3–L5 values and links for one state; as-of time; fixture marker (refused by delivery). |
| EmailTemplate | Versioned render(payload, assets) → subject, preheader, html, text. |
| EmailAssetSet | The approved assets for a lineage group (slot, class, url, size, alt). |
| EmailDeliveryRequest | Definition + recipient + payload + idempotency key + headers (List-Unsubscribe). |
| EmailDeliveryResult | SENT / QUEUED / SUPPRESSED / DUPLICATE / FAILED / NOT_SENT_DRY_RUN / REFUSED_FIXTURE. |
| EmailPreference | Category on/off with version, time and source (mirrors the consent record shape). |
| EmailEvent | REQUESTED, SUPPRESSED, DELIVERED, BOUNCED, OPENED, CTA_CLICKED, DEEP_LINK_OPENED, UNSUBSCRIBED, PREFERENCE_CHANGED, CONVERSION_EVENT. |
| EmailProvider | send(request, rendered) → result. Only implementation today: createDryRunEmailProvider (never sends). |

## Rules
- Auth mail (A02, A08) is rendered by the auth provider (Supabase) from the approved authority; JURNL does not re-send it.
- Delivery refuses fixture payloads, unverified addresses (except A02) and categories that are off.
- Idempotency key = the contract’s duplicate guard; the send log is persisted (not in memory) when a provider is wired.
- Security links are never click-tracked.
