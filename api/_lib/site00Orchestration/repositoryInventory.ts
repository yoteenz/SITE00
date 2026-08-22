import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { GitHubRepoSnapshot } from './githubClient.js';

export type InventoryFinding = {
  evidence_type: string;
  title: string;
  description: string;
  source_path: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  workstream_key?: string;
  requirement_key?: string;
  metadata?: Record<string, unknown>;
};

function walkDir(root: string, max = 8000): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    if (out.length >= max) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (out.length >= max) return;
      if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
      const full = join(dir, name);
      try {
        const st = statSync(full);
        if (st.isDirectory()) walk(full);
        else out.push(relative(root, full));
      } catch {
        /* skip */
      }
    }
  }
  walk(root);
  return out;
}

const SITE00_WORKSTREAM_PATTERNS: Array<{
  workstream_key: string;
  requirement_key?: string;
  label: string;
  patterns: RegExp[];
  confidence: InventoryFinding['confidence'];
}> = [
  { workstream_key: 'public-experience', requirement_key: 'public_website', label: 'Public routes', patterns: [/src\/site00\/pages\/OriginPage/i, /src\/routes\/Site00Routes/i], confidence: 'HIGH' },
  { workstream_key: 'identity', requirement_key: 'identity', label: 'Identity (IDNTY)', patterns: [/src\/site00\/pages\/Idnty/i, /config\/identity/i], confidence: 'HIGH' },
  { workstream_key: 'builder', requirement_key: 'builder_flow', label: 'Builder (BLDR)', patterns: [/Bldr/i, /bldr/i], confidence: 'HIGH' },
  { workstream_key: 'evolve', label: 'Evolve', patterns: [/evolve/i], confidence: 'MEDIUM' },
  { workstream_key: 'admin-dashboard', requirement_key: 'admin_operations', label: 'Admin dashboard', patterns: [/src\/site00\/admin/i, /Site00AdminRoutes/i], confidence: 'HIGH' },
  { workstream_key: 'email-pack', requirement_key: 'transactional_email', label: 'Email pack', patterns: [/shared\/site00-email/i, /EmailPackGallery/i, /EmailPreviewCanvas/i], confidence: 'HIGH' },
  { workstream_key: 'orchestration', label: 'Orchestration backend', patterns: [/site00Orchestration/i, /site00-orchestration/i], confidence: 'HIGH' },
  { workstream_key: 'studio-world-bridge', requirement_key: 'studio_workflow', label: 'Studio World bridge', patterns: [/studioWorld/i, /studio-world/i], confidence: 'MEDIUM' },
  { workstream_key: 'orchestration-ui', label: 'Admin orchestration UI wiring', patterns: [/OrchestrationDebugPage/i], confidence: 'LOW' },
  { workstream_key: 'payments', requirement_key: 'payments', label: 'Payments', patterns: [/stripe/i, /payment/i], confidence: 'LOW' },
  { workstream_key: 'assts', label: 'Asset factory (ASSTS)', patterns: [/site00Assts/i, /assts/i], confidence: 'MEDIUM' },
  { workstream_key: 'access-credentials', label: 'Access credentials', patterns: [/access-credentials/i, /AccessCredential/i], confidence: 'MEDIUM' },
  { workstream_key: 'marketing-evolve', label: 'Evolve marketing', patterns: [/marketing-engagements/i, /site00-marketing/i], confidence: 'MEDIUM' },
];

const FSBW_PATTERNS: Array<{
  owner: 'frontal-slayer' | 'studio-world';
  workstream_key: string;
  label: string;
  patterns: RegExp[];
  confidence: InventoryFinding['confidence'];
}> = [
  { owner: 'frontal-slayer', workstream_key: 'commerce', label: 'Commerce', patterns: [/shopify|commerce|product/i], confidence: 'MEDIUM' },
  { owner: 'frontal-slayer', workstream_key: 'mansion', label: 'Mansion experience', patterns: [/mansion/i], confidence: 'MEDIUM' },
  { owner: 'frontal-slayer', workstream_key: 'membership', label: 'Membership', patterns: [/membership|entitlement/i], confidence: 'MEDIUM' },
  { owner: 'frontal-slayer', workstream_key: 'hair-analysis', label: 'Hair Analysis', patterns: [/hair.?analysis|build.?a.?wig/i], confidence: 'MEDIUM' },
  { owner: 'frontal-slayer', workstream_key: 'lounge', label: 'Lounge', patterns: [/lounge/i], confidence: 'MEDIUM' },
  { owner: 'frontal-slayer', workstream_key: 'psa', label: 'PSA', patterns: [/psa/i], confidence: 'LOW' },
  { owner: 'frontal-slayer', workstream_key: 'checkout', label: 'Checkout/payments', patterns: [/checkout|stripe|payment/i], confidence: 'MEDIUM' },
  { owner: 'frontal-slayer', workstream_key: 'analytics', label: 'Analytics', patterns: [/analytics|gtag/i], confidence: 'LOW' },
  { owner: 'studio-world', workstream_key: 'virtual-production', label: 'Virtual production OS', patterns: [/virtual.?production|studio_vp|studio_world/i], confidence: 'HIGH' },
  { owner: 'studio-world', workstream_key: 'campaign-production', label: 'Campaign production', patterns: [/campaign/i], confidence: 'MEDIUM' },
  { owner: 'studio-world', workstream_key: 'production-governance', label: 'Production governance', patterns: [/governance|production_governance/i], confidence: 'HIGH' },
  { owner: 'studio-world', workstream_key: 'references', label: 'Reference system', patterns: [/reference/i], confidence: 'MEDIUM' },
];

