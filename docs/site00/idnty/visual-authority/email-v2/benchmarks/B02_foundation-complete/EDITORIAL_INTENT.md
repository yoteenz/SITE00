# B02 — Foundation Complete — editorial intent

Template ID: `foundation-complete` (T23). Trigger: `FOUNDATION_COMPLETED`. Family: transactional, essential service.
Composition: MILESTONE RECORD. Register: RECORD.

## Reasoning before writing

| Question | Answer |
|---|---|
| Who is receiving this? | A paying client whose Digital Foundation has passed the completion gate. |
| What has just happened? | Every required delivery task is complete or verified, verification rules pass, no domain or signature approvals are pending, and an ownership record exists (`shared/site00-digital-foundation/operations/completionGate.ts`). |
| What do they already know? | They followed progress, approved choices, maybe set up devices. They may not know it is finished, or what "finished" covers. |
| Why write now? | Completion is a real milestone and the client should hear it from SITE 00, not infer it from a status page. |
| What are they likely thinking? | "Is that it? Is everything actually working? Who owns all this? What do I keep?" |
| What do they need? | Confirmation in plain words. What is now in place, stage by stage, in terms of what it does for them. Who owns the accounts. Where the full record will be. That nothing else is needed from them. |
| What should they feel after? | Accomplishment, ownership, confidence, continuity. |
| What action follows? | Optional: view the foundation. |
| Most natural way to say it | A short, satisfied record: what was built, what it means, and that it is theirs. |
| What composition supports that? | A monumental moment, then a ledger, then rest. The blueprint slab filled with real marble is the image of "established": a drawing that has become material. |

## Creative rationale

The lean pack's completion email said "THE FOUNDATION SERVICE IS RECORDED COMPLETE." It reported a database state.

V2 marks the moment and then proves it. The headline is short and final ("THE GROUNDWORK IS DONE."). The preheader carries the one line of personality: the work nobody applauds and everything else stands on. The ledger turns five delivery stages into five things the client now has. Each line says what the stage does for them, not what it is called internally.

Ownership is stated once, with a line that builds trust by pointing away from SITE 00: the accounts are theirs "WHOEVER YOU WORK WITH NEXT."

There is no BLDR, no credit, and no "what's next" offer. The contract forbids it, and the email is stronger without it. Continuity comes from the record arriving separately and the foundation page staying open.

The closing image is the terrace edge meeting the sea, used as rest after the record. Red is limited to the status seal and the slab edge.

## Accuracy guardrails

- The ledger renders only stages present and complete in the project record. A skipped stage (for example devices and signature, when not in scope) is omitted, and the numbering closes up.
- "AS AGREED IN YOUR SCOPE" points to the accepted quote. It avoids promising a mailbox count the email does not know.
- "HELP YOUR MAIL REACH INBOXES" and "HARDER TO IMPERSONATE" describe what DNS authentication records do without promising deliverability.
- Records availability is its own event (`records-available`). The copy says the record arrives in its own email and does not give a time.

## Lineage test

| # | Question | Result |
|---|---|---|
| 1 | Could it exist because of the core idea? | Yes. The ground at the address is laid; the drawing becomes stone. |
| 2 | Explainable without color? | Yes. Blueprint becoming marble, ledger, ownership. |
| 3 | Preserves core DNA? | Yes. Blueprint line, marble, red accent, uppercase type, photoreal horizon. |
| 4 | Meaningful variation? | Yes. Only email built on a code-native monument and a ledger. Black button. |
| 5 | Serves a real purpose? | Yes. Confirms completion and ownership. |
| 6 | Recognizable without the name? | Yes. |
| 7 | Distinct from siblings? | Yes. See `COMPOSITION_COMPARISON.md`. |

Premium art candidate: optional, not required. See `PREMIUM_ART_CANDIDATES.md`.
