# SITE 00 Builder — creative direction and page value on the five-tab Blueprint

Sprint `P0.SITE00.BUILDER.OPUS-DYNAMIC-CREATIVE-INTELLIGENCE-EDITORIAL-INTEGRATION-AND-VISUAL-LOCK1` · branch
`claude/bldr-five-tab-editorial-authority-8d42xk` · draft PR · not merged, not deployed.

## Integration: what the history actually was

The sprint expected #1674 (Composer) to be stacked, open, on #1672 (Opus, draft). When this sprint started, both
had already been merged:

| PR | State found | Detail |
|---|---|---|
| #1674 | merged into the Opus branch | squash `44c0c7b44`, tree identical to Composer's head `7e5df340c` |
| #1672 | merged into `main` (`e87366155`) | no longer a draft; `main`'s builder source equals the Opus head |

Nothing was reset, force-pushed or rewritten. To keep both layers auditable on this branch:

1. The branch was fast-forwarded to `main` (`83bd0e5d5`). This was a normal push.
2. Composer's original commit `7e5df340c` was merged with `--no-ff` (`82437cb87`). Its content was already present, so
   the merge changes no files. The only conflict, in `motherboard/MEMORY.md`, was resolved to `main`'s newer text.
3. The presentation work below sits on top. #1672 and #1674 are closed, so it ships as one new draft PR. No other
   builder PR is open, so nothing competes with it.

## STRUCTURE — CREATIVE DIRECTION

The resolver's rows used to be in a collapsed DESIGN DETAILS list, with a second bullet list repeating each label.
They are now a **CREATIVE DIRECTION** section after HOW IT FLOWS, in the tab's own rhythm: a section heading, one
lede line, then hairline rows. Each row has:

- **Dimension:** a muted microlabel.
- **Source:** a microlabel under the dimension. YOUR SELECTION and FROM YOUR BRAND are set in ink, OUR RECOMMENDATION
  in muted grey, and TO BE REFINED in red. No badges.
- **Resolved value:** in bold.
- **Explanation:** one or two short lines.
- **IN DETAIL:** an optional disclosure, shown only when there is something more that is true to say.

On a phone the row stacks. In the wider tab column the dimension and source sit in a left column.

### What changed in the resolver (`designResolution.ts`)

| Before | After |
|---|---|
| One explanation template per dimension ("TYPE HIERARCHY SUPPORTS EDITORIAL WITHOUT REPLACING ITS STRUCTURAL ROLE."), identical for every client | Read from the registry entry of the value that resolved: type voice and use, colour mood plus background/surface/accent roles, what people see plus where the imagery comes from, how motion behaves plus an example, and spacing that paces the structure's own path |
| A custom direction showed motion `QUIET` labelled TO BE REFINED, a filled-in value | Open values stay open (value `null`), shown as SET WITH YOU IN YOUR CUSTOM DIRECTION |
| An established brand showed the system colour (for example WARM MINERAL) labelled FROM YOUR BRAND | Resolves to YOUR BRAND COLOURS. An explicit colour choice still wins and reads YOUR SELECTION |
| INTERACTION CHARACTER repeated MOTION ("QUIET: FADES AND MEASURED SLIDES.") | Reads the structure's navigation ("QUIET INDEX, RETURN-TO-CONTENTS, READ NEXT"), moving with the motion above |

Provenance, the explicit-choice override and pairing conflicts are Composer's and are unchanged. A conflict's
recommendation is now shown on the row it concerns.

### Configurations A / B / C

These are the real builder flow, not presets: ADVANCED (editorial structure) with PAGES + SHOP. Only the feel differs.

