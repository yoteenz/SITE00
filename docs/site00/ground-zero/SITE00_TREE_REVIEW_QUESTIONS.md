# SITE 00 — Questions for the Independent Tree Reviewer

Please work from `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md`, Parts A–C (facts and locked constraints), **before** you read Parts D–E (Opus's opinion). Answer in prose, then fill `response_template` in `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.json`.

For every family, page and route/state classification, use exactly one of these verdicts:

- `AGREE_WITH_OPUS`
- `PARTIALLY_AGREE`
- `DISAGREE`
- `ALTERNATIVE_RECOMMENDATION`

The locked constraints are L1–L9 in Part C. Do not re-litigate them unless you find a **structural contradiction**. If you do, name the constraint and the contradiction.

---

1. **What should the canonical SITE 00 page / product tree be?**
   Give families, top-level pages, children and grandchildren. Mark states and interactions explicitly.

2. **Which current top-level pages should remain top-level?**
   Choose from Part A3.

3. **Which should become children?**
   Name the parent for each.

4. **Which should collapse into states or interactions?**
   Consider at least:
   - the six client review sub-routes;
   - `project/:section`;
   - `library/:categoryId`;
   - the CTRL ROOM sections;
   - `/origin/locations`;
   - `/contact`, `/faq`, `/guide` and `/sound`.

5. **What is missing?**
   Consider:
   - invite acceptance;
   - a client "my projects" list;
   - the workspace client-relationship view;
   - a send-to-client action;
   - legal pages;
   - a not-found page;
   - the BLDR EXTENSIONS class.

6. **Which pages are overloaded and should split?**
   For example: `/production` (all projects plus NDXBOOK hub), the INBOX body (6 lenses + 3 detail children + 4 overlays), and `/projects/:slug` (founder + client).

7. **Which families should merge or split?**
   Consider:
   - the four client project surfaces (`/app`, `/client/projects`, `/studio/:slug`, `/projects/:slug`);
   - 00 / CONTROL vs the production workspace;
   - the legacy founder workspace vs EXPRESSION;
   - SYSTEM / GUIDE / SOUND as a family.

8. **What should the public information architecture be?**
   Include the mobile bottom nav, the desktop header and the directory: WAITING ROOM vs LOCATIONS.

9. **What should the client app information architecture be?**
   Work within locked L4: HOME · PROJECT · REVIEWS · INBOX · LIBRARY. Say where project switching, profile, notifications, activity and files live.

10. **What should the production workspace information architecture be?**
    Work within locked L5. Say how project scoping works (URL vs context) and where client relationship, client status and project status live.

11. **Where does the current tree conflict with the locked product ontology?**
    Known examples:
    - BLDR uses ENTERPRISE / NOT SURE where the ontology has SYSTEMS / EXTENSIONS;
    - the client nav has PROJECTS / PROFILE where the ontology has PROJECT / LIBRARY;
    - "ENTER STUDIO" and "BLDR STUDIO" leak STUDIO OS naming to clients.

    Are there others?

12. **Which structural changes are launch-critical** for the first external client (AIO)?

13. **Which structural changes can wait?**

14. **What would you change from Opus's recommendation, and why?**
    Address at least:
    - U1: audience-first vs project-first project address;
    - U2: merging LOCATIONS into WAITING ROOM;
    - U3: whether CONTROL folds into production;
    - any changelog entry you rate DISAGREE.

---

**Also helpful:** your own confidence (HIGH / MEDIUM / LOW) for each major recommendation, and its basis (`repo_evidence`, `user_journey`, `visual_authority`, `locked_ontology`, `technical_constraint` or `inference`). This lets the founder compare your view with Opus's line by line.
