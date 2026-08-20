import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMarketingService } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import type { MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';
import { Site00AccountRouteGuard } from '../../../components/guards/Site00AccountRouteGuard';
import { Site00AppShell } from '../../../components/shell/Site00AppShell';
import { MARKETING_INTAKE_STEPS } from '../../../config/marketing-content';
import { SITE00_ROUTES, site00EvolveMarketingBrief } from '../../../config/routes';
import { marketingEngagementApi } from '../../../services/marketingEngagementApi';

export default function MarketingIntakePage() {
  const { serviceId = 'campaign' } = useParams();
  const navigate = useNavigate();
  const service = getMarketingService(serviceId as MarketingServiceCategory);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string | string[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service) {
    return (
      <Site00AppShell>
        <p>Unknown service.</p>
        <Link to={SITE00_ROUTES.evolveMarketingServices}>← SERVICES</Link>
      </Site00AppShell>
    );
  }

  const current = MARKETING_INTAKE_STEPS[step];
  const isLast = step >= MARKETING_INTAKE_STEPS.length - 1;

  async function handleContinue() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const engagement = await marketingEngagementApi.create(service!.id, String(form.businessName ?? 'UNTITLED CAMPAIGN'));
      await marketingEngagementApi.updateIntake(
        engagement.id,
        {
          businessName: form.businessName ? String(form.businessName) : undefined,
          campaignObjective: form.campaignObjective ? String(form.campaignObjective) : undefined,
          makingWhat: form.makingWhat ? String(form.makingWhat) : undefined,
          targetAudience: form.targetAudience ? String(form.targetAudience) : undefined,
          platforms: form.platforms ? String(form.platforms).split(',').map((s) => s.trim()) : [],
          deliverableTypes: form.deliverableTypes ? String(form.deliverableTypes).split(',').map((s) => s.trim()) : [],
          quantityCadence: form.quantityCadence ? String(form.quantityCadence) : undefined,
          deadline: form.deadline ? String(form.deadline) : undefined,
          launchDate: form.launchDate ? String(form.launchDate) : undefined,
          productService: form.productService ? String(form.productService) : undefined,
          copyMessaging: form.copyMessaging ? String(form.copyMessaging) : undefined,
          restrictions: form.restrictions ? String(form.restrictions) : undefined,
          approvalContact: form.approvalContact ? String(form.approvalContact) : undefined,
          additionalNotes: form.additionalNotes ? String(form.additionalNotes) : undefined,
        },
        true,
      );
      navigate(site00EvolveMarketingBrief(engagement.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save intake');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Site00AccountRouteGuard>
      <Site00AppShell>
        <div className="site00-marketing-intake">
          <p className="site00-label-red">EVOLVE / MARKETING & CONTENT / INTAKE</p>
          <h1>{service.title}</h1>
          <p className="site00-label">STEP {String(step + 1).padStart(2, '0')} / {current.label}</p>

          <div className="site00-marketing-intake__fields">
            {current.id === 'objective' ? (
              <>
                <label>CAMPAIGN OBJECTIVE<textarea value={String(form.campaignObjective ?? '')} onChange={(e) => setForm({ ...form, campaignObjective: e.target.value })} /></label>
                <label>WHAT ARE WE MAKING?<textarea value={String(form.makingWhat ?? '')} onChange={(e) => setForm({ ...form, makingWhat: e.target.value })} /></label>
                <label>PRODUCT / SERVICE<textarea value={String(form.productService ?? '')} onChange={(e) => setForm({ ...form, productService: e.target.value })} /></label>
              </>
            ) : null}
            {current.id === 'audience' ? (
              <>
                <label>TARGET AUDIENCE<textarea value={String(form.targetAudience ?? '')} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} /></label>
                <label>PLATFORMS (comma-separated)<input value={String(form.platforms ?? '')} onChange={(e) => setForm({ ...form, platforms: e.target.value })} /></label>
                <label>DELIVERABLE TYPES<input value={String(form.deliverableTypes ?? '')} onChange={(e) => setForm({ ...form, deliverableTypes: e.target.value })} /></label>
              </>
            ) : null}
            {current.id === 'timeline' ? (
              <>
                <label>QUANTITY / CADENCE<input value={String(form.quantityCadence ?? '')} onChange={(e) => setForm({ ...form, quantityCadence: e.target.value })} /></label>
                <label>DEADLINE<input value={String(form.deadline ?? '')} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
                <label>LAUNCH DATE<input value={String(form.launchDate ?? '')} onChange={(e) => setForm({ ...form, launchDate: e.target.value })} /></label>
              </>
            ) : null}
            {current.id === 'brand' ? (
              <>
                <label>BUSINESS / BRAND<input value={String(form.businessName ?? '')} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></label>
                <label>COPY / MESSAGING<textarea value={String(form.copyMessaging ?? '')} onChange={(e) => setForm({ ...form, copyMessaging: e.target.value })} /></label>
                <label>RESTRICTIONS<textarea value={String(form.restrictions ?? '')} onChange={(e) => setForm({ ...form, restrictions: e.target.value })} /></label>
                <label>APPROVAL CONTACT<input value={String(form.approvalContact ?? '')} onChange={(e) => setForm({ ...form, approvalContact: e.target.value })} /></label>
              </>
            ) : null}
            {current.id === 'notes' ? (
              <label>ADDITIONAL NOTES<textarea value={String(form.additionalNotes ?? '')} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} /></label>
            ) : null}
          </div>

          {error ? <p className="site00-marketing-error">{error}</p> : null}

          <div className="site00-marketing-intake__actions">
            {step > 0 ? (
              <button type="button" className="site00-btn site00-btn--ghost" onClick={() => setStep((s) => s - 1)}>
                BACK
              </button>
            ) : null}
            <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void handleContinue()}>
              {isLast ? 'BUILD BRIEF →' : 'CONTINUE →'}
            </button>
          </div>
        </div>
      </Site00AppShell>
    </Site00AccountRouteGuard>
  );
}
