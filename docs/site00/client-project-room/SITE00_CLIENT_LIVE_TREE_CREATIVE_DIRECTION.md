# SITE 00 — Live Review & Working Tree: Creative Direction

**Follow-up:** P0.SITE00.CLIENT-PROJECT-ROOM-LIVE-VIEWPORT-WORKING-TREE-REVIEW1
**Status:** PROPOSED_BY_OPUS. Planning only; nothing here has been built.

Models referenced:

- `SITE00_CLIENT_LIVE_REVIEW_MODEL.json`
- `SITE00_CLIENT_VIEWPORT_MODEL.json`
- `SITE00_CLIENT_WORKING_TREE_MODEL.json`
- `SITE00_PROJECT_GRAPH_SCHEMA.json`
- `SITE00_CLIENT_TREE_FILTER_RULES.json`
- `SITE00_FINAL_PROJECT_REVIEW_MODEL.json`

---

## Where it lives (no sixth tab)

| Tab or place | What it holds |
|---|---|
| **PROJECT** | The journey plus the **WORKING TREE**. The tree sits at `/app/:slug/project/tree` as a full-screen place you can deep-link to. |
| **REVIEWS** | Each family review gets a **DESIGN \| LIVE** switch. LIVE becomes the main view once the family is built. |
| **LIVE viewer** | A full-screen client viewport at `/app/:slug/live/:nodeId`, reachable from the tree, a review or a notification. |
| **FINAL REVIEW** | A review of kind FINAL with three segments: **SITE · TREE · SUMMARY**. |

## The live viewport should feel like walking into the finished room

The client opens their actual product, not a picture of it. The host recedes to a single quiet strip. On the left is the device choice: **MOBILE · TABLET · DESKTOP**. On the right are **RESTART · SCENARIO · VIEW IN TREE · BACK TO REVIEW**.

Everything an engineer would want is absent: grid, bounds, safe-area overlays, zoom percentages, state selectors and diff tools.

- **On a phone:** MOBILE fills the screen, so the client simply uses their product.
- **On larger viewports:** TABLET and DESKTOP appear as scaled previews on an off-white stage, labelled *SCALED PREVIEW*, with one tap to open them full size.

**DESIGN | LIVE** is a calm two-word switch with one line of explanation:

> DESIGN SHOWS THE APPROVED TARGET. LIVE IS THE WORKING PRODUCT BUILT FROM IT.

The client never sees an overlay or a percentage match.

The ♥ APPROVE and × NEEDS REVISION controls behave exactly as defined in the family review model. They stay docked under the viewport, labelled and large.

## The working tree should feel like an architect's plan of their location

The tree should look like a living blueprint drawn in SITE 00's own hand. It must not look like a Miro board, a flowchart or a developer node graph.

**Ground and lines**
- The ground is off-white, with a faint survey grid.
- Families are plotted as grouped *plots*: hairline-bordered areas with the family name set in uppercase.
- Screens are small labelled *rooms* inside each plot.
- Connections are architectural lines:
  - a **solid** line means *you can go here*;
  - a **dashed** line means *this depends on / unlocks*.
- Lines are never curved spaghetti. They route orthogonally, like corridors.

**Status**
- Status is written in words on each family plot, with a small mark.
- **Red** is reserved for the one thing that needs the client: READY FOR YOU, and the current node they are standing on.
- APPROVED plots are drawn solid ink. UPCOMING plots are drawn in pale outline, like a planned extension on a drawing.
- The plan visibly *fills in* as the project advances. It is the same drawing from the first day to the last.

**Two kinds of product shape**
- **Spine:** linear onboarding, read left to right on desktop and top to bottom on a phone. For example, ENTRY → SETUP → TODAY.
- **Ring:** non-linear families arranged around the hub they belong to. For example, TODAY with ACTIVITY, MONEY, PLAN and others around it.
- The ring is never flattened into a line.

## Mobile tree: one family at a time

The phone version is not the desktop drawing shrunk down.

- **The spine** is a vertical list of stations.
- **The current station** is expanded, showing its parent, material children and key interactions.
- **Other families** are collapsed to a single line with their status.
- **At the bottom** sit **PREVIOUS** and **NEXT** connection chips, plus the hub's ring as a short list.

Tapping a node opens a sheet that answers, in product words:

- what this does;
- where it comes from;
- where it goes;
- what action connects them;
- whether it is live (**VIEW LIVE**).

## Tablet and desktop tree: the whole plan

On tablet and desktop the complete plan is visible:

- the spine across the page;
- rings around their hubs;
- cross-family corridors.

Selecting an edge explains it in one sentence, for example:

> TAP START SETUP — TAKES YOU FROM ENTRY INTO SETUP · LIVE

There are no editor controls of any kind. The client views, understands, navigates and reviews; they never draw.

## Cost and approvals on the tree

- **Cost:** a family plot may carry one small line, ESTIMATED $22–$40, ACTUAL $27, or FUNDING NEEDED. The detail stays in PROJECT.
- **Approval history:** versions and revisions sit behind **HISTORY**. They never crowd the drawing.

## Final review: SITE · TREE · SUMMARY

The final review is a single calm screen with three segments:

- **SITE** is the live product, end to end.
- **TREE** is the complete plan, with every plot in ink.
- **SUMMARY** reads like the colophon of a book:
  - scope;
  - approvals;
  - completion;
  - deliverables;
  - final costs;
  - deferred items.

Final approval is the one place with a deliberate confirmation. The client confirms they explored the live product and the structure. They are never asked to re-approve each family.

Afterwards, the tree stays in the archive as the human-readable map of what was built. That map becomes the starting drawing for any EVOLVE work.

## Trust rules carried over

- The client tree is a filtered view of the same project graph the founder uses. It is never a second drawing kept by hand.
- Live review runs on safe demo data, isolated from the host and from other clients.
- There is no product jargon: no routes, state machines, databases, React or APIs.
