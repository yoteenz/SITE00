# Repository contract (Wave 0)

**Interface:** `src/projects/jurnl/data/repository/types.ts` (`JurnlRepository`)

**Device adapter:** `src/projects/jurnl/data/repository/deviceRepository.ts` — user-scoped `localStorage` key `jurnl.repository.v1.{userId}`.

**Domains in snapshot:** setup profile, accounts, transactions (ledger).

**Events (boundary):** `RepositoryEventType` — mutations emit typed events for future server sync.

**Not production persistence.** Server adapter (Wave 5) must implement the same interface.
