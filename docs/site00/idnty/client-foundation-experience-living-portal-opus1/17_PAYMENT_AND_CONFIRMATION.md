# 17 — Payment and Confirmation (Families L, M)

Boards: **M16, M17**, TP04, TL04, TL05, D16, D17, UW03, X07.

## Awaiting payment — "YOUR FOUNDATION IS READY TO BEGIN"

| State (`ReviewState`) | Headline | Lede | CTA |
|---|---|---|---|
| READY_FOR_CHECKOUT | YOUR FOUNDATION IS READY TO BEGIN | YOU ACCEPTED PROPOSAL V2. PAYMENT HAPPENS ON STRIPE'S SECURE PAGE — NEVER ON THIS ONE. | PAY SECURELY ON STRIPE (lock icon) |
| CREATING_CHECKOUT | OPENING SECURE CHECKOUT | TAKING YOU TO STRIPE. DON'T CLOSE THIS PAGE. | busy "OPENING STRIPE…" |
| PAYMENT_CANCELLED | PAYMENT NOT COMPLETED | YOU LEFT CHECKOUT BEFORE PAYING. NOTHING WAS CHARGED… | RETURN TO SECURE PAYMENT |
| CHECKOUT_ERROR / FAILED | PAYMENT DIDN'T GO THROUGH | …NOTHING WAS CHARGED. TRY AGAIN OR USE ANOTHER CARD ON STRIPE. | TRY PAYMENT AGAIN |
| PAYMENT_PENDING | CHECKOUT IS OPEN | A CHECKOUT FOR PROPOSAL V2 IS ALREADY OPEN… | CONTINUE ON STRIPE |
| AWAITING_FOUNDER_PRICING | ALMOST READY | SITE 00 CONFIRMS PART OF THIS SCOPE BEFORE CHECKOUT OPENS… | disabled |

Each state shows the same two blocks:
- **YOU ARE PAYING FOR:** version, accepted time, amount, turnaround, and "PAID ON STRIPE HOSTED CHECKOUT — CARD DETAILS NEVER TOUCH SITE 00".
- **HOW PAYMENT IS CONFIRMED:**
  1. YOU PAY ON STRIPE.
  2. STRIPE CONFIRMS TO SITE 00 ("ONLY STRIPE'S CONFIRMATION STARTS YOUR PROJECT").
  3. YOUR FOUNDATION IS UNDERWAY.

The trust line reads "SECURE CHECKOUT BY STRIPE · NOTHING IS CHARGED HERE". **No card field, no embedded Elements, no raw card details in the portal.**

## Confirmation — return from Stripe

| `ActivationState` | Headline | Body |
|---|---|---|
| VERIFYING_PAYMENT | CONFIRMING YOUR PAYMENT | YOU'RE BACK FROM STRIPE. WE'RE WAITING FOR STRIPE TO CONFIRM YOUR PAYMENT TO SITE 00. RETURNING HERE DOES NOT MARK IT PAID. Status "CHECKING WITH STRIPE… CHECK 3 OF 10" |
| PAYMENT_CONFIRMATION_PENDING | STILL CONFIRMING | …YOU CAN CLOSE THIS PAGE — WE'LL EMAIL YOU WHEN IT'S CONFIRMED. "CHECKED 10 TIMES · NOT CONFIRMED YET". CHECK AGAIN |
| ACTIVATION_ERROR | WE COULDN'T CONFIRM YET | …IF YOU PAID, NOTHING IS LOST — STRIPE'S CONFIRMATION STILL REACHES US. CHECK AGAIN |
| PAID states | **YOUR FOUNDATION IS UNDERWAY** | PAYMENT CONFIRMED BY STRIPE. YOUR FOUNDATION SETUP HAS STARTED. Ink panel "PAYMENT CONFIRMED — VERIFIED BY STRIPE · <time> · PROPOSAL V2"; strip at stage 5; first NEEDS YOU item; GO TO MY FOUNDATION + SAVE YOUR FOUNDATION |

The confirmed page is the natural moment to offer SAVE YOUR FOUNDATION. It is the only post-payment upsell of any kind, and it is a convenience, not a product.

## Payment truth gates (X07)

PAID requires **all** of the following:

| Gate | Rule | Today |
|---|---|---|
| Verified webhook | HMAC signature with `STRIPE_WEBHOOK_SECRET` | exists |
| Event | `checkout.session.completed` with `payment_status=paid`, or `payment_intent.succeeded` | exists |
| Quote-version binding | `metadata.quote_version` = accepted version = current version | exists (guard) |
| Idempotency | event id processed once | **verify** (G-15) |
| Amount | `amount_total` = quote total minor units | **verify** (G-15) |
| Currency | = quote currency | **verify** (G-15) |
| Artifact linkage | `metadata.artifact_id` = artifact | exists |

The frontend redirect (`?checkout=return`) never writes payment state. That is already true, and it stays true. This sprint does not modify payment processing or trigger Stripe.
