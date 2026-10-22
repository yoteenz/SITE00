# Release gate matrix (A–X)

| Gate | Name | Status |
| --- | --- | --- |
| A | SPA + API health | **PASS** |
| B | DB connection | **PASS** (staging project + API flag) |
| C | Intake durable persistence | **PARTIAL** (schema+flag; live journey NOT_TESTED) |
| D | Client access + RLS | **PARTIAL** (RLS audit PASS; token journey NOT_TESTED) |
| E | Quote + acceptance | **PASS** (unit); live NOT_TESTED |
| F | Stripe test checkout | **NOT_TESTED** |
| G | Signed payment webhook | **NOT_TESTED** |
| H | Paid activation | **PARTIAL** |
| I | Email to authorized tester | **BLOCKED** (send off) |
| J | Email order + dedupe | **PARTIAL** |
| K | Four-tab portal | **PARTIAL** |
| L | Founder operations | **PARTIAL** |
| M | Runbook dependencies | **PARTIAL** |
| N | Verification vs simulation | **PARTIAL** |
| O | Records + downloads | **PARTIAL** |
| P | Foundation completion | **PARTIAL** |
| Q | Completed portal reopen | **PARTIAL** |
| R | Credit issuance | **PARTIAL** |
| S | Builder handoff | **PARTIAL** |
| T | Cross-client authorization | **PARTIAL** (unit); live NOT_TESTED |
| U | Regression tests | **PASS** (202/205 DF tests) |
| V | Complete founder staging journey | **FAIL** (not executed) |
| W | Founder visual review | **NOT_TESTED** (founder) |
| X | Founder release approval | **NOT_TESTED** (founder) |

Classification: **FAIL** only where the full journey was required and not run; **BLOCKED** where env explicitly prevents progress.
