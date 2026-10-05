/**
 * P0.VR.PAGE-SYSTEM-REVIEW-FAMILY-EXPANSION-AND-EXPERIENCE-REVIEW-PANEL1
 */

import { useState } from 'react';

import type { PageFamilyBlueprint } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import type { PageFamilyReviewPageRow } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyReviewPresentation.js';

type TabId = 'FUNCTION' | 'DESIGN' | 'EXPERIENCE' | 'RESPONSIVE' | 'LINEAGE';

export type DesignPageFamilyInspectorProps = {
  row: PageFamilyReviewPageRow;
  blueprint: PageFamilyBlueprint | null;
  onClose: () => void;
};

export function DesignPageFamilyInspector({ row, blueprint, onClose }: DesignPageFamilyInspectorProps) {
  const [tab, setTab] = useState<TabId>('FUNCTION');
  const node = blueprint?.nodes.find((n) => n.pageId === row.pageId) ?? null;
  const responsive = blueprint?.archetypeShells.find((a) => a.archetype === row.shellArchetype) ?? null;
  const childDirective = blueprint?.childDirectives.find((d) => d.pageId === row.pageId) ?? null;
  const grandchildDirective = blueprint?.grandchildDirectives.find((d) => d.pageId === row.pageId) ?? null;

  return (
    <div className="tod-psr-inspector" role="dialog" aria-label="Page family inspector" data-testid="page-family-inspector">
      <header className="tod-psr-inspector__head">
        <h3>{row.pageName.toUpperCase()}</h3>
        <button type="button" className="tod-psr-inspector__close" onClick={onClose} data-testid="page-family-inspector-close">
          CLOSE
        </button>
      </header>
      <nav className="tod-psr-inspector__tabs" role="tablist">
        {(['FUNCTION', 'DESIGN', 'EXPERIENCE', 'RESPONSIVE', 'LINEAGE'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className="tod-psr-inspector__tab"
            data-testid={`page-family-inspector-tab-${id.toLowerCase()}`}
            onClick={() => setTab(id)}
          >
            {id}
          </button>
        ))}
      </nav>
      <div className="tod-psr-inspector__body">
        {tab === 'FUNCTION' ?
          <div data-testid="page-family-inspector-function">
            <p>PAGE ROLE · {row.functionRole}</p>
            <p>PRIMARY JOB · {childDirective?.function ?? grandchildDirective?.function ?? `Deliver ${row.functionRole}`}</p>
            <p>ROUTE · {row.route || '—'}</p>
            <p>NAVIGATION · {childDirective?.navigationRelationship ?? 'Nested under parent context'}</p>
            <p>
              PARENT / CHILD ·{' '}
              {row.depth === 0 ? 'ROOT PARENT'
              : row.depth === 1 ?
                `CHILD OF ${row.parentPageName ?? 'OVERVIEW'}`
              : `GRANDCHILD OF ${row.parentPageName ?? '—'}`}
            </p>
          </div>
        : null}
        {tab === 'DESIGN' ?
          <div data-testid="page-family-inspector-design">
            <p>INHERITED FROM · NDXBOOK × SITE 00 PROJECT EXPRESSION</p>
            <p>SHELL ARCHETYPE · {row.shellArchetype}</p>
            <p>DIVERGENCE · {row.divergenceLevel}</p>
            {node ?
              <>
                <h4>INHERITED</h4>
                <ul>
                  {node.inheritance.inherited.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <h4>ADAPTABLE</h4>
                <ul>
                  {node.inheritance.adaptable.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <h4>PAGE SPECIFIC</h4>
                <ul>
                  {node.inheritance.pageSpecific.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            : null}
          </div>
        : null}
        {tab === 'EXPERIENCE' ?
          <div data-testid="page-family-inspector-experience">
            <p>Approved Experience Package patterns:</p>
            <ul>
              {row.experiencePatternIds.length ?
                row.experiencePatternIds.map((id) => <li key={id}>{id}</li>)
              : <li>—</li>}
            </ul>
            {childDirective?.experiencePatterns.length ?
              childDirective.experiencePatterns.map((p) => <p key={p}>{p}</p>)
            : null}
          </div>
        : null}
        {tab === 'RESPONSIVE' ?
          <div data-testid="page-family-inspector-responsive">
            {responsive ?
              <>
                <p>MOBILE · {responsive.mobile.join(' · ')}</p>
                <p>TABLET · {responsive.tablet.join(' · ')}</p>
                <p>DESKTOP · {responsive.desktop.join(' · ')}</p>
              </>
            : <p>RESPONSIVE CONTRACT · {row.responsiveStatus}</p>}
          </div>
        : null}
        {tab === 'LINEAGE' ?
          <div data-testid="page-family-inspector-lineage">
            <p>PAGE FAMILY BLUEPRINT · {blueprint?.blueprintId ?? '—'}</p>
            <p>ARCHETYPE · {row.shellArchetype}</p>
            <p>INHERITANCE DIRECTIVE · {row.inheritanceDirectiveId}</p>
            <p>RESPONSIVE CONTRACT · {row.responsiveContractId}</p>
            <p>OPUS SHELL · {row.coverageStatus}</p>
          </div>
        : null}
      </div>
    </div>
  );
}
