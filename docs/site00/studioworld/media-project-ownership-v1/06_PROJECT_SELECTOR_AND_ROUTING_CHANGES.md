# 06 — Project selector and routing

- **Projects index:** THE EXCHANGE appears when org UUID resolves (founder portfolio).
- **Production header switcher:** `listHostProductionProjects()` uses `listProductionManagedProjects()`.
- **Hub project list:** spine-only projects merged when absent from API index.
- **Primary production entry:** `/production?project=the-exchange` and tab routes `/production/the-exchange/{expression|experience|…}`.
- **Design selector:** THE EXCHANGE intentionally **excluded** (`designEnabled: false`).
