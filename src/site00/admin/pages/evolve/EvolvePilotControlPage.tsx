import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi, type ExpandedReadinessPayload } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

import type { SafeConnectionView } from '../../types/evolve';

type ConfigItem = {
  key: string;
  label: string;
  status: string;
  lastValidated: string | null;
  validationResult: string;
};

type ExpandedReadiness = ExpandedReadinessPayload;

type AssessmentForm = {
  organizationPurpose: string;
  whatItOffers: string;
  targetAudience: string;
  primaryObjective: string;
  secondaryObjectives: string;
  initialChannelPriority: string;
  contentGoals: string;
  conversionTarget: string;
  brandVoice: string;
  visualIdentityStatus: string;
  publishingCadence: string;
  approvalPreference: string;
  websiteDestination: string;
  brandAssetsAvailable: string;
};

const EMPTY_ASSESSMENT: AssessmentForm = {
  organizationPurpose: '',
  whatItOffers: '',
  targetAudience: '',
  primaryObjective: '',
  secondaryObjectives: '',
  initialChannelPriority: 'INSTAGRAM',
  contentGoals: '',
  conversionTarget: '',
  brandVoice: '',
  visualIdentityStatus: '',
  publishingCadence: '',
  approvalPreference: 'OWNER_APPROVAL_REQUIRED',
  websiteDestination: '',
  brandAssetsAvailable: '',
};

function configStatusClass(status: string): string {
  if (status === 'CONFIGURED') return evolveStatusPillClass('READY');
  if (status === 'INVALID') return evolveStatusPillClass('ERROR');
  return evolveStatusPillClass('NOT_STARTED');
}

