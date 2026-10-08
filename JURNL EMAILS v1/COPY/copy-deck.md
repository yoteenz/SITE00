# Copy deck — subjects, preheaders, CTAs (DRAFT FOR FOUNDER REVIEW)

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

- Subjects: sentence case, ≤ 50 characters, no emoji, no financial figures.
- Preheaders: 40–100 characters, sentence case, add to the subject rather than repeat it, no financial figures (lock-screen privacy).
- Headlines: uppercase, short, declarative — the app’s voice.
- Body: sentence case, two short paragraphs at most outside E03 / E07.
- CTA: uppercase verb + object; one primary CTA per email.
- Every {token} is live HTML filled from source truth at send time; a missing token selects the honest variant, never a placeholder.
- Every email has a plain-text fallback with the same facts and the same links.

| Email | Subject | Preheader | Headline | CTA |
|---|---|---|---|---|
| A01 WELCOME TO JURNL | Welcome to JURNL, {firstName} | Your financial life, beautifully organized. Here is where to begin. | YOUR JURNL IS OPEN. | BEGIN SETUP |
| A02 VERIFY YOUR EMAIL | Verify your email for JURNL | One step to open your account. If this was not you, ignore this email. | VERIFY YOUR EMAIL. | VERIFY MY EMAIL |
| A03 FINISH SETTING UP JURNL | Your JURNL is waiting where you left it | A few minutes finishes your setup, right where you stopped. | PICK UP WHERE YOU LEFT OFF. | FINISH SETUP |
| A04 YOUR SAFE TO SPEND IS READY | Your Safe to Spend is ready | See what is safe to spend now, and how JURNL got there. | YOUR NUMBER IS READY. | SEE WHY THIS AMOUNT |
| A05 YOUR WEEK IN JURNL | Your week in JURNL | What is coming, what moved, and where you stand. | YOUR WEEK, IN BRIEF. | OPEN MY WEEK |
| A06 A PURCHASE MAY NEED A SECOND LOOK | A purchase may need a second look | Your plan changed since you saved it. You still have options. | THIS MAY NEED A SECOND LOOK. | REVIEW THIS PURCHASE |
| A07 YOU REACHED A MILESTONE | You reached a milestone | {goalName} is fully set aside and recorded in your plan. | YOU REACHED A MILESTONE. | SEE YOUR GOAL |
| A08 RESET YOUR ACCESS | Reset your JURNL password | Use this link to choose a new password. If you did not ask, ignore this email. | RESET YOUR ACCESS. | CHOOSE A NEW PASSWORD |
