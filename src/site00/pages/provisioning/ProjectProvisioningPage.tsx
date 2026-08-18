import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { site00ClientProductionApi } from '../../services/clientProductionApi';

type ProvisioningService = {
  provider_key: string;
  display_name: string;
  required_phase: string;
  effective_state: string;
  owner_type: string;
  bucket: string;
  help: string;
};

type ProvisioningPayload = {
  project: { id: string; slug: string; name: string; current_phase: string };
  environmentReadiness: { current_phase_readiness_pct: number } | null;
  services: {
    needed_now: ProvisioningService[];
    coming_up: ProvisioningService[];
    later: ProvisioningService[];
    complete: ProvisioningService[];
  };
};

/** Client-facing post-payment provisioning — driven by phase-aware readiness graph. */
export default function ProjectProvisioningPage() {
  const { projectSlug = '' } = useParams();
  const [data, setData] = useState<ProvisioningPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'SITE 00 — PROVISIONING';
    if (!projectSlug) return;
    site00ClientProductionApi
      .provisioning(projectSlug)
      .then((payload) => setData(payload as ProvisioningPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD PROVISIONING'));
  }, [projectSlug]);

  async function connect(providerKey: string) {
    if (!data?.project.id) return;
    setBusy(providerKey);
    try {
      await site00ClientProductionApi.connectService(data.project.id, providerKey, 'CONNECTED');
      const refreshed = await site00ClientProductionApi.provisioning(projectSlug);
      setData(refreshed as ProvisioningPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CONNECTION FAILED');
    } finally {
      setBusy(null);
    }
  }

  const step = data ? (data.services.needed_now.length === 0 ? 4 : 2) : 1;

  function renderBucket(title: string, items: ProvisioningService[]) {
    if (!items.length) return null;
    return (
      <section className="site00-provisioning-bucket">
        <h3>{title}</h3>
        <div className="site00-hub-grid site00-hub-grid--2x2">
          {items.map((svc) => (
            <article key={svc.provider_key} className="site00-hub-card">
              <div className="site00-hub-card__copy">
                <h3 className="site00-hub-card__title">{svc.display_name}</h3>
                <p className="site00-hub-card__desc">
                  NEEDED: BEFORE {svc.required_phase} · {svc.effective_state.replace(/_/g, ' ')}
                </p>
                <p className="site00-hub-card__desc">{svc.help}</p>
                {svc.bucket === 'NEEDED_NOW' && svc.effective_state !== 'CONNECTED' ? (
                  <button
                    type="button"
                    className="site00-hub-card__cta site00-hub-card__cta--button"
                    disabled={busy === svc.provider_key}
                    onClick={() => connect(svc.provider_key)}
                  >
                    {busy === svc.provider_key ? 'CONNECTING…' : 'GRANT ACCESS →'}
                  </button>
                ) : (
                  <span className="site00-hub-card__cta">
                    {svc.bucket === 'COMPLETE' ? 'CONNECTED ✓' : 'NOT NEEDED YET'}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--provisioning">
        <PageIntro
          title={<BracketHeading>YOUR PROJECT IS OFFICIAL</BracketHeading>}
          subtitle="PAYMENT CONFIRMED. NOW LET'S PREPARE YOUR BUILD ENVIRONMENT."
          body="SITE 00 WILL IDENTIFY ONLY THE SERVICES REQUIRED FOR THIS PROJECT. YOUR INFRASTRUCTURE REMAINS CLIENT-OWNED."
        />

        {error ? <p className="site00-body">{error.toUpperCase()}</p> : null}

        <ol className="site00-admin-panel" style={{ listStyle: 'none', padding: 16 }}>
          <li style={{ opacity: step >= 1 ? 1 : 0.4 }}>01 PROJECT OFFICIAL</li>
          <li style={{ opacity: step >= 2 ? 1 : 0.4 }}>02 REQUIRED ACCOUNTS</li>
          <li style={{ opacity: step >= 3 ? 1 : 0.4 }}>03 CONNECT ACCESS</li>
          <li style={{ opacity: step >= 4 ? 1 : 0.4 }}>04 READINESS</li>
        </ol>

        <section className="site00-admin-panel">
          <h2 className="site00-label-red">
            REQUIRED ACCOUNTS — {(data?.project.name ?? projectSlug).toUpperCase()}
          </h2>
          <p className="site00-body">
            CURRENT PHASE READINESS: {data?.environmentReadiness?.current_phase_readiness_pct ?? 0}%
          </p>
          {renderBucket('NEEDED NOW', data?.services.needed_now ?? [])}
          {renderBucket('COMING UP', data?.services.coming_up ?? [])}
          {renderBucket('LATER', data?.services.later ?? [])}
          {renderBucket('COMPLETE', data?.services.complete ?? [])}
          <p className="site00-body" style={{ marginTop: 16 }}>
            YOUR PROJECT INFRASTRUCTURE BELONGS TO YOU. SITE 00 RECEIVES ONLY THE ACCESS NECESSARY TO BUILD AND
            MAINTAIN YOUR PROJECT. WE NEVER ASK FOR PLAINTEXT PASSWORDS.
          </p>
          {data?.project.slug ? (
            <Link className="site00-btn-ghost-sm" to="/control">
              BACK TO CTRL ROOM →
            </Link>
          ) : null}
        </section>
      </div>
    </Site00PublicShell>
  );
}
