import { useState } from 'react';
import type { CreativeDirectionBoard } from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeDirectionBoardTypes.js';

type CreativeDirectionBoardViewProps = {
  board: CreativeDirectionBoard;
  defaultBreakpoint?: 'desktop' | 'mobile';
};

export function CreativeDirectionBoardView({
  board,
  defaultBreakpoint = 'mobile',
}: CreativeDirectionBoardViewProps) {
  const [breakpoint, setBreakpoint] = useState(defaultBreakpoint);
  const src = breakpoint === 'mobile' ? board.mobileBoardUrl : board.desktopBoardUrl;

  const versionSuffix = board.boardPlanVersion.includes('pilot-v4')
    ? ' V4'
    : board.boardPlanVersion.includes('pilot-v3')
      ? ' V3'
      : board.boardPlanVersion.includes('pilot-v2')
        ? ' V2'
        : '';

  return (
    <figure className="site00-cd__creative-board" aria-label={`Creative direction board — ${board.directionName}`}>
      <figcaption className="site00-cd__creative-board-label">
        FINAL CREATIVE DIRECTION BOARD{versionSuffix}
      </figcaption>
      <div className="site00-cd__creative-board-toolbar">
        <button
          type="button"
          className={breakpoint === 'mobile' ? 'active' : ''}
          onClick={() => setBreakpoint('mobile')}
          aria-pressed={breakpoint === 'mobile'}
        >
          MOBILE
        </button>
        <button
          type="button"
          className={breakpoint === 'desktop' ? 'active' : ''}
          onClick={() => setBreakpoint('desktop')}
          aria-pressed={breakpoint === 'desktop'}
        >
          DESKTOP
        </button>
      </div>
      <div className="site00-cd__creative-board-frame">
        {src ? (
          <img
            src={src}
            alt={`${board.directionName} creative direction board`}
            className="site00-cd__creative-board-image"
            loading="lazy"
          />
        ) : (
          <span className="site00-cd__creative-board-pending">BOARD RENDER PENDING</span>
        )}
      </div>
      {board.founderVisualApproval === 'PENDING' ? (
        <p className="site00-cd__creative-board-qa" role="status">
          FOUNDER VISUAL REVIEW · PENDING
        </p>
      ) : null}
      {board.qaReport.result !== 'PASS' ? (
        <p className="site00-cd__creative-board-qa" role="status">
          BOARD QA · {board.qaReport.result.replace(/_/g, ' ')}
        </p>
      ) : null}
    </figure>
  );
}
