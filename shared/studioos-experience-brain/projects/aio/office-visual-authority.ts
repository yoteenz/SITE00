/**
 * AIO OFFICE visual authority — founder approval of the fifteen design decisions and the record of the completed
 * HOME · WORK · REPORTS · MORE visual family (P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1).
 *
 * The decisions are APPROVED. The renders built on them are CANDIDATES awaiting founder review. Nothing here authorizes
 * live implementation, security changes or deployment.
 */
import type { DesignDecisionApproval } from '../../office-design-reconciliation.js';
import { AIO_DESIGN_DECISIONS } from './office-design-reconciliation.js';

export const AIO_VA_SPRINT = 'P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1';
export const AIO_VA_DATE = '2026-10-08';
export const AIO_VA_NEXT_GATE = 'FOUNDER REVIEW OF COMPLETED AIO OFFICE VISUAL AUTHORITIES';

const approve = (decision_id: string, approved_as: string, modification: string | null = null): DesignDecisionApproval => ({
  decision_id,
  decided_by: 'FOUNDER',
  date: AIO_VA_DATE,
  sprint: AIO_VA_SPRINT,
  chosen_option: AIO_DESIGN_DECISIONS.find((d) => d.decision_id === decision_id)!.recommended_option,
  approved_as,
  modification,
});

/** The founder approved all fifteen recommendations, with one explicit modification (D-CREATIVE-PROFILE scope). */
export const AIO_DESIGN_DECISION_APPROVALS: DesignDecisionApproval[] = [
  approve('D-HERO-SCALE', 'HOME retains a cinematic welcome photograph at about 60% of the reference height. WORK, REPORTS and MORE use slimmer photographic bands so useful content appears sooner, keeping the premium composition.'),
  approve('D-HOME-ATTENTION', 'The three attention cards become selectable views of one supporting task list of up to five items; each item names the client, the issue and where to fix it.'),
  approve('D-HOME-QUICK-ACTIONS', 'Phone: a square-rounded “+” in the header opens the available quick actions. Tablet: a compact action row after recent activity. Desktop: actions in the context column. Actions depend on permissions.'),
  approve('D-WORK-CARD-SIGNALS', 'Cards show a needs-attention count where supported and a BLOCKED indicator when appropriate; unconnected data says so. VEHICLES & FLEET never pretends its missing staff workspace works.'),
  approve('D-WORK-BANNER', 'The “NEED TO ASSIGN WORK?” banner is replaced by MY WORK near the top of WORK: assigned work and approaching deadlines where supported. No nonexistent case creation is advertised.'),
  approve('D-PHOTOGRAPHY', 'Reuse approved AIO photography wherever it fits; keep the subjects and cinematic character; replace images with generated text, invented branding, anatomical mistakes or repeated compositions with controlled, high-resolution assets.'),
  approve('D-REPORTS-OVERVIEW', 'Only supported figures: ACTIVE CLIENTS, FILINGS FILED, ACTIVE WORK, COLLECTED REVENUE (founder / finance only). No unsupported trends or growth; elegant, truthful unavailable states.'),
  approve('D-REPORTS-DOMAINS', 'Phone: overview, then the reporting areas. Tablet: an organized report selector. Desktop: report navigation beside the content. All ten areas reachable by permission and status.'),
  approve('D-REPORTS-STAFF', 'REPORTS stays in the fixed five-item navigation. Staff see only what their role allows; without reporting access, a clear, professional access explanation. Founder-only financial intelligence never reaches general staff views.'),
  approve('D-MORE-GROUPS', 'Four groups: CLIENTS & RECORDS (Clients, Documents & Vault, Messages) · BUSINESS (Growth / CRM, Billing, Service Catalog) · PEOPLE & NETWORK (Team & Staff, Mechanic Network) · SYSTEM (System Settings, Help & Support, Account). “ADDITIONAL TOOLS” is removed.'),
  approve('D-MORE-HELP-CARD', 'The redundant NEED HELP card is removed; HELP & SUPPORT stays as a directory entry.'),
  approve('D-ACCOUNT', 'The header profile control and MORE → ACCOUNT open the same account destination; no second account experience.'),
  approve('D-IDENTITY', 'One consistent illustrative staff identity across the AIO OFFICE family; the role label reflects the actor (FOUNDER, STAFF or another authorized role); founder privileges never tied to a name or email.'),
  approve('D-DESKTOP-SHELL', 'Reuse the approved AIO OFFICE tablet and desktop frame with WORK replacing FILING; desktop and tablet are intentional compositions, not enlarged phone layouts.'),
  approve(
    'D-CREATIVE-PROFILE',
    'The four-screen visual language becomes the INTERNAL AIO OFFICE design profile: cinematic transportation photography, premium workspace imagery, black-and-gold navigation, ivory and champagne surfaces, strong editorial type, disciplined hierarchy, photographic service cards, precise spacing, practical utility.',
    'Scope limited to the internal AIO OFFICE. It is not a template for every AIO product: the public website may stay darker and cinematic, CLIENT OFFICE keeps its own approved composition, and the IFTA and client-migration authorities remain valid and protected. All share the AIO brand.',
  ),
];
