# 06 · Correspondence (D-11 · TP-08 · TL-08)

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


- Views MESSAGES / LIFECYCLE EMAIL; actions TEMPLATES · STUDIO and COMMUNICATIONS COMMAND (routes preserved).
- MESSAGES: thread index (search, last lifecycle intent chip) | portal thread (`msg` bubbles from `messages(id)`) with the
  composer opening OL-14 | context (stage, next, last email, recipient, policy banner, SEND GATE → OL-15). The messages
  endpoint marks threads read, so it is only called when the thread is on screen (≥ 1000 px or opened).
- The old native client `<select>` is replaced by the thread index.
- LIFECYCLE EMAIL: `lc-table` from `emailTimeline()`; `DRY_RUN` reads DRY RUN (policy), `QUEUED` reads QUEUED · NOT SENT,
  `ACCEPTED` reads ACCEPTED BY PROVIDER (unverified) — only `DELIVERED` reads delivered. No sent history is invented.
- Staging transactional email is not enabled; no client message was sent during this sprint (the capture harness
  refuses every POST).
- esbuild fix preserved (`scripts/vite-site00-local-api.mjs` unchanged).

Evidence: `evidence/matrix/correspondence-14-viewports.jpg`, `evidence/compare/correspondence-*.jpg`.

CORRESPONDENCE: COMPLETE
