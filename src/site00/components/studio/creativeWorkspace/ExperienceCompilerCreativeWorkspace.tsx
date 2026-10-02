import { useState } from 'react';
import type { ExperienceCompilerWorkspaceState } from '../../../../studioos/experience-compiler/workspace/types';
import { useSite00ShellAuth } from '../../../auth/Site00ShellAuthContext';
import { CreativeCanvas } from './CreativeCanvas';
import { CreativeConversationDock } from './CreativeConversationDock';
import { CreativeLineageView } from './CreativeLineageView';
import { CreativeRunDetails } from './CreativeRunDetails';
import { FounderDirectorRail } from './FounderDirectorRail';
import { HybridizePanel } from './HybridizePanel';
import { JourneyRail } from './JourneyRail';
import { ProjectIntelligenceRail } from './ProjectIntelligenceRail';
import { useCreativeDirectorWorkspace } from './useCreativeDirectorWorkspace';

type Props = {
  state: ExperienceCompilerWorkspaceState;
};

export function ExperienceCompilerCreativeWorkspace({ state }: Props) {
  const { persistenceDegraded } = useSite00ShellAuth();
  const w = useCreativeDirectorWorkspace(state);
  const [intelExpanded, setIntelExpanded] = useState(false);
  const runtimeBlocked = !w.runtime?.configured || w.runtime?.blocked != null;

  const territoryIds = w.territories.map((t) => t.territory_id);
  const compareAb = territoryIds.length >= 2 ? ([territoryIds[0], territoryIds[1]] as [string, string]) : null;
  const compareAc = territoryIds.length >= 3 ? ([territoryIds[0], territoryIds[2]] as [string, string]) : null;
  const compareBc = territoryIds.length >= 3 ? ([territoryIds[1], territoryIds[2]] as [string, string]) : null;

  return (
    <div className="ec-cw" data-testid="ec-creative-workspace">
      {persistenceDegraded ? (
        <p className="ec-cw-degraded" role="status">
          PERSISTENCE DEGRADED / PREVIEW ONLY — local thread cache; durable Supabase memory when auth is restored.
        </p>
      ) : null}

      <header className="ec-cw-header">
        <div>
          <p className="ec-cw-header__kicker">FOUNDER CREATIVE WORKSPACE</p>
          <h2 className="ec-cw-header__title">{w.thread?.title ?? 'Creative architecture thread'}</h2>
        </div>
        <div className="ec-cw-header__threads">
          <label>
            Thread
            <select
              value={w.thread?.thread_id ?? ''}
              onChange={(e) => {
                if (e.target.value) void w.selectThread(e.target.value);
              }}
            >
              <option value="">Select or create…</option>
              {w.threads.map((t) => (
                <option key={t.thread_id} value={t.thread_id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="ec-cw-btn ec-cw-btn--ghost" disabled={w.busy} onClick={() => void w.ensureThread()}>
            New thread context
          </button>
        </div>
      </header>

      <div className="ec-cw-layout">
        <ProjectIntelligenceRail
          snapshot={w.snapshot}
          thread={w.thread}
          runtime={w.runtime}
          expanded={intelExpanded}
          onToggleExpand={() => setIntelExpanded((v) => !v)}
          onLoadContext={() => void w.loadContextManifest()}
          contextManifest={w.contextManifest}
        />

        <main className="ec-cw-main">
          <CreativeCanvas
            taskMode={w.taskMode}
            territories={w.territories}
            activeArtifact={w.activeArtifact}
            runtimeBlocked={runtimeBlocked}
            runError={w.runError}
            territoryIndex={w.territoryIndex}
            onTerritoryIndexChange={w.setTerritoryIndex}
            comparePair={w.comparePair}
            onCompare={w.setComparePair}
            onJudgment={(action, id) => void w.applyJudgment(action, id)}
            busy={w.busy}
            onRun={() => void w.runCreative()}
          />
          <CreativeConversationDock
            open={w.conversationOpen}
            thread={w.thread}
            message={w.message}
            onMessage={w.setMessage}
            onSend={() => void w.sendMessage()}
            onRun={() => void w.runCreative()}
            busy={w.busy}
          />
          <CreativeLineageView open={w.lineageOpen} thread={w.thread} />
          <CreativeRunDetails
            open={w.runDetailsOpen}
            onToggle={() => w.setRunDetailsOpen((v) => !v)}
            runtime={w.runtime}
            thread={w.thread}
            artifact={w.activeArtifact}
          />
          {!w.runDetailsOpen ? (
            <button type="button" className="ec-cw-btn ec-cw-btn--ghost ec-cw-run-details-toggle" onClick={() => w.setRunDetailsOpen(true)}>
              Show run details
            </button>
          ) : null}
        </main>

        <FounderDirectorRail
          thread={w.thread}
          judgmentNote={w.judgmentNote}
          onJudgmentNote={w.setJudgmentNote}
          onJudgment={(action) => void w.applyJudgment(action)}
          disabled={w.busy}
          onToggleConversation={() => w.setConversationOpen((v) => !v)}
          conversationOpen={w.conversationOpen}
          onToggleLineage={() => w.setLineageOpen((v) => !v)}
          lineageOpen={w.lineageOpen}
        />
      </div>

      <JourneyRail thread={w.thread} taskMode={w.taskMode} />

      <HybridizePanel
        open={w.hybridizeOpen}
        targetTerritory={w.hybridizeTarget}
        onClose={() => w.setHybridizeOpen(false)}
        onSubmit={(preserve, reject, push) => {
          w.setJudgmentNote(`${preserve}\n${reject}\n${push}`);
          w.setHybridizeOpen(false);
          void w.applyJudgment('HYBRIDIZE', w.hybridizeTarget ?? undefined);
        }}
      />

      {/* Compare shortcuts injected via canvas — expose ids for tablet */}
      <div className="ec-cw-compare-shortcuts ec-cw-tablet-only" hidden={!compareAb}>
        {compareAb ? (
          <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => w.setComparePair(compareAb)}>
            Tablet compare A/B
          </button>
        ) : null}
        {compareAc ? (
          <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => w.setComparePair(compareAc)}>
            Tablet compare A/C
          </button>
        ) : null}
        {compareBc ? (
          <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={() => w.setComparePair(compareBc)}>
            Tablet compare B/C
          </button>
        ) : null}
      </div>
    </div>
  );
}
