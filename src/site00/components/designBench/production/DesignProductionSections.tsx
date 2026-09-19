/**
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — durable DESIGN child sections rebuilt
 * on the shared overlay grammar.
 *
 * REFERENCES, ASSETS and SKINS are libraries of visual things and are now
 * shown as such. HISTORY previously rendered a hard-coded list of NDXBOOK
 * events; it now reads the real authority and asset records and shows an
 * explicit empty state when a page has no history yet, because a fabricated
 * timeline is worse than a blank one.
 */

import { Link } from 'react-router-dom';

import { listCanonicalReferences } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import { loadPageAuthorityWorkflow } from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { listPageAssetHistory } from '../../../../../shared/site00-design-workspace-production/designPageActiveAssetManifest.js';
import { TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH } from '../opusDirect/twinOpusDirectContent';
import { TWIN_OPUS_DIRECT_ASSET_MANIFEST } from '../opusDirect/twinOpusDirectAssetManifest';
import { DesignProductionChildShell } from './DesignProductionChildShell';
import { useTwinOpusDirectProduction } from '../opusDirect/useTwinOpusDirectProduction';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';
import { readDesignPageTarget } from './designProductionPageTarget';
import { site00ProjectProductAssetsPath } from '../../../config/routes';
import {
  OverlayBody,
  OverlayMeta,
  OverlayPreview,
  OverlayRows,
  OverlaySection,
  OverlayStatus,
  OverlayThumbs,
  OverlayTimeline,
} from './designOverlayKit';