export function inventoryLocalSite00(workspaceRoot: string): InventoryFinding[] {
  const files = walkDir(workspaceRoot);
  const findings: InventoryFinding[] = [];

  findings.push({
    evidence_type: 'REPOSITORY_STRUCTURE',
    title: 'SITE 00 repository root verified',
    description: `${files.length} source files indexed (excluding node_modules/dist)`,
    source_path: workspaceRoot,
    confidence: 'HIGH',
    metadata: { file_count: files.length },
  });

  for (const ws of SITE00_WORKSTREAM_PATTERNS) {
    const matches = files.filter((f) => ws.patterns.some((p) => p.test(f)));
    if (matches.length > 0) {
      findings.push({
        evidence_type: 'WORKSTREAM_EVIDENCE',
        title: `${ws.label} — implementation files present`,
        description: `${matches.length} matching paths (route/file existence ≠ completion)`,
        source_path: matches.slice(0, 5).join(', '),
        confidence: ws.confidence,
        workstream_key: ws.workstream_key,
        requirement_key: ws.requirement_key,
        metadata: { match_count: matches.length, sample_paths: matches.slice(0, 10) },
      });
    }
  }

  if (files.some((f) => /OrchestrationDebugPage/i.test(f)) && !files.some((f) => /admin\/pages\/DashboardPage/i.test(f) && /orchestration/i.test(f))) {
    findings.push({
      evidence_type: 'GAP_EVIDENCE',
      title: 'Admin orchestration UI not wired to production dashboard',
      description: 'Debug route exists; approved admin dashboard orchestration wiring not found',
      source_path: 'src/site00/admin/pages/debug/OrchestrationDebugPage.tsx',
      confidence: 'HIGH',
      workstream_key: 'orchestration-ui',
      metadata: { sprint01_gap: true },
    });
  }

  if (files.some((f) => /site00-email/i.test(f))) {
    findings.push({
      evidence_type: 'WORKSTREAM_STATE',
      title: 'Email pack — IN_PROGRESS (not complete)',
      description: 'Email debug/preview architecture exists; family reference work ongoing — not marked complete',
      source_path: 'shared/site00-email/',
      confidence: 'HIGH',
      workstream_key: 'email-pack',
      requirement_key: 'transactional_email',
      metadata: { execution_status: 'IN_PROGRESS', not_complete: true },
    });
  }

  if (existsSync(join(workspaceRoot, 'supabase/migrations/20260820180000_site00_production_orchestration.sql'))) {
    findings.push({
      evidence_type: 'MIGRATION',
      title: 'Orchestration migration present in repository',
      description: 'Schema migration file exists — runtime application verified separately',
      source_path: 'supabase/migrations/20260820180000_site00_production_orchestration.sql',
      confidence: 'HIGH',
      workstream_key: 'orchestration',
    });
  }

  return findings;
}

export function inventoryGitHubSnapshot(snapshot: GitHubRepoSnapshot, ownerSlug: 'frontal-slayer' | 'studio-world'): InventoryFinding[] {
  const paths = snapshot.tree.filter((t) => t.type === 'blob').map((t) => t.path);
  const findings: InventoryFinding[] = [
    {
      evidence_type: 'REPOSITORY_STRUCTURE',
      title: `${snapshot.ref.fullName} indexed`,
      description: `${paths.length} files at ${snapshot.headSha.slice(0, 7)}`,
      source_path: snapshot.ref.fullName,
      confidence: 'HIGH',
      metadata: { head_sha: snapshot.headSha, branch: snapshot.defaultBranch },
    },
  ];

  const patterns = FSBW_PATTERNS.filter((p) => p.owner === ownerSlug);
  for (const ws of patterns) {
    const matches = paths.filter((p) => ws.patterns.some((re) => re.test(p)));
    if (matches.length > 0) {
      findings.push({
        evidence_type: 'WORKSTREAM_EVIDENCE',
        title: `${ws.label} — files detected in ${ownerSlug}`,
        description: `${matches.length} matching paths (existence ≠ completion)`,
        source_path: matches.slice(0, 3).join(', '),
        confidence: ws.confidence,
        workstream_key: ws.workstream_key,
        metadata: { owner: ownerSlug, match_count: matches.length, repository: snapshot.ref.fullName },
      });
    }
  }

  return findings;
}

export function countReconciliationBuckets(findings: InventoryFinding[]) {
  return {
    confirmed: findings.filter((f) => f.confidence === 'HIGH' && f.evidence_type === 'WORKSTREAM_EVIDENCE').length,
    probable: findings.filter((f) => f.confidence === 'MEDIUM').length,
    missing_evidence: 0,
    requires_review: findings.filter((f) => f.evidence_type === 'GAP_EVIDENCE' || f.evidence_type === 'WORKSTREAM_STATE').length,
    newly_discovered: findings.filter((f) => f.evidence_type === 'REPOSITORY_STRUCTURE').length,
  };
}
