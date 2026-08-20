import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';

const COPY: Record<string, { title: string; subtitle: string }> = {
  identities: { title: 'CLIENTS / NETWORK', subtitle: 'IDNTY ONBOARDING RECORDS AND CLIENT IDENTITY STATE.' },
  'bldr-intakes': { title: 'BLDR INTAKES', subtitle: 'BUILD CLASS SELECTIONS AND DISCOVERY INPUT.' },
  leads: { title: 'LEADS / PIPELINE', subtitle: 'PRE-PROJECT INQUIRIES AND PIPELINE.' },
  discovery: { title: 'DISCOVERY', subtitle: 'DISCOVERY BRIEFS AND SCOPING.' },
  sites: { title: 'SYSTEMS / INFRASTRUCTURE', subtitle: 'LAUNCHED DIGITAL PROPERTIES.' },
  finance: { title: 'BUSINESS / OPERATIONS', subtitle: 'PAYMENTS, INVOICES, AND REVENUE.' },
  team: { title: 'OPERATORS / TEAM', subtitle: 'PROJECT TEAM AND PERMISSIONS.' },
  reports: { title: 'REPORTS / SIGNALS', subtitle: 'PRODUCTION AND BUSINESS REPORTS.' },
  settings: { title: 'SETTINGS / OPERATOR', subtitle: 'SITE 00 ADMIN CONFIGURATION.' },
  automation: { title: 'AUTOMATION / LIVE', subtitle: 'WHAT IS RUNNING WITHOUT ME?' },
};

export default function Site00AdminPlaceholderPage() {
  const segment = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() ?? 'settings' : 'settings';
  const key = segment === 'automation' ? 'automation' : segment;
  const copy = COPY[key] ?? { title: segment.toUpperCase(), subtitle: 'SITE 00 ADMIN MODULE.' };

  return (
    <Site00AdminShell>
      <ControlPageHeader kicker="00 / CONTROL" title={copy.title} subtitle={copy.subtitle} />
      <section className="site00-admin-panel">
        <p>MODULE SCAFFOLD READY — CONNECT TO PRODUCTION DATA IN NEXT SPRINT.</p>
      </section>
    </Site00AdminShell>
  );
}
