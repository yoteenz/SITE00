/** Regenerates docs/site00/studio-os/design-unified-workspace/ASSET_SLOTS.json from the workspace slot registry. Run: npx vite-node scripts/generate-dws-asset-slots.ts */
import { writeFileSync } from 'node:fs';
import { listDwsSlots } from '../src/site00/components/designUnified/dwsSlots';

const slots = listDwsSlots();
const byKind: Record<string, number> = {};
for (const s of slots) byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
writeFileSync(
  'docs/site00/studio-os/design-unified-workspace/ASSET_SLOTS.json',
  JSON.stringify(
    {
      generated: 0,
      note: 'Derived from src/site00/components/designUnified/dwsSlots.ts (listDwsSlots). Slots render a neutral text-free placeholder until a url is registered in DWS_ART_URLS. ICON3D slots are per FORM; interim live-SVG forms render in DwsStageObject.',
      total: slots.length,
      byKind,
      slots,
    },
    null,
    2,
  ),
);
console.log('slots', slots.length, byKind);
