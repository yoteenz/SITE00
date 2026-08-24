import type { CharacterSynthesisPresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type CharacterLabRoomProps = {
  synthesis: CharacterSynthesisPresentation;
  modes: readonly { id: string; label: string }[];
  activeMode: string;
  onModeChange: (id: string) => void;
  modeContent: React.ReactNode;
  actions?: React.ReactNode;
};

export function CharacterLabRoom({
  synthesis,
  modes,
  activeMode,
  onModeChange,
  modeContent,
  actions,
}: CharacterLabRoomProps) {
  return (
    <div className="site00-fws-character">
      <section className="site00-fws-character__synthesis">
        <h2 className="site00-fws-section-title">WHO DO WE THINK SHE IS RIGHT NOW?</h2>
        <div className="site00-fws-character__portrait-row">
          <div className="site00-fws-character__portrait-placeholder" aria-hidden />
          <div className="site00-fws-character__essence">
            <p className="site00-fws-character__label">HER IN A SENTENCE</p>
            <p className="site00-fws-character__sentence">
              {synthesis.herInASentence ?? 'Complete discovery rounds or trigger synthesis to see her essence.'}
            </p>
            {synthesis.whoSheIs ? <p className="site00-fws-character__who">{synthesis.whoSheIs}</p> : null}
            {synthesis.calibrationPct != null ? (
              <p className="site00-fws-character__calibration">
                Current calibration · {synthesis.calibrationPct}%
              </p>
            ) : null}
            {synthesis.workingDraftLabel ? (
              <span className="site00-fws-character__draft">{synthesis.workingDraftLabel}</span>
            ) : null}
          </div>
        </div>
        {actions}
      </section>

      <nav className="site00-fws-character__modes" aria-label="Character lab modes">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            className={activeMode === m.id ? 'site00-fws-btn site00-fws-btn--primary' : 'site00-fws-btn'}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <section className="site00-fws-character__mode-content">{modeContent}</section>
    </div>
  );
}
