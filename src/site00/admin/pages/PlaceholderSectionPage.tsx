import { Site00AdminShell } from '../components/shell/Site00AdminShell';

const COPY: Record<string, { title: string; subtitle: string }> = {
  identities: { title: 'IDENTITIES', subtitle: 'IDNTY ONBOARDING RECORDS AND CLIENT IDENTITY STATE.' },
  'bldr-intakes': { title: 'BLDR INTAKES', subtitle: 'BUILD CLASS SELECTIONS AND DISCOVERY INPUT.' },
  leads: { title: 'LEADS', subtitle: 'PRE-PROJECT INQUIRIES AND PIPELINE.' },
  discovery: { title: 'DISCOVERY', subtitle: 'DISCOVERY BRIEFS AND SCOPING.' },
  sites: { title: 'SITES', subtitle: 'LAUNCHED DIGITAL PROPERTIES.' },
  finance: { title: 'FINANCE', subtitle: 'PAYMENTS, INVOICES, AND REVENUE.' },
  team: { title: 'TEAM', subtitle: 'PROJECT TEAM AND PERMISSIONS.' },
  reports: { title: 'REPORTS', subtitle: 'PRODUCTION AND BUSINESS REPORTS.' },
  settings: { title: 'SETTINGS', subtitle: 'SITE 00 ADMIN CONFIGURATION.' },
  automation: { title: 'AUTOMATION', subtitle: 'STUDIO AUTOMATION MATRIX — LEVEL 1 / 2 / 3 RULES.' },
};

export default function Site00AdminPlaceholderPage() {
  const segment = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() ?? 'settings' : 'settings';
  const key = segment === 'automation' ? 'automation' : segment;
  const copy = COPY[key] ?? { title: segment.toUpperCase(), subtitle: 'SITE 00 ADMIN MODULE.' };

  return (
    <Site00AdminShell>
      <h1 className="site00-admin-page-title">[ {copy.title} ]</h1>
      <p className="site00-admin-page-subtitle">{copy.subtitle}</p>
      <section className="site00-admin-panel">
        <p>MODULE SCAFFOLD READY — CONNECT TO PRODUCTION DATA IN NEXT SPRINT.</p>
      </section>
    </Site00AdminShell>
  );
}
