# Server validation contract

**Function:** `completeIntake(artifactId)`

| Condition | Behavior |
| --- | --- |
| `intake_state === 'COMPLETE'` | Return artifact unchanged (legacy records without phone stay complete) |
| Missing/invalid phone | Throw `CONTACT_PHONE_REQUIRED` or `CONTACT_PHONE_INVALID` |
| Valid phone | Existing completion + quote pipeline unchanged |

**Draft saves:** `updateIntake(..., markComplete: false)` does not invoke phone completion gate.

**API:** errors propagate as thrown errors from service layer (existing handler behavior).
