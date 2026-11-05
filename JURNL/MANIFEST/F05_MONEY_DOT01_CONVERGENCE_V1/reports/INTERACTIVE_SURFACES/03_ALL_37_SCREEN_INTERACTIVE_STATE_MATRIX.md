# 03 · All-37-screen interactive-state matrix

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Screen | Interactive controls (deduplicated components) |
|---|---|
| 01 MONEY DOT 01 VIEW ALL ACCOUNTS | chips; cards; actions; dock |
| 02 BANK ACCOUNT | chips; strips |
| 03 RIDESHARE CARD | chips; strips |
| 04 CASH ON HAND | chips; strips |
| 05 CREDIT CARD | chips; strips |
| 06 ALL ACCOUNTS | chips; cards; actions; dock |
| 07 BANK TRANSACTION HISTORY | chips; search; JURNL selects / dates; rows |
| 08 RIDESHARE ACTIVITY | chips; search; JURNL selects / dates; rows |
| 09 CASH USAGE HISTORY | chips; search; JURNL selects / dates; rows |
| 10 CREDIT CARD ACTIVITY | chips; search; JURNL selects / dates; rows |
| 11 TRANSACTION DETAIL | chips; buttons; rows |
| 12 ACCOUNT DETAILS AND SETTINGS | chips; buttons; rows |
| 13 ACCOUNT BALANCE REVIEW | chips; buttons; rows |
| 14 ADD ACCOUNT | chips; JURNL selects / dates; text fields; buttons |
| 15 EDIT ACCOUNT | chips; JURNL selects / dates; text fields; buttons |
| 16 RECORD BANK TRANSACTION | chips; JURNL selects / dates; text fields; buttons |
| 17 ADD CASH | chips; JURNL selects / dates; text fields; buttons |
| 18 RECORD CASH SPENDING | chips; JURNL selects / dates; text fields; buttons |
| 19 RECORD CREDIT CARD PURCHASE | chips; JURNL selects / dates; text fields; buttons |
| 20 RECORD CREDIT CARD PAYMENT | chips; JURNL selects / dates; text fields; buttons |
| 21 ACCOUNT PURPOSE PREFERENCES | chips; JURNL selects / dates; text fields; buttons |
| 22 EMPTY ACCOUNTS | chips; buttons; rows |
| 23 BALANCE ADJUSTMENT REVIEW | chips; JURNL selects / dates; text fields; buttons |
| 24 TRANSACTION CORRECTION / REVERSAL | chips; JURNL selects / dates; text fields; buttons |
| 25 ACCOUNT ARCHIVE CONFIRMATION | chips; buttons; rows |
| 26 CAPTURE RECEIPT | chips; buttons; rows |
| 27 SCANNING RECEIPT | chips; buttons; rows |
| 28 REVIEW EXTRACTED PURCHASE | chips; JURNL selects / dates; text fields; buttons |
| 29 RECEIPT EXCEPTION / DUPLICATE | chips; buttons; rows |
| 30 ACCOUNT SETUP DETAILS | chips; JURNL selects / dates; text fields; buttons |
| 31 TRANSACTION SEARCH AND FILTER | chips; search; JURNL selects / dates; rows |
| 32 REORDER ACCOUNTS | chips; buttons; rows |
| 33 TRANSACTION REVIEW | chips; buttons; rows |
| 34 RECEIPT CAPTURE FAILURE | chips; buttons; rows |
| 35 ACCOUNT NEEDS REVIEW | chips; buttons; rows |
| 36 ARCHIVE BLOCKED | chips; buttons; rows |
| 37 CORRECTION / REVERSAL CONFIRMATION | chips; buttons; rows |

## Unique components and their states (deduplicated)

| Component | Screens | States covered |
|---|---|---|
| Back / search / add chips | all 37 | CLOSED, FOCUS, PRESSED |
| Action strip | 02–05, 11–13, 24, 35 | CLOSED, FOCUS, PRESSED, DISABLED |
| Primary / quiet / danger button | all forms | CLOSED, FOCUS, PRESSED, DISABLED, LOADING (SAVING…) |
| Text field | 14–21, 23, 24, 28, 30 | CLOSED, FOCUS, ERROR (uncertain), EMPTY (placeholder) |
| JURNL_SELECT | 14–21, 23, 24, 28, 30, 31 | CLOSED, OPEN, FOCUS, ACTIVE OPTION, SELECTED, EMPTY, ERROR, DISMISSAL (Escape / outside / Tab) |
| JURNL_DATE_PICKER | 16–20, 23, 24, 28, 31 | CLOSED, OPEN, FOCUS DAY, TODAY, SELECTED, EMPTY / ANY DATE, CLEAR, DISMISSAL |
| Choice chips (purposes, kinds) | 12, 14, 15, 21, 30 | CLOSED, PRESSED / SELECTED, FOCUS |
| Account card | 01, 06, 14, 22, 30 | CLOSED, FOCUS, PRESSED, BADGE (needs review) |
| Reorder row | 32 | CLOSED, DRAGGING, FOCUS, DISABLED (ends) |
| Alert / banner | 13, 16–29, 34–36 | WARN, OK |
| Receipt capture | 26, 27, 34 | CAMERA LIVE, LOADING (engine progress), ERROR, SUCCESS → review |
| Overlay | 14–37 | OPEN (rise), FOCUS TRAP, DISMISSAL (Escape / back chip) |

**Interactive states audited: 52 across 12 unique components.**