| | A — high contrast, expressive (IMMERSIVE) | B — colourful, playful (BOLD) | C — quiet, warm (EDITORIAL) |
|---|---|---|---|
| Structure | EDITORIAL · YOUR SELECTION | EDITORIAL · YOUR SELECTION | EDITORIAL · YOUR SELECTION |
| Typography | EXPRESSIVE DISPLAY + RESTRAINED BODY | CONDENSED DISPLAY | EDITORIAL SERIF |
| Colour | DEEP CINEMATIC — A DARK ROOM WITH ONE LIGHT | SATURATED EDITORIAL — A MAGAZINE THAT SHOUTS | WARM MINERAL — SUN ON SANDSTONE |
| Image world | 3D / SPATIAL · YOUR SELECTION | EDITORIAL COLLAGE | PRODUCT-LED |
| Motion | CINEMATIC · YOUR SELECTION | KINETIC | EDITORIAL |
| Composition | WIDE FRAMES, SEQUENCES, ONE SUBJECT AT A TIME | EDITORIAL STRUCTURE WITH BIG GRAPHIC MOVES | TYPE-LED PAGES WITH ONE PHYSICAL OBJECT AS THE FOCAL POINT |

**What the rooms can and cannot produce.** The spatial builder asks for a feel, never for type, colour, imagery or
brand readiness, and it records brand as IN PROGRESS. So in the live builder:

- Creative rows read OUR RECOMMENDATION, except where the feel itself sets the value (IMMERSIVE sets 3D imagery and
  cinematic motion).
- FROM YOUR BRAND never appears in the browser.

The resolver handles explicit tunables and brand-sourced colour, and both are covered by tests (C, D, K: the legacy
builder samples carry them). Adding inputs for them to the rooms would be a product decision, not a presentation fix,
so this sprint does not add them.

## PAGES — page-specific value

**Summary row:** each page row shows the page name and its one-line purpose. **Opened detail:** the row opens in place
to WHY IT MATTERS, WHAT IS INCLUDED (with the depth), HOW IT CONNECTS and a SCOPE NOTE.

The page engine (`pageValueIntelligence.ts`) now covers every page in the registry (30 pages). Before, about half of
them fell back to "SUPPORTS X WITHIN YOUR SELECTED BUILD" and "MAIN VIEWS PLUS THE SUB-VIEWS AND STATES PEOPLE MEET
ON X".

- **Depth is cumulative:** ESSENTIAL ⊂ FULL ⊂ EXTENSIVE.
- **Feature-gated parts:** a part that needs a feature is listed only when that feature is in the build. Removing the
  feature removes the promise:

| Page | Part | Needs |
|---|---|---|
| SHOP | search and filtering | SEARCH |
| ACCOUNT | order history / bookings / membership / records | SELL / BOOK / MEMBERSHIP / DATA / PORTAL |
| CONTACT | a link into booking | BOOK |
| DASHBOARD | usage and performance insight | MEASURE |
| RECORDS | attachments / documents | UPLOAD FILES / DOCUMENTS |

- **Scope note:** names an expected-but-absent part, for example "NOT IN THIS BUILD: SEARCH AND FILTERING. ASK FOR IT
  AT BLUEPRINT REVIEW IF YOU NEED IT." The rooms cannot add every feature, so the note does not tell the client to
  add one.
- **HOW IT CONNECTS:** names features exactly as the FEATURES tab titles them, and only ones the build has. A test
  checks this.

## Other tabs

- **OVERVIEW / TIMELINE:** unchanged. MAIN EXPERIENCE is the contract's structure, which is the same value the
  STRUCTURE row shows.
- **FEATURES:** one targeted correction. The DATA / PORTAL card said "A PRIVATE AREA WHERE DOCUMENTS … CAN LIVE",
  which promised documents without the DOCUMENTS feature. It now reads "A PRIVATE, SIGNED-IN AREA BUILT AROUND YOUR
  RECORDS AND THE WORK PEOPLE DO ON THEM."
- **Estimation:** estimates are untouched. The new code imports nothing from the estimator, does not mutate the
  selection, and a test checks `estimateProject` output is identical before and after resolving.

## Evidence

See `EVIDENCE.md` in this folder for the capture list, browser audit results and source test mapping.
