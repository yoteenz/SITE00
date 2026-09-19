import { useParams } from 'react-router-dom';
import { useClientProjectRoom } from '../../hooks/useClientProjectRoom';
import {
  ClientProjectRoomOverview,
  ClientProjectRoomRightRail,
} from '../../components/clientProjectRoom/ClientProjectRoomOverview';
import { ClientProjectRoomShell } from '../../components/clientProjectRoom/ClientProjectRoomShell';

export default function ClientProjectRoomOverviewPage() {
  const { projectSlug = 'preview-client-room' } = useParams();
  const { data, state, error, reload } = useClientProjectRoom(projectSlug);

  if (state === 'loading' || state === 'idle') {
    return <div className="site00-cpr site00-cpr-loading">LOADING PROJECT ROOM…</div>;
  }

  if (state === 'error' || !data) {
    return (
      <div className="site00-cpr site00-cpr-error">
        {error ?? 'Could not load project room.'}
        <div>
          <button type="button" onClick={() => void reload()}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientProjectRoomShell
      manifest={data.manifest}
      activeSection="overview"
      rightRail={<ClientProjectRoomRightRail viewModel={data} />}
    >
      <ClientProjectRoomOverview viewModel={data} />
    </ClientProjectRoomShell>
  );
}
