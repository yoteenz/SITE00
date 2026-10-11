import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi } from '../../services/foundationAdminApi';

export default function FoundationWorkbenchPage() {
  const { id = '' } = useParams();
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    foundationAdminApi
      .workbench(id)
      .then(setView)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  return (
    <div className="site00-admin-page">
      <header>
        <h1>Execution workbench (P15)</h1>
        <p>
          <Link to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', id)}>← Project command</Link>
        </p>
      </header>
      {error && <p>{error}</p>}
      {view && <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(view, null, 2)}</pre>}
    </div>
  );
}
