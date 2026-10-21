# Source authority lock

| Authority document | Source commit | Founder approval | Implementation component | Evidence |
| --- | --- | --- | --- | --- |
| Opus1 visual foundation | `b82ca64e4` | Direction approved; Opus2 supersedes desktop scale | `styles/idnty-founder-workspace.css`, shell tokens | CSS + boards docs on branch |
| Opus2 responsive grid | `81407c694` | Approved for implementation | Breakpoints 768/1024/1920, 52px title | `idnty-founder-workspace.css`, vitest |
| Opus3 referrals | `890fc40b6` | Approved for implementation | `pages/ReferralsPage.tsx`, RO overlay registry | vitest overlay counts |
| Policy lock | `ca708271` | Commission structure decided | `config/referralPolicy.ts`, blocked commission UI | Referrals page disabled CTAs |
| G-01 intake column | Opus2 gap | Resolved | `data/intakeColumn.ts` + API `intake_state` | list API + registry column |
