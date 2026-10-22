import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DfLoading, DfSystemPanel } from '../../../foundation-client/shell';
import { foundationAdminApi, type FoundationPipelineView } from '../../services/foundationAdminApi';
import { FounderPipelineBoard } from './boards/FounderBoards';
import { founderBoardPath } from './boards/founderBoardRoutes';

/** Board 13 — foundation pipeline (admin, founder session). */
export default function FoundationPipelinePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<FoundationPipelineView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    foundationAdminApi
      .pipeline()
      .then(setView)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return <DfSystemPanel index="13" label="FOUNDATION PIPELINE" lines={["WE COULDN'T", 'LOAD THIS']} body={error.toUpperCase()} />;
  }
  if (!view) return <DfLoading />;
  return (
    <FounderPipelineBoard
      rows={view.rows}
      attention={view.attention}
      onOpenProject={(id) => navigate(founderBoardPath('14', id))}
    />
  );
}
