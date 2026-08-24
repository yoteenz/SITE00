/**
 * Character Lab — operate layer synthesis (Layer 1).
 */

import { Link } from 'react-router-dom';
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types';
import type { buildFounderCharacterDiscoveryProgress } from '../../utils/founderCharacterDiscoveryProgress';
import type { FounderDiscoveryProgressStep } from '../../utils/founderCharacterDiscoveryProgress';
import { castingStatusHeadline } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge';
import { site00ProjectEmbodiedCharacterDiscoveryPath } from '../../config/routes';
import { FounderCharacterCalibrationProgressPanel } from './FounderCharacterCalibrationProgressPanel';
import { FounderEmptyState, FounderWorkspacePanel } from './FounderWorkspaceShell';

type Progress = ReturnType<typeof buildFounderCharacterDiscoveryProgress>;

type Props = {
  projectSlug: string;
  run: NdxFounderCharacterDiscoveryRun | null;
  loading: boolean;
  discoveryProgress: Progress | null;
  busy?: boolean;
  actionError?: string | null;
  actionNotice?: string | null;
  onProgressStep?: (step: FounderDiscoveryProgressStep) => void;
  onContinueCalibration?: () => void;
  onGenerateSynthesis?: () => void;
};

export function CharacterLabOperateLayer({
  projectSlug,
  run,
  loading,
  discoveryProgress,
  busy = false,
  actionError,
  actionNotice,
  onProgressStep,
  onContinueCalibration,
  onGenerateSynthesis,
}: Props) {
  if (loading) {
    return <p className="site00-fws-empty">Loading character lab…</p>;
  }

  if (!run) {
    return (
      <FounderEmptyState
        title="CHARACTER NOT STARTED"
        body="Enter the discovery room below to begin calibration. Founder recognition remains the authority."
      />
    );
  }

  return (
    <>
      <div className="site00-fws-pulse" style={{ marginBottom: 16 }}>
        <div className="site00-fws-pulse__metrics">
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{discoveryProgress?.percentComplete ?? 0}%</span>
            <span className="site00-fws-pulse__label">CALIBRATION</span>
          </div>
        </div>
      </div>

      {discoveryProgress && onProgressStep ? (
        <FounderCharacterCalibrationProgressPanel
          discoveryProgress={discoveryProgress}
          busy={busy}
          actionError={actionError}
          actionNotice={actionNotice}
          onStepPress={onProgressStep}
          onContinueCalibration={onContinueCalibration}
          onGenerateSynthesis={onGenerateSynthesis}
          className="site00-fws-calibration-progress--operate"
        />
      ) : null}

      <FounderWorkspacePanel title="HER IN A SENTENCE">
        {run.humanReadableSynthesis?.whoIThinkSheIs ? (
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>{run.humanReadableSynthesis.whoIThinkSheIs}</p>
        ) : (
          <FounderEmptyState title="SYNTHESIS PENDING" body="Complete calibration gates to generate a living character read." />
        )}
      </FounderWorkspacePanel>

      <FounderWorkspacePanel title="CASTING STATE">
        <p style={{ fontSize: 12 }}>{castingStatusHeadline(run)}</p>
        <Link to={site00ProjectEmbodiedCharacterDiscoveryPath(projectSlug)} className="site00-fws-inspect-trigger">
          EMBODIED VOICE LAB →
        </Link>
      </FounderWorkspacePanel>
    </>
  );
}
