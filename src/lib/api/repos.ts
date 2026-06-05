const INGEST_GATE_URL = '/api/ingest-gate';

export interface RepoListItem {
  repo_full_name: string;
  index_branch: string | null;
  indexed_branch: string | null;
  status: string;
  files_count: number;
  last_synced_at: string | null;
}

export interface UpdateBranchResponse {
  status: string;
  repository: string;
  index_branch: string | null;
  purged: number;
  resync_scheduled: boolean;
}

export async function fetchRepos(token: string): Promise<RepoListItem[]> {
  const res = await fetch(`${INGEST_GATE_URL}/api/v1/setup/repos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load repos: ${res.status}`);
  const data = await res.json();
  return data.repos as RepoListItem[];
}

export async function updateIndexBranch(
  token: string,
  owner: string,
  repo: string,
  index_branch: string | null,
): Promise<UpdateBranchResponse> {
  const res = await fetch(`${INGEST_GATE_URL}/api/v1/setup/github/${owner}/${repo}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ index_branch }),
  });
  if (!res.ok) throw new Error(`Failed to update branch: ${res.status}`);
  return res.json() as Promise<UpdateBranchResponse>;
}
