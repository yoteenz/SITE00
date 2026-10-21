# Global overlay implementation matrix

| ID | Title | Component | Trigger | Live actions | Status |
| --- | --- | --- | --- | --- | --- |
| OL-01 | Create foundation | `CreateClientOverlay.tsx` | Shell Create / bottom Create | `create-artifact` | COMPLETE |
| OL-02 | Link ready | `WorkspaceOverlayBody` | After OL-01 success | Copy link | COMPLETE |
| OL-03 | Workspace menu | `WorkspaceOverlayBody` | Shell Menu | Navigate | COMPLETE |
| OL-04 | Search | `WorkspaceOverlayBody` | Shell Search · ⌘K | List filter | COMPLETE |
| OL-05 | Notifications | `WorkspaceOverlayBody` | Shell Alerts | Pipeline-derived | PARTIAL (derived only) |
| OL-06 | Row actions | `WorkspaceOverlayBody` | Foundations inspector | Copy link · open record | COMPLETE |
| OL-07 | Filter / sort | `WorkspaceOverlayBody` | Foundations Filter | Client-side (toolbar) | PARTIAL |
| OL-08 | Approve quote | `WorkspaceOverlayBody` | Client record | `quote-commercial-ready` | COMPLETE (when artifact valid) |
| OL-09 | Manual adjustment | `WorkspaceOverlayBody` | Client record | `manual-adjustment` | COMPLETE |
| OL-10 | Mark complete | `WorkspaceOverlayBody` | Client record | `mark-complete` | COMPLETE |
| OL-11 | Request changes | `WorkspaceOverlayBody` | Reviews | `approval-resolve` | PARTIAL (needs approval_id) |
| OL-12 | Task detail | `WorkspaceOverlayBody` | Operations | `start-task` | COMPLETE |
| OL-13 | Set blocker | `WorkspaceOverlayBody` | Operations | `set-blocker` | COMPLETE |
| OL-14 | Compose message | `WorkspaceOverlayBody` | Correspondence | `send-message` | COMPLETE |
| OL-15 | Send gated | `WorkspaceOverlayBody` | Correspondence | Blocked by policy | BLOCKED BY POLICY |
| OL-16 | System module | `WorkspaceOverlayBody` | System modules | Readiness snapshot | COMPLETE (read-only) |
| OL-17 | Reset test data | `WorkspaceOverlayBody` | System | `reset-test-data` | COMPLETE |
| OL-18 | Account | `WorkspaceOverlayBody` | Shell account | Sign out link | COMPLETE |
| OL-19 | Client preview | `WorkspaceOverlayBody` | Registry dbl-click | Navigate | COMPLETE |
| OL-20 | Error detail | `WorkspaceOverlayBody` | Global (programmatic) | Display | COMPLETE |

Host: `overlay/OverlayHost.tsx` · geometry · ESC · dirty confirm · scroll lock.
