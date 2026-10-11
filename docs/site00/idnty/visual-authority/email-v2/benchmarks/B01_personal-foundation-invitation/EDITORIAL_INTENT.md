# B01 — Personal Foundation Invitation — editorial intent

Template ID: `personal-foundation-invitation` (T01). Trigger: `ARTIFACT_CREATED`. Family: transactional access message.
Composition: PERSONAL LETTER. Register: LETTER.

## Reasoning before writing

| Question | Answer |
|---|---|
| Who is receiving this? | A business owner or manager for whom SITE 00 has prepared a Digital Foundation. Often reached through a referral or invitation. They may know very little about SITE 00. |
| What has just happened? | A foundation artifact was created with their business name and a personal link. Nothing has been entered, quoted, or paid. |
| What do they already know? | Possibly a name and a conversation. Possibly nothing. They do not know what the link opens or what it costs. |
| Why write now? | The link is useless until they have it. This message is the front door. |
| What are they likely thinking? | "Is this legitimate? What is it? Is it going to cost me? Do I have time for this?" |
| What do they need? | What a Digital Foundation is, in concrete terms. What the link opens. That they see a scope and price before any charge. That accounts end up in their name. That they can stop and come back. |
| What should they feel after? | Attended to. That someone has thought about their business before asking anything of it. Curious enough to open the link. |
| What action follows? | Open the briefing. |
| Most natural way to say it | As a short letter from a studio that wants to understand them before doing anything. |
| What composition supports that? | Mostly type. A letterhead that names them. One narrow, quiet image of an open red glass doorway. An inline button sized to its words, with the real link printed beneath it. |

## Creative rationale

The lean pack sent a system notice ("THE LINK BELOW OPENS YOUR PROJECT. NO PAYMENT IS CONFIRMED IN THIS MESSAGE."). It answered "what is this record?" when the reader was asking "why should I trust this?"

The V2 letter leads with intention: "BEFORE WE SET ANYTHING UP, WE'D LIKE TO KNOW HOW YOU WORK." That sentence does the trust work. It tells the reader they will be asked before anything is done to them, and it reframes the intake form as a briefing.

The payment truth survives in human terms ("YOU READ BOTH BEFORE ANYTHING IS CHARGED"). The P.S. names the one question most likely to stall a busy owner, who registered the domain, and gives permission not to know. That is the single line of humor, and it removes real friction.

The image is a doorway, cropped narrow and tall so it reads as a detail, not a hero. On mobile it becomes a short band so the letter starts within the first screen.

## Lineage test

| # | Question | Result |
|---|---|---|
| 1 | Could it exist because of the core idea? | Yes. A letter delivered to an address, inviting the owner to describe the ground before anything is built on it. |
| 2 | Explainable without color? | Yes. Letterhead, doorway, briefing. |
| 3 | Preserves core DNA? | Yes. White, red accent, uppercase editorial type, photoreal architecture, registration mark. |
| 4 | Meaningful variation? | Yes. The only letter in the set. No hero, no numbering, no full-width band. |
| 5 | Serves a real purpose? | Yes. Delivers the access link and earns the first click. |
| 6 | Recognizable without the name? | Yes. Red glass doorway, Saira uppercase, crosshair. |
| 7 | Distinct from siblings? | Yes. See `COMPOSITION_COMPARISON.md`. |

## Contract notes

- CTA route changed from `/foundation/{{public_token}}` to `/foundation/{{public_token}}?step=intake` (`digitalFoundationClientIntakePath` in `shared/site00-digital-foundation/clientRoutes.ts`) for the direct intake action the founder asked for. Proposed contract amendment; not applied to the V1 registry.
- CTA label `BEGIN YOUR FOUNDATION` matches the product's own NOT_STARTED action in `src/site00/pages/invitation/invitationJourney.ts`, so the email button and the landing button agree.
- Claims checked against code: partial briefing answers persist (`api/_lib/digitalFoundation/service.ts` intake patch and `schedulePersist`); checkout requires an accepted quote (`shared/site00-digital-foundation/quoteReadiness.ts`); accounts are client-owned (`administrative_access_model` in `operations/ownershipGenerator.ts`).

Premium art candidate: no. The existing doorway crop holds the role.
