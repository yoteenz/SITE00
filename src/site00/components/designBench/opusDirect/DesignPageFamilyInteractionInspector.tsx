/**
 * P0.VR.PAGE-FAMILY-INTERACTION-MAP-AND-HANDOFF-GATE1
 */

import { useState } from 'react';

import type { PageFamilyInteractionRecord } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyInteractionMap.js';

type Tab = 'FUNCTION' | 'STATE' | 'EXPERIENCE' | 'RESPONSIVE' | 'DATA' | 'LINEAGE';

type Props = {
  record: PageFamilyInteractionRecord;
  onClose: () => void;
};

export function DesignPageFamilyInteractionInspector({ record, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('FUNCTION');

  return (
    <div className="tod-psr-inspector tod-psr-inspector--interaction" data-testid="page-family-interaction-inspector">
      <header className="tod-psr-inspector__head">
        <h3>{record.controlLabel}</h3>
        <button type="button" className="tod-psr-inspector__close" onClick={onClose}>
          CLOSE
        </button>
      </header>

      <div className="tod-psr-inspector__tabs" role="tablist">
        {(['FUNCTION', 'STATE', 'EXPERIENCE', 'RESPONSIVE', 'DATA', 'LINEAGE'] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'tod-psr-inspector__tab tod-psr-inspector__tab--active' : 'tod-psr-inspector__tab'}
            onClick={() => setTab(id)}
          >
            {id}
          </button>
        ))}
      </div>

      {tab === 'FUNCTION' ?
        <dl className="tod-psr-inspector__dl">
          <dt>CONTROL</dt>
          <dd>{record.controlLabel}</dd>
          <dt>TYPE</dt>
          <dd>{record.controlType}</dd>
          <dt>PAGE</dt>
          <dd>{record.pageName}</dd>
          <dt>TRIGGER</dt>
          <dd>{record.trigger}</dd>
          <dt>ACTION</dt>
          <dd>{record.actionType}</dd>
          <dt>DESTINATION / EFFECT</dt>
          <dd>{record.destination ?? record.stateMutation ?? '—'}</dd>
          <dt>BACK</dt>
          <dd>{record.backBehavior ?? '—'}</dd>
        </dl>
      : null}

      {tab === 'STATE' ?
        <dl className="tod-psr-inspector__dl">
          <dt>DEFAULT</dt>
          <dd>DEFAULT</dd>
          <dt>LOADING</dt>
          <dd>{record.loadingState ?? '—'}</dd>
          <dt>SUCCESS</dt>
          <dd>{record.successState ?? '—'}</dd>
          <dt>ERROR</dt>
          <dd>{record.errorState ?? '—'}</dd>
          <dt>DISABLED</dt>
          <dd>{record.disabledState ?? '—'}</dd>
          {record.stateMutationDetail ?
            <>
              <dt>MUTATION</dt>
              <dd>
                {record.stateMutationDetail.initialState} → {record.stateMutationDetail.mutation} →{' '}
                {record.stateMutationDetail.resultingState} ({record.stateMutationDetail.persistenceLevel})
              </dd>
            </>
          : null}
        </dl>
      : null}

      {tab === 'EXPERIENCE' ?
        <dl className="tod-psr-inspector__dl">
          <dt>PATTERN</dt>
          <dd>{record.experiencePatternId ?? 'FUNCTIONAL ONLY'}</dd>
        </dl>
      : null}

      {tab === 'RESPONSIVE' ?
        <dl className="tod-psr-inspector__dl">
          <dt>MOBILE</dt>
          <dd>{record.responsiveBehavior.mobile}</dd>
          <dt>TABLET</dt>
          <dd>{record.responsiveBehavior.tablet}</dd>
          <dt>DESKTOP</dt>
          <dd>{record.responsiveBehavior.desktop}</dd>
        </dl>
      : null}

      {tab === 'DATA' ?
        <dl className="tod-psr-inspector__dl">
          <dt>READS</dt>
          <dd>{record.dataDependency ?? '—'}</dd>
          <dt>WRITES</dt>
          <dd>{record.stateMutation ?? '—'}</dd>
          <dt>PERSISTENCE</dt>
          <dd>{record.persistenceBehavior}</dd>
          <dt>PERMISSIONS</dt>
          <dd>{record.permissionRequirement ?? 'any'}</dd>
        </dl>
      : null}

      {tab === 'LINEAGE' ?
        <ol className="tod-psr-inspector__lineage">
          <li>PAGE FUNCTION MAP</li>
          <li>PAGE FAMILY BLUEPRINT</li>
          <li>{record.experiencePatternId ?? 'EXPERIENCE (FUNCTIONAL)'}</li>
          <li>INTERACTION MAP</li>
          <li>OPUS SHELL</li>
          <li>COMPOSER IMPLEMENTATION</li>
        </ol>
      : null}
    </div>
  );
}
