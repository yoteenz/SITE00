# Accessibility verification — Phase 1

| Check | Status | Notes |
| --- | --- | --- |
| Required fields visual `*` | Implemented | Asterisk is `aria-hidden`; `aria-required` set on P02 required inputs |
| Optional distinction | Implemented | `OPTIONAL` sublabel on meaningful optional fields |
| `aria-describedby` for errors | Implemented | `DfField` merges hint/error ids onto child input |
| `aria-invalid` | Preserved | Existing P02 validation wiring unchanged |
| Error announcement | Improved | Field errors use `role="alert"` |
| Focus visible | Implemented | Solid 2px red outline on `.df-input:focus-visible` and global DF `:focus-visible` |
| VoiceOver walkthrough | **Not run** | Scheduled Phase 4 per authority |

Keyboard: no navigation behavior changed; progression CTAs unchanged.
