import { SITE00_ROUTES } from '../../../../config/routes';
import type { FounderBoardId } from './FounderBoards';

/** Admin route for a founder board. Task ids are opaque engine ids; no client data enters the path. */
export function founderBoardPath(board: FounderBoardId, artifactId: string, taskId?: string): string {
  const id = encodeURIComponent(artifactId);
  switch (board) {
    case '13':
      return SITE00_ROUTES.digitalFoundationPipeline;
    case '14':
      return SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', id);
    case '15':
      return SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', id);
    case '15A':
      return SITE00_ROUTES.digitalFoundationRunbook.replace(':id', id);
    case '15B':
      return SITE00_ROUTES.digitalFoundationRunbookTasks.replace(':id', id);
    case '15C':
      return SITE00_ROUTES.digitalFoundationRunbookTask.replace(':id', id).replace(':taskId', encodeURIComponent(taskId ?? ''));
  }
}

export const FOUNDER_PROJECT_BOARDS: FounderBoardId[] = ['13', '14', '15', '15A', '15B'];
