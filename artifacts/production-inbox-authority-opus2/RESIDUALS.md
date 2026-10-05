# Residuals / conflicts

## Residual differences
1. **Desktop and tablet authorities were not inspected.** The 8 OpenArt boards are behind `cdn.openart.ai`, which this environment's network policy blocks (CONNECT 403). Desktop and tablet are therefore MOBILE_AUTHORITY_TRANSLATED. Once the host is allowed, or the boards are attached to the pack, a compare-and-fix pass against them is still owed.
2. **Screenshot content without a data source** is not reproduced:
   - people, avatars, "By JANE DOE", Etta Vale and other conversations, messages, reactions and attachments with file sizes
   - reviewers, due dates, versions and discussion
   - system health %, sync %, deployments, render attempts, access requests
   - resolved history counts (48 / 12 / 08 / 05)

   Each place shows live values, "—" or an honest UNMOUNTED or EMPTY state.
3. **Live ndxbook is sparse** (0 resolved, 0 requests, no messages), so RESOLVED, MESSAGES and the thread render mostly as empty states. Their layouts are built and will fill as data arrives.
4. **Disabled actions** have no backing operation: STOP WATCHING, the notice's RETRY / ASSIGN / ESCALATE / ACKNOWLEDGE, the composer and CREATE DECISION. They show a reason and are not faked.
5. **APPROVE is disabled on live data** because the narrative founder gate has `decidableInHub=false`. This is unchanged behaviour.
6. **"Attachments" are the stage's related materials** (upstream and downstream stage assets from the graph). The decision itself has no file attachments in the data.
7. **Artwork** comes from the hub's asset slots (the narrative stage art is a book-page photo). The authority's pyramid and studio imagery is not used: no screenshot crops.
8. **Short phones (≤760px tall)** hide secondary modules, documented in `NO_SCROLL_MATRIX.md`, to keep the no-page-scroll contract.

## Conflicts
1. **Routes.** The brief lists `/production/inbox/*`, but the working route is `/production/queue`. It was kept, per "do not rename working routes merely to match this prompt"; the children are query states on it.
2. **Superseded OPUS1 tests.** The Inbox half of `productionInboxActivityThreeViewportOpus1.test.ts` asserted the old lenses. Those blocks were rewritten to the new contract, keeping their intent (mount on the existing route, gated approval, legacy link, Inbox ≠ Activity approvals).
3. **Root tab.** The authority shows NEEDS YOU highlighted on ALL INBOX, MESSAGES and SYSTEM. This is followed: those children sit under NEEDS YOU and get a shared type rail (ALL INBOX · MESSAGES · SYSTEM) so they are reachable.
4. **SYSTEM sub-filter.** The authority's ALL · SYSTEM · PEOPLE · PROJECTS has no PEOPLE or PROJECTS data. It is replaced by the type rail rather than inventing those filters.
5. **Header count.** The authority reads 03; live reads 02 (the attention count, unchanged).
