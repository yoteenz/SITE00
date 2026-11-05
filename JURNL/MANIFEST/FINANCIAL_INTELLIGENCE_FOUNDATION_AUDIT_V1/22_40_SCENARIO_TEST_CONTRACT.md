# 22 — Forty-scenario test contract

Inspected tree: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf`
Worktree: `/tmp/site00-jurnl-integration-wt`
Default branch `main` @ `e413590e1` does not contain `src/projects/jurnl/data/ledger/accounting.ts`.
None of the financial-OS pull requests below are merged to `main`.
Tagline: PLAN TODAY. GROW FREELY.
Sprint: P0.JURNL.FINANCIAL-INTELLIGENCE.CONNECTED-TRANSACTION-UNDERSTANDING-AND-ADAPTIVE-LEARNING-FOUNDATION.AUDIT1
Application code: unchanged. Database: unchanged. Paid calls: none.


Evidence classes:

- VERIFIED_IN_REPOSITORY — read in the inspected tree.
- VERIFIED_IN_TESTS — covered by a named test in that tree.
- VERIFIED_WITH_PROVIDER_DOCS — public page read on 4 Nov 2026 (America/Chicago). Not a live JURNL connection.
- DESIGN_REQUIREMENT — required by this sprint. Not implemented.
- PROPOSED_ARCHITECTURE — design for a later implementation sprint. Not implemented.
- UNKNOWN — not established by repository evidence or a cited source.
- BLOCKED — needs a founder or vendor decision before build.

These cases are DESIGN_REQUIREMENT test contracts. They are not implemented tests.
A case fails if any failure condition occurs, even when the happy-path classification looks right.
Confidence words are the policy in document 12. They are not model scores.

## 01. 01 Confirmed business fuel

- INPUT: Posted Shell $42.80 on connected checking. User confirms rideshare fuel, 100% business, activity Uber.
- KNOWN FACTS: Amount, merchant, account, and posted date come from the provider record. Purpose does not.
- EXPECTED CLASSIFICATION: TYPE EXPENSE. CATEGORY TRANSPORT. SUBCATEGORY FUEL. PURPOSE RIDESHARE OPERATIONS. ACTIVITY UBER. ALLOCATION 100% business. TAX UNDETERMINED.
- CONFIDENCE / UNCERTAINTY: HIGH only after an enabled user-approved rule. The first confirmation is USER-CONFIRMED FACT, not a rule.
- EXPECTED LEDGER IMPACT: One expense on the checking asset. Balance effect equals the provider amount. No second withdrawal.
- USER REVIEW REQUIREMENT: Ask once: was this fuel for business driving? Do not ask again while the approved rule matches.
- LEARNING EFFECT: Evidence count +1. Rule remains disabled until the user approves automation.
- AUDIT EXPECTATION: Raw provider row unchanged. Classification and confirmation stored beside it.
- FAILURE CONDITION: Treating the first yes as a permanent merchant rule, or marking the fuel deductible.

## 02. 02 Personal gas-station purchase

- INPUT: Same merchant Shell, different day, user says personal transportation or convenience, not work.
- KNOWN FACTS: Merchant name alone does not decide purpose.
- EXPECTED CLASSIFICATION: TYPE EXPENSE. CATEGORY TRANSPORT or FOOD depending on the user's answer. PURPOSE PERSONAL. ALLOCATION 0% business.
- CONFIDENCE / UNCERTAINTY: LOW until the user answers. HIGH only for a later approved personal rule.
- EXPECTED LEDGER IMPACT: One expense. Excluded from business operating cost.
- USER REVIEW REQUIREMENT: Required when no approved personal or business rule matches.
- LEARNING EFFECT: A personal confirmation must not train the business-fuel rule.
- AUDIT EXPECTATION: Both answers kept. No historical rewrite.
- FAILURE CONDITION: Applying the business-fuel rule because the merchant string matches.

## 03. 03 Mixed fuel and groceries

- INPUT: One posted charge $60.00. User splits $45.00 business fuel and $15.00 personal groceries.
- KNOWN FACTS: The bank amount is $60.00. Item contents are not known from the merchant.
- EXPECTED CLASSIFICATION: Parent remains one EXPENSE of $60.00. Lines: FUEL / RIDESHARE 45.00 and FOOD / PERSONAL 15.00. TAX UNDETERMINED.
- CONFIDENCE / UNCERTAINTY: HIGH for the split only after the user saves it. The suggestion to split is LOW.
- EXPECTED LEDGER IMPACT: Account balance moves by 60.00 once. Lines sum to 60.00. No second bank withdrawal.
- USER REVIEW REQUIREMENT: Required. Show the residual if the lines do not sum.
- LEARNING EFFECT: Do not learn 'every Shell is 75% business' from one split.
- AUDIT EXPECTATION: Parent source amount immutable. Split version recorded.
- FAILURE CONDITION: Creating two bank withdrawals, or a line total other than 60.00.

## 04. 04 Repeated same-amount purchases

- INPUT: Two Shell charges of $42.80 on the same account and the same posted date, distinct provider transaction ids.
- KNOWN FACTS: Two source ids. Merchant and amount match is not identity.
- EXPECTED CLASSIFICATION: Two separate EXPENSE events. Purpose unresolved on each.
- CONFIDENCE / UNCERTAINTY: Identity HIGH because source ids differ. Purpose LOW on each.
- EXPECTED LEDGER IMPACT: Two expenses. Neither is dropped.
- USER REVIEW REQUIREMENT: Each purpose is reviewed on its own unless a narrow approved rule already covers both.
- LEARNING EFFECT: No collapse into one learned event.
- AUDIT EXPECTATION: Both source ids retained.
- FAILURE CONDITION: Deduping solely by merchant, amount, and day.

## 05. 05 Pending-to-posted fuel purchase

- INPUT: Pending Shell authorization $40.00 later removed. Posted Shell $42.80 arrives with pending_transaction_id pointing at the removed id.
- KNOWN FACTS: Plaid documents this as removal plus a new posted transaction, not an in-place state change.
- EXPECTED CLASSIFICATION: One canonical posted EXPENSE of $42.80. Pending row is linked and no longer a live charge.
- CONFIDENCE / UNCERTAINTY: Match HIGH when pending_transaction_id is present. Purpose unchanged by the match.
- EXPECTED LEDGER IMPACT: Pending does not become a second expense. Posted amount replaces the authorization for balance coverage.
- USER REVIEW REQUIREMENT: Review only if the amount change is material and no rule explains the tip or pump difference.
- LEARNING EFFECT: No new rule from the amount change alone.
- AUDIT EXPECTATION: Both provider ids and the link kept.
- FAILURE CONDITION: Keeping the pending $40 and the posted $42.80 as two expenses.

## 06. 06 Imported transaction matching a manual record

- INPUT: User recorded Shell $42.80. The same account later imports a provider row with the same amount, close date, and similar merchant, and no shared source id.
- KNOWN FACTS: Manual row has no provider id. Import has a provider id. Similarity is not proof.
- EXPECTED CLASSIFICATION: One canonical event if the user confirms the match. Otherwise both remain and the import is flagged.
- CONFIDENCE / UNCERTAINTY: Probable match is MEDIUM at most. Never HIGH from merchant plus amount alone.
- EXPECTED LEDGER IMPACT: Confirming the match must not post the amount twice. Rejecting it keeps both until the user decides.
- USER REVIEW REQUIREMENT: Required. Show both records and the fields that differ.
- LEARNING EFFECT: No rule is learned from the match decision.
- AUDIT EXPECTATION: Link or explicit non-link stored. Manual source_values preserved.
- FAILURE CONDITION: Auto-merging because amount and merchant are equal.

## 07. 07 Uber net payout deposit

- INPUT: Posted deposit described as an Uber payout for $186.40 on checking. No platform statement is attached.
- KNOWN FACTS: The bank fact is a deposit of 186.40. Gross fares, tips, fees, and bonuses are absent.
- EXPECTED CLASSIFICATION: TYPE INCOME. CATEGORY INCOME. PURPOSE RIDESHARE PAYOUT. ACTIVITY UBER. Gross components UNKNOWN. Not gross revenue.
- CONFIDENCE / UNCERTAINTY: Amount HIGH as a provider fact. Gross breakdown UNVERIFIED and must stay unknown.
- EXPECTED LEDGER IMPACT: One inflow of 186.40. Do not invent offsetting fee expenses.
- USER REVIEW REQUIREMENT: Optional note that this is the net deposit, not a full earnings statement.
- LEARNING EFFECT: Do not learn a gross formula.
- AUDIT EXPECTATION: Provenance says bank deposit only.
- FAILURE CONDITION: Splitting the deposit into invented fare, tip, and fee lines.

## 08. 08 Lyft payout adjustment

- INPUT: A later Lyft-described deposit or debit labeled adjustment, with its own provider id.
- KNOWN FACTS: It is a new provider record, not a rewrite of the earlier payout.
- EXPECTED CLASSIFICATION: TYPE ADJUSTMENT or INCOME or EXPENSE according to sign. PURPOSE PLATFORM ADJUSTMENT. ACTIVITY LYFT. Not a duplicate of the original payout.
- CONFIDENCE / UNCERTAINTY: Type from sign is deterministic. Purpose MEDIUM until the user confirms.
- EXPECTED LEDGER IMPACT: Signed amount posts once. The original payout stays.
- USER REVIEW REQUIREMENT: Ask only if the description cannot be distinguished from a reversal of a known payout.
- LEARNING EFFECT: No automatic pairing without ids or user confirmation.
- AUDIT EXPECTATION: Separate source id. Optional link if the user confirms.
- FAILURE CONDITION: Deleting the original payout or netting it silently.

## 09. 09 Internal transfer

- INPUT: Outflow $200 from checking and inflow $200 to savings, same owner, matched legs.
- KNOWN FACTS: Two provider rows, one economic movement.
- EXPECTED CLASSIFICATION: TYPE INTERNAL TRANSFER on both legs. Not INCOME. Not EXPENSE.
- CONFIDENCE / UNCERTAINTY: HIGH when both accounts are in the workspace and amount, currency, and window match, or the user confirms.
- EXPECTED LEDGER IMPACT: Checking decreases, savings increases, in-transit or completed per the existing settlement states. Income and expense totals unchanged.
- USER REVIEW REQUIREMENT: Review when only one leg is visible.
- LEARNING EFFECT: No category learning.
- AUDIT EXPECTATION: Transfer relationship id on both legs.
- FAILURE CONDITION: Counting the outflow as spending and the inflow as income.

## 10. 10 Credit-card purchase

- INPUT: Posted card charge $28.00 at a grocery merchant.
- KNOWN FACTS: Liability increases. No cash account has moved.
- EXPECTED CLASSIFICATION: TYPE EXPENSE and txn class CREDIT_PURCHASE. CATEGORY from user or rule. Payment is not this event.
- CONFIDENCE / UNCERTAINTY: Amount HIGH. Purpose separate.
- EXPECTED LEDGER IMPACT: Amount owed on the card increases by 28.00. Cash accounts unchanged.
- USER REVIEW REQUIREMENT: Purpose review under the normal confidence policy.
- LEARNING EFFECT: May support a later merchant rule. Does not create a payment rule.
- AUDIT EXPECTATION: Card account id and source id stored.
- FAILURE CONDITION: Also reducing a checking account.

## 11. 11 Credit-card payment

- INPUT: Checking outflow $200 described as a card payment, and a card credit of $200.
- KNOWN FACTS: This settles liability. It is not a second copy of earlier purchases.
- EXPECTED CLASSIFICATION: TYPE CREDIT CARD PAYMENT. Not EXPENSE.
- CONFIDENCE / UNCERTAINTY: HIGH when the card and the funding account are both in the workspace and the user or a deterministic transfer match agrees.
- EXPECTED LEDGER IMPACT: Checking decreases. Amount owed decreases. Expense totals do not increase.
- USER REVIEW REQUIREMENT: Review if the card payment has no matching card credit yet.
- LEARNING EFFECT: No spend-category learning.
- AUDIT EXPECTATION: Transfer relationship. Settlement state from the existing state machine.
- FAILURE CONDITION: Adding $200 to spending already recorded from card purchases.

## 12. 12 Credit-card payment reversal

- INPUT: A previously completed card payment returns. The existing product label is PAYMENT REVERSED.
- KNOWN FACTS: The reversal undoes the settlement. It does not forgive the original purchases.
- EXPECTED CLASSIFICATION: TYPE REVERSAL linked to the payment. Amount owed goes back up.
- CONFIDENCE / UNCERTAINTY: HIGH when the provider or the user ties it to the payment id. Otherwise NEEDS_RECONCILIATION.
- EXPECTED LEDGER IMPACT: Funding account increases. Card liability increases. Original purchases remain expenses.
- USER REVIEW REQUIREMENT: Required if the link is ambiguous.
- LEARNING EFFECT: No change to purchase rules.
- AUDIT EXPECTATION: Settlement history appends REVERSED. Prior state kept.
- FAILURE CONDITION: Decreasing the card balance because a reversal arrived, or deleting the original purchases.

## 13. 13 Fuel refund

- INPUT: Posted credit $42.80 from Shell against a known fuel purchase.
- KNOWN FACTS: A refund is not earned income.
- EXPECTED CLASSIFICATION: TYPE REFUND linked to the purchase when confirmed. CATEGORY follows the original fuel lines.
- CONFIDENCE / UNCERTAINTY: Link MEDIUM until the user or a provider reference confirms. Sign is deterministic.
- EXPECTED LEDGER IMPACT: The refund reduces the net expense. It does not increase income.
- USER REVIEW REQUIREMENT: Ask which purchase it reverses when several candidates exist.
- LEARNING EFFECT: Does not create an income rule for Shell credits.
- AUDIT EXPECTATION: Refund relationship stored. Original purchase preserved.
- FAILURE CONDITION: Classifying the credit as rideshare income.

## 14. 14 Uncertain merchant name

- INPUT: Posted debit $16.20. Description is an unreadable processor string.
- KNOWN FACTS: Amount and account are known. Merchant and purpose are not.
- EXPECTED CLASSIFICATION: TYPE EXPENSE if the sign is a debit. CATEGORY OTHER. PURPOSE unconfirmed.
- CONFIDENCE / UNCERTAINTY: Amount HIGH. Merchant and purpose LOW.
- EXPECTED LEDGER IMPACT: One expense of 16.20. No invented merchant.
- USER REVIEW REQUIREMENT: Required. Ask what it was. Do not guess an item list.
- LEARNING EFFECT: No rule until the user names a stable merchant.
- AUDIT EXPECTATION: Raw description preserved beside any later normalized name.
- FAILURE CONDITION: Substituting a guessed merchant or a guessed basket of goods.

## 15. 15 Merchant rename

- INPUT: The same provider transaction id returns with a cleaner merchant name. Amount unchanged.
- KNOWN FACTS: Identity is the source id. The name is mutable provider text.
- EXPECTED CLASSIFICATION: Same canonical event. Normalized merchant updates. Purpose unchanged unless a rule key changed.
- CONFIDENCE / UNCERTAINTY: Identity HIGH. A rule that keyed on the old string is reviewed, not silently widened.
- EXPECTED LEDGER IMPACT: No second posting.
- USER REVIEW REQUIREMENT: No review if only the display name changed and an approved rule still matches on the stable merchant id.
- LEARNING EFFECT: If the rule keyed on the raw string, propose a revision. Do not auto-widen it.
- AUDIT EXPECTATION: Prior raw description kept in lineage.
- FAILURE CONDITION: Inserting a second transaction because the name changed.

## 16. 16 Multiple linked accounts

- INPUT: Checking, savings, and a card at two institutions import on the same day.
- KNOWN FACTS: Each account has its own provider account id and its own cursor.
- EXPECTED CLASSIFICATION: Events stay on their account. Transfers are a later match, not an import side effect.
- CONFIDENCE / UNCERTAINTY: Per-account sync status is independent.
- EXPECTED LEDGER IMPACT: No cross-posting.
- USER REVIEW REQUIREMENT: Review only cross-account candidates, not every row.
- LEARNING EFFECT: Rules may be scoped to one account. A checking rule does not fire on the card unless its scope says so.
- AUDIT EXPECTATION: Connection, account, and cursor stored per account.
- FAILURE CONDITION: One failed institution marking the other disconnected.

## 17. 17 Expired institution connection

- INPUT: The provider reports the item needs reauthentication. Last success was three days ago.
- KNOWN FACTS: Balances and transactions after the last success are unverified.
- EXPECTED CLASSIFICATION: No new classifications. Status REAUTHORIZATION_REQUIRED.
- CONFIDENCE / UNCERTAINTY: Existing posted facts stay at their last confidence. New data is absent, not zero.
- EXPECTED LEDGER IMPACT: No balance is zeroed. Last verified balance and as-of time remain visible.
- USER REVIEW REQUIREMENT: The reconnect action is the review. Do not ask classification questions for data that did not arrive.
- LEARNING EFFECT: Rules do not train on the gap.
- AUDIT EXPECTATION: Health event appended. Tokens stay server-side.
- FAILURE CONDITION: Showing the account as syncing, or inventing transactions for the gap.

## 18. 18 Missing transaction history

- INPUT: The provider returns 90 days. The user expected a year. A balance discrepancy remains.
- KNOWN FACTS: Coverage is partial. The gap is a fact.
- EXPECTED CLASSIFICATION: No synthetic history. Status shows the missing window.
- CONFIDENCE / UNCERTAINTY: Imported rows HIGH for their own dates. The unexplained difference is UNKNOWN, not a plug entry.
- EXPECTED LEDGER IMPACT: Last verified balance stays the provider balance. Difference is displayed, not forced to zero.
- USER REVIEW REQUIREMENT: Show the missing window. Do not ask the user to fabricate the missing rows.
- LEARNING EFFECT: No learning from invented rows.
- AUDIT EXPECTATION: Coverage start date stored.
- FAILURE CONDITION: Inserting an adjustment equal to the gap without a user-confirmed manual adjustment.

## 19. 19 Recurring subscription

- INPUT: Three monthly software charges, same merchant, similar amount, same account, posted.
- KNOWN FACTS: The pattern is inferred. The next charge has not happened.
- EXPECTED CLASSIFICATION: Past rows EXPENSE. Recurrence LIKELY until the user confirms CONFIRMED RECURRING. PURPOSE unresolved until answered.
- CONFIDENCE / UNCERTAINTY: Pattern MEDIUM. Future occurrence is not a posted fact.
- EXPECTED LEDGER IMPACT: Only posted charges affect balances and expense totals. The forecast is separate.
- USER REVIEW REQUIREMENT: Ask once to confirm the series and the purpose.
- LEARNING EFFECT: A confirmed series can become a recurring-series rule after approval.
- AUDIT EXPECTATION: Series id on the posted rows only.
- FAILURE CONDITION: Posting next month's charge today, or adding it to Safe to Spend as money already spent.

## 20. 20 Variable utility bill

- INPUT: Monthly utility amounts differ by more than a small tolerance.
- KNOWN FACTS: Cadence can repeat while the amount does not.
- EXPECTED CLASSIFICATION: Past rows EXPENSE. Recurrence LIKELY. Amount of the next bill UNKNOWN.
- CONFIDENCE / UNCERTAINTY: Cadence MEDIUM. Amount LOW.
- EXPECTED LEDGER IMPACT: Posted bills affect totals. The forecast uses a range or 'amount not known', not a fake exact charge.
- USER REVIEW REQUIREMENT: Confirm the series. Do not require the amounts to match.
- LEARNING EFFECT: A series rule must not lock the amount.
- AUDIT EXPECTATION: Observed amounts kept. No averaged 'true' bill written back.
- FAILURE CONDITION: Replacing the posted amounts with an average.

## 21. 21 Payroll deposit

- INPUT: Biweekly deposit from an employer payroll description.
- KNOWN FACTS: It is income. It is not a rideshare payout unless the description or the user says so.
- EXPECTED CLASSIFICATION: TYPE INCOME. PURPOSE PAYROLL. ACTIVITY none. Not business revenue by default.
- CONFIDENCE / UNCERTAINTY: Type HIGH from a credit to a cash account plus a payroll description or user confirmation. Employer identity MEDIUM.
- EXPECTED LEDGER IMPACT: One inflow. Not an expense offset.
- USER REVIEW REQUIREMENT: Ask only if the description is ambiguous between payroll, a transfer, and a refund.
- LEARNING EFFECT: A confirmed payroll series can feed upcoming income after approval. It does not create a rideshare rule.
- AUDIT EXPECTATION: Source id and series suggestion stored.
- FAILURE CONDITION: Labeling it rideshare revenue because the product has a rideshare purpose enum.

## 22. 22 Personal reimbursement

- INPUT: A person pays the user back $40 for a personal expense.
- KNOWN FACTS: It is not wages and not a refund from a merchant unless the user says so.
- EXPECTED CLASSIFICATION: TYPE REIMBURSEMENT. CONTEXT PERSONAL. Not INCOME for earnings totals.
- CONFIDENCE / UNCERTAINTY: LOW until the user confirms. Sign is known.
- EXPECTED LEDGER IMPACT: Cash increases. Personal spending net of reimbursement decreases if linked. Earnings stay unchanged.
- USER REVIEW REQUIREMENT: Required.
- LEARNING EFFECT: No broad 'all credits are reimbursements' rule.
- AUDIT EXPECTATION: Optional link to the original expense.
- FAILURE CONDITION: Counting it as payroll or rideshare income.

## 23. 23 Business reimbursement

- INPUT: A client or platform returns $40 for a business cost the user already recorded.
- KNOWN FACTS: It offsets the cost. It is not new revenue unless the user classifies it as revenue.
- EXPECTED CLASSIFICATION: TYPE REIMBURSEMENT. CONTEXT BUSINESS. TAX UNDETERMINED.
- CONFIDENCE / UNCERTAINTY: LOW until confirmed.
- EXPECTED LEDGER IMPACT: Cash increases. Linked business expense is reduced for reporting. Revenue is not increased by default.
- USER REVIEW REQUIREMENT: Required. Show the candidate expense.
- LEARNING EFFECT: A rule may later match the same payer, only after approval, and only for that payer.
- AUDIT EXPECTATION: Link and confirmation stored.
- FAILURE CONDITION: Booking it as gross receipts.

## 24. 24 Split purchase correction

- INPUT: User changes the $45 / $15 split to $30 / $30.
- KNOWN FACTS: The bank charge remains $60.
- EXPECTED CLASSIFICATION: Lines update only after confirmation. Parent amount stays 60.00.
- CONFIDENCE / UNCERTAINTY: The new split is USER-CONFIRMED. Prior split stays in history.
- EXPECTED LEDGER IMPACT: Balance unchanged by the correction. Reporting follows the new lines.
- USER REVIEW REQUIREMENT: Show the before and after. Require confirmation.
- LEARNING EFFECT: The correction reviews any rule that would reapply the old split. It does not rewrite other historical charges.
- AUDIT EXPECTATION: correction_history style append. Prior lines retained.
- FAILURE CONDITION: Changing the bank amount to 30 or 45.

## 25. 25 User disables learned rule

- INPUT: An approved Shell fuel rule is disabled.
- KNOWN FACTS: Past classifications the user already confirmed stay.
- EXPECTED CLASSIFICATION: Future Shell rows are unconfirmed again. Past rows are not stripped.
- CONFIDENCE / UNCERTAINTY: Future purpose LOW. Past confirmations remain USER-CONFIRMED FACT.
- EXPECTED LEDGER IMPACT: No ledger rewrite.
- USER REVIEW REQUIREMENT: No question about the past. Future uncertain rows return to the queue.
- LEARNING EFFECT: automation_enabled false. Version incremented. Evidence kept.
- AUDIT EXPECTATION: disabled_at set. Applications after that time do not cite the rule as active.
- FAILURE CONDITION: Deleting historical confirmations or auto-reclassifying them to unknown.

## 26. 26 Contradictory confirmations

- INPUT: Three business-fuel confirmations, then one personal convenience correction on a later Shell purchase.
- KNOWN FACTS: The counts disagree. The merchant is not a single purpose.
- EXPECTED CLASSIFICATION: The corrected row becomes PERSONAL. Other rows stay as confirmed. The candidate rule is not auto-enabled.
- CONFIDENCE / UNCERTAINTY: The candidate drops from eligible. The corrected row is HIGH as a user fact.
- EXPECTED LEDGER IMPACT: Only the corrected row's reporting changes, and only because the user edited that row.
- USER REVIEW REQUIREMENT: Rule review is required before any automation.
- LEARNING EFFECT: The contradiction blocks approval. It does not delete the earlier evidence.
- AUDIT EXPECTATION: Both outcomes and the review decision stored.
- FAILURE CONDITION: Continuing to auto-classify every Shell purchase as business fuel.

## 27. 27 Historical bulk correction

- INPUT: User asks to relabel twelve past Shell rows from business fuel to personal.
- KNOWN FACTS: Each row has its own confirmation history.
- EXPECTED CLASSIFICATION: No change until the user sees the twelve rows and confirms.
- CONFIDENCE / UNCERTAINTY: The proposal is not an application.
- EXPECTED LEDGER IMPACT: After confirmation, reporting changes for those rows only. Amounts unchanged.
- USER REVIEW REQUIREMENT: Required. List every row. Explain that this does not edit the bank.
- LEARNING EFFECT: The business-fuel rule is disabled or versioned. It is not silently inverted for the future.
- AUDIT EXPECTATION: One bulk audit id, twelve row revisions, prior classifications kept.
- FAILURE CONDITION: Updating the twelve rows because a new rule was saved.

## 28. 28 Cross-tenant rule isolation

- INPUT: User A approves a Shell business-fuel rule. User B imports Shell.
- KNOWN FACTS: Rules carry owner and tenant. B has no such rule.
- EXPECTED CLASSIFICATION: B's row stays unconfirmed. A's rule is not readable by B.
- CONFIDENCE / UNCERTAINTY: A's HIGH does not transfer.
- EXPECTED LEDGER IMPACT: No effect on B's ledger.
- USER REVIEW REQUIREMENT: B is asked under B's own policy.
- LEARNING EFFECT: B's evidence starts at zero.
- AUDIT EXPECTATION: A test must show B's query cannot return A's rule id.
- FAILURE CONDITION: Any shared cache, prompt, or default rule that copies A's confirmation.

## 29. 29 Provider webhook replay

- INPUT: The same SYNC_UPDATES_AVAILABLE delivery is received twice.
- KNOWN FACTS: The cursor and the provider transaction id are the idempotency keys.
- EXPECTED CLASSIFICATION: One canonical event.
- CONFIDENCE / UNCERTAINTY: Identity HIGH.
- EXPECTED LEDGER IMPACT: One posting.
- USER REVIEW REQUIREMENT: No user review for the replay itself.
- LEARNING EFFECT: No double evidence count.
- AUDIT EXPECTATION: Webhook receipt id stored. Second receipt is a no-op.
- FAILURE CONDITION: A second ledger row or a second confirmation prompt.

## 30. 30 Provider transaction backfill

- INPUT: After reconnect, sync returns older posted rows the workspace already stored, plus two genuinely new rows.
- KNOWN FACTS: Known source ids are already canonical.
- EXPECTED CLASSIFICATION: Known ids update in place if the provider modified them. The two new ids insert once.
- CONFIDENCE / UNCERTAINTY: HIGH on source id.
- EXPECTED LEDGER IMPACT: Only the new rows post. Modified amounts follow the provider update path, with an audit row, and never a second insert.
- USER REVIEW REQUIREMENT: Review only if a modification changes an amount the user has already split or confirmed.
- LEARNING EFFECT: No new evidence from the replayed rows.
- AUDIT EXPECTATION: Cursor advances once. Each id processed once.
- FAILURE CONDITION: Reinserting the backfill as new spending.

## 31. 31 Pending authorization disappears

- INPUT: A fuel authorization is removed and no posted successor arrives.
- KNOWN FACTS: Plaid documents authorization holds that never post.
- EXPECTED CLASSIFICATION: No posted expense. The pending row is voided and linked to the removal.
- CONFIDENCE / UNCERTAINTY: Removal HIGH. There is nothing to classify.
- EXPECTED LEDGER IMPACT: It must not remain in spent totals or in amount owed.
- USER REVIEW REQUIREMENT: No question unless the user had already confirmed a purpose on the pending row. Then explain that the hold was removed.
- LEARNING EFFECT: No rule.
- AUDIT EXPECTATION: Removal id kept. Any premature classification marked void, not deleted.
- FAILURE CONDITION: Leaving the authorization as a final charge.

## 32. 32 Multiple currencies

- INPUT: An imported row is not USD.
- KNOWN FACTS: The product's current ledger amounts are numbers without a second currency field on LedgerEntry.
- EXPECTED CLASSIFICATION: Do not convert silently. Hold the row out of USD totals until a currency policy exists.
- CONFIDENCE / UNCERTAINTY: Amount in source currency HIGH. USD equivalent UNKNOWN.
- EXPECTED LEDGER IMPACT: No USD posting and no invented FX gain.
- USER REVIEW REQUIREMENT: Show the original currency and that it is outside the current book.
- LEARNING EFFECT: No rule.
- AUDIT EXPECTATION: Raw currency stored on the provider record even if the canonical book rejects it.
- FAILURE CONDITION: Adding the foreign amount as if it were dollars.

## 33. 33 Tax-method ambiguity

- INPUT: User confirmed business fuel and has not chosen mileage or actual expenses.
- KNOWN FACTS: Business use and deductibility are different facts.
- EXPECTED CLASSIFICATION: ALLOCATION as confirmed. TAX UNDETERMINED. No deductible flag.
- CONFIDENCE / UNCERTAINTY: Business-use confirmation can be HIGH. Tax treatment stays unknown.
- EXPECTED LEDGER IMPACT: The expense remains in the books either way. No tax journal is created.
- USER REVIEW REQUIREMENT: Do not ask a tax conclusion. A later setting can explain the choice.
- LEARNING EFFECT: The fuel rule must not store a deductible boolean.
- AUDIT EXPECTATION: Tax context version absent is an explicit unknown, not a default yes.
- FAILURE CONDITION: Marking the fuel deductible because it was business.

## 34. 34 Partial business-use allocation

- INPUT: User says 60% of a $50 charge is business.
- KNOWN FACTS: The bank amount is 50. The allocation is a user fact.
- EXPECTED CLASSIFICATION: Lines or percents sum to 50. TAX UNDETERMINED.
- CONFIDENCE / UNCERTAINTY: HIGH after save.
- EXPECTED LEDGER IMPACT: One bank effect of 50. Reports show 30 business and 20 personal.
- USER REVIEW REQUIREMENT: Required when the user chooses a percent that is not 0 or 100.
- LEARNING EFFECT: A later rule may store 60% only if the user approves that exact policy.
- AUDIT EXPECTATION: Percent, amounts, and confirmation stored.
- FAILURE CONDITION: Posting $30 to the bank and dropping $20.

## 35. 35 Account balance discrepancy

- INPUT: Provider available balance differs from the derived book by $63.
- KNOWN FACTS: The provider balance is authoritative for a connected account. The book explains activity. It does not have to be forced equal.
- EXPECTED CLASSIFICATION: No classification change. Coverage status UNRECONCILED_DIFFERENCE.
- CONFIDENCE / UNCERTAINTY: The provider figure HIGH as of its timestamp. The cause LOW.
- EXPECTED LEDGER IMPACT: Do not post a plug. Do not replay imports on top of the provider balance.
- USER REVIEW REQUIREMENT: Show last verified balance, as-of, pending, and the difference.
- LEARNING EFFECT: No rule.
- AUDIT EXPECTATION: Both figures and the delta stored.
- FAILURE CONDITION: Creating an adjustment of $63 to hide the gap.

## 36. 36 Transfer appears on one connected account first

- INPUT: Checking shows an outflow. Savings has not yet shown the inflow.
- KNOWN FACTS: One-sided visibility is a known settlement condition.
- EXPECTED CLASSIFICATION: Outgoing leg INTERNAL TRANSFER. State IN_TRANSIT or NEEDS_RECONCILIATION. Not income and not a final expense.
- CONFIDENCE / UNCERTAINTY: The outflow HIGH. The match LOW until the other leg or the user confirms.
- EXPECTED LEDGER IMPACT: Source reduced or held in transit per the existing state machine. Destination unchanged. Not in either pocket as spend.
- USER REVIEW REQUIREMENT: Show that the other side has not arrived. Do not ask a category question.
- LEARNING EFFECT: No expense rule.
- AUDIT EXPECTATION: One-sided link with a review reason.
- FAILURE CONDITION: Classifying the outflow as spending because the inflow is late.

## 37. 37 User disconnects an institution

- INPUT: User disconnects one bank and asks to keep history.
- KNOWN FACTS: Revocation is a consent event. History retention is a product choice already flagged for founder confirmation.
- EXPECTED CLASSIFICATION: Status DISCONNECTED. Tokens revoked. Existing canonical rows remain until a deletion request.
- CONFIDENCE / UNCERTAINTY: Historical provider facts stay as they were. They are no longer refreshing.
- EXPECTED LEDGER IMPACT: No balance zeroing. No new imports.
- USER REVIEW REQUIREMENT: Confirm disconnect. Separate confirm for deletion.
- LEARNING EFFECT: Rules remain unless the user deletes them. They stop matching accounts that are gone.
- AUDIT EXPECTATION: Revocation time. Provider token destroyed. Audit kept.
- FAILURE CONDITION: Deleting the ledger because the link was removed, or leaving a usable token.

## 38. 38 Incomplete rideshare payout data

- INPUT: A payout card deposit has no fare, tip, bonus, or fee breakdown.
- KNOWN FACTS: Net deposit is the only amount.
- EXPECTED CLASSIFICATION: TYPE INCOME. Gross UNKNOWN. Fees UNKNOWN. Do not manufacture a breakdown.
- CONFIDENCE / UNCERTAINTY: Net HIGH. Components absent.
- EXPECTED LEDGER IMPACT: One inflow for the net. No fee expense is invented.
- USER REVIEW REQUIREMENT: Explain that platform detail is not in the bank record.
- LEARNING EFFECT: A future platform connector may attach detail. It must not replace the bank row.
- AUDIT EXPECTATION: Missing-component flags stored.
- FAILURE CONDITION: Deriving gross by multiplying the deposit by an assumed take rate.

## 39. 39 Classification model outage

- INPUT: Import succeeds. The suggestion service times out.
- KNOWN FACTS: The provider row is already valid.
- EXPECTED CLASSIFICATION: Canonical event is stored. Purpose unconfirmed. No AI label.
- CONFIDENCE / UNCERTAINTY: Provider facts remain HIGH. Suggestions are absent, not low-confidence guesses.
- EXPECTED LEDGER IMPACT: The posting stands. Classification failure does not roll it back.
- USER REVIEW REQUIREMENT: The row waits in review without an invented suggestion.
- LEARNING EFFECT: No evidence is counted.
- AUDIT EXPECTATION: Ingest receipt and a classification job failure are separate records.
- FAILURE CONDITION: Dropping the transaction because classification failed.

## 40. 40 Financial data deletion request

- INPUT: User requests deletion of financial data.
- KNOWN FACTS: Consent and retention must be honored without leaving tokens or another user's rules.
- EXPECTED CLASSIFICATION: Provider items revoked. Canonical financial rows, rules, raw payloads, and receipt metadata for that owner are deleted or retained only under an explicit legal hold the product does not currently have.
- CONFIDENCE / UNCERTAINTY: After deletion there is nothing left to classify.
- EXPECTED LEDGER IMPACT: Balances and transactions for that owner are gone. Other tenants unchanged.
- USER REVIEW REQUIREMENT: The request itself is the confirmation. Show what will be removed.
- LEARNING EFFECT: Rules and evidence are deleted with the owner. They are not folded into a global model.
- AUDIT EXPECTATION: Deletion job id. Token revocation proof. A test that another tenant's row count is unchanged.
- FAILURE CONDITION: A partial delete that leaves access tokens, raw provider payloads, or another user's classifications.

Count: 40 of 40.
