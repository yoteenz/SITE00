/**
 * ALL IN ONE ENTERPRISES INC — project experience DNA (first full proof project of the Workspace Experience Brain).
 * Source of truth for product facts: yoteenz/fsbw · all-in-one-enterprises/ (read-only here). Brand canon:
 * appConfig.ts tagline + founder sprint canon. No Frontal Slayer typography.
 */
import type { ProjectExperienceDna } from '../../schema.js';

export const AIO_SOURCE_REPO = 'yoteenz/fsbw · all-in-one-enterprises/ @ fd8bf3c';

export const AIO_DNA: ProjectExperienceDna = {
  project_id: 'AIO',
  project_name: 'ALL IN ONE ENTERPRISES INC',
  brand: {
    tagline: 'WHERE BUSINESS MEETS THE ROAD.',
    positioning: 'THE BUSINESS OFFICE BEHIND THE TRUCK.',
    promise: 'FROM STARTUP TO EVERY MILE AFTER.',
    voice: ['CLEAR', 'CAPABLE', 'CONNECTED', 'HUMAN'],
  },
  visual_language: {
    register: 'EXECUTIVE INDUSTRIAL × MODERN INFRASTRUCTURE — operational luxury',
    palette: ['BLACK', 'GOLD', 'SILVER', 'OBSIDIAN', 'CHARCOAL', 'STONE', 'CHAMPAGNE'],
    emphasis_map: {
      NEUTRAL: 'STONE on CHARCOAL',
      PROGRESS: 'CHAMPAGNE progress line on OBSIDIAN',
      ATTENTION: 'GOLD',
      BLOCKER: 'GOLD outline + solid marker (never alarm red as decoration)',
      REVIEW: 'SILVER',
      DECISION: 'GOLD fill — the one decision on screen',
      SUCCESS: 'CHAMPAGNE seal on BLACK',
      ARCHIVED: 'STONE, muted, filed',
      ERROR: 'GOLD on BLACK with explicit recovery copy',
    },
    imagery: 'cinematic trucking / infrastructure context — highways, yards, cabs, fuel islands, office light; never stock smiles',
    forbidden: ['Frontal Slayer typography', 'generic SaaS dashboard chrome', 'cartoon trucks', 'legal / government seals implying AIO is a government system'],
  },
  actors: {
    PUBLIC: 'Prospective carrier / owner-operator / small fleet / shipper discovering AIO',
    CLIENT: 'Carrier client organization (owner-operator, fleet owner, office manager) in the portal',
    FOUNDER_STAFF: 'AIO founder and office specialists (permitting, compliance, dispatch, insurance, factoring, bookkeeping, brokerage divisions)',
    SYSTEM: 'AIO automation: service request engine, office work items, readiness engines, vault, notification + communication engines',
  },
  role_projections: [
    { id: 'SHIPPER', label: 'Shipper', actor: 'CLIENT', route_prefix: 'shipper/*', note: 'Freight buyer; never sees carrier pay / margin.' },
    { id: 'DRIVER', label: 'Driver', actor: 'CLIENT', route_prefix: 'driver/driverlink/*', note: 'Driver candidate / hired driver (route guard is a known gap).' },
    { id: 'FLEETCARE_PROVIDER', label: 'FleetCare provider', actor: 'CLIENT', route_prefix: 'provider/fleetcare/*', note: 'Repair / service provider (route guard is a known gap).' },
    { id: 'AIO_OFFICE', label: 'AIO Office', actor: 'FOUNDER_STAFF', route_prefix: 'office/*', note: 'Internal staff; OfficeRouteGuard.' },
  ],
  shared_surfaces: {
    vault: 'F16 VAULT — portal/vault (customer) · office/documents (Office Document Center)',
    inbox: 'F17 INBOX — portal/messages · notifications · office/inbox',
    activity: 'F05 MY OFFICE — portal/activity',
    founder_hub: 'AIO Office — office/* command center + division queues (OfficeWorkItem)',
    client_home: 'F05 MY OFFICE — portal (Client Command Center: next action · attention · health)',
  },
  source_repositories: ['yoteenz/fsbw/all-in-one-enterprises', 'yoteenz/SITE00 (Studio OS host)'],
};
