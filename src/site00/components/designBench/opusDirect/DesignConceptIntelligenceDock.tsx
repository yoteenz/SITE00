/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-INTELLIGENCE-DOCK1 — bottom dossier for selected page concept.
 */

import { useState } from 'react';

import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { PageConceptContainedPreviewFrame } from '../pageConceptGenerator/PageConceptContainedPreviewFrame';
import type { ConceptIntelligenceDockTab } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/designConceptIntelligenceDock.js';
import { PAGE_CONCEPT_HEADER_THUMBNAIL_CROP } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptConceptHeaderThumbnail.js';

type DockVariant = 'canonical' | 'list';

function tabPrefixFor(variant: DockVariant): 'tod' | 'tod-lv' {
  return variant === 'list' ? 'tod-lv' : 'tod';
}

/** Inner dossier layout — shared class across grid/list (same dock state). */
const CID = 'tod-cid';

function LineageNodeDetails({ fullId }: { fullId: string | null }) {
  const [open, setOpen] = useState(false);
  if (!fullId) return null;
  return (
    <button type="button" className="tod-cid__detailsBtn" onClick={() => setOpen((v) => !v)}>
      {open ? fullId : 'VIEW DETAILS'}
    </button>
  );
}

function TabPanelConcept({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { concept } = workspace.data.conceptIntelligenceDock;
  return (
    <div className={`${CID}__conceptGrid`} data-testid="concept-intelligence-dock-concept">
      <div className={`${CID}__visual`}>
        <span className={`${CID}__visualLabel`}>CONCEPT VISUAL</span>
        {concept.previewSrc ?
          <PageConceptContainedPreviewFrame
            size="mobile"
            objectFit="cover"
            status={concept.previewStatus === 'RUNNING' ? 'GENERATING' : concept.previewStatus}
            imageSrc={concept.previewSrc}
            headerThumbnailCrop={
              concept.headerThumbnailCrop ?
                { ...PAGE_CONCEPT_HEADER_THUMBNAIL_CROP, ...concept.headerThumbnailCrop }
              : PAGE_CONCEPT_HEADER_THUMBNAIL_CROP
            }
            testId="concept-intelligence-dock-preview"
          />
        : <div className={`${CID}__visualEmpty`}>NO CONCEPT PREVIEW</div>}
      </div>
      <div className={`${CID}__identity`}>
        <span className={`${CID}__kicker`}>SELECTED CONCEPT</span>
        <dl className={`${CID}__meta`}>
          <div>
            <dt>CONCEPT</dt>
            <dd>{concept.conceptLetter}</dd>
          </div>
          <div>
            <dt>VIEWPORT</dt>
            <dd>{concept.viewport}</dd>
          </div>
          <div>
            <dt>TERRITORY</dt>
            <dd>{concept.territoryName}</dd>
          </div>
          <div>
            <dt>TARGET</dt>
            <dd>{concept.targetRoute}</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>{concept.status}</dd>
          </div>
          <div>
            <dt>GENERATION</dt>
            <dd>
              {concept.runIdShort ?? '—'}
              {concept.generatedAt ? ` · ${concept.generatedAt}` : ''}
              {concept.artifactVersion ? ` · ${concept.artifactVersion}` : ''}
            </dd>
          </div>
        </dl>
        <div className={`${CID}__summary`}>
          <div>
            <span className={`${CID}__sumLabel`}>CREATIVE PREMISE</span>
            <p>{concept.creativePremise}</p>
          </div>
          <div>
            <span className={`${CID}__sumLabel`}>DISTINCTIVE MOVE</span>
            <p>{concept.distinctiveMove}</p>
          </div>
          <div>
            <span className={`${CID}__sumLabel`}>BESPOKE MOMENT</span>
            <p>{concept.bespokeMoment}</p>
          </div>
        </div>
      </div>
      <div className={`${CID}__rail`}>
        <span className={`${CID}__kicker`}>STATE</span>
        <ul className={`${CID}__stateStrip`}>
          {concept.stateStrip.map((chip) => (
            <li key={chip.id} data-tone={chip.tone}>
              <span>{chip.label}</span>
              <span>{chip.value}</span>
            </li>
          ))}
        </ul>
        <span className={`${CID}__kicker`}>NEXT</span>
        <p className={`${CID}__next`}>{workspace.data.conceptIntelligenceDock.handoff.nextAction}</p>
      </div>
    </div>
  );
}

function TabPanelExpression({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { expression } = workspace.data.conceptIntelligenceDock;
  return (
    <div className={`${CID}__stack`} data-testid="concept-intelligence-dock-expression">
      <div className={`${CID}__sectionHead`}>
        <span>WEB EXPRESSION TERRITORY</span>
        <strong>{expression.territoryName}</strong>
      </div>
      <div className={`${CID}__cards`}>
        {expression.rows.map((row) => (
          <div key={row.label} className={`${CID}__card`}>
            <span className={`${CID}__cardLabel`}>{row.label}</span>
            <p>{row.value}</p>
          </div>
        ))}
      </div>
      <div className={`${CID}__inlineMeta`}>
        <span>NDX BRAND FAMILIARITY</span>
        <span>{expression.ndxBrandFamiliarity}</span>
      </div>
    </div>
  );
}

function TabPanelFunction({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { function: fn } = workspace.data.conceptIntelligenceDock;
  return (
    <div className={`${CID}__stack`} data-testid="concept-intelligence-dock-function">
      <p className={`${CID}__lockBanner`}>THE DESIGN MAY CHANGE. THE FUNCTION MAY NOT.</p>
      <div className={`${CID}__sectionHead`}>
        <span>PAGE FUNCTION MAP</span>
        <strong>{fn.targetRoute}</strong>
      </div>
      <div className={`${CID}__regionList`}>
        <span className={`${CID}__cardLabel`}>PAGE REGIONS</span>
        <ul>
          {fn.pageRegions.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <dl className={`${CID}__meta ${CID}__meta--compact`}>
        <div>
          <dt>INTERACTIONS PRESERVED</dt>
          <dd>{fn.interactionsPreserved}</dd>
        </div>
        <div>
          <dt>BOTTOM NAV</dt>
          <dd>{fn.bottomNav}</dd>
        </div>
        <div>
          <dt>HOST / PROJECT OWNERSHIP</dt>
          <dd>{fn.hostOwnership}</dd>
        </div>
        <div>
          <dt>FUNCTIONAL VALIDATION</dt>
          <dd>{fn.functionalValidation}</dd>
        </div>
      </dl>
    </div>
  );
}

function TabPanelLineage({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { lineage } = workspace.data.conceptIntelligenceDock;
  return (
    <div className={`${CID}__stack`} data-testid="concept-intelligence-dock-lineage">
      <ol className={`${CID}__chain`}>
        {lineage.chain.map((node) => (
          <li key={node.id} data-present={node.present ? 'yes' : 'no'}>
            <span className={`${CID}__chainLabel`}>{node.label}</span>
            <span className={`${CID}__chainStatus`}>{node.status}</span>
            {node.version ? <span className={`${CID}__chainVer`}>{node.version}</span> : null}
            <LineageNodeDetails fullId={node.fullId} />
          </li>
        ))}
      </ol>
      <div className={`${CID}__sourceStatus`}>
        {lineage.sourceStatus.map((row) => (
          <div key={row.label} className={`${CID}__sourceRow`}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabPanelHistory({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { history } = workspace.data.conceptIntelligenceDock;
  return (
    <div className={`${CID}__stack`} data-testid="concept-intelligence-dock-history">
      <div className={`${CID}__runs`}>
        <span className={`${CID}__cardLabel`}>GENERATION RUNS</span>
        <ul>
          {history.runs.map((run) => (
            <li key={run.runLabel}>
              <span>{run.runLabel}</span>
              <span>{run.slots}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className={`${CID}__timeline`}>
        {history.events.map((ev) => (
          <li key={ev.id}>
            <span className={`${CID}__when`}>{ev.whenLabel}</span>
            <span className={`${CID}__action`}>{ev.action}</span>
            <span className={`${CID}__artifact`}>{ev.artifact}</span>
            <span className={`${CID}__change`}>{ev.stateChange}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabPanelHandoff({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { handoff } = workspace.data.conceptIntelligenceDock;
  return (
    <div className={`${CID}__stack`} data-testid="concept-intelligence-dock-handoff">
      <div className={`${CID}__nextBlock`}>
        <span className={`${CID}__kicker`}>NEXT</span>
        <p className={`${CID}__next`}>{handoff.nextAction}</p>
      </div>
      <ul className={`${CID}__pipeline`}>
        {handoff.pipeline.map((step) => (
          <li key={step.id} data-complete={step.complete ? 'yes' : 'no'}>
            <span>{step.label}</span>
            <span>{step.complete ? '✓' : '○'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderTab(tab: ConceptIntelligenceDockTab, workspace: TwinOpusDirectWorkspace) {
  switch (tab) {
    case 'CONCEPT':
      return <TabPanelConcept workspace={workspace} />;
    case 'EXPRESSION':
      return <TabPanelExpression workspace={workspace} />;
    case 'FUNCTION':
      return <TabPanelFunction workspace={workspace} />;
    case 'LINEAGE':
      return <TabPanelLineage workspace={workspace} />;
    case 'HISTORY':
      return <TabPanelHistory workspace={workspace} />;
    case 'HANDOFF':
      return <TabPanelHandoff workspace={workspace} />;
    default:
      return null;
  }
}

export function DesignConceptIntelligenceDock({
  workspace,
  variant,
}: {
  workspace: TwinOpusDirectWorkspace;
  variant: DockVariant;
}) {
  const { data, state, actions } = workspace;
  const p = tabPrefixFor(variant);
  const tabs = data.conceptIntelligenceDock.tabs;
  const tab = tabs[state.recordTabIndex] ?? tabs[0];
  const tabPrefix = variant === 'list' ? 'tod-lv-tab' : 'tod-tab';
  const panelId = variant === 'list' ? 'tod-lv-concept-intelligence-panel' : 'tod-concept-intelligence-panel';

  return (
    <>
      <div className={`${p}-tabs`}>
        <div className={`${p}-tabs__list ${p}-tabs__list--cid`} role="tablist" aria-label="Concept intelligence">
          {tabs.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              id={`${tabPrefix}-${index}`}
              aria-selected={state.recordTabIndex === index}
              aria-controls={panelId}
              tabIndex={state.recordTabIndex === index ? 0 : -1}
              className={`${p}-tabs__tab${state.recordTabIndex === index ? ' is-active' : ''}`}
              onClick={() => actions.selectRecordTab(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={CID}
        id={panelId}
        role="tabpanel"
        data-testid="concept-intelligence-dock"
        aria-labelledby={`${tabPrefix}-${state.recordTabIndex}`}
      >
        {data.conceptIntelligenceDock.emptyMessage ?
          <p className={`${CID}__empty`}>{data.conceptIntelligenceDock.emptyMessage}</p>
        : renderTab(tab, workspace)}
      </div>
    </>
  );
}
