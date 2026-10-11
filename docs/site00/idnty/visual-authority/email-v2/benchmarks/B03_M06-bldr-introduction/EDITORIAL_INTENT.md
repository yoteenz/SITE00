# B03 — M06 BLDR Introduction — editorial intent

Template ID: `M06`. Trigger: journey step, no event binding. Family: marketing, requires marketing opt-in.
Composition: EDITORIAL FEATURE. Register: FEATURE.

## Reasoning before writing

| Question | Answer |
|---|---|
| Who is receiving this? | A SITE 00 contact who has opted into marketing and has not expressed build interest. Often a Foundation client with a domain and email in place. |
| What has just happened? | Nothing specific. This is a nurture step, not a reaction to an action. |
| What do they already know? | They have, or know about, a Digital Foundation. They probably have not heard of BLDR, or only as a word. |
| Why write now? | They asked to hear what comes after the Foundation. This is the first real look at it. |
| What are they likely thinking? | "I have a domain. My website is fine, or it isn't, or I don't have one. I don't have time for a sales pitch." |
| What do they need? | A reason to care: a way of thinking about a website that is new to them. What BLDR actually does, in concrete terms. What they get from it (three blueprint directions to choose from). No pressure. |
| What should they feel after? | Curiosity, ambition, the sense of possibility. A wish to look. |
| What action follows? | Optional exploration of BLDR. |
| Most natural way to say it | As a short editorial feature with one central idea, told as a walk through a building. |
| What composition supports that? | A rich architectural hero. A headline that carries the idea. A three-step walk-through (approach, inside, in use) whose layout changes at each step. A revelation of three blueprint plans. A resting image, then one full-width red invitation. |

## The central idea

"AN ADDRESS DESERVES A BUILDING."

The subject line asks the question ("WHAT STANDS AT YOUR ADDRESS?") and the headline answers it, so the inbox and the email do different work instead of repeating each other.

The reader's domain is the address; the Foundation laid the ground. A website is usually planned like a brochure. BLDR plans it like a building: who arrives, what they came for, how it feels to walk in, and whether it works. The idea is drawn from shipped SITE 00 language ("YOUR BUSINESS HAS AN ADDRESS.", "THE NEXT ROOM.", "A STUDIO FOR THE BUILD.") and from BLDR's own definition (`src/site00/config/builder.ts`: "BLDR IS THE BLUEPRINT ENGINE … THREE STRATEGIC BLUEPRINT DIRECTIONS FOR YOUR REVIEW AND SELECTION").

## Creative rationale

The lean pack said "BLDR IS INTRODUCED. NO INTEREST IS CLAIMED. NO BOOKING IS CLAIMED." It narrated its own safety rules and gave the reader nothing to want.

V2 gives the reader a new way to see their own website, then shows what BLDR makes from it. The walk-through uses the three lenses already on the approved DF-I02 plate (PLACE, FEEL, WORK AND PACE) and turns them into a sequence the reader moves through: approaching, stepping inside, using the building. Each step has its own alignment and scale, so the email reads as movement, not as three equal cards.

The revelation is concrete and true: BLDR produces three blueprint directions, and the reader chooses. The plans are drawn as code-native line drawings with one red room each, labelled as illustrative.

There is no booking, no date, no deadline, no "your request", and no claim of interest. The close is an open invitation with one dry line: "WHENEVER CURIOSITY GETS THE BETTER OF YOU."

## Lineage test

| # | Question | Result |
|---|---|---|
| 1 | Could it exist because of the core idea? | Yes. It is the core idea's next sentence: what stands at the address. |
| 2 | Explainable without color? | Yes. Building, walk-through, blueprints. |
| 3 | Preserves core DNA? | Yes. Closest to the marketing authority: hero architecture, numbered sections, blueprint, red band. |
| 4 | Meaningful variation? | Yes. Only feature, only full-bleed hero, only full-width red band. Sections vary in alignment. |
| 5 | Serves a real purpose? | Yes. Introduces BLDR to an opted-in reader. |
| 6 | Recognizable without the name? | Yes. |
| 7 | Distinct from siblings? | Yes. See `COMPOSITION_COMPARISON.md`. |

## Contract notes

- The copy contract's route is `/foundation/{{public_token}}`, but `public_token` is not in its `dynamic_placeholders`. Either add `public_token` to M06 or route to a public BLDR page. Logged in `qa/CONTRACT_GAPS.md`.
- A compliant marketing footer needs `unsubscribe_url` and `postal_address`. Neither is in the M06 contract. The board shows them as visible tokens.
- Registry notes DF-I02 is shared with `bldr-discovery`. V2 uses different crops and roles; `bldr-discovery` must use a different composition when it is rebuilt.

Premium art candidate: no. DF-I02 carries all required roles.
