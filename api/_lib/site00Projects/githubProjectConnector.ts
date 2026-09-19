/**
 * B5.10 — GitHub-backed project repository connector (server-side only).
 */

import { githubAvailable } from '../site00Orchestration/githubClient.js';
import type {
  ProjectBranchState,
  ProjectCiCheckState,
  ProjectDependencyState,
  ProjectIssueSummary,
  ProjectPullRequestSummary,
  ProjectRepositoryConnection,
} from '../../../shared/site00-projects/technical/types.js';
import { getProjectRepositoryBinding } from '../../../shared/site00-projects/technical/projectRepositoryRegistry.js';

type GitHubCommit = {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  html_url: string;
};

type GitHubPull = {
  id: number;
  number: number;
  title: string;
  state: string;
  user: { login: string } | null;
  created_at: string;
  updated_at: string;
  head: { ref: string };
  base: { ref: string };
  html_url: string;
};

type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  state: string;
  labels: Array<{ name: string }>;
  created_at: string;
  updated_at: string;
  html_url: string;
};

function token(): string | null {
  return process.env.SITE00_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? null;
}

async function gh(path: string): Promise<Response> {
  const t = token();
  if (!t) throw new Error('GITHUB_TOKEN_NOT_CONFIGURED');
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 180)}`);
  }
  return res;
}

function emptyCi(label: string): ProjectCiCheckState {
  return {
    status: 'NOT_CONFIGURED',
    lastRun: null,
    duration: null,
    workflow: label,
    branch: null,
    commitSha: null,
    failureSummary: null,
  };
}

export function buildDisconnectedConnection(projectId: string, reason: string): ProjectRepositoryConnection {
  const binding = getProjectRepositoryBinding(projectId);
  const now = new Date().toISOString();
  return {
    projectId,
    provider: 'GITHUB',
    repositoryOwner: binding.repositoryOwner,
    repositoryName: binding.repositoryName,
    repositoryId: null,
    repositoryUrl: binding.repositoryUrl,
    defaultBranch: binding.defaultBranch,
    connected: false,
    connectionStatus: binding.status === 'UNRESOLVED' ? 'NOT_CONNECTED' : 'SYNC_ERROR',
    connectionHealth: 'UNKNOWN',
    lastSyncedAt: null,
    syncConfidence: 'LOW',
    syncError: reason,
    readOnly: true,
    permissions: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function fetchGitHubProjectSnapshot(projectId: string): Promise<{
  connection: ProjectRepositoryConnection;
  branchState: ProjectBranchState;
  recentCommits: Array<{ sha: string; message: string; author: string | null; at: string | null; url: string | null }>;
  pullRequests: ProjectPullRequestSummary[];
  issues: ProjectIssueSummary[];
  buildState: ProjectCiCheckState;
  testState: ProjectCiCheckState;
  lintState: ProjectCiCheckState;
  typecheckState: ProjectCiCheckState;
  dependencyState: ProjectDependencyState;
  packageJson: Record<string, unknown> | null;
}> {
  const binding = getProjectRepositoryBinding(projectId);
  const now = new Date().toISOString();

  if (binding.status !== 'BOUND' || !binding.repositoryOwner || !binding.repositoryName) {
    throw new Error(binding.notes ?? 'REPOSITORY UNRESOLVED');
  }

  if (!githubAvailable()) {
    throw new Error('GITHUB_TOKEN_NOT_CONFIGURED');
  }

  const owner = binding.repositoryOwner;
  const repo = binding.repositoryName;
  const repoRes = await gh(`/repos/${owner}/${repo}`);
  const repoData = (await repoRes.json()) as { default_branch: string; id: number; html_url: string };
  const branch = binding.defaultBranch ?? repoData.default_branch;

  const commitRes = await gh(`/repos/${owner}/${repo}/commits?sha=${branch}&per_page=5`);
  const commits = (await commitRes.json()) as GitHubCommit[];
  const latest = commits[0];

  const prRes = await gh(`/repos/${owner}/${repo}/pulls?state=open&per_page=10`);
  const pulls = (await prRes.json()) as GitHubPull[];

  const issueRes = await gh(`/repos/${owner}/${repo}/issues?state=open&per_page=10`);
  const issuesRaw = (await issueRes.json()) as GitHubIssue[];
  const issues = issuesRaw.filter((i) => !('pull_request' in i));

  let compareAhead: number | null = null;
  try {
    const compareRes = await gh(`/repos/${owner}/${repo}/compare/${branch}...origin/${branch}`);
    const compare = (await compareRes.json()) as { ahead_by?: number; behind_by?: number };
    compareAhead = compare.ahead_by ?? null;
  } catch {
    compareAhead = null;
  }

  let buildState = emptyCi('BUILD');
  try {
    const runsRes = await gh(`/repos/${owner}/${repo}/actions/runs?branch=${branch}&per_page=1`);
    const runs = (await runsRes.json()) as {
      workflow_runs: Array<{ conclusion: string | null; status: string; created_at: string; html_url: string; run_number: number }>;
    };
    const run = runs.workflow_runs[0];
    if (run) {
      const passing = run.conclusion === 'success';
      buildState = {
        status: passing ? 'PASSING' : run.conclusion === 'failure' ? 'FAILING' : 'UNKNOWN',
        lastRun: run.created_at,
        duration: null,
        workflow: 'GITHUB ACTIONS',
        branch,
        commitSha: latest?.sha ?? null,
        failureSummary: passing ? null : `RUN #${run.run_number} ${run.conclusion ?? run.status}`.toUpperCase(),
      };
    }
  } catch {
    buildState = emptyCi('BUILD');
  }

  let packageJson: Record<string, unknown> | null = null;
  try {
    const pkgRes = await gh(`/repos/${owner}/${repo}/contents/package.json?ref=${branch}`);
    const pkgMeta = (await pkgRes.json()) as { content: string; encoding: string };
    if (pkgMeta.encoding === 'base64') {
      const decoded = Buffer.from(pkgMeta.content, 'base64').toString('utf8');
      packageJson = JSON.parse(decoded) as Record<string, unknown>;
    }
  } catch {
    packageJson = null;
  }

  const deps = (packageJson?.dependencies ?? {}) as Record<string, string>;
  const devDeps = (packageJson?.devDependencies ?? {}) as Record<string, string>;
  const depEntries = Object.entries({ ...deps, ...devDeps });

  const connection: ProjectRepositoryConnection = {
    projectId,
    provider: 'GITHUB',
    repositoryOwner: owner,
    repositoryName: repo,
    repositoryId: String(repoData.id),
    repositoryUrl: repoData.html_url,
    defaultBranch: branch,
    connected: true,
    connectionStatus: 'CONNECTED',
    connectionHealth: buildState.status === 'FAILING' ? 'DEGRADED' : 'HEALTHY',
    lastSyncedAt: now,
    syncConfidence: 'HIGH',
    syncError: null,
    readOnly: true,
    permissions: ['READ'],
    createdAt: now,
    updatedAt: now,
  };

  const branchState: ProjectBranchState = {
    defaultBranch: branch,
    activeBranch: branch,
    commitsAhead: compareAhead,
    commitsBehind: null,
    lastCommitSha: latest?.sha ?? null,
    lastCommitMessage: latest?.commit.message?.split('\n')[0] ?? null,
    lastCommitAuthor: latest?.commit.author.name ?? null,
    lastCommitAt: latest?.commit.author.date ?? null,
    branchProtectionKnown: false,
    dirtyStateIfKnown: null,
    syncStatus: 'SYNCED',
  };

  return {
    connection,
    branchState,
    recentCommits: commits.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split('\n')[0] ?? '',
      author: c.commit.author.name,
      at: c.commit.author.date,
      url: c.html_url,
    })),
    pullRequests: pulls.map((p) => ({
      id: String(p.id),
      number: p.number,
      title: p.title.toUpperCase(),
      state: p.state === 'open' ? 'OPEN' : 'CLOSED',
      author: p.user?.login ?? null,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      reviewStatus: null,
      mergeability: null,
      branch: p.head.ref,
      targetBranch: p.base.ref,
      url: p.html_url,
      riskLevelIfDerived: null,
    })),
    issues: issues.map((i) => ({
      id: String(i.id),
      number: i.number,
      title: i.title.toUpperCase(),
      state: i.state === 'open' ? 'OPEN' : 'CLOSED',
      priority: i.labels.some((l) => /high|critical/i.test(l.name)) ? 'HIGH' : null,
      labels: i.labels.map((l) => l.name.toUpperCase()),
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      url: i.html_url,
      blockingRelease: i.labels.some((l) => /block|release/i.test(l.name)),
      category: i.labels[0]?.name?.toUpperCase() ?? null,
    })),
    buildState,
    testState: buildState.status === 'PASSING' ? { ...buildState, workflow: 'TESTS' } : emptyCi('TESTS'),
    lintState: emptyCi('LINT'),
    typecheckState: emptyCi('TYPECHECK'),
    dependencyState: {
      packageManager: 'npm',
      manifestFiles: ['package.json'],
      lockfileType: 'package-lock.json',
      totalDependencies: depEntries.length,
      productionDependencies: Object.keys(deps).length,
      devDependencies: Object.keys(devDeps).length,
      outdated: [],
      majorUpdates: [],
      deprecated: [],
      securityAdvisories: [],
      peerConflicts: [],
      runtimeCompatibility: typeof packageJson?.engines === 'object' ? JSON.stringify(packageJson.engines) : null,
      lastScannedAt: now,
      scanConfidence: packageJson ? 'MODERATE' : 'LOW',
    },
    packageJson,
  };
}
