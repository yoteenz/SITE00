import { useEffect, useState } from 'react';
import type { PipelineRow } from '../../../../shared/site00-digital-foundation/operations/contracts/p13Pipeline.js';
import type { ProjectCommandSnapshot } from '../../../../shared/site00-digital-foundation/operations/contracts/p14ProjectCommand.js';
import type { FounderRunbookView } from '../../../../shared/site00-digital-foundation/operations/contracts/p15RunbookView.js';
import {
  FounderPipelineBoard,
  FounderProjectCommandBoard,
  FounderRunbookDetailBoard,
  FounderRunbookOverviewBoard,
  FounderTaskDetailBoard,
  FounderWorkbenchBoard,
  type FounderBoardId,
  type FounderBoardNav,
} from '../../admin/pages/foundation/boards/FounderBoards';
import type { PipelineAttention } from '../../admin/pages/foundation/boards/founderBoardModel';
import { DfReviewInertProvider } from '../../foundation-client/reviewInert';
import snapshots from './generated/reviewFounderSnapshots.json';

export type ReviewFounderSnapshots = {
  generated_at: string;
  focus_artifact_id: string;
  focus_task_id: string;
  pipeline: { rows: PipelineRow[]; attention: PipelineAttention };
  project_command: ProjectCommandSnapshot;
  runbook: FounderRunbookView;
};

export const REVIEW_FOUNDER_SNAPSHOTS = snapshots as unknown as ReviewFounderSnapshots;

/** Review gallery founder board ids, keyed by registry `reviewId`. */
export const FOUNDER_BOARD_FOR_REVIEW_ID: Record<string, FounderBoardId> = {
  FOUNDATION_PIPELINE: '13',
  PROJECT_COMMAND: '14',
  EXECUTION_WORKBENCH: '15',
  RUNBOOK_OVERVIEW: '15A',
  RUNBOOK_DETAIL: '15B',
  RUNBOOK_TASK_DETAIL: '15C',
};

const ALL_BOARDS: FounderBoardId[] = ['13', '14', '15', '15A', '15B', '15C'];

/**
 * Founder boards 13–15C on the engine-generated review snapshot. Navigation is local; task actions are inert
 * (`DfReviewInertProvider`), so nothing reaches the operations API from the review page.
 */
export default function DigitalFoundationReviewFounderBoardHost({
  initialBoard,
  data = REVIEW_FOUNDER_SNAPSHOTS,
}: {
  initialBoard: FounderBoardId;
  data?: ReviewFounderSnapshots;
}) {
  const [board, setBoard] = useState<FounderBoardId>(initialBoard);
  const [taskId, setTaskId] = useState(data.focus_task_id);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setBoard(initialBoard), [initialBoard]);

  const go = (next: FounderBoardId, task?: string) => {
    setNotice(null);
    if (task) setTaskId(task);
    setBoard(next);
  };
  const nav: FounderBoardNav = { available: ALL_BOARDS, onNavigate: (b) => go(b) };
  const openProject = (artifactId: string) => {
    if (artifactId === data.focus_artifact_id) go('14');
    else setNotice(`REVIEW SNAPSHOT · PROJECT COMMAND IS CAPTURED FOR ${projectName(data)} ONLY.`);
  };
  const { project_command: snapshot, runbook } = data;
  const inertOps = { start: async () => undefined, complete: async () => undefined };

  let body;
  switch (board) {
    case '13':
      body = <FounderPipelineBoard rows={data.pipeline.rows} attention={data.pipeline.attention} onOpenProject={openProject} nav={nav} />;
      break;
    case '14':
      body = (
        <FounderProjectCommandBoard
          snapshot={snapshot}
          runbook={runbook}
          onWorkbench={() => go('15')}
          onRunbook={() => go('15A')}
          onBack={() => go('13')}
          nav={nav}
        />
      );
      break;
    case '15':
      body = (
        <FounderWorkbenchBoard
          snapshot={snapshot}
          runbook={runbook}
          onRunbook={() => go('15A')}
          onTask={(t) => go('15C', t)}
          onBack={() => go('14')}
          nav={nav}
        />
      );
      break;
    case '15A':
      body = <FounderRunbookOverviewBoard snapshot={snapshot} runbook={runbook} onOpenRunbook={() => go('15B')} onBack={() => go('15')} nav={nav} />;
      break;
    case '15B':
      body = <FounderRunbookDetailBoard snapshot={snapshot} runbook={runbook} onTask={(t) => go('15C', t)} onBack={() => go('15A')} nav={nav} />;
      break;
    case '15C':
      body = (
        <FounderTaskDetailBoard
          key={taskId}
          snapshot={snapshot}
          runbook={runbook}
          taskId={taskId}
          operations={inertOps}
          onTask={(t) => go('15C', t)}
          onBack={() => go('15B')}
          nav={nav}
        />
      );
      break;
  }

  return (
    <div className="df-review__founder-boards" data-founder-board={board}>
      <p className="df-review__sim df-review__sim--inline">
        SIMULATED · FOUNDER BOARD {board} · ENGINE SNAPSHOT · INERT ACTIONS
      </p>
      {notice && <p className="df-review__sim df-review__sim--inline">{notice}</p>}
      <DfReviewInertProvider>{body}</DfReviewInertProvider>
    </div>
  );
}

function projectName(data: ReviewFounderSnapshots): string {
  return (data.project_command.artifact.intake.business_name || 'THE FOCUS PROJECT').toUpperCase();
}
