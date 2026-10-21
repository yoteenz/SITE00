import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DfLoading, DfSystemPanel } from '../../../foundation-client/shell';
import {
  foundationAdminApi,
  type FounderRunbookView,
  type ProjectCommandSnapshot,
} from '../../services/foundationAdminApi';
import {
  FounderProjectCommandBoard,
  FounderRunbookDetailBoard,
  FounderRunbookOverviewBoard,
  FounderTaskDetailBoard,
  FounderWorkbenchBoard,
  type FounderBoardId,
  type FounderBoardNav,
} from './boards/FounderBoards';
import { FOUNDER_PROJECT_BOARDS, founderBoardPath } from './boards/founderBoardRoutes';

type ProjectBoard = Exclude<FounderBoardId, '13'>;

/** Boards 14–15C for one project (admin, founder session). Reads the project command and runbook views. */
export default function FoundationFounderProjectBoardPage({ board }: { board: ProjectBoard }) {
  const { id = '', taskId = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<{ snapshot: ProjectCommandSnapshot; runbook: FounderRunbookView } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [snapshot, runbook] = await Promise.all([foundationAdminApi.projectCommand(id), foundationAdminApi.runbook(id)]);
    setData({ snapshot, runbook });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    load().catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id, load]);

  if (error) {
    return <DfSystemPanel index={board} label="PROJECT COMMAND" lines={["WE COULDN'T", 'LOAD THIS']} body={error.toUpperCase()} />;
  }
  if (!data) return <DfLoading />;

  const go = (b: FounderBoardId, task?: string) => navigate(founderBoardPath(b, id, task));
  const nav: FounderBoardNav = { available: FOUNDER_PROJECT_BOARDS, onNavigate: (b) => go(b) };
  const { snapshot, runbook } = data;

  switch (board) {
    case '14':
      return (
        <FounderProjectCommandBoard
          snapshot={snapshot}
          runbook={runbook}
          onWorkbench={() => go('15')}
          onRunbook={() => go('15A')}
          onBack={() => go('13')}
          nav={nav}
        />
      );
    case '15':
      return (
        <FounderWorkbenchBoard
          snapshot={snapshot}
          runbook={runbook}
          onRunbook={() => go('15A')}
          onTask={(t) => go('15C', t)}
          onBack={() => go('14')}
          nav={nav}
        />
      );
    case '15A':
      return <FounderRunbookOverviewBoard snapshot={snapshot} runbook={runbook} onOpenRunbook={() => go('15B')} onBack={() => go('15')} nav={nav} />;
    case '15B':
      return <FounderRunbookDetailBoard snapshot={snapshot} runbook={runbook} onTask={(t) => go('15C', t)} onBack={() => go('15A')} nav={nav} />;
    case '15C':
      return (
        <FounderTaskDetailBoard
          snapshot={snapshot}
          runbook={runbook}
          taskId={taskId}
          operations={{
            start: async (t) => {
              await foundationAdminApi.startTask(id, t);
              await load();
            },
            complete: async (t) => {
              await foundationAdminApi.completeTask(id, t);
              await load();
            },
          }}
          onTask={(t) => go('15C', t)}
          onBack={() => go('15B')}
          nav={nav}
        />
      );
  }
}
