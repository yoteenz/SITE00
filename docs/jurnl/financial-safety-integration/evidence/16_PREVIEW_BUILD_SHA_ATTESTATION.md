# Preview build SHA attestation

**Dev-only (implemented this sprint):**
- `JurnlRuntimeChrome` sets `document.documentElement.dataset.site00PreviewBuild` from `import.meta.env.VITE_APP_BUILD_ID`.
- `dataset.site00PreviewMode` = `cloud-dev` when `VITE_SITE00_CLOUD_PREVIEW=1`.
- Vite dev middleware emits `X-Site00-Preview-Commit` when `SITE00_PREVIEW_COMMIT_SHA` / `GITHUB_SHA` set (`vite.config.ts`).

**Verification:** On running preview, inspect `<html data-site00-preview-build="...">` or response headers — must match git checkout used to start Vite.
