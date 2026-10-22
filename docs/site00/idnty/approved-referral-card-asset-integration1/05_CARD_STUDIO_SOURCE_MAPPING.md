# 05 — Card studio source mapping

| Surface | Component | Behavior |
| --- | --- | --- |
| Large preview | `ReferralsPage` → `FounderCard` | Same canonical JPEG |
| Thumbnails | `ReferralsPage` tpl radiogroup → `FounderCard` width 220 | Same JPEG |
| Front/back toggle | `WsSegCtl` + thumbnail buttons | Unchanged |
| Partner | AIO legal name → `approvedReferralCardAssets()` | Maps to AIO JPEG pair |
| Other partners | `FounderCard` CSS reconstruction | No AIO artwork inheritance |

Config: `src/site00/admin/founder-workspace/config/referralCardAssets.ts`  
Render: `src/site00/admin/founder-workspace/referrals/rfKit.tsx` (`rcard--approved-art`, `rcard__art`)  
Styles: `styles/ifw-referrals.css` — `object-fit: contain`, no crop.
