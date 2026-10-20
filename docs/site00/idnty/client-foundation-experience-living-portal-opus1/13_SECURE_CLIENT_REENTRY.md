# 13 — Secure Client Reentry (Family H)

Boards: **M10, M11, M12**, TP09, TL09, D12, AH04, AH09, X08.

## Architecture (proposed; backend dependency G-09)

```
invitation / email link  ──►  /foundation/:token   (existing bearer link)
                                   │  server: exchange token → httpOnly session cookie (SameSite=Lax, Secure, 30 days)
                                   │  client: history.replaceState → /foundation/return (token leaves the address bar)
home screen / bookmark   ──►  /foundation/return?src=home
access card scan         ──►  /foundation/return?card=<id>
                                   │
                         session valid? ──yes──► portal (same FoundationClient, session-authorised payload)
                                   │no
                                   ▼
                     CONFIRM IT'S YOU → email → link (15 min, single use) or 6-digit code (10 min, 5 tries)
                                   ▼
                         session issued → portal
```

- The token link keeps working for invitation continuity (no migration break). Its first use also mints a session, after which the client never needs the token again.
- Hardening the token itself (expiry, rotation, hashing) is G-12 and is sequenced after sessions exist.
- Sensitive records need a **step-up** within the session: a fresh email confirmation, valid for 30 minutes idle (`08`).
- **Sign out on this device** clears the session cookie and returns to `/foundation/return`.

## States (12)

| # | State | Headline | Body | Primary action |
|---|---|---|---|---|
| 1 | Existing session | WELCOME BACK | SIGNED IN ON THIS DEVICE AS NORTHLINE TRANSPORT. OPENING YOUR FOUNDATION. | busy "OPENING…" then auto-continue |
| 2 | Session expired | YOUR SESSION ENDED | FOR YOUR SECURITY… WE'LL EMAIL YOU A ONE-TIME LINK. | EMAIL ME A LINK |
| 3 | Verified email required | CONFIRM IT'S YOU | ENTER THE EMAIL YOU USED… LINK AND CODE. | EMAIL ME A LINK |
| 4 | Link requested | CHECK YOUR EMAIL | IF THAT EMAIL MATCHES A FOUNDATION, A LINK AND A 6-DIGIT CODE ARE ON THEIR WAY… | code entry + CONTINUE; RESEND IN 0:42 |
| 5 | Link expired | THAT LINK EXPIRED | SIGN-IN LINKS WORK ONCE AND LAST 15 MINUTES… | SEND A NEW LINK |
| 6 | Link invalid | WE DON'T RECOGNIZE THAT LINK | IT MAY BE INCOMPLETE OR ALREADY USED… | CONFIRM MY EMAIL |
| 7 | Not found | NOTHING FOUND | WE COULDN'T FIND A FOUNDATION FOR THAT LINK OR CARD… | CONFIRM MY EMAIL |
| 8 | Revoked | THIS CARD WAS REPLACED | A NEWER ACCESS CARD WAS ISSUED… | CONFIRM MY EMAIL |
| 9 | Wrong identity | ANOTHER FOUNDATION IS OPEN | THIS DEVICE IS SIGNED IN TO A DIFFERENT FOUNDATION… | SIGN OUT AND CONTINUE · KEEP THE CURRENT ONE |
| 10 | Temporarily unavailable | BACK SHORTLY | SIGN-IN IS TEMPORARILY UNAVAILABLE. YOUR FOUNDATION IS SAFE… | TRY AGAIN |
| 11 | Retry (rate limited) | PLEASE WAIT | TOO MANY SIGN-IN ATTEMPTS… TRY AGAIN IN 5 MINUTES. | TRY AGAIN (disabled with a countdown) |
| 12 | Success | YOU'RE BACK IN | THIS DEVICE IS SIGNED IN FOR 30 DAYS. SIGN OUT ANY TIME FROM THE MENU. | OPEN MY FOUNDATION |

Every state uses the system-panel composition: rail, headline, lede, an optional field or code, actions, trust "WE NEVER ASK FOR A PASSWORD." On TP+ it adds the corner fragment. The area navigation is hidden: reentry is public.

## Non-enumeration

States 3/4 respond identically whether or not the email matches. States 6 and 7 use the same tone, and the copy never confirms that a foundation exists for an address or a card. The masked email (`M•••@…`) is shown **only inside** an authenticated session (header, preferences), never on the public reentry page.

## Why a code as well as a link

iOS home-screen web apps run in their own storage container. A magic link opens in Safari, which signs in Safari, not the home-screen app. The 6-digit code lets the client finish inside the app. Both are issued together, and whichever is used first consumes both.

## Email

The sign-in email (X12) is subject "YOUR SITE 00 SIGN-IN LINK", CTA "OPEN MY FOUNDATION", with the code in the body and the note "IF YOU DIDN'T ASK FOR THIS, IGNORE IT." It is designed only; sending stays disabled (G-14).
