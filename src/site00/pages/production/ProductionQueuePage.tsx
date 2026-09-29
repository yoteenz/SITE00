import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productionRequestScope, productionRequestTitle } from '../../../../shared/site00-production-workspace/requestCatalog.js';
import { productionWorkspacePath } from '../../../../shared/site00-production-workspace/routes.js';
import { PW_IMG } from '../../components/production/productionImagery';
import { PwFrame } from '../../components/production/PwFrame';
import { PwChip, PwScreenHead, PwTabs, type PwChipTone } from '../../components/production/PwPrimitives';
import { useProductionRequests, type StoredProductionRequest } from '../../state/productionRequestStore';

type Source = 'ALL' | 'PROJECT' | 'CLIENT_SITE' | 'SERVICE';

const STATUS_TONE: Record<StoredProductionRequest['status'], PwChipTone> = {
  QUEUED: 'gray',
  IN_PROGRESS: 'blue',
  AWAITING_APPROVAL: 'orange',
  COMPLETE: 'green',
};

function ago(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
}

export function ProductionQueuePage() {
  const [source, setSource] = useState<Source>('ALL');
  const requests = useProductionRequests();
  // Every request stored today originates from a Personal Project; client/site and service
  // pipelines will populate the other sources.
  const shown = source === 'ALL' || source === 'PROJECT' ? requests : [];

  return (
    <PwFrame variant="production">
      <main data-testid="production-queue">
        <PwScreenHead backTo="/production" backLabel="Production" title="Queue" sub="Work received from projects and services" />
        <PwTabs
          tabs={[
            { id: 'ALL', label: 'All' },
            { id: 'PROJECT', label: 'Project' },
            { id: 'CLIENT_SITE', label: 'Client / site' },
            { id: 'SERVICE', label: 'Service' },
          ]}
          active={source}
          onChange={setSource}
          badge={{ ALL: requests.length }}
        />
        {shown.length ?
          <div className="pw-list">
            {shown.map((r) => (
              <Link
                key={r.id}
                className="pw-req"
                to={r.targetWorkspace === 'GENERAL' ? `/production/${r.projectSlug}` : productionWorkspacePath(r.projectSlug, r.targetWorkspace, r.targetSubWorkspace ?? '')}
                data-testid="queue-request"
              >
                <span className="pw-req__thumb" style={{ backgroundImage: `url(${r.targetWorkspace === 'DESIGN' ? PW_IMG.request.design : r.targetSubWorkspace === 'sets' ? PW_IMG.request.set : r.targetSubWorkspace === 'casting' ? PW_IMG.request.character : PW_IMG.request.content})` }} aria-hidden />
                <span className="pw-req__text">
                  <span className="pw-req__title">{productionRequestTitle(r.kind)}</span>
                  <span className="pw-req__tag">{r.projectSlug.toUpperCase()} · {productionRequestScope(r.kind)}</span>
                  <span className="pw-req__foot">
                    <span>PROJECT · {ago(r.createdAt)}</span>
                    <PwChip tone={STATUS_TONE[r.status]}>{r.status.replace(/_/g, ' ')}</PwChip>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        : (
          <div className="pw-empty" data-testid="queue-empty">
            <strong>QUEUE CLEAR</strong>
            {source === 'ALL' || source === 'PROJECT' ?
              'NO REQUESTS FROM PROJECTS YET. THEY APPEAR HERE WHEN A PROJECT SENDS ONE.'
            : 'NO WORK FROM THIS SOURCE YET. CLIENT / SITE AND SERVICE PIPELINES DELIVER HERE.'}
          </div>
        )}
        <p className="pw-label" style={{ marginTop: 16 }}>Requests are held on this device until the queue service is connected.</p>
      </main>
    </PwFrame>
  );
}
