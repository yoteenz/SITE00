# Deployed revision evidence

**Timestamp:** 2026-10-19T19:32Z UTC

## Backend

```json
"gitCommit": "255576b5d737",
"releaseId": "site00-v272-255576b"
```

Source: `GET https://reliable-creation-staging.up.railway.app/api/health`

## Frontend

```json
"commitSha": "unknown",
"builtAt": "2026-10-19T17:01:31.529Z",
"bundleEntry": "/assets/index.C0JXqPre.js"
```

Source: `GET https://carefree-luck-staging.up.railway.app/release-manifest.json`

## Interpretation

- Backend SHA **matches** required #1661 merge.
- Frontend manifest does not embed git SHA (known gap); **runtime smoke** + post-merge `builtAt` after Sprint A merge time support functional parity.
- Recommend wiring `dist/release-manifest.json` commit from CI/Railway build for future audits.

## Code markers

| Capability | Evidence |
| --- | --- |
| Persistence repair (#1657) | API `persistenceStore: supabase` |
| Phone completion guard (#1661) | Backend SHA `255576b5` |
| System B / phone UI (#1661) | Runtime P02 smoke + `df-check` in review HTML |
