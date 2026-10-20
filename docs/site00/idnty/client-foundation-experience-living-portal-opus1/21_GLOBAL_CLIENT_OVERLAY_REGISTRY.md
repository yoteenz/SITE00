# 21 — Global Client Overlay Registry (Family T)

There are 13 overlays. They do not share the founder workspace `OverlayHost`: the client gets a small `DfOverlayHost` on the existing `.df-portal` scope (portaled to `<body>`, as `DfMenu` already is).

| ID | Overlay | Kind | M | TP | TL / D / UW | Trigger | Dismiss | Boards |
|---|---|---|---|---|---|---|---|---|
| OL-C01 | Menu | drawer | full-screen | right 400 | right 400 | header menu | close, Esc, scrim | M20, TP10 |
| OL-C02 | Save to home screen | sheet / dialog | bottom sheet | bottom sheet 600 | dialog 560 | SAVE TO HOME SCREEN | close, Esc, scrim | M08, AH02–AH04, D10 |
| OL-C03 | Sign out on this device | sheet / dialog | bottom | bottom | dialog | menu | STAY SIGNED IN, Esc | TP10, X08 |
| OL-C04 | Open a sensitive record | sheet / dialog | bottom | bottom | dialog | sensitive row | close | M07, D09 |
| OL-C05 | Decline required item | sheet / dialog | bottom | bottom | dialog | DECLINE on required | KEEP … | M14, D14, TL10 |
| OL-C06 | Replace access card | sheet / dialog | bottom | bottom | dialog | REPLACE MY CARD | KEEP CURRENT CARD | M09, D11, AH10 |
| OL-C07 | Help | sheet / dialog | bottom | bottom | dialog | menu HELP, I NEED HELP | close | X10 |
| OL-C08 | Toast: saved | toast | bottom-centre above bar | bottom-right | bottom-right | download | auto 4.2 s | M09, D11, AH10 |
| OL-C09 | Toast: share opened | toast | " | " | " | share | auto 4.2 s | AH10 |
| OL-C10 | Toast: save failed | toast (error) | " | " | " | download error | manual | D11, AH10 |
| OL-C11 | Offline | banner (sticky top) | yes | yes | yes | `offline` event | `online` / RETRY | M20, X09 |
| OL-C12 | Secure view expiring | banner (sticky top, red) | yes | yes | yes | step-up session < 2 min | STAY SIGNED IN | D20 |
| OL-C13 | Refresh failed | toast (error) | " | " | " | REFRESH error | manual | M20, X09 |

## Rules

- Dialogs and sheets use `role="dialog"`, `aria-modal="true"`, an `aria-label` equal to the title, a focus trap, Esc to close, focus returned to the trigger, and a scroll lock on the page. Toasts use `role="status"`; error toasts use `role="alert"`. Banners use `role="status"` / `role="alert"`.
- One overlay at a time. Opening a dialog closes the drawer.
- Scrim `rgba(12,12,12,0.42)`. Sheets have a 1px ink border and no rounded corners (DF grammar: "no rounded primary buttons").
- Mobile toasts sit above the bottom bar (bottom 84px).
- Motion: `25`.
