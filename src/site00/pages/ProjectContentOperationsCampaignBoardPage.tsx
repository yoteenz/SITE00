import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import {
  CampaignBoardInspectContent,
  CampaignBoardProductionWall,
} from '../components/founderWorkspace/CampaignBoardProductionWall';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { MarketingCampaignProductionRun } from '../../../shared/site00-studio-world-production/marketingCampaignProduction/types';
import '../styles/site00-founder-workspace.css';

/** Inspect layer preserves: CLIENT REVIEW MODE · Experiment 01 V2.3 campaign initialization semantics */

export default function ProjectContentOperationsCampaignBoardPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<MarketingCampaignProductionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [clientMode, setClientMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState('mon');

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.campaignProductionGet(projectSlug);
      setRun((result.run as MarketingCampaignProductionRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      setRun((result.run as MarketingCampaignProductionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Campaign board is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const generatedCount =
    run?.board?.assets.filter((a) => a.sequencePosition === 1 && a.generatedAssetUrl).length ?? 0;
  const totalSlide01 = run?.board?.assets.filter((a) => a.sequencePosition === 1).length ?? 0;

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="CAMPAIGN BOARD"
        subtitle={clientMode ? 'YOUR CONTENT PLAN' : run?.campaign?.name ?? 'MARKET TEST 01'}
        attentionBadge={generatedCount < totalSlide01 ? 'DEVELOPING' : 'READY TO REVIEW'}
        operate={
          <CampaignBoardProductionWall
            projectSlug={projectSlug}
            run={run}
            loading={loading}
            busy={busy}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onInitialize={() => void act(() => site00ProjectsApi.campaignProductionInitialize(projectSlug))}
            onLockRound01={() => void act(() => site00ProjectsApi.campaignProductionLockRound01(projectSlug))}
            onFormulateRound02={() => void act(() => site00ProjectsApi.campaignProductionFormulateRound02(projectSlug))}
          />
        }
        understand={
          <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
            Drag to reorder when persistence semantics allow · Tap artwork to review · Day navigation switches the working wall
          </p>
        }
        inspect={
          <CampaignBoardInspectContent
            run={run}
            clientMode={clientMode}
            onToggleClientMode={() => setClientMode((v) => !v)}
            busy={busy}
            onSynthesizeCaptions={() => void act(() => site00ProjectsApi.campaignProductionSynthesizeCaptions(projectSlug))}
            onCaptionJudgment={(contentPieceId, judgment) =>
              void act(() => site00ProjectsApi.campaignProductionCaptionJudgment(projectSlug, contentPieceId, judgment))
            }
          />
        }
      />
    </EcosystemShell>
  );
}
