# Route Map

| Route | Purpose |
|-------|---------|
| `/existing-location` | Service entry |
| `/existing-location/start` | Alias entry |
| `/existing-location/case/:caseId` | Intake |
| `.../access` | Access instructions |
| `.../status` | Case status |
| `.../diagnosis` | Findings (when published) |
| `.../quote` | Scope approval |
| `.../checkout` | Authorization (WAITING_FOR_AUTHORITY visuals) |
| `.../complete` | Entitlement confirmation |

API: `/api/site00/existing-location`, `/api/admin/site00-existing-location`.
