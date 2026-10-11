import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { resolveBrandForCampaign } from '../../../../../shared/site00-correspondence-studio/brandFirewall.js';
import { DEVICE_PREVIEW_MODES, type DevicePreviewMode } from '../../../../../shared/site00-correspondence-studio/types.js';
import { getCorrespondenceWorkspace } from '../../../../../shared/site00-correspondence-studio/workspace.js';
import {
  copyContractFor,
  filterLibraryRows,
  listLibraryRows,
  resolveVersion,
  reviewStateLabel,
  type LibraryClassification,
  type LibraryRow,
} from '../../../../../shared/site00-correspondence-studio/workspaceLibrary.js';
import { getSupabase } from '../../../../utils/supabase';
import { CsActions } from '../../components/correspondence/workspace/CsActions';
import { CsIcon, type IconName } from '../../components/correspondence/workspace/CsIcons';
import { CsInspector, type InspectorTab } from '../../components/correspondence/workspace/CsInspector';
import { CsLibrary, type LibraryMode } from '../../components/correspondence/workspace/CsLibrary';
import { CsPreviewStage, type PreviewStageHandle } from '../../components/correspondence/workspace/CsPreviewStage';
import { useEmailDocument, useLibraryThumbnails } from '../../components/correspondence/workspace/emailDocument';
import { useWorkspaceReview } from '../../components/correspondence/workspace/useWorkspaceReview';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

const ENV = '/site00-correspondence-studio/environment';

type Panel = 'library' | 'preview' | 'inspector';

type NavItem = { id: string; label: string; icon: IconName; mode?: LibraryMode };

const NAV: NavItem[] = [
  { id: 'templates', label: 'TEMPLATES', icon: 'templates', mode: 'emails' },
  { id: 'campaigns', label: 'CAMPAIGNS', icon: 'campaigns', mode: 'campaigns' },
  { id: 'audiences', label: 'AUDIENCES', icon: 'audiences' },
  { id: 'assets', label: 'ASSETS', icon: 'assets' },
  { id: 'analytics', label: 'ANALYTICS', icon: 'analytics' },
  { id: 'deliveries', label: 'DELIVERIES', icon: 'deliveries', mode: 'deliveries' },
  { id: 'settings', label: 'SETTINGS', icon: 'settings' },
];

function initialDevice(param: string | null): DevicePreviewMode {
  if (param && (DEVICE_PREVIEW_MODES as readonly string[]).includes(param)) return param as DevicePreviewMode;
  return typeof window !== 'undefined' && window.innerWidth < 700 ? 'mobile' : 'desktop';
}

function useOperatorLabel() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) setLabel(email.split('@')[0]?.replace(/\./g, ' ').toUpperCase() || null);
    });
  }, []);
  return label;
}

