# Residuals / conflicts

## Residual differences (honest, not fixed in this sprint)

1. **Hero art.** There is no dedicated INBOX or ACTIVITY plate. Inbox uses `hubHero` and Activity uses `hubCrystal`. The frames show a red "V" studio scene with figures. New plates are needed; the frames must not be cropped.
2. **People / avatars / DMs.** There is no people, messaging or read-state model. Direct is UNMOUNTED, and the frames' "Messages", "Direct messages" and "Channel activity" panels map to NEEDS YOU, or are absent.
3. **Comments / annotations.** There is no comment service. Activity / Comments is UNMOUNTED, and the detail pages carry a "not connected" hint.
4. **Due dates, reviewers, versions, file metadata.** There is no data. The approval-detail tabs are DETAILS / DEPENDENCIES / STATUS HISTORY instead of REVIEWERS / VERSIONS.
5. **Trend deltas ("+12%").** There are no historic counts, so the stats show live values only.
6. **Sort control.** None exists, so none was added.
7. **Publish.** There is no route, tab or data. It is NOT PRESENT, and `activity/publish/` proof is intentionally absent.
8. **Media resolution.** Approval-detail media uses the existing node asset slots, which are low resolution when shown at full width. Higher-resolution renders come from the asset pipeline, not from this UI.
9. **Activity tablet stats.** They are 4 across, matching Inbox, where the frame shows 2×2.
10. **Live density.** The ndxbook data is sparse (2 attention items, 0 recorded activity, 0 requests). Fuller lists will look closer to the frames once real activity is recorded. No fake rows were added.

## Conflicts

1. The Activity frames repeat the DESIGN mode bar (BRAND…VIEWPORT). This is a generation artifact and was not reproduced.
2. The Activity / Comments frame highlights INBOX in the nav. ACTIVITY stays active.
3. The mobile frame top bar (iOS status bar plus a single title) conflicts with the protected `ph` strip. The strip was kept.
4. The Publish lens appears in the frames but does not exist in the product. It was not invented.
5. An earlier authority test (OPUS2) pins the Activity hero to `hubCrystal`. A first pass used `designAtrium`, which regressed that test. It was reverted to `hubCrystal`, so the delta is 0.

## Founder decisions requested

- Commission dedicated INBOX and ACTIVITY hero plates (desktop, tablet and mobile crops).
- Confirm that the Publish lens should stay absent until a publish pipeline exists.
- Confirm that the mobile `ph` strip stays over the frames' simplified top bar.
