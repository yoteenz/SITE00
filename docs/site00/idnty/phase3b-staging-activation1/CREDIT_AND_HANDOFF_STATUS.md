# Foundation credit & builder handoff

## Credit (Phase 1 policy)

- **$200** / **30 days** — verify in `shared/site00-digital-foundation` credit rules (do not invent amounts)  
- Issuance on completion — unit tested  
- **Redemption** at builder checkout — **NOT_TESTED** end-to-end (builder commerce separate product)

## Handoff (board 12)

- `captureBuildInterest` / `createBuilderHandoff` — Phase 1 contract  
- Persistent handoff record expected when client opts in  
- **Gate S:** PASS (logic); live NOT_TESTED

## Gates R / S

| Gate | Status |
| --- | --- |
| R — credit issuance | PASS (unit); live NOT_TESTED |
| S — builder handoff | PARTIAL |
