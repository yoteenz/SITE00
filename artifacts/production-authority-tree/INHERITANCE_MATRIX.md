# INHERITANCE MATRIX

Documents **parent → child** visual/system inheritance for Production. Applies to all tabs unless row notes a **SPECIALIZATION_ALLOWED** exception.

## Global shell (parent: PRODUCTION)

| Dimension | MUST inherit |
|-----------|----------------|
| Shell geometry | Full-viewport `.pxa` portal; locked body scroll |
| Top bar / project context | Project thumb + title band (ph or pxh) |
| Bottom nav | Seven global tabs; active state grammar |
| Typography hierarchy | Saira Semi Condensed (authority); CF exception |
| Spacing rhythm | `pxa-body` gutters and section stacks |
| Border system | Glass card borders, red pipe section headers |
| Radius system | Authority pill / card radii (Opus2 tokens) |
| Background / material | Crystal / stage / world plates + glass panels |
| Color hierarchy | Red accent pipes; muted label small caps |
| Icon system | Glyph strokes consistent with hub primitives |
| Navigation grammar | Bottom nav for global; sub-bars for design modes / capsules |
| Density | Editorial production density — not compact SaaS tables |
| Panel behavior | Scroll in `pxa-scroll`; sub-bars fixed |
| Content alignment | Centered max-width bands on descendants (1180–1320 where applied) |
| Responsive philosophy | Distinct host families (ph vs pxh), not scaled desktop-only app |
| Motion / animation | Minimal; bar progress widths |
| Overlay treatment | Glass overlays; legacy hub machine exempt |
| Modal / drawer | Prefer inline panels; CF popovers use CF spec |
| Interaction feedback | Button variants `pxa-btn`, chips `PwChip` |
| Selection treatment | `is-active` on tabs/capsules/entries |
| Focus treatment | Link focus visible on nav capsules |

## Tab-specific parent → child

### HUB → hub-machine

| MUST inherit | Notes |
|--------------|-------|
| — | **SPECIALIZATION_FORBIDDEN** for remapping machine to `.pxa` in this phase |

**SPECIALIZATION_ALLOWED:** Machine keeps 864-space `ProductionHub` inspector grammar (**LEGACY_LOCKED**).

**SPECIALIZATION_FORBIDDEN:** Replacing machine with generic dashboard; hiding legacy without founder route decision.

### HUB → Expression links (cross-tab)

**MUST inherit:** Hub entry card visual language matches Expression entry active state.

### DESIGN root → design-child-*

**MUST inherit:** Mode bar remains reachable from overlay routes; production-provisional token remap on twin-opus.

**SPECIALIZATION_ALLOWED:** Workspace bench tool density, dark preview wells for assets.

**SPECIALIZATION_FORBIDDEN:** White-on-white rails; lime NME literals; unscoped generic Bootstrap-like forms.

### DESIGN → viewport

**SPECIALIZATION_ALLOWED:** Device frame geometry, iframe live client, zoom controls.

### EXPERIENCE root → experience-child-*

**MUST inherit:** World plate crop, capsule nav, glass head, empty state copy pattern.

**SPECIALIZATION_FORBIDDEN:** Generic “coming soon” SaaS illustration; unrelated icon set.

### EXPRESSION root → expression-child-*

**MUST inherit:** Stage atmosphere band, red pipe heads, `pw--authority` descendant layer.

**SPECIALIZATION_ALLOWED:** Character Fabrication Fab Condensed + step wizard (**AUTHORITY_CONFLICT** — intentional).

**SPECIALIZATION_FORBIDDEN:** Routing engine buttons to look like primary Production descendants (they exit to legacy engine).

### LIBRARY root → collection panel

**MUST inherit:** Canon vault typography; live thumb when asset exists.

### INBOX → request rows

**MUST inherit:** Inbox plate thumbnails; request title catalog copy.

### ACTIVITY → log rows

**MUST inherit:** Filter chip styling from activity hero section.

## Reconstruction rule (Opus)

Fix **shell and root authority** before **children**, then **interaction-only** states, then **responsive variants**, then end-to-end proof per tab (see [RECONSTRUCTION_ORDER.md](./RECONSTRUCTION_ORDER.md)).
