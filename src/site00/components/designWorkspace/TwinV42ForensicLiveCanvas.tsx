import type { TwinV41PixelExtractionBundle } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Types.js';
import type { TwinV4CanonicalViewport } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42Types.js';
import {
  readTwinV42ReconstructionContract,
  type TwinV42LayoutTokens,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42ReconstructionContract.js';
import { TWIN_V4_CSS_NAMESPACE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';
import '../../styles/site00-twin-v42-forensic.css';

type Props = {
  viewport: TwinV4CanonicalViewport;
  pixelBundle: TwinV41PixelExtractionBundle;
  correctionGeneration?: number;
};

const SPEC_ROWS = 12;

function SpecTable({ tokens }: { tokens: TwinV42LayoutTokens }) {
  return (
    <table
      className="site00-twin-v42-spec-table"
      style={{ fontSize: tokens.specTableFontPx, borderCollapse: 'collapse' }}
    >
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: SPEC_ROWS }, (_, i) => (
          <tr key={i} style={{ height: tokens.specTableRowPx }}>
            <td>Field {i + 1}</td>
            <td>{(1.2 + i * 0.08).toFixed(2)}</td>
            <td>mm</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** V4.2R1 forensic-layout LIVE DOM (golden-first proportions; no scene-graph boxes). */
export function TwinV42ForensicLiveCanvas({ viewport, pixelBundle, correctionGeneration }: Props) {
  const contract = readTwinV42ReconstructionContract();
  const gen = correctionGeneration ?? contract.correctionGeneration;
  const tokens = contract.tokens;
  const { width, height } = viewport;
  const headerH = Math.round(height * 0.1);
  const mainH = Math.round(height * 0.66);
  const lowerH = height - headerH - mainH;
  const leftW = Math.round(width * 0.62);

  const paletteSamples = pixelBundle.analysis.colorSampleMap.samples.slice(0, 8);

  return (
    <div
      className={`${TWIN_V4_CSS_NAMESPACE} site00-twin-v42-forensic`}
      data-testid="twin-v4-live-reconstruction"
      data-twin-v4-qa-stable="1"
      data-correction-generation={gen}
      data-layout-version={contract.layoutVersion}
      style={{ width, height, position: 'relative', background: '#f5f5f0', boxSizing: 'border-box' }}
    >
      <header
        data-region="TITLE_HEADER"
        className="site00-twin-v42-forensic__header"
        style={{ height: headerH, fontSize: tokens.headerTitlePx }}
      >
        <div className="site00-twin-v42-forensic__title">NDXBOOK · FORENSIC IMPLEMENTATION BLUEPRINT</div>
        <div className="site00-twin-v42-forensic__subtitle">Authority lock · {pixelBundle.authorityLock.artifactId.slice(0, 16)}</div>
        <div
          className="site00-twin-v42-forensic__rule"
          style={{ height: tokens.headerRulePx, background: '#1e5bb8' }}
        />
      </header>

      <div className="site00-twin-v42-forensic__main" style={{ height: mainH }}>
        <section
          data-region="LEFT_MAIN_BLUEPRINT"
          className="site00-twin-v42-forensic__left"
          style={{
            width: leftW,
            padding: tokens.leftPanelInsetPx,
            boxSizing: 'border-box',
          }}
        >
          <div className="site00-twin-v42-forensic__page-shell">
            {Array.from({ length: 5 }, (_, band) => (
              <div
                key={band}
                className="site00-twin-v42-forensic__band"
                style={{ minHeight: tokens.blueprintBandPx, borderColor: '#1e5bb8' }}
              >
                <span className="site00-twin-v42-forensic__band-label">Section {band + 1}</span>
              </div>
            ))}
          </div>
        </section>
        <section
          data-region="RIGHT_SPEC_TABLE"
          className="site00-twin-v42-forensic__right"
          style={{
            width: width - leftW,
            padding: tokens.specTableColGapPx,
            boxSizing: 'border-box',
          }}
        >
          <SpecTable tokens={tokens} />
        </section>
      </div>

      <footer className="site00-twin-v42-forensic__lower" style={{ height: lowerH }}>
        <div data-region="LOWER_COLOR_PALETTE" className="site00-twin-v42-forensic__palette">
          <span className="site00-twin-v42-forensic__palette-title">Color palette</span>
          <div className="site00-twin-v42-forensic__swatches" style={{ gap: tokens.paletteGapPx }}>
            {paletteSamples.map((s) => (
              <div
                key={s.sampleId}
                className="site00-twin-v42-forensic__swatch"
                style={{
                  width: tokens.paletteSwatchPx,
                  height: tokens.paletteSwatchPx,
                  background: s.hex,
                  borderWidth: tokens.dividerWeightPx,
                }}
                title={s.role}
              />
            ))}
          </div>
        </div>
        <div
          data-region="LOWER_TYPOGRAPHY_KEY"
          className="site00-twin-v42-forensic__typography-key"
          style={{ fontSize: tokens.specTableFontPx }}
        >
          Typography key · IBM Plex Sans · weights 400 / 600
        </div>
        <div
          data-region="LOWER_DIVIDER_SPECS"
          className="site00-twin-v42-forensic__divider-specs"
          style={{ borderTopWidth: tokens.dividerWeightPx }}
        >
          Divider specs · 1px · #1e5bb8
        </div>
        <div
          data-region="LOWER_NOTES_CONTEXT"
          className="site00-twin-v42-forensic__notes"
          style={{ fontSize: tokens.notesLinePx, lineHeight: 1.35 }}
        >
          Notes · Coordinate origin lower-left · forensic reference drives layout tokens · correction gen {gen}
        </div>
      </footer>
    </div>
  );
}
