/**
 * Preview / review / QA architecture (definition). The minimum viable preview reuses what exists: SITE 00 admin already
 * hosts an email pack gallery (site00/debug/email-pack) rendering shared/site00-email. JURNL gets a sibling page, not a
 * new product.
 */

export const PREVIEW_FIELDS = [
  'template name',
  'family',
  'state / variant',
  'mobile preview (375 px)',
  'desktop preview (640 px)',
  'sample data (fixture id, marked DEMO)',
  'image-disabled fallback',
  'dark-mode approximation',
  'subject',
  'preheader',
  'CTA label and destination',
  'asset lineage (group, slots, lineage action, approval)',
  'production state and founder approval',
] as const;

export const PREVIEW_ARCHITECTURE = {
  minimumViable: [
    'A JURNL tab beside the existing SITE 00 email pack gallery (src/site00/admin/pages/debug/EmailPackGalleryPage.tsx pattern), internal-only behind the existing admin guard.',
    'Each card renders a template with its fixture into two sandboxed iframes (375 / 640), with toggles for images-off and a dark-mode approximation (prefers-color-scheme emulation + [data-ogsc] class).',
    'Metadata panel reads the manifests (family, state, consent class, subject, preheader, CTA, lineage, production state).',
    'Before templates exist (now), the same page lists contracts and shows CONTRACT_READY with no render.',
  ],
  notNow: ['A separate email product', 'In-app WYSIWYG editing', 'Sending from the preview (preview never sends; test sends go through DELIVERY_QA with the dry-run or a sandbox provider)'],
  review: ['Founder review happens on authority images (JURNL EMAILS v1/REVIEW) before implementation, and on the preview page after.'],
} as const;

export const QA_GATES = {
  RESPONSIVE_QA: ['CLIENT_MATRIX pass in light and dark', 'image-blocked read-through', 'Gmail clipping (< 102 KB)', 'accessibility gates', 'plain-text part matches'],
  DELIVERY_QA: ['test recipients only', 'links resolve to real routes', 'security links not tracked', 'suppression and cooldown honoured', 'idempotency key prevents duplicates', 'List-Unsubscribe headers on non-transactional mail', 'fixture payloads refused'],
} as const;
