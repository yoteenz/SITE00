/**
 * PROJECT DETAIL (mobile) — identity, status, production SUMMARIES, requests, deliverables.
 * Summaries are not workspace embeds; actions send requests into Production.
 */

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import { productionRequestScope, productionRequestTitle } from '../../../../shared/site00-production-workspace/requestCatalog.js';
import { submitProductionRequest, useProductionRequests } from '../../state/productionRequestStore';
import { site00ProjectExperienceWorkspacePath } from '../../config/routes';
import { PW_IMG, projectImage } from '../production/productionImagery';
import { PwFrame } from '../production/PwFrame';
import {
  IconArrow,
  IconBack,
  IconPlus,
  PwButton,
  PwChip,
  PwRow,
  PwTabs,
  type PwChipTone,
} from '../production/PwPrimitives';
import { ProjectActionsSheet } from './ProjectActionsSheet';

type DetailTab = 'overview' | 'requests' | 'deliverables';
type Pillar = 'design' | 'experience' | 'expression';

const PILLAR_LABEL: Record<Pillar, string> = { design: 'Design', experience: 'Experience', expression: 'Expression' };

function pillarOf(module: string): Pillar {
  const m = module.toUpperCase();
  if (m.includes('EXPERIENCE')) return 'experience';
  if (m.includes('EVOLVE') || m.includes('EXPRESSION') || m.includes('CAMPAIGN') || m.includes('CONTENT')) return 'expression';
  return 'design';
}

