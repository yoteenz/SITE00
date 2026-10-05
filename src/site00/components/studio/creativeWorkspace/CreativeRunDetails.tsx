import type { CreativeArtifact } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { RuntimeStatus } from '../../../services/experienceCompilerCreativeDirectorApi';
import type { CreativeThread } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

type Props = {
  open: boolean;
  onToggle: () => void;
  runtime: RuntimeStatus | null;
  thread: CreativeThread | null;
  artifact: CreativeArtifact | null;
};

export function CreativeRunDetails({ open, onToggle, runtime, thread, artifact }: Props) {
  return (
    <details className="ec-cw-run-details-wrap" open={open} onToggle={() => onToggle()} data-testid="ec-cw-run-details">
      <summary>Run details / debug provenance</summary>
      {open ? (
        <pre className="ec-cw-run-details">
          {JSON.stringify(
            {
              model: runtime?.model,
              reasoning: runtime?.reasoning_effort,
              key: runtime?.OPENAI_API_KEY_PRESENT,
              persistence: runtime?.persistence_backend,
              run_status: thread?.run_status,
              run_id: artifact?.run_id,
              context_pack_id: artifact?.context_pack_id,
              artifact_id: artifact?.artifact_id,
            },
            null,
            2,
          )}
        </pre>
      ) : null}
    </details>
  );
}
