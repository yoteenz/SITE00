import type { CreativeThread } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

type Props = {
  open: boolean;
  thread: CreativeThread | null;
};

export function CreativeLineageView({ open, thread }: Props) {
  if (!open || !thread) return null;
  const events = [
    ...thread.artifacts.map((a) => ({
      id: a.artifact_id,
      label: `${a.task_mode} · ${a.approval_state}`,
      at: a.created_at,
    })),
    ...thread.judgments.map((j) => ({
      id: j.judgment_id,
      label: `${j.action} → ${j.artifact_id.slice(-6)}`,
      at: j.created_at,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section className="ec-cw-lineage" data-testid="ec-cw-lineage" aria-label="Creative lineage">
      <h3>Lineage</h3>
      <ol>
        {events.map((e) => (
          <li key={e.id}>
            <time dateTime={e.at}>{e.at}</time> · {e.label}
          </li>
        ))}
      </ol>
    </section>
  );
}