export default function CorrespondenceWorkspacePage() {
  const { projectId, campaignId, templateId } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const manifest = getCorrespondenceWorkspace();
  const review = useWorkspaceReview(manifest);
  const operator = useOperatorLabel();
  const stageRef = useRef<PreviewStageHandle>(null);

  const routeKind = templateId ? 'email' : campaignId ? 'campaign' : projectId ? 'project' : 'home';
  const routeCampaign = campaignId ? manifest.projects.flatMap((p) => p.campaigns).find((c) => c.campaign_id === campaignId) : undefined;

  const brandId = useMemo(() => {
    if (routeCampaign) return routeCampaign.brand_authority_id;
    const param = search.get('brand');
    if (param && manifest.brand_authorities.some((b) => b.brand_authority_id === param)) return param;
    const withCampaigns = manifest.projects.flatMap((p) => p.campaigns)[0]?.brand_authority_id;
    return withCampaigns ?? manifest.brand_authorities[0].brand_authority_id;
  }, [routeCampaign, search, manifest]);
  const brand = resolveBrandForCampaign(manifest, brandId);

  const [mode, setMode] = useState<LibraryMode>(routeKind === 'project' ? 'campaigns' : 'emails');
  useEffect(() => {
    if (routeKind === 'project') setMode('campaigns');
    else if (routeKind === 'campaign') setMode('emails');
  }, [routeKind, projectId, campaignId]);

  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<LibraryClassification | 'all'>('all');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [focus, setFocus] = useState(false);
  const [panel, setPanel] = useState<Panel>(routeKind === 'email' ? 'preview' : 'library');
  const [navOpen, setNavOpen] = useState(false);
  const [device, setDeviceState] = useState<DevicePreviewMode>(() => initialDevice(search.get('device')));

  const scopeCampaignId = routeKind === 'campaign' || routeKind === 'project' ? campaignId ?? null : null;
  const brandCampaigns = useMemo(
    () => manifest.projects.flatMap((p) => p.campaigns).filter((c) => c.brand_authority_id === brandId && (!projectId || c.project_id === projectId)),
    [manifest, brandId, projectId],
  );
  const scopeRows = useMemo(
    () => listLibraryRows(manifest, { brandAuthorityId: brandId, campaignId: scopeCampaignId }),
    [manifest, brandId, scopeCampaignId],
  );
  const stateOfRow = useCallback((row: LibraryRow) => review.stateOf(row.template_id, row.current_version), [review]);
  const visibleRows = useMemo(
    () =>
      filterLibraryRows(
        scopeRows,
        {
          classification: mode === 'archive' ? 'all' : family,
          query,
          reviewStates: mode === 'archive' ? ['archived'] : reviewOnly ? ['founder_review'] : null,
        },
        stateOfRow,
      ),
    [scopeRows, mode, family, query, reviewOnly, stateOfRow],
  );
  const awaitingReview = useMemo(() => scopeRows.filter((r) => stateOfRow(r) === 'founder_review').length, [scopeRows, stateOfRow]);

  const thumbnailPaths = useMemo(
    () =>
      scopeRows
        .map((r) => (r.current_version.preview_source.kind === 'repository_html' ? r.current_version.preview_source.publicPreviewPath : undefined))
        .filter((p): p is string => Boolean(p)),
    [scopeRows],
  );
  const thumbnails = useLibraryThumbnails(thumbnailPaths);

  const selectedRow =
    (templateId ? scopeRows.find((r) => r.template_id === templateId) ?? listLibraryRows(manifest, { brandAuthorityId: brandId }).find((r) => r.template_id === templateId) : undefined) ??
    scopeRows.find((r) => r.composed) ??
    scopeRows[0] ??
    null;
  const entry = selectedRow ? manifest.templates[selectedRow.template_id] : null;
  const versionParam = search.get('v');
  const version = useMemo(() => (entry ? resolveVersion(entry, versionParam) : null), [entry, versionParam]);
  const docState = useEmailDocument(version);
  const contract = selectedRow ? copyContractFor(selectedRow.template_id) : null;
  const campaign = selectedRow ? manifest.projects.flatMap((p) => p.campaigns).find((c) => c.campaign_id === selectedRow.campaign_id) ?? null : null;
  const bundle = entry && version ? review.bundleOf(entry.template_id, version) : null;
  const selectedState = bundle?.review_state ?? 'draft';
  const canApprove = docState.status === 'ready';

  const updateSearch = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      setSearch(next, { replace: true });
    },
    [search, setSearch],
  );

  const setDevice = (d: DevicePreviewMode) => {
    setDeviceState(d);
    updateSearch({ device: d });
  };

  const carry = () => {
    const keep = new URLSearchParams();
    const d = search.get('device');
    if (d) keep.set('device', d);
    const s = keep.toString();
    return s ? `?${s}` : '';
  };

  const selectRow = (row: LibraryRow) => {
    setPanel('preview');
    navigate(`${SITE00_ADMIN_ROUTES.correspondenceEmail(row.project_id, row.campaign_id, row.template_id)}${carry()}`);
  };

  const selectCampaign = (c: { project_id: string; campaign_id: string } | null) => {
    setMode('emails');
    navigate(c ? `${SITE00_ADMIN_ROUTES.correspondenceCampaign(c.project_id, c.campaign_id)}${carry()}` : `${SITE00_ADMIN_ROUTES.correspondenceStudio}${carry()}`);
  };

  const selectBrand = (id: string) => {
    navigate(`${SITE00_ADMIN_ROUTES.correspondenceStudio}?brand=${encodeURIComponent(id)}`);
  };

  const selectMode = (m: LibraryMode) => {
    setMode(m);
    setPanel('library');
    setNavOpen(false);
  };

  const setState = (state: Parameters<typeof review.setState>[2]) => {
    if (entry && version) review.setState(entry.template_id, version, state);
  };

  const delivery = review.deliveryFor(campaign?.campaign_id ?? scopeCampaignId ?? brandCampaigns[0]?.campaign_id ?? null);
  const title = entry ? `${selectedRow?.code} · ${entry.display_name}` : 'NO TEMPLATE';

  const actions = (className?: string) => (
    <CsActions state={selectedState} canApprove={canApprove} onSetState={setState} className={className} />
  );

  const studioNav = (
    <>
      <nav className="csw-nav__list" aria-label="Studio">
        {NAV.map((item) =>
          item.mode ? (
            <button
              key={item.id}
              type="button"
              className={`csw-nav__item${mode === item.mode || (item.mode === 'emails' && mode === 'archive') ? ' is-active' : ''}`}
              aria-current={mode === item.mode ? 'page' : undefined}
              onClick={() => selectMode(item.mode as LibraryMode)}
            >
              <CsIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ) : (
            <div key={item.id} className="csw-nav__item is-unavailable" aria-disabled="true" title={`${item.label} is not part of Correspondence Studio V1`}>
              <CsIcon name={item.icon} />
              <span>{item.label}</span>
              <em>NOT IN V1</em>
            </div>
          ),
        )}
      </nav>
      <div className="csw-nav__brand">
        <label className="csw-label" htmlFor="csw-brand">
          ACTIVE BRAND
        </label>
        <div className="csw-select">
          <select id="csw-brand" value={brandId} onChange={(e) => selectBrand(e.target.value)}>
            {manifest.brand_authorities.map((b) => (
              <option key={b.brand_authority_id} value={b.brand_authority_id}>
                {b.display_name}
              </option>
            ))}
          </select>
          <CsIcon name="chevron-down" size={14} />
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`csw${focus ? ' is-focus' : ''}${navOpen ? ' is-nav-open' : ''}`}
      data-panel={panel}
      style={{ ['--csw-env-gutter' as string]: `url(${ENV}/cs-env-red-glass-tall.webp)`, ['--csw-env-floor' as string]: `url(${ENV}/cs-env-terrace.webp)` }}
    >
      <div className="csw-env" aria-hidden="true">
        <span className="csw-env__gutter" />
        <span className="csw-env__floor" />
        <span className="csw-env__wall" />
      </div>

      <header className="csw-top">
        <Link className="csw-top__word" to={SITE00_ADMIN_ROUTES.dashboard} title="SITE 00 control">
          SITE 00
        </Link>
        <p className="csw-top__crumbs">
          <span>STUDIO WORLD</span>
          <i aria-hidden="true">/</i>
          <span>CORRESPONDENCE STUDIO</span>
        </p>
        <label className="csw-top__search">
          <CsIcon name="search" size={15} />
          <span className="csw-sr">Search templates, subjects or tags</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (mode !== 'emails' && mode !== 'archive') setMode('emails');
            }}
            placeholder="SEARCH TEMPLATES, SUBJECTS, OR TAGS…"
          />
        </label>
        <button
          type="button"
          className={`csw-top__bell${reviewOnly ? ' is-on' : ''}`}
          aria-pressed={reviewOnly}
          onClick={() => {
            setReviewOnly((v) => !v);
            setMode('emails');
            setPanel('library');
          }}
          title={`${awaitingReview} version(s) awaiting founder review`}
        >
          <CsIcon name="bell" size={20} />
          {awaitingReview ? <b>{awaitingReview}</b> : null}
          <span className="csw-sr">{awaitingReview} awaiting founder review</span>
        </button>
        <div className="csw-top__who" title={operator ? `Signed in as ${operator}` : undefined}>
          <span className="csw-top__avatar" aria-hidden="true" />
          <span>
            <b>FOUNDER MODE</b>
            <small>{brand.display_name}</small>
          </span>
        </div>
        <button type="button" className="csw-top__menu" aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
          <CsIcon name={navOpen ? 'close' : 'menu'} size={20} />
          <span className="csw-sr">Studio menu</span>
        </button>
      </header>

      <aside className="csw-nav" aria-label="Correspondence Studio">
        <div className="csw-nav__id">
          <p className="csw-nav__kicker">CORRESPONDENCE</p>
          <p className="csw-nav__studio" aria-hidden="true">
            <span>STUDIO</span>
          </p>
          <p className="csw-nav__desc">DESIGN. REFINE. APPROVE. DELIVER. A CURATED ENVIRONMENT FOR BRAND-SPECIFIC CORRESPONDENCE.</p>
        </div>
        {studioNav}
        <figure className="csw-nav__card">
          <img src={`${ENV}/cs-env-doorway.webp`} alt="" />
          <figcaption>DIGITAL LOCATIONS FOR VISIONARIES.</figcaption>
        </figure>
        <Link className="csw-nav__legacy" to={SITE00_ADMIN_ROUTES.emailPack}>
          EMAIL PACK DEBUG ↗
        </Link>
      </aside>

      <div className="csw-drawer-nav" role="dialog" aria-label="Studio menu" hidden={!navOpen}>
        {studioNav}
        <Link className="csw-nav__legacy" to={SITE00_ADMIN_ROUTES.emailPack}>
          EMAIL PACK DEBUG ↗
        </Link>
      </div>

      <section className="csw-mast" aria-label="Correspondence Studio">
        <img className="csw-mast__photo" src={`${ENV}/cs-env-pavilion.webp`} alt="" />
        <div className="csw-mast__glass">
          <div className="csw-mast__title">
            <p className="csw-mast__kicker">SITE 00</p>
            <h1>CORRESPONDENCE STUDIO</h1>
            <p className="csw-mast__sub">EDITORIAL EMAIL DESIGN AND PUBLISHING ENVIRONMENT</p>
          </div>
          <span className="csw-mast__slash" aria-hidden="true" />
          <ul className="csw-mast__list">
            <li>BRAND-SPECIFIC</li>
            <li>TEMPLATES</li>
            <li>CAMPAIGNS</li>
            <li>AUTOMATIONS</li>
            <li>PERFORMANCE</li>
          </ul>
        </div>
        <span className="csw-mast__stone" aria-hidden="true" />
      </section>

      <div className="csw-tasks" role="tablist" aria-label="Task">
        {(
          [
            ['library', 'LIBRARY'],
            ['preview', 'PREVIEW'],
            ['inspector', 'REVIEW'],
          ] as [Panel, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={panel === id} className={panel === id ? 'is-active' : ''} onClick={() => setPanel(id)}>
            {label}
          </button>
        ))}
      </div>

      <main className="csw-work">
        <div className="csw-work__library">
          <CsLibrary
            mode={mode}
            onMode={selectMode}
            query={query}
            onQuery={setQuery}
            family={family}
            onFamily={setFamily}
            reviewOnly={reviewOnly}
            onReviewOnly={setReviewOnly}
            scopeRows={scopeRows}
            visibleRows={visibleRows}
            selectedId={selectedRow?.template_id ?? null}
            onSelect={selectRow}
            reviewStateOf={stateOfRow}
            thumbnails={thumbnails}
            campaigns={brandCampaigns}
            activeCampaignId={scopeCampaignId}
            onCampaign={selectCampaign}
            delivery={delivery}
          />
        </div>

        <section className="csw-stage" aria-label="Email preview">
          <header className="csw-stage__bar">
            <button type="button" className="csw-stage__drawer-btn" onClick={() => setPanel(panel === 'library' ? 'preview' : 'library')} aria-pressed={panel === 'library'}>
              LIBRARY
            </button>
            <p className="csw-stage__title">
              <b>{title}</b>
              <span className={`csw-dot csw-state--${selectedState}`} aria-hidden="true" />
              <span className="csw-stage__state">{reviewStateLabel(selectedState)}</span>
            </p>
            {entry && entry.versions.length > 1 ? (
              <label className="csw-version">
                <span className="csw-sr">Version</span>
                <select value={version?.version_id} onChange={(e) => updateSearch({ v: e.target.value })}>
                  {entry.versions.map((v) => (
                    <option key={v.version_id} value={v.version_id}>
                      {v.label}
                      {v.version_id === entry.current_version_id ? ' · CURRENT' : ''}
                    </option>
                  ))}
                </select>
                <CsIcon name="chevron-down" size={13} />
              </label>
            ) : version ? (
              <span className="csw-version csw-version--single">{version.label}</span>
            ) : null}
            <div className="csw-devices" role="group" aria-label="Preview device">
              {DEVICE_PREVIEW_MODES.map((d) => (
                <button key={d} type="button" aria-pressed={device === d} className={device === d ? 'is-active' : ''} onClick={() => setDevice(d)}>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
            <button type="button" className="csw-icon-btn csw-stage__expand" aria-pressed={focus} onClick={() => setFocus((v) => !v)} title={focus ? 'Show library and inspector' : 'Focus the preview'}>
              <CsIcon name={focus ? 'collapse' : 'expand'} size={17} />
              <span className="csw-sr">{focus ? 'Exit focus' : 'Focus preview'}</span>
            </button>
            <button type="button" className="csw-stage__drawer-btn" onClick={() => setPanel(panel === 'inspector' ? 'preview' : 'inspector')} aria-pressed={panel === 'inspector'}>
              INSPECTOR
            </button>
          </header>
          {version ? (
            <CsPreviewStage ref={stageRef} state={docState} device={device} title={title} contract={contract} />
          ) : (
            <p className="csw-empty">NO TEMPLATES ARE REGISTERED FOR THIS BRAND AUTHORITY.</p>
          )}
          {entry && version ? actions('csw-actions--docked') : null}
        </section>

        <div className="csw-work__inspector">
          {entry && version && campaign && bundle ? (
            <CsInspector
              tab={inspectorTab}
              onTab={setInspectorTab}
              entry={entry}
              version={version}
              docState={docState}
              contract={contract}
              brand={resolveBrandForCampaign(manifest, campaign.brand_authority_id)}
              campaign={campaign}
              bundle={bundle}
              versionStateOf={(v) => review.stateOf(entry.template_id, v)}
              onSelectVersion={(id) => updateSearch({ v: id })}
              onSetState={setState}
              onComment={(body) => review.comment(entry.template_id, version, body)}
              onJumpToBlock={(block) => {
                if (panel === 'inspector' && window.matchMedia('(max-width: 1199px)').matches) {
                  setPanel('preview');
                  window.setTimeout(() => stageRef.current?.scrollToBlock(block.index), 80);
                  return true;
                }
                return stageRef.current?.scrollToBlock(block.index) ?? false;
              }}
              footer={actions()}
            />
          ) : (
            <section className="csw-inspector">
              <p className="csw-empty">SELECT A TEMPLATE TO INSPECT IT.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
