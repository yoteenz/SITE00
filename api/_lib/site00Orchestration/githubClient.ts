/** Read-only GitHub repository access for evidence ingestion */

export type GitHubRepoRef = {
  owner: string;
  repo: string;
  fullName: string;
};

export type GitHubTreeEntry = {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
};

export type GitHubRepoSnapshot = {
  ref: GitHubRepoRef;
  defaultBranch: string;
  headSha: string;
  tree: GitHubTreeEntry[];
  fetchedAt: string;
};

function githubToken(): string | null {
  return process.env.SITE00_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? null;
}

export function githubAvailable(): boolean {
  return Boolean(githubToken());
}

async function ghFetch(path: string): Promise<Response> {
  const token = githubToken();
  if (!token) throw new Error('GitHub token not configured');
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res;
}

export async function verifyRepository(ref: GitHubRepoRef): Promise<{ ok: boolean; error?: string }> {
  try {
    await ghFetch(`/repos/${ref.owner}/${ref.repo}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function fetchRepositoryTree(
  ref: GitHubRepoRef,
  maxEntries = 4000,
): Promise<GitHubRepoSnapshot> {
  const repoRes = await ghFetch(`/repos/${ref.owner}/${ref.repo}`);
  const repo = (await repoRes.json()) as { default_branch: string };
  const branch = repo.default_branch;
  const commitRes = await ghFetch(`/repos/${ref.owner}/${ref.repo}/commits/${branch}`);
  const commit = (await commitRes.json()) as { sha: string; commit: { tree: { sha: string } } };
  const treeSha = commit.commit.tree.sha;

  const tree: GitHubTreeEntry[] = [];
  let page = 1;
  while (tree.length < maxEntries) {
    const treeRes = await ghFetch(
      `/repos/${ref.owner}/${ref.repo}/git/trees/${treeSha}?recursive=1&per_page=100&page=${page}`,
    );
    const payload = (await treeRes.json()) as {
      truncated?: boolean;
      tree?: Array<{ path: string; type: string; sha: string }>;
    };
    for (const item of payload.tree ?? []) {
      if (item.type === 'blob' || item.type === 'tree') {
        tree.push({ path: item.path, type: item.type, sha: item.sha });
      }
      if (tree.length >= maxEntries) break;
    }
    if (!payload.truncated || (payload.tree?.length ?? 0) === 0) break;
    page += 1;
  }

  return {
    ref,
    defaultBranch: branch,
    headSha: commit.sha,
    tree,
    fetchedAt: new Date().toISOString(),
  };
}

export const KNOWN_REPOS = {
  site00: { owner: 'yoteenz', repo: 'SITE00', fullName: 'yoteenz/SITE00' },
  frontalSlayer: { owner: 'yoteenz', repo: 'fsbw', fullName: 'yoteenz/fsbw' },
} as const;
