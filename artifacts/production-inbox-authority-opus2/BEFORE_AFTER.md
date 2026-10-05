# Before / after

Pairs are in `<route>/{mobile,tablet,desktop}/before-after.jpg`: the OPUS1 build at `72b2ad5a` on the left, this sprint on the right. Before this sprint, WATCHING, RESOLVED, ALL INBOX, MESSAGES (then DIRECT), the thread and the notice did not exist, so their "before" is the nearest OPUS1 route (root, `?view=direct` or `?view=system`).

| Area | Before (OPUS1) | After (OPUS2) |
|---|---|---|
| Product model | lenses PRIORITY / APPROVALS / DIRECT / SYSTEM, mixing state, type and urgency | lifecycle STATES (NEEDS YOU / WATCHING / RESOLVED) × object TYPES (DECISION / MESSAGE / SYSTEM) |
| Root | hero band + 4 stats + 4 stacked panels; scrolls on every viewport | one focus decision + INCOMING + ATTENTION + RECENTLY RESOLVED; fits one viewport |
| Children | each lens had its own layout | children share root DNA (tabs, stats bar, menus, rows, rails) |
| Grandchildren | one approval detail | decision detail, message thread and system notice detail in one detail grammar (breadcrumb, title + chips, card, tabbed pane, materials, persistent actions) |
| Temporary surfaces | none | request revision, approval confirmation, filter / sort sheet + custom menus, attachment preview (all contained) |
| Page scroll | yes | never (45/45 measured) |
| Visual system | iaKit (shared with Activity) + hero plates | one Inbox material/token set; no hero (the authorities have none) |
