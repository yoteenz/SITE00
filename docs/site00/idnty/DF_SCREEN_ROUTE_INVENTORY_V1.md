# Digital Foundation screen and route inventory

Client URL: `/foundation/:token` (`FoundationClient`). Views are history state, not separate paths.

| Screen | Reference | React view | Actor | Asset |
| --- | --- | --- | --- | --- |
| P01 Entry | REF-01 | `P01` | Client | DF-G01 hero, implemented |
| P02 Intake | REF-01 | `P02` | Client | DF-G03 corner, implemented |
| P03 Configurator | REF-01 | `P03` | Client | DF-G03 corner, implemented |
| P04 Recommendation | REF-02 | `P04` | Client | DF-G02 crown, implemented |
| P05 Checkout | REF-02 | `P05` | Client | DF-G02 crown, implemented |
| P06 Activation | REF-02 | `P06` | Client | DF-G02 crown, implemented |
| P07 Overview | REF-03 | `OVERVIEW` | Paid client | DF-G02 crown, implemented |
| P08 Roadmap | REF-03 | No client view | — | Not a route |
| P09 Stage detail | REF-03 | No client view | — | Not a route |
| P10 Needs you | REF-04 | No client view | — | Not a route |
| P11 Complete | REF-04 | Complete surface when lifecycle says complete | Client | No dedicated photoreal plate |
| P12 Next threshold | REF-04 | No client view | — | Not a route |
| P13 Pipeline | REF-05 | Founder ops, not this client route | Founder | Not mounted here |
| P14 Project command | REF-05 | Founder ops | Founder | Not mounted here |
| P15 Workbench | REF-05 | Founder ops | Founder | Not mounted here |
| Records / location / runbook | REF-06, REF-07 | Not client views on `/foundation/:token` | Founder or later portal | Not mounted |

P08–P15 were not added as client routes. Founder screens stay behind founder authorization.
