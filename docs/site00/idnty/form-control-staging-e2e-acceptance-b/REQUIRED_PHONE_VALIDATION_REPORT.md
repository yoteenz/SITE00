# Required phone validation report

## Client (integration code)

| Requirement | Status |
| --- | --- |
| CONTACT NUMBER * label | PASS Phase 1/2 tests |
| Approved helper / placeholder | PASS |
| Missing / invalid messages | PASS consolidated A tests |
| International (`+44…`) | PASS `validateContactPhoneForCompletion` |
| Draft save without phone | PASS model validation timing (continue boundary) |

## Server

| Requirement | Status |
| --- | --- |
| `completeIntake` guard | PASS on integration **code** |
| Legacy COMPLETE grandfather | PASS consolidated A test |
| **Live staging API @ 1152f25f** | **NOT DEPLOYED** — guard not live on staging |

## Post-deploy API test

After redeploy, attempt completion without phone via token-scoped API → expect `CONTACT_PHONE_REQUIRED`.
