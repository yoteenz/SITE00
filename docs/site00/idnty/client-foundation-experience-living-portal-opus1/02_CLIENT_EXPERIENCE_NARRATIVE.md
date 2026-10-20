# 02 — Client Experience Narrative

**Experience name: YOUR FOUNDATION.** It is one place that persists from the moment the client submits their intake until their foundation is established, and it stays available for their records afterwards. Its URL family is `/foundation/…`, and the client never needs to understand it.

## The journey, as the client lives it

1. **Submission.** The client presses SUBMIT on intake. The screen becomes **"YOUR FOUNDATION IS TAKING SHAPE."** with the locked supporting line: "YOUR INTAKE HAS BEEN RECEIVED. WE'RE REVIEWING YOUR REQUIREMENTS AND PREPARING YOUR PERSONALIZED FOUNDATION PROPOSAL."
   - The screen shows what was received, what happens next (three steps) and stage 2 of 7.
   - It offers "COME BACK ANYTIME", the three ways back in locked order.
   - Nothing pretends to move. There is no percentage, no countdown and no "someone is looking at your file".
2. **Review.** Straightforward intakes are auto-prepared and wait for founder approval. Complex ones go to founder review. The client sees the same hero either way. When the review route is founder-led, one honest line says some requirements need a closer look. If SITE 00 needs an answer, it appears in NEEDS YOU and by email.
3. **Proposal.** Email: "YOUR PERSONALIZED PROPOSAL IS READY".
   - The overview becomes "YOUR PROPOSAL IS READY". The proposal shows the version, the base Digital Foundation, the founder-approved recommendations and the total.
   - Each recommendation answers five questions: what it is, why for you, is it necessary, what it costs, and what happens if you decline.
   - Optional items toggle. Declining a required item sends the proposal back to founder review, and that produces a new version. Prices never change silently.
4. **Acceptance.** The client accepts **this exact version**: three disclosures, version, total, terms. A superseded version is struck through and cannot be accepted or paid.
5. **Awaiting payment.** "YOUR FOUNDATION IS READY TO BEGIN." One button opens Stripe's hosted checkout. The portal never shows a card field. Cancel, failure and an already-open checkout each have their own calm state.
6. **Confirmation.** Returning from Stripe shows "CONFIRMING YOUR PAYMENT". Only Stripe's signed webhook flips the experience to **"YOUR FOUNDATION IS UNDERWAY."** If it is slow, the client is told they can leave and will get an email.
7. **Setup.** Eight workstreams — domain, ownership, email, DNS, security, device, verification, records — each show their real state.
   - Fulfillment is typically 2–3 business days, starting after payment plus readiness. It is never a guaranteed date.
   - When something needs the client, the overview says "YOUR FOUNDATION NEEDS YOU" and the turnaround says it is paused.
   - When a provider is the wait, the client is told plainly that nothing is needed from them.
8. **Final verification.** A list of checks, each passed or not yet. Then one last step: review the handoff record.
9. **Established.** "YOUR FOUNDATION IS ESTABLISHED." The page shows what the client owns and their records. "BUILD ON YOUR FOUNDATION" is an opt-in line: nothing is scheduled, nothing is charged, and there is no automatic upsell.

## Coming back

Coming back is always in this order (LOCK1): **home screen › email.**

- **Home screen ("SAVE YOUR FOUNDATION").**
  - The client adds MY FOUNDATION to their home screen with the founder-approved white "00" icon. On iPhone/iPad: Safari Share → Add to Home Screen. On Android: the browser's own install prompt where offered, otherwise menu steps. On desktop: bookmark.
  - It opens `/foundation/return`, briefly showing the approved light launch image, "YOUR DIGITAL SPACE AWAITS.", while the foundation loads.
  - A device with a session goes straight in; a new device confirms by email.
  - Installing is optional and never required to continue.
- **Email.** Every SITE 00 email has VIEW MY FOUNDATION. Recovery is always by email: a one-time link plus a 6-digit code. The code is for home-screen apps, where email links open in the browser.

There is **no access card and no QR** (retired, LOCK1). Both return methods resolve to the same canonical foundation.

## Voice

The voice follows the live client:
- uppercase, short sentences, second person;
- a calm guarantee of what is *not* lost;
- no internal language (no "artifact", "surface", "webhook", "runbook", "token");
- no exclamation marks;
- no fabricated activity.