function ago(iso: string | null): string {
  if (!iso) return 'recently';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} d ago`;
}

const REQ_TONE: Record<string, PwChipTone> = { QUEUED: 'gray', IN_PROGRESS: 'blue', AWAITING_APPROVAL: 'orange', COMPLETE: 'green' };

export function PersonalProjectMobileDetail({
  projectSlug,
  operatingState,
}: {
  projectSlug: string;
  operatingState: GeneralizedProjectOperatingState;
}) {
  const [params, setParams] = useSearchParams();
  const tab = (['overview', 'requests', 'deliverables'].includes(params.get('tab') ?? '') ? params.get('tab') : 'overview') as DetailTab;
  const setTab = (t: DetailTab) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    setParams(next, { replace: true });
  };
  const [menu, setMenu] = useState(false);
  const [reqTab, setReqTab] = useState<'requests' | 'approvals'>('requests');
  const [pillar, setPillar] = useState<Pillar>('design');
  const [updates, setUpdates] = useState(false);
  const slug = projectSlug.toLowerCase();
  const sum = operatingState.summary;
  const requests = useProductionRequests(slug);
  const heroImage = slug === 'ndxbook' ? PW_IMG.detailHero : projectImage(slug);
  const pending = operatingState.reviewsState.filter((r) => r.status === 'PENDING');
  const bs = operatingState.builderState;
  const ev = operatingState.evolveState;

  const summaryRows: { id: Pillar; title: string; status: string; tone: PwChipTone | null; sub?: string; to: string; thumb: string }[] = useMemo(
    () => [
      {
        id: 'design',
        title: 'Design',
        status: bs ? (bs.inReview > 0 ? 'In Review' : bs.complete > 0 ? 'Complete' : 'In Production') : 'In Production',
        tone: bs && bs.inReview > 0 ? 'green' : null,
        sub: bs ? `${bs.pages} pages` : undefined,
        to: `/client/projects/${slug}/reviews`,
        thumb: PW_IMG.pillar.DESIGN,
      },
      {
        id: 'experience',
        title: 'Experience',
        status: 'In Production',
        tone: null,
        to: site00ProjectExperienceWorkspacePath(slug, 'build-a-wig', 'review'),
        thumb: PW_IMG.pillar.EXPERIENCE,
      },
      {
        id: 'expression',
        title: 'Expression',
        status: ev && ev.contentInProduction > 0 ? `${ev.contentInProduction} in production` : 'Not started',
        tone: null,
        to: `/projects/${slug}/content-operations/campaign-board`,
        thumb: PW_IMG.pillar.EXPRESSION,
      },
    ],
    [bs, ev, slug],
  );

  const deliverables = operatingState.reviewsState.filter((r) => pillarOf(r.module) === pillar);

  return (
    <PwFrame variant="projects">
      <main data-testid="personal-project-detail">
        <div
          className="pw-detail__hero"
          style={
            heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: '75% 20%' }
            : undefined
          }
        >
          <div className="pw-head__bar" style={{ position: 'absolute', top: 6, left: 16, right: 16 }}>
            <Link to="/projects" className="pw-head__back">
              <IconBack />
              <span>Project</span>
            </Link>
            <button type="button" className="pw-pcard__more" style={{ position: 'static', border: '1px solid var(--pw-line-2)', borderRadius: '50%' }} onClick={() => setMenu(true)} aria-label="Project actions" data-testid="project-actions-open">
              <IconPlus />
            </button>
          </div>
          <h1 className="pw-detail__name">{sum.displayName}</h1>
          {sum.tagline ? <p className="pw-detail__tag">{sum.tagline}</p> : null}
          <div className="pw-detail__bar">
            <span className="pw-pcard__status">{sum.phase}</span>
          </div>
          <div className="pw-detail__bar">
            <span className="pw-progress">
              <i style={{ width: `${sum.progressPercent}%` }} />
            </span>
            <span className="pw-pcard__pct">{sum.progressPercent}%</span>
          </div>
        </div>

        <PwTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'requests', label: 'Requests' },
            { id: 'deliverables', label: 'Deliverables' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'overview' ?
          <div data-testid="detail-overview">
            <h2 className="pw-section" style={{ marginTop: 4 }}>Production overview</h2>
            <div className="pw-list">
              {summaryRows.map((r) => (
                <PwRow
                  key={r.id}
                  to={r.to}
                  thumb={r.thumb}
                  title={r.title}
                  sub={[r.tone ? null : r.status, r.sub].filter(Boolean).join(' · ')}
                  chip={r.tone ? <PwChip tone={r.tone}>{r.status}</PwChip> : undefined}
                  testId={`overview-${r.id}`}
                />
              ))}
            </div>
            <div className="pw-cta">
              <PwButton onClick={() => setUpdates((v) => !v)} testId="view-latest-updates">
                View latest updates <IconArrow />
              </PwButton>
            </div>
            {updates ?
              <div className="pw-list" style={{ marginTop: 12 }} data-testid="latest-updates">
                {operatingState.activity.filter((a) => a.clientSafe).slice(0, 6).map((a) => (
                  <div key={a.id} className="pw-card" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
                    {a.summary}
                    <div className="pw-label" style={{ marginTop: 6 }}>{ago(a.timestamp)}</div>
                  </div>
                ))}
                {operatingState.activity.length === 0 ?
                  <div className="pw-empty">NO UPDATES YET</div>
                : null}
              </div>
            : null}
            {operatingState.needsYourEye.length ?
              <>
                <h2 className="pw-section">Needs your eye</h2>
                <div className="pw-list">
                  {operatingState.needsYourEye.slice(0, 4).map((n) => (
                    <PwRow key={n.id} to={n.href} title={n.label} sub={n.module} chip={<PwChip tone={n.priority === 'HIGH' ? 'red' : 'amber'}>{n.priority}</PwChip>} />
                  ))}
                </div>
              </>
            : null}
          </div>
        : null}

        {tab === 'requests' ?
          <div data-testid="detail-requests">
            <div className="pw-tabs" style={{ marginTop: -14 }} role="tablist">
              <button type="button" role="tab" aria-selected={reqTab === 'requests'} className={`pw-tabs__tab${reqTab === 'requests' ? ' is-active' : ''}`} onClick={() => setReqTab('requests')}>
                REQUESTS
              </button>
              <button type="button" role="tab" aria-selected={reqTab === 'approvals'} className={`pw-tabs__tab${reqTab === 'approvals' ? ' is-active' : ''}`} onClick={() => setReqTab('approvals')}>
                APPROVALS {pending.length ? <i className="pw-tabs__badge">{pending.length}</i> : null}
              </button>
            </div>
            {reqTab === 'requests' ?
              requests.length ?
                <div className="pw-list">
                  {requests.map((r) => (
                    <div key={r.id} className="pw-req" data-testid="project-request">
                      <span className="pw-req__thumb" style={{ backgroundImage: `url(${r.targetWorkspace === 'DESIGN' ? PW_IMG.request.design : r.targetSubWorkspace === 'sets' ? PW_IMG.request.set : r.targetSubWorkspace === 'casting' ? PW_IMG.request.character : PW_IMG.request.content})` }} aria-hidden />
                      <span className="pw-req__text">
                        <span className="pw-req__title">{productionRequestTitle(r.kind)}</span>
                        <span className="pw-req__tag">{productionRequestScope(r.kind)}</span>
                        <span className="pw-req__foot">
                          <span>{ago(r.createdAt)}</span>
                          <PwChip tone={REQ_TONE[r.status] ?? 'gray'}>{r.status.replace(/_/g, ' ')}</PwChip>
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              : (
                <div className="pw-empty">
                  <strong>NO REQUESTS YET</strong>
                  USE + TO SEND A STRUCTURED REQUEST INTO PRODUCTION.
                </div>
              )
            : pending.length ?
              <div className="pw-list">
                {pending.map((r) => (
                  <PwRow key={r.id} to={r.href} title={r.label} sub={PILLAR_LABEL[pillarOf(r.module)]} chip={<PwChip tone="orange">Awaiting</PwChip>} />
                ))}
              </div>
            : (
              <div className="pw-empty">
                <strong>NOTHING TO APPROVE</strong>
                DELIVERABLES APPEAR HERE WHEN PRODUCTION SENDS THEM FOR REVIEW.
              </div>
            )}
          </div>
        : null}

        {tab === 'deliverables' ?
          <div data-testid="detail-deliverables">
            <div className="pw-tabs" style={{ marginTop: -14 }} role="tablist">
              {(Object.keys(PILLAR_LABEL) as Pillar[]).map((p) => (
                <button key={p} type="button" role="tab" aria-selected={pillar === p} className={`pw-tabs__tab${pillar === p ? ' is-active' : ''}`} onClick={() => setPillar(p)}>
                  {PILLAR_LABEL[p].toUpperCase()}
                </button>
              ))}
            </div>
            {deliverables.length ?
              <div className="pw-stack">
                <div className="pw-deliv-hero" style={{ backgroundImage: `url(${PW_IMG.pillar[pillar.toUpperCase() as 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION']})` }}>
                  <div className="pw-deliv-hero__cap">
                    {deliverables[0]!.label}
                    <small>{PILLAR_LABEL[pillar]}</small>
                  </div>
                </div>
                <div className="pw-list">
                  {deliverables.slice(1).map((d) => (
                    <PwRow key={d.id} to={d.href} title={d.label} sub={d.status} chip={<PwChip tone={d.status === 'APPROVED' ? 'green' : d.status === 'REJECTED' ? 'red' : 'orange'}>{d.status}</PwChip>} />
                  ))}
                </div>
                <PwButton to={deliverables[0]!.href ?? `/client/projects/${slug}/reviews`} testId="deliverable-approve">
                  Approve <IconArrow />
                </PwButton>
                <PwButton
                  variant="ghost"
                  onClick={() => {
                    submitProductionRequest({ projectSlug: slug, kind: pillar === 'design' ? 'DESIGN_REVISION' : pillar === 'experience' ? 'EXPERIENCE_WORLD_APPROVAL' : 'EXPRESSION_LOOK_APPROVAL' });
                    setTab('requests');
                  }}
                  testId="deliverable-request-revision"
                >
                  Request revision
                </PwButton>
              </div>
            : (
              <div className="pw-empty" data-testid="deliverables-empty">
                <strong>NOTHING TO REVIEW</strong>
                {PILLAR_LABEL[pillar].toUpperCase()} DELIVERABLES APPEAR HERE WHEN PRODUCTION SENDS THEM FOR REVIEW.
              </div>
            )}
          </div>
        : null}
      </main>
      <ProjectActionsSheet open={menu} projectSlug={slug} projectName={sum.displayName} onClose={() => setMenu(false)} />
    </PwFrame>
  );
}
