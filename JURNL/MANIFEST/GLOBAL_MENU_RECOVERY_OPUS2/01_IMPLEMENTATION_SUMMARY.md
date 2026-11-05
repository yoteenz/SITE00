# 01 · Implementation summary

Sprint: P0.JURNL.GLOBAL-EIGHT-OVERLAYS.MENU-FUNCTIONAL-RECOVERY-AND-SECTIONED-NAVIGATION-CONVERGENCE.OPUS2. It runs on the same
branch as the parent OPUS1 asset mount (no parent implementation branch existed, so both contracts are on one branch).

| Field | Value |
|---|---|
| Base | `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `4ddbac6ced7fd43213d22ffd6d26524336ee37aa` (PR #1714 head) |
| Branch | `claude/jurnl-global-eight-overlays-menu-recovery-um0u93` |
| Not carried | `c34ef288f` (the re-skin of the approved F09 drawer; it waits for FD-12) |

## One navigation state machine

`runtime/global/menuPanels.ts` is a stack, hosted by `JurnlCornerChromeProvider`.

* **One dialog at a time.** The menu sits at the bottom of the stack, each destination goes on top of it, and each follow-on step
  goes on top of its destination. Only the top entry is drawn, so there is one dialog, one scrim and one focus trap.
* **Back is one step.** BACK, Escape and the scrim each pop one step, and focus returns to the control that opened that step.
  The menu's own close empties the stack, and focus returns to the hamburger.
* **Leaving clears everything.** A route change to entry or setup (after sign-out or account deletion) clears the stack.
  Destinations that navigate (YOUR POCKETS, the drawer's ACCOUNT title) close the whole stack first, so no orphaned modal remains.
* **Shared with the page and drawer.** The ACCOUNT page and the approved F09 drawer open destinations through the same stack
  (`useMenuPanels`). There are no duplicate sheets.

## Sectioned menu on OV08

`GlobalMenu` draws the OV08 production shell at one uniform contain scale. The plate has the shell's exact 9:16 ratio, so it is
never stretched. The live regions are fractions of the shell:
* the headline on the parchment;
* the rows in the olive field, which is the only scroll container;
* a square-rounded close at the top end.

The shell already contains the bust, lemons, arch, coast and oxblood. The old menu head (SK01 bust, lemon branch, heading paper)
is no longer layered over it.

The rows come from one source, `GLOBAL_MENU_SECTIONS`:

| Section | Rows |
|---|---|
| YOUR FINANCES | CONNECTED ACCOUNTS & SYNC · CURRENCY & EXCHANGE · SAFE TO SPEND BUFFER |
| YOUR INTELLIGENCE | ASK JURNL · CLASSIFICATION & LEARNING RULES |
| YOUR ACCOUNT | ACCOUNT & PROFILE · PREFERENCES · PRIVACY & CONSENTS · MY MEMBERSHIP · EXPLORE ADD-ONS · HELP & SUPPORT · SIGN OUT |

* The dock (HOME · MONEY · ADD · PLAN · CREDIT) is unchanged and is not repeated in the menu.
* Rows show only values JURNL actually holds: the currency code, the buffer amount, whether the Ask context is on or off, "MANUAL
  POCKETS ONLY", "NOTHING LEARNED YET".
* While the menu is open, the hamburger stays above it as the menu's toggle (`aria-expanded`), and the BACK chip is hidden.

## Destinations

| Row | Opens |
|---|---|
| CONNECTED ACCOUNTS & SYNC | `ConnectionsFolio`. It reads `JURNL_BANK_CONNECTION_PROVIDER = PROVIDER_UNAVAILABLE`: no bank link, sync off, the pocket count, YOUR POCKETS → `money/places`. If setup recorded the simulated F02 CONNECTED step, it says that no bank was ever linked |
| CURRENCY & EXCHANGE | `CurrencySheet` (the existing selector), now with `ExchangeDisclosure` and an inline failure state. It no longer closes as if a failed currency had applied |
| SAFE TO SPEND BUFFER | `BufferFolio`, using the shared `useSafetyBuffer` (also used by the ACCOUNT page and the drawer) |
| ASK JURNL | `AskJurnlSheet`, explanation only. From the menu it links to PRIVACY & CONSENTS |
| CLASSIFICATION & LEARNING RULES | `RulesFolio`: no rules exist and none are shown |
| ACCOUNT & PROFILE | the approved F09 `AccountDrawer`, unchanged in look. Its ACCOUNT title and PROFILE card open the ACCOUNT page |
| PREFERENCES | `PreferencesFolio`: notifications, week start and date format, time zone, and sign-in security (F01.12 tools) |
| PRIVACY & CONSENTS | `PrivacyConsentsFolio`: the three setup consents, ASK JURNL CONTEXT, and the F01.11 tools |
| MY MEMBERSHIP / EXPLORE ADD-ONS | unchanged. The unlock card and MANAGE MEMBERSHIP are honest (see 02) |
| HELP & SUPPORT | `HelpFolio` (plus `LegalFolio`) |
| SIGN OUT | `SignOutConfirm`: the F01.04 confirmation, then `signOut()`, then every panel closes, then the welcome screen (`F01.00` → `entry`). Authentication itself is unchanged |
