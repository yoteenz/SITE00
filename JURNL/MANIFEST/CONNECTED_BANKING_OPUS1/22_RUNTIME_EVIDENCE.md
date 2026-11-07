# 22 / 23 · RUNTIME EVIDENCE (screenshots and recordings)

All images and videos are **real captures of the running app** (Chromium, Playwright). They are in the ZIPs under `RUNTIME/`.

- **Real app, unconfigured (`/jurnl/app`, normal dev server):** it fails closed with JURNL SERVICE UNAVAILABLE. No preview data is shown.
- **Real app, production mode, against a STUBBED network** (`e2e/jurnl/helpers/jurnl-stub-backend.ts`). This covers auth, the JURNL API and Plaid Link. Every institution shown is **synthetic**, labelled "(TEST)", and the panel shows the TEST MODE notice. **No screenshot shows a real bank, a real Plaid Link window or a real auth server.**

| File | Shows |
|---|---|
| `01_real_app_fail_closed.png` | The unconfigured real app, failing closed |
| `02_registration_check_your_email.png` | Registration → CHECK YOUR EMAIL |
| `03_unverified_sign_in_refused.png` | An unverified sign-in returns to CHECK YOUR EMAIL |
| `04_signed_in_entry_complete.png` | After verification, sign-in succeeds |
| `05_first_run_real_account_empty.png` | First-run real account: empty, no sample data |
| `06_money_with_imported_accounts.png` | MONEY with imported balances: HELD = checking + payout card; OWED = card; "FROM YOUR BANK"; dated source line |
| `07_connected_accounts_up_to_date.png` | CONNECTED ACCOUNTS & SYNC: TEST MODE, 3 institutions UP TO DATE, accounts with mask / balance / limit / as-of, READ ONLY disclosure, payout card rows |
| `08_needs_reconnection.png` | The server reports NEEDS_REAUTH; the panel shows RECONNECT with an explanation |
| `09_connected_new_institution.png` | CONNECT A BANK → stubbed Link → server exchange → the new institution appears |
| `10_disconnect_confirm.png` | Disconnect confirmation (what is kept, and the optional deletion) |
| `11_disconnected.png` | After disconnect: "ACCESS WAS REMOVED. IMPORTED HISTORY IS KEPT." |
| `12_connections_{360x640,393x660,393x852,430x932,834x1194,1440x900}.png` | Six viewports, with no horizontal overflow (asserted) |
| `13_signed_back_in_restored.png` | Signed out, then signed back in: records restored from the server snapshot |
| `RECORDINGS/*.webm` | Walkthrough recordings of the same runs |

**Not shown, because external blockers prevent it:**
- the real Plaid sandbox Link window (B-1);
- real email delivery (B-2);
- a real institution (B-5).
