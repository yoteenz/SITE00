/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — LIST mount surface.
 *
 * Deliberately NOT a design. The Spark digest renderer lands here in a later
 * sprint; until then this surface exists only to prove the mode boundary
 * works: it mounts in place of the canonical renderer, reads the same shared
 * workspace model, and mutates nothing. Opus must not invent the List View,
 * so the diagnostic below is a plain read-out, not a layout proposal.
 */

import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';

export const TWIN_OPUS_DIRECT_LIST_PENDING_NOTICE = 'SPARK PRESENTATION PENDING';

export function TwinOpusDirectListBody({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, selectedCandidate } = workspace;

  return (
    <main className="tod-main tod-main--list">
      <section className="tod-listmount" aria-label="List view mount surface">
        <p className="tod-listmount__title">LIST VIEW</p>
        <p className="tod-listmount__notice">{TWIN_OPUS_DIRECT_LIST_PENDING_NOTICE}</p>
        <p className="tod-listmount__note">
          Presentation mount only. The canonical workspace is unchanged and still holds every value below.
        </p>
        <dl className="tod-listmount__state" data-testid="twin-opus-direct-list-state">
          <div>
            <dt>SELECTED CANDIDATE</dt>
            <dd>{`${selectedCandidate.id.toUpperCase()} / ${selectedCandidate.version}`}</dd>
          </div>
          <div>
            <dt>AUTHORITY PAIR</dt>
            <dd>{`${data.stage.authorityValue} / ${state.authorityPairOpen ? 'EXPANDED' : 'COLLAPSED'}`}</dd>
          </div>
          <div>
            <dt>READINESS</dt>
            <dd>{`${data.readiness.percent}% ${data.readiness.state}`}</dd>
          </div>
          <div>
            <dt>STAGE</dt>
            <dd>{data.stage.stageValue}</dd>
          </div>
          <div>
            <dt>VIEWPORT</dt>
            <dd>{state.viewport}</dd>
          </div>
          <div>
            <dt>RECORD TAB</dt>
            <dd>{data.conceptTabs[state.recordTabIndex]}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export function TwinOpusDirectListRecord({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state } = workspace;

  return (
    <div className="tod-listrecord">
      <span className="tod-listrecord__label">CONCEPT RECORD</span>
      <span className="tod-listrecord__value">{data.conceptTabs[state.recordTabIndex]}</span>
      <span className="tod-listrecord__notice">{TWIN_OPUS_DIRECT_LIST_PENDING_NOTICE}</span>
    </div>
  );
}
