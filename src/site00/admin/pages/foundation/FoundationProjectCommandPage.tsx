import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi } from '../../services/foundationAdminApi';

export default function FoundationProjectCommandPage() {
  const { id = '' } = useParams();
  const [snap, setSnap] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    foundationAdminApi
      .projectCommand(id)
      .then(setSnap)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  return (
    <div className="site00-admin-page">
      <header>
        <h1>Project command (P14)</h1>
        <p>
          <Link to={SITE00_ROUTES.digitalFoundationPipeline}>← Pipeline</Link>
          {' · '}
          <Link to={SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', id)}>Detail</Link>
        </p>
      </header>
      {error && <p>{error}</p>}
      {snap && (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(snap, null, 2)}</pre>
      )}
    </div>
  );
}
