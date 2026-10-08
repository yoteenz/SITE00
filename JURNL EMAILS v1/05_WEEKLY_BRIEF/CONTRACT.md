# A05 — YOUR WEEK IN JURNL

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

**State:** CONTRACT_READY · **founder approval:** NOT_REVIEWED · **delivery:** NOT_WIRED

**Family:** E03 FINANCIAL BRIEF / DIGEST · **message type:** WEEKLY_BRIEF · **lineage:** BRIEFING

A calm weekly brief: what is coming, what moved, and where Safe to Spend stands.

## Trigger contract
| Field | Value |
|---|---|
| EMAIL_ID | A05 |
| FAMILY | E03 FINANCIAL BRIEF / DIGEST |
| PURPOSE | A calm weekly brief: what is coming, what moved, and where Safe to Spend stands. |
| TRIGGER_EVENT | WEEKLY_BRIEF_READY (PROPOSED) |
| ELIGIBILITY | FINANCIAL_BRIEFS on; Setup finished; At least one week since account verified |
| SUPPRESSION_RULES | FINANCIAL_BRIEFS off; No data at all (send A03 instead); Already sent this week |
| COOLDOWN | P7D |
| PERSONALIZATION_INPUTS | firstName, weekOf, safeToSpend, availableThrough, upcomingItems[], movedItems[], insight? (P3) |
| CTA_DESTINATION | today |
| CONSENT_CLASS | LIFECYCLE_SERVICE · preference FINANCIAL_BRIEFS |
| PRIORITY | LOW |
| DUPLICATE_GUARD | A05:{userId}:{isoWeek} |
| DELIVERY_STATE | NOT_WIRED |

Source: Scheduled weekly job over jurnl_user_snapshots (upcoming projection F07, activity F04, Safe to Spend F09).

Needs before it can fire: FINANCIAL_BRIEFS preference stored and on; Scheduler; Server-side derivations of upcoming / moved / Safe to Spend.

## States
| State | When | Differs by |
|---|---|---|
| HEALTHY | Safe to Spend COMPLETE and nothing overdue | Status line: ON TRACK. |
| ATTENTION | An item is overdue or due today, or Safe to Spend fell below the buffer | Status line: ONE THING NEEDS A LOOK. The item leads COMING. |
| INCOMPLETE_DATA | Safe to Spend PARTIAL / NEEDS_ACCOUNT | Snapshot shows the honest incomplete copy; CTA COMPLETE MY PICTURE → setup/accounts |
| QUIET_WEEK | Nothing moved and nothing is coming | Columns replaced by one line: A QUIET WEEK. |

## Copy (DRAFT_FOR_FOUNDER_REVIEW)
| Field | Draft |
|---|---|
| SUBJECT | Your week in JURNL |
| PREHEADER | What is coming, what moved, and where you stand. |
| FROM_NAME | JURNL |
| REPLY_TO_POLICY | Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address. |
| EYEBROW | WEEK OF {weekOf} |
| HEADLINE | YOUR WEEK, IN BRIEF. |
| MESSAGE_BODY | Here is your week at a glance. Everything below comes from your JURNL as of {asOf}. |
| CTA | OPEN MY WEEK → today |
| FALLBACK_TEXT | Your week in JURNL (week of {weekOf}). ⏎  ⏎ Safe to spend: {safeToSpend} ⏎ Coming: {upcomingSummary} ⏎ Moved: {movedSummary} ⏎  ⏎ Open your week: {todayUrl} |

## Composition
- **Artifact:** BRIEFING_SHEET / LEDGER_INSERT / CLIPBOARD_BRIEF
- **Components (reading order):** EC01 HERO CORRESPONDENCE → EC12 STATUS NOTICE → EC03 FINANCIAL SNAPSHOT → EC04 TWO-COLUMN BRIEF → EC14 PERSONALIZED INSIGHT → EC07 SINGLE CTA → EC16 EMAIL FOOTER → EC17 MARKETING PREFERENCES / UNSUBSCRIBE
- **Primary editorial gesture (options):** a clipped briefing sheet with ledger rules, the columns set as live HTML on the paper colour
- **Secondary tactile detail (options):** a brass clip at the head of the sheet
- **Contrast anchor:** serif figures in black ink, olive section labels
- **Environment:** BRIEFING lineage: a narrow desk crop (stone, linen, a pen) at the head only.
- **Avoid:** charts as images; any figure in an image; judgement words
- **Live HTML (never image):** headline, body, firstName, weekOf, safeToSpend, availableThrough, upcomingItems[], movedItems[], insight?, CTA, links, footer, unsubscribe / preferences

## Planned assets (decomposed after the authority is approved; nothing generated)
| Slot | Class | Lineage action | Note |
|---|---|---|---|
| L1 briefing desk crop | EMAIL_ENVIRONMENT | CREATE_NEW | Founds BRIEFING; monthly brief reuses it. |
| L2 briefing sheet head (clip + torn top) | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Body of the sheet is an HTML paper cell. |

Fixture: `FX_WEEKLY_BRIEF` (DEMO ONLY) in `00_SYSTEM/fixtures.json`.