export function DesignProductionSectionReferences() {
  const { projectSlug } = useDesignProductionNavigation();
  const refs = listCanonicalReferences(projectSlug);

  return (
    <DesignProductionChildShell title="REFERENCES" subtitle="Approved golden, authorities, and visual sources.">
      <OverlayBody>
        <OverlayPreview
          src={TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH}
          caption="APPROVED GOLDEN · MOBILE"
          side={<OverlayStatus label="APPROVED" />}
        />
        <OverlaySection title="CANONICAL REFERENCES" meta={`${refs.length}`}>
          <div data-testid="design-references-golden" hidden />
          <OverlayThumbs
            wide
            items={refs.slice(0, 18).map((ref) => ({
              id: ref.referenceId,
              src: ref.storagePath ? `/${ref.storagePath.replace(/^public\//, '')}` : null,
              label: ref.screenId.replace(/_/g, ' '),
              sub: `${ref.viewportClass.toUpperCase()} · ${ref.status.replace(/_/g, ' ')}`,
            }))}
            emptyLabel="NO REFERENCES YET"
            emptyHint="Approved references for this project appear here."
          />
        </OverlaySection>
      </OverlayBody>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionAssets() {
  const { projectSlug } = useDesignProductionNavigation();
  const manifest = TWIN_OPUS_DIRECT_ASSET_MANIFEST;

  return (
    <DesignProductionChildShell
      title="ASSETS"
      subtitle="Approved Grok manifest slots — read-only; authority is not mutated here."
    >
      <OverlayBody>
        <OverlaySection title="MANIFEST SLOTS" meta={`${manifest.length}`}>
          <div data-testid="design-assets-list" hidden />
          <OverlayThumbs
            items={manifest.map((entry) => ({
              id: entry.slot,
              src: entry.src,
              label: entry.slot,
              sub: entry.role,
            }))}
            emptyLabel="NO MANIFEST SLOTS"
          />
        </OverlaySection>
        <OverlayRows
          rows={[
            {
              id: 'vault',
              name: 'PROJECT PRODUCT ASSETS',
              sub: 'Full asset vault for this project',
              side: (
                <Link to={site00ProjectProductAssetsPath(projectSlug)} className="tod-ok-btn">
                  OPEN
                </Link>
              ),
            },
          ]}
        />
      </OverlayBody>
    </DesignProductionChildShell>
  );
}

const SKIN_PALETTE = [
  { token: 'INK', value: '#050505' },
  { token: 'PAPER', value: '#f4f4f4' },
  { token: 'SIGNAL', value: '#d8ff3e' },
];

export function DesignProductionSectionSkins() {
  return (
    <DesignProductionChildShell title="SKINS" subtitle="Current NDXBOOK design expression — not a generic theme builder.">
      <OverlayBody>
        <OverlaySection title="PALETTE" flat>
          <div className="tod-ok-chips">
            {SKIN_PALETTE.map((swatch) => (
              <span key={swatch.token} className="tod-ok-file">
                <span className="tod-ok-file__thumb" style={{ background: swatch.value }} />
                {swatch.token} · {swatch.value}
              </span>
            ))}
          </div>
        </OverlaySection>
        <OverlaySection title="EXPRESSION" flat>
          <OverlayMeta
            entries={[
              { k: 'PROJECT SKIN', v: 'NDXBOOK EDITORIAL TECHNICAL' },
              { k: 'TYPOGRAPHY', v: 'Condensed display · mono UI · hierarchical rules' },
              { k: 'MATERIAL', v: 'Archival plate · paper grain · ink silhouette' },
              { k: 'DENSITY', v: 'Reference viewport 768×1376 · full-bleed shell' },
              { k: 'PANEL GRAMMAR', v: 'Band / pipe / dock · Canonical + List parity' },
              { k: 'STATUS', v: <OverlayStatus label="APPROVED" /> },
            ]}
          />
        </OverlaySection>
      </OverlayBody>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionHistory() {
  const { projectSlug } = useDesignProductionNavigation();
  const pageId = readDesignPageTarget(projectSlug)?.pageId ?? `${projectSlug}:overview`;
  const workflow = loadPageAuthorityWorkflow(projectSlug, pageId);
  const assetEvents = listPageAssetHistory(projectSlug, pageId);

  const entries = [
    ...workflow.history.map((event) => ({
      id: `wf-${event.type}-${event.at}`,
      at: event.at,
      what: event.type.replace(/_/g, ' '),
      who: event.summary,
    })),
    ...assetEvents.map((event) => ({
      id: event.id,
      at: event.timestamp,
      what: event.type.replace(/_/g, ' ').toUpperCase(),
      who: event.detail,
    })),
  ].sort((left, right) => right.at.localeCompare(left.at));

  return (
    <DesignProductionChildShell title="HISTORY" subtitle="Durable design workspace events for the active page.">
      <OverlayBody>
        <OverlaySection title="EVENTS" meta={`${entries.length}`}>
          <div data-testid="design-history-list" hidden />
          <OverlayTimeline
            entries={entries.map((entry, index) => ({
              id: entry.id,
              when: entry.at.slice(0, 16).replace('T', ' '),
              what: entry.what,
              who: entry.who,
              current: index === 0,
            }))}
          />
        </OverlaySection>
      </OverlayBody>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionMore() {
  const { goReferenceTwin, projectSlug, goWorkspace } = useDesignProductionNavigation();
  const production = useTwinOpusDirectProduction(projectSlug);

  return (
    <DesignProductionChildShell title="MORE" subtitle="Secondary DESIGN utilities — not duplicated in top nav.">
      <OverlayBody>
        <OverlayRows
          rows={[
            {
              id: 'creative-context',
              name: 'PROJECT CREATIVE CONTEXT',
              sub: 'Brand, expression and page registry',
              side: (
                <button
                  type="button"
                  className="tod-ok-btn"
                  onClick={() => {
                    production.actions.openCreativeContext();
                    goWorkspace();
                  }}
                >
                  OPEN
                </button>
              ),
            },
            {
              id: 'twin-reference',
              name: 'TWIN REFERENCE (QA)',
              sub: 'Founder review copy of the workspace',
              side: (
                <button type="button" className="tod-ok-btn" onClick={goReferenceTwin}>
                  OPEN
                </button>
              ),
            },
            {
              id: 'opus-native',
              name: 'OPUS NATIVE DIAGNOSTICS',
              sub: 'Agent runtime route',
              side: (
                <Link to={`/projects/${projectSlug}/design/opus-native`} className="tod-ok-btn">
                  OPEN
                </Link>
              ),
            },
            {
              id: 'icons',
              name: 'NDX ICON SHEET',
              sub: 'Project icon inventory',
              side: (
                <Link to={`/projects/${projectSlug}/inspect/icons`} className="tod-ok-btn">
                  OPEN
                </Link>
              ),
            },
          ]}
        />
      </OverlayBody>
    </DesignProductionChildShell>
  );
}
