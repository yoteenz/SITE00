import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

const SETTINGS_SECTIONS = [
  {
    title: 'INTEGRATIONS',
    description:
      'STRIPE, SUPABASE, FAL, AND OTHER SERVICE CONNECTIONS ARE CONFIGURED VIA BACKEND ENV VARS AND SUPABASE — NOT IN THIS UI.',
    items: ['STRIPE BILLING', 'SUPABASE AUTH', 'GENERATION PROVIDERS'],
  },
  {
    title: 'ROLES & ACCESS',
    description:
      'ADMIN ACCESS IS CONTROLLED BY ADMIN_EMAILS AND SUPABASE AUTH. ROLE MANAGEMENT REQUIRES BACKEND CONFIGURATION.',
    items: ['ADMIN EMAIL ALLOWLIST', 'PROJECT ACCESS RULES', 'CLIENT PORTAL PERMISSIONS'],
  },
  {
    title: 'STUDIO AUTOMATION',
    description: 'STUDIO PIPELINE AUTOMATION RULES LIVE IN THE PRODUCTION OS — CONFIGURE VIA DEDICATED STUDIO SETTINGS.',
    items: ['BRIEF GENERATION', 'APPROVAL WORKFLOWS', 'DELIVERABLE TRIGGERS'],
    href: SITE00_ADMIN_ROUTES.settingsAutomation,
  },
  {
    title: 'NOTIFICATIONS',
    description: 'EMAIL AND IN-APP NOTIFICATION ROUTING IS NOT YET EXPOSED IN ADMIN UI. BACKEND CONFIG REQUIRED.',
    items: ['LEAD ALERTS', 'APPROVAL REMINDERS', 'INVOICE OVERDUE'],
  },
] as const;

export default function SettingsPage() {
  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ SETTINGS ]</h1>
          <p className="site00-admin-page-subtitle">ADMIN CONFIGURATION — READ-ONLY OVERVIEW.</p>
        </div>
      </header>

      <div className="site00-admin-dashboard-grid">
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.title} className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">{section.title}</h2>
            <p className="site00-admin-page-subtitle">{section.description}</p>
            <ul className="site00-admin-activity-list">
              {section.items.map((item) => (
                <li key={item} className="site00-admin-activity-list__item">
                  <span>{item}</span>
                  <span className="site00-admin-badge site00-admin-badge--gray">READ ONLY</span>
                </li>
              ))}
            </ul>
            {'href' in section && section.href ? (
              <Link className="site00-admin-link-cta" to={section.href}>
                OPEN STUDIO AUTOMATION →
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </Site00AdminShell>
  );
}
