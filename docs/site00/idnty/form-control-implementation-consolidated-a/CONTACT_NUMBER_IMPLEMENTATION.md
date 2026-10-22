# Contact number implementation

| Item | Value |
| --- | --- |
| Field | `intake.phone` (unchanged key) |
| Label | CONTACT NUMBER * |
| Placeholder | ENTER PHONE NUMBER |
| Helper | USED AS A BACKUP CONTACT FOR URGENT ACCOUNT, DOMAIN, OR EMAIL ISSUES. |
| Missing | ENTER A CONTACT NUMBER TO CONTINUE. |
| Invalid | ENTER A VALID CONTACT NUMBER. |

Draft autosave: allowed without valid phone. P02 CONTINUE and `markComplete` completion require valid phone.

Synthetic test journey supplies `901-555-0199` when advancing intake submitted.
