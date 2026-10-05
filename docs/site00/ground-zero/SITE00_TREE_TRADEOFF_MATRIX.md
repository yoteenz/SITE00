# SITE 00 — Tree Tradeoff Matrix

Compares three trees:

- **CURRENT:** the repo as it is today (`SITE00_CURRENT_DISCOVERED_PAGE_TREE.json`).
- **PRIMARY:** Opus's main recommendation, audience-first (`SITE00_OPUS_RECOMMENDED_CANONICAL_PAGE_TREE.json`).
- **ALTERNATIVE:** Opus's strongest alternative, project-first (`SITE00_OPUS_ALTERNATIVE_TREE.json`).

Scores run from 1 (poor) to 5 (strong). They are Opus judgements; the evidence column says what each rests on.

| Criterion | CURRENT | PRIMARY | ALTERNATIVE | Evidence / reasoning |
|---|:-:|:-:|:-:|---|
| User clarity | 1 | 4 | 4 | Current: four client rooms plus two directories. Both proposals give each person one place. |
| Navigation depth | 3 | 4 | 3 | Primary keeps most journeys at 3 levels or fewer. Alternative adds a `/production` segment under every project. |
| Product clarity (vs locked ontology) | 2 | 5 | 4 | Primary maps 1:1 to the locked navs. Alternative mixes both navs under one address. |
| Scalability (more projects) | 1 | 5 | 4 | Current HUB, INBOX, LIBRARY and ACTIVITY resolve to ndxbook. Both proposals scope by slug; the alternative needs a role-lens check on every node. |
| Client experience | 1 | 5 | 4 | Primary gets a dedicated `/app` namespace (PWA install, clean shell). Alternative shares URLs with internal views. |
| Founder experience | 2 | 4 | 5 | Alternative: one link per project, and VIEW AS CLIENT is a toggle. Primary: two links per project. |
| Implementation complexity (to reach target) | — | 3 | 2 | Primary reuses `/app` and `/production`, which are the most-built surfaces. Alternative must re-home `/production` under `/projects` and fold CONTROL's 59 routes in. |
| Maintainability | 1 | 4 | 3 | Alternative has more role-conditional rendering per page. |
| Mobile usability | 2 | 5 | 4 | Primary keeps the mobile client shell separate from dense production chrome. |
| Public-site clarity | 2 | 4 | 4 | Same public proposal apart from the directory (merge vs keep both). |
| Production workspace clarity | 2 | 4 | 4 | Both project-scope every tab. The alternative also brings in operations. |
| Firewall safety (client vs internal) | 1 | 5 | 3 | Primary: separate route trees and guards. Alternative: one URL, and isolation depends on render-time role checks. |
| Future expansion (STUDIO WORLD, more products) | 2 | 4 | 4 | Both reserve STUDIO WORLD. |

## Where the alternative wins

- **One link per project for the founder.** Fewer "which surface am I in" moments.
- **Reuses `/projects/:slug`.** The existing `ProjectOperatingModulePage`, with overview / production / reviews / library tabs, is already a project-first shell.
- **Folding CONTROL into production.** This removes the cross-link bugs between the two internal apps and the duplicate REVIEWS, ACTIVITY and PROJECTS views.

## Where the primary wins

- **Firewall by construction.** Clients never load internal routes or chrome, which matters before an external client (AIO) arrives.
- **Matches the locked navs exactly** and keeps the most-built surfaces (`/app` shell, `/production` frame) where they are.
- **Mobile.** The client app is a quiet, light, single-column room. Production is dense and instrumented. Sharing URLs pushes these toward each other.

## Decisions the matrix cannot make

| ID | Question | Notes |
|---|---|---|
| U1 | Audience-first vs project-first address | The main fork |
| U2 | Merge LOCATIONS into WAITING ROOM vs keep both | Metaphor question |
| U3 | Fold CONTROL into production? | Only one internal user today |

## Conditional recommendation

If the founder expects other internal production users soon, keep the **primary**. Separate internal apps make roles easier.

If the founder stays the only internal user for the foreseeable future and values one-link-per-project above all, the **alternative's ALT-3** (fold CONTROL into production) can be adopted on its own. ALT-3 is independent of ALT-1.
