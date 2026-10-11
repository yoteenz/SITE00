# Email V2 benchmark — contract gaps found while writing

None of these were changed in the V1 registry. They are proposals for the founder or the HTML stage.

| Template | Gap | Proposal |
|---|---|---|
| `personal-foundation-invitation` | V1 route `/foundation/{{public_token}}` lands on the prospect surface. The founder asked for a direct intake action. | Route to `/foundation/{{public_token}}?step=intake` (`digitalFoundationClientIntakePath`). CTA label `BEGIN YOUR FOUNDATION` to match the product's own NOT_STARTED action. |
| `foundation-complete` | Ledger rows depend on project stage records, which are not a contract field. | Add `completed_stages` (ordered list of completed stage codes 02–06). Render only those; renumber. |
| `foundation-complete` | V1 preheader "THE FOUNDATION SERVICE IS RECORDED COMPLETE" and body outline lines are internal rules. | Replace with V2 copy. Keep the no-upsell rule in `opt_out` and enforce it in QA. |
| `M06` | Route `/foundation/{{public_token}}` but `public_token` is not in `dynamic_placeholders`. | Add `public_token`, or route to a public BLDR page. Decide before HTML. |
| `M06` | Marketing footer needs an unsubscribe link and a postal address. Neither is in the contract. | Add `unsubscribe_url` and `postal_address`. Do not send without them. |
| All three | Sender identity unregistered. | Register a from-address before any live send. Review boards show the from-line as pending, outside the email body. |
| `M06` | V1 `message_classification` is `PLANNED_CONTRACT`. | Fine as an internal state. It must never appear in customer copy (enforced by `qa_copy.py`). |