export default function EvolvePilotControlPage() {
  const { orgSlug = 'ndxbook' } = useParams<{ orgSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [readiness, setReadiness] = useState<ExpandedReadiness | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<{ items: ConfigItem[]; exactCallbackUrl: string; allConfigured: boolean } | null>(null);
  const [ndxState, setNdxState] = useState<Record<string, unknown> | null>(null);
  const [fenceReadiness, setFenceReadiness] = useState<Record<string, unknown> | null>(null);
  const [socialConnection, setSocialConnection] = useState<SafeConnectionView | null>(null);
  const [discoveredAccounts, setDiscoveredAccounts] = useState<Array<Record<string, string>>>([]);
  const [requiresSelection, setRequiresSelection] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [capabilities, setCapabilities] = useState<Record<string, string> | null>(null);
  const [analyticsBaseline, setAnalyticsBaseline] = useState<Record<string, unknown> | null>(null);
  const [firstPost, setFirstPost] = useState<Record<string, unknown> | null>(null);
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(EMPTY_ASSESSMENT);
  const [draftCaption, setDraftCaption] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  const oauthParam = searchParams.get('oauth');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, payload, { overview }, providerCfg, state, fence, connections] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.pilotReadiness(orgSlug),
        site00EvolveApi.overview(orgSlug),
        site00EvolveApi.providerConfig(),
        orgSlug === 'ndxbook' ? site00EvolveApi.ndxbookState() : Promise.resolve(null),
        site00EvolveApi.fenceReadiness(orgSlug),
        site00EvolveApi.connections(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setReadiness(payload);
      setConfig(providerCfg);
      setNdxState(state);
      setFenceReadiness(fence);
      const social = (connections.buckets.SOCIAL ?? [])[0] ?? null;
      setSocialConnection(social);
      const fp = await site00EvolveApi.firstPostCandidate(orgSlug);
      setFirstPost(fp);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pilot readiness');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (oauthParam === 'complete') setOauthNotice('OAuth authorization complete — discover and confirm your Instagram account.');
    else if (oauthParam === 'error') setOauthNotice(`OAuth error: ${searchParams.get('reason') ?? 'unknown'}`);
    if (oauthParam) {
      searchParams.delete('oauth');
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    }
  }, [oauthParam, searchParams, setSearchParams]);

  const assessmentComplete = useMemo(() => {
    const profile = ndxState?.profile as Record<string, unknown> | undefined;
    return Boolean(profile && profile.marketing_maturity !== 'ASSESSMENT_REQUIRED');
  }, [ndxState]);

  async function handleAssessmentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy('assessment');
    try {
      await site00EvolveApi.runNdxbookAssessment({
        organizationPurpose: assessmentForm.organizationPurpose,
        brandDescription: assessmentForm.whatItOffers,
        whatItOffers: assessmentForm.whatItOffers,
        targetAudience: assessmentForm.targetAudience,
        primaryObjective: assessmentForm.primaryObjective,
        secondaryObjectives: assessmentForm.secondaryObjectives.split(',').map((s) => s.trim()).filter(Boolean),
        initialChannelPriority: assessmentForm.initialChannelPriority,
        contentGoals: assessmentForm.contentGoals.split(',').map((s) => s.trim()).filter(Boolean),
        conversionTarget: assessmentForm.conversionTarget,
        brandVoice: assessmentForm.brandVoice,
        visualIdentityStatus: assessmentForm.visualIdentityStatus,
        publishingCadence: assessmentForm.publishingCadence,
        approvalPreference: assessmentForm.approvalPreference,
        websiteDestination: assessmentForm.websiteDestination,
        brandAssetsAvailable: assessmentForm.brandAssetsAvailable,
        brandVoiceAvailable: Boolean(assessmentForm.brandVoice),
        visualIdentityAvailable: assessmentForm.visualIdentityStatus === 'DEFINED',
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setBusy(null);
    }
  }

  async function ensureSocialConnection() {
    if (socialConnection) return socialConnection;
    const created = await site00EvolveApi.initiateConnection(orgSlug, 'meta_instagram', 'NDXbook Instagram');
    setSocialConnection(created.connection);
    return created.connection;
  }

  async function handleStartOAuth() {
    setBusy('oauth');
    try {
      const conn = await ensureSocialConnection();
      const result = await site00EvolveApi.startOAuth(orgSlug, conn.id);
      if (result.ok && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return;
      }
      setError(result.message ?? 'OAuth could not start — configure Meta credentials first');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth start failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleDiscoverAccounts() {
    if (!socialConnection) return;
    setBusy('discover');
    try {
      const result = await site00EvolveApi.discoverIgAccounts(orgSlug, socialConnection.id);
      setDiscoveredAccounts(result.accounts);
      setRequiresSelection(result.requiresSelection);
      if (result.accounts.length === 1) setSelectedAccountId(result.accounts[0].externalAccountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account discovery failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleSelectAccount() {
    if (!socialConnection || !selectedAccountId) return;
    const acct = discoveredAccounts.find((a) => a.externalAccountId === selectedAccountId);
    if (!acct) return;
    setBusy('select');
    try {
      const { connection } = await site00EvolveApi.selectConnectionAccount(
        orgSlug,
        socialConnection.id,
        acct.externalAccountId,
        acct.externalAccountName,
        acct.externalPropertyId,
        acct.externalPropertyName,
      );
      setSocialConnection(connection);
      await site00EvolveApi.verifyConnection(orgSlug, connection.id);
      const caps = await site00EvolveApi.verifyCapabilities(orgSlug, connection.id);
      setCapabilities(caps.capabilities);
      const baseline = await site00EvolveApi.analyticsBaseline(orgSlug, connection.id);
      setAnalyticsBaseline(baseline);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account selection failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleConfirmAccount() {
    if (!socialConnection) return;
    setBusy('confirm');
    try {
      const { connection } = await site00EvolveApi.confirmAccount(orgSlug, socialConnection.id);
      setSocialConnection(connection);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account confirmation failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveDraft() {
    setBusy('draft');
    try {
      const { candidate } = await site00EvolveApi.saveFirstPostDraft(orgSlug, { caption: draftCaption });
      const view = await site00EvolveApi.firstPostCandidate(orgSlug, String(candidate.id));
      setFirstPost(view);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save draft failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleSendApproval() {
    const candidate = firstPost?.candidate as { id?: string } | null;
    if (!candidate?.id) return;
    setBusy('approval');
    try {
      await site00EvolveApi.sendFirstPostApproval(orgSlug, candidate.id);
      const view = await site00EvolveApi.firstPostCandidate(orgSlug, candidate.id);
      setFirstPost(view);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send for approval failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleDryRun() {
    const candidate = firstPost?.candidate as { id?: string } | null;
    if (!candidate?.id) return;
    setBusy('dryrun');
    try {
      const result = await site00EvolveApi.firstPostDryRun(orgSlug, candidate.id, 'APPROVED');
      setFirstPost((prev) => ({ ...prev, dryRun: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dry run failed');
    } finally {
      setBusy(null);
    }
  }

  const brandReadiness = ndxState?.brandReadiness as { overall?: string; gaps?: string[] } | undefined;
  const callbackUrl = config?.exactCallbackUrl ?? readiness?.exactCallbackUrl ?? '';

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="pilot"
      title={`${orgName} · PILOT ACTIVATION`}
      subtitle="NDXbook distribution pilot — prerequisites for fence enablement (no publishing this sprint)"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading pilot activation…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}
      {oauthNotice ? <p className="site00-evolve-ops-callout--info">{oauthNotice}</p> : null}

      {!loading && !error && readiness ? (
        <>
          {orgSlug === 'ndxbook' ? (
            <p className="site00-evolve-ops-callout--info">
              <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirection(orgSlug)}>CREATIVE DIRECTION STUDIO →</Link>
            </p>
          ) : null}
          <section className="site00-control-panel site00-evolve-ops-callout--info">
            <h2 className="site00-control-panel__title">{readiness.designation}</h2>
            <p>Current state: <span className={evolveStatusPillClass(readiness.currentState)}>{formatEvolveLabel(readiness.currentState)}</span></p>
            <p>Global publishing: {readiness.globalPublishing}</p>
            <p>Automation: MANUAL · Cross-posting: {readiness.crossPosting}</p>
            <p>Next action: {readiness.nextAction}</p>
            {fenceReadiness ? (
              <p className="site00-orchestration-meta">{String(fenceReadiness.fenceEnablementNote)}</p>
            ) : null}
            <p>
              <Link to={SITE00_ADMIN_ROUTES.evolveOrgConnections(orgSlug)}>Manage provider connections →</Link>
            </p>
          </section>

          {config ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">Owner Configuration</h2>
              <p className="site00-orchestration-meta">
                Register this exact Meta OAuth callback URL: <code>{callbackUrl}</code>
              </p>
              <div className="site00-orchestration-grid">
                {config.items.map((item) => (
                  <article key={item.key} className="site00-control-panel">
                    <h3>{item.label}</h3>
                    <span className={configStatusClass(item.status)}>{item.status}</span>
                    <p className="site00-orchestration-meta">{item.validationResult}</p>
                    {item.lastValidated ? (
                      <p className="site00-orchestration-meta">Last validated: {new Date(item.lastValidated).toLocaleString()}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {orgSlug === 'ndxbook' && !assessmentComplete ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">NDXbook Marketing Assessment</h2>
              <p className="site00-orchestration-meta">Owner-confirmed answers only — nothing is inferred.</p>
              <form onSubmit={(e) => void handleAssessmentSubmit(e)} className="site00-orchestration-form">
                {(
                  [
                    ['organizationPurpose', 'What is NDXbook?'],
                    ['whatItOffers', 'What does it offer?'],
                    ['targetAudience', 'Who is it for?'],
                    ['primaryObjective', 'Primary objective'],
                    ['secondaryObjectives', 'Secondary objectives (comma-separated)'],
                    ['contentGoals', 'Content goals (comma-separated)'],
                    ['conversionTarget', 'CTA / conversion goal'],
                    ['brandVoice', 'Brand voice'],
                    ['visualIdentityStatus', 'Visual identity status'],
                    ['publishingCadence', 'Posting cadence preference'],
                    ['websiteDestination', 'Website / destination URL'],
                    ['brandAssetsAvailable', 'Available brand assets'],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="site00-orchestration-field">
                    <span>{label}</span>
                    <input
                      value={assessmentForm[field]}
                      onChange={(e) => setAssessmentForm((f) => ({ ...f, [field]: e.target.value }))}
                      required={field === 'primaryObjective' || field === 'organizationPurpose'}
                    />
                  </label>
                ))}
                <button type="submit" disabled={busy === 'assessment'} className="site00-control-btn">
                  {busy === 'assessment' ? 'Saving…' : 'Complete Assessment'}
                </button>
              </form>
            </section>
          ) : null}

          {orgSlug === 'ndxbook' && assessmentComplete && ndxState ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">Marketing Bootstrap</h2>
              <p>Profile: {(ndxState.profile as { strategy_status?: string })?.strategy_status ?? 'ACTIVE'}</p>
              <p>Objectives: {((ndxState.objectives as unknown[]) ?? []).length}</p>
              <p>Channels: {((ndxState.channels as unknown[]) ?? []).length}</p>
              {brandReadiness ? (
                <>
                  <p>Brand readiness: <span className={evolveStatusPillClass(brandReadiness.overall ?? 'PARTIAL')}>{brandReadiness.overall}</span></p>
                  {brandReadiness.gaps?.length ? (
                    <ul className="site00-orchestration-meta">
                      {brandReadiness.gaps.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">Instagram Authorization</h2>
            <p className="site00-orchestration-meta">
              Connection: {socialConnection?.status ?? 'NOT_CONNECTED'} · Account confirmed:{' '}
              {socialConnection?.accountConfirmedAt ? 'YES' : 'NO'}
            </p>
            <div className="site00-orchestration-actions">
              <button type="button" className="site00-control-btn" disabled={!config?.allConfigured || busy === 'oauth'} onClick={() => void handleStartOAuth()}>
                {busy === 'oauth' ? 'Starting…' : 'Authorize Meta / Instagram'}
              </button>
              <button type="button" className="site00-control-btn" disabled={!socialConnection || busy === 'discover'} onClick={() => void handleDiscoverAccounts()}>
                Discover Accounts
              </button>
            </div>
            {discoveredAccounts.length > 0 ? (
              <div className="site00-orchestration-field">
                <span>Select Instagram account (required when multiple)</span>
                <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                  <option value="">— Select —</option>
                  {discoveredAccounts.map((a) => (
                    <option key={a.externalAccountId} value={a.externalAccountId}>
                      {a.externalAccountName} ({a.externalPropertyName ?? a.externalAccountId})
                    </option>
                  ))}
                </select>
                <button type="button" className="site00-control-btn" disabled={!selectedAccountId || busy === 'select'} onClick={() => void handleSelectAccount()}>
                  Use Selected Account
                </button>
                {requiresSelection ? (
                  <p className="site00-orchestration-meta">Multiple accounts found — owner selection required.</p>
                ) : null}
              </div>
            ) : null}
            {socialConnection?.verificationStatus === 'VERIFIED' || socialConnection?.status === 'CONNECTED' ? (
              <div className="site00-orchestration-actions">
                <p>Selected: {socialConnection.externalAccountName ?? '—'} · {socialConnection.externalPropertyName ?? ''}</p>
                {!socialConnection.accountConfirmedAt ? (
                  <button type="button" className="site00-control-btn site00-control-btn--primary" disabled={busy === 'confirm'} onClick={() => void handleConfirmAccount()}>
                    CONFIRM THIS ACCOUNT
                  </button>
                ) : (
                  <p className="site00-evolve-ops-callout--info">Account confirmed at {new Date(socialConnection.accountConfirmedAt).toLocaleString()}</p>
                )}
              </div>
            ) : null}
            {capabilities ? (
              <div className="site00-orchestration-grid">
                {Object.entries(capabilities).map(([cap, state]) => (
                  <article key={cap} className="site00-control-panel">
                    <h3>{cap.replace(/_/g, ' ')}</h3>
                    <span className={evolveStatusPillClass(state)}>{state}</span>
                  </article>
                ))}
              </div>
            ) : null}
            {analyticsBaseline ? (
              <p className="site00-orchestration-meta">
                Analytics baseline: {String(analyticsBaseline.status)} — {String(analyticsBaseline.message)}
              </p>
            ) : null}
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">First Post Candidate</h2>
            <p className="site00-orchestration-meta">SAVE DRAFT · SEND FOR APPROVAL — no PUBLISH action this sprint.</p>
            <label className="site00-orchestration-field">
              <span>Caption</span>
              <textarea value={draftCaption} onChange={(e) => setDraftCaption(e.target.value)} rows={3} />
            </label>
            <div className="site00-orchestration-actions">
              <button type="button" className="site00-control-btn" disabled={busy === 'draft'} onClick={() => void handleSaveDraft()}>
                SAVE DRAFT
              </button>
              <button type="button" className="site00-control-btn" disabled={!firstPost?.candidate || busy === 'approval'} onClick={() => void handleSendApproval()}>
                SEND FOR APPROVAL
              </button>
              <button type="button" className="site00-control-btn" disabled={!firstPost?.candidate || busy === 'dryrun'} onClick={() => void handleDryRun()}>
                RUN DRY RUN
              </button>
            </div>
            {firstPost?.candidate ? (
              <div className="site00-orchestration-meta">
                <p>Channel: INSTAGRAM · Target: {(firstPost.candidate as { targetAccount?: string }).targetAccount ?? '—'}</p>
                <p>Approval: {(firstPost.candidate as { approvalState?: string }).approvalState}</p>
                <p>Connection: {String(firstPost.connectionState)} · Fence: global {String((firstPost.fenceState as { global?: string })?.global)} / org {String((firstPost.fenceState as { organization?: string })?.organization)}</p>
              </div>
            ) : null}
            {(firstPost?.dryRun as { status?: string })?.status ? (
              <p>Dry run: {(firstPost?.dryRun as { status?: string }).status} · Provider writes: 0</p>
            ) : null}
          </section>

          <div className="site00-orchestration-grid">
            {readiness.items.map((item) => (
              <section key={item.key} className="site00-control-panel">
                <h2 className="site00-control-panel__title">{item.label}</h2>
                <span className={evolveStatusPillClass(item.state)}>{formatEvolveLabel(item.state)}</span>
                {item.detail ? <p className="site00-orchestration-meta">{item.detail}</p> : null}
              </section>
            ))}
          </div>
        </>
      ) : null}
    </EvolveOrgShell>
  );
}
