import type { FounderJudgmentAction } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { CreativeThread } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { sonnetHandoffBlocked } from './creativeWorkspaceUtils';

const JUDGMENT_ACTIONS: { action: FounderJudgmentAction; label: string }[] = [
  { action: 'LOVE_IT', label: 'LOVE IT' },
  { action: 'PROMISING', label: 'PROMISING' },
  { action: 'TOO_CLOSE', label: 'TOO CLOSE' },
  { action: 'WRONG_DIRECTION', label: 'WRONG DIRECTION' },
  { action: 'PUSH_FURTHER', label: 'PUSH FURTHER' },
  { action: 'REGENERATE', label: 'REGENERATE' },
  { action: 'COMBINE_WITH', label: 'COMBINE WITH' },
  { action: 'MAKE_FAMILY_AUTHORITY', label: 'MAKE FAMILY AUTHORITY' },
  { action: 'NEEDS_ANOTHER_STATE', label: 'NEEDS ANOTHER STATE' },
  { action: 'REMOVE', label: 'REMOVE' },
  { action: 'DEFER', label: 'DEFER' },
  { action: 'AMEND', label: 'AMEND' },
  { action: 'EXPAND', label: 'EXPAND' },
  { action: 'HYBRIDIZE', label: 'HYBRIDIZE' },
];

type Props = {
  thread: CreativeThread | null;
  judgmentNote: string;
  onJudgmentNote: (v: string) => void;
  onJudgment: (action: FounderJudgmentAction) => void;
  disabled: boolean;
  onToggleConversation: () => void;
  conversationOpen: boolean;
  onToggleLineage: () => void;
  lineageOpen: boolean;
};

export function FounderDirectorRail({
  thread,
  judgmentNote,
  onJudgmentNote,
  onJudgment,
  disabled,
  onToggleConversation,
  conversationOpen,
  onToggleLineage,
  lineageOpen,
}: Props) {
  const sonnetBlocked = sonnetHandoffBlocked(thread);
  return (
    <aside className="ec-cw-rail ec-cw-rail--director" aria-label="Founder director">
      <h2 className="ec-cw-rail__title">Founder director</h2>
      <label className="ec-cw-field">
        Founder note
        <textarea value={judgmentNote} onChange={(e) => onJudgmentNote(e.target.value)} rows={3} placeholder="Preserve / reject / push…" />
      </label>
      <div className="ec-cw-judgment-grid">
        {JUDGMENT_ACTIONS.map(({ action, label }) => (
          <button key={action} type="button" className="ec-cw-btn ec-cw-btn--ghost" disabled={!thread?.active_artifact_id || disabled} onClick={() => onJudgment(action)}>
            {label}
          </button>
        ))}
      </div>
      <dl className="ec-cw-dl ec-cw-dl--compact">
        <dt>Sonnet handoff</dt>
        <dd>{sonnetBlocked ? 'BLOCKED_FOR_AUTHORITY' : 'READY'}</dd>
        <dt>VAM</dt>
        <dd>{thread?.downstream_readiness.visual_authority_model ? 'READY' : '—'}</dd>
        <dt>Opus</dt>
        <dd>{thread?.downstream_readiness.opus ? 'READY' : '—'}</dd>
      </dl>
      <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={onToggleConversation}>
        {conversationOpen ? 'Hide conversation' : 'Conversation dock'}
      </button>
      <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={onToggleLineage}>
        {lineageOpen ? 'Hide lineage' : 'Lineage view'}
      </button>
    </aside>
  );
}
