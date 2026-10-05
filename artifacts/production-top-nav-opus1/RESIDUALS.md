# Residuals / conflicts

## Residual differences
1. **Reticle art.** The authority's attention glyph has a partial red progress arc. The live `Reticle` SVG is a red dashed ring with crosshair ticks. The glyph is unchanged, because the brief limits this sprint to geometry and type and the arc would need to encode a progress value that has no source.
2. **Project thumbnail.** The authority shows a red pyramid. The live slot `project.ndxbook.cover` shows the actor portrait. The image source is unchanged, as the brief requires.
3. **Phone type scale.** The phone header still lives in the approved 864-unit strip that is zoomed by width/864. Text is therefore physically small at 360px (title about 13px, ITEMS NEED YOU about 5px), in proportion to the authority frame. Making it larger means leaving the zoomed strip, which earlier sprints approved and tests guard. That needs a founder decision.
4. **Count.** The authority reads 03 and live ndxbook reads 02. The live attention count is used.
5. **Design section pages** (`/design/references|assets|pages|skins|history|more`):
   - They mount the shared header through the fixed Design overlay.
   - Their bodies render blank in this sandbox both before and after the change, because the route gate needs a live session and the sandbox blocks Supabase. So whether the slightly taller header (phone 120 vs 75 units, tablet/desktop +6/+10px) covers their top content **was not verified on device**.
6. **Longer project names.** Any slug longer than NDXBOOK widens the PROJECT group; it never crops. A long enough name at the 864-unit phone minimum would push the strip wider than the phone; the exact limit was not measured. No such project exists today. If one is added, a deliberate fallback (smaller name size) is needed.

## Conflicts
1. **Fifth phone group.** The phone CURRENT WORKSPACE / CURRENT QUEUE selector existed (HUB.RECONSTRUCTION memory notes it was kept), but the authority shows four groups. It was removed: it duplicated the project link's destination (`/production`), and its text is kept as the title tooltip.
2. **Old test.** `productionHubReconstructionOpus1.test.ts` asserted the phone TOP height through the `.pxa`-scoped selector. The selector moved to the shared token; the 120-unit value and the no-scaling intent are kept and asserted.
3. **Headers not converged.** Character Fabrication and the legacy hub machine keep their own headers (see the audit) and do not adopt the shared one.
