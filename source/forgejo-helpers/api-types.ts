// Shape of responses from the Forgejo REST API.
// Keep field names in snake_case to match the API. Fields are marked optional
// only when the original local type marked them as optional or when they are
// only present in some endpoints; fields that existing features treat as
// always-present are non-optional.

export type Repository = {
  id?: number;
  name?: string;
  full_name?: string;
  description?: string;
  private?: boolean;
  fork: boolean;
  stars_count: number;
  forks_count?: number;
  default_branch?: string;
  created_at: string;
  updated_at?: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  parent?: {
    full_name: string;
    html_url: string;
  };
};

export type RepositoryBranch = {
  name?: string;
  commit?: {
    id?: string;
  };
};

export type RepositoryTag = {
  name: string;
  web_link?: string;
  commit?: {
    id: string;
  };
};

export type LoadBranchesAndTags = {
  default_branch?: string;
  branches?: RepositoryBranch[];
  tags: RepositoryTag[];
};

export type Issue = {
  id?: number;
  number?: number;
  title?: string;
  state?: "open" | "closed" | "all";
  is_locked: boolean;
  closed_at: string | null;
  updated_at?: string;
  created_at?: string;
  user?: { login: string; avatar_url: string };
};

export type PullRequest = {
  id?: number;
  number: number;
  title?: string;
  state: "open" | "closed";
  merge_base?: string;
  additions: number;
  deletions: number;
  changed_files: number;
  changedFiles?: number;
  head: { ref: string };
  merged: boolean;
  html_url: string;
};

export type CommitPullRequest = {
  number?: number;
};

export type ContentsResponse = {
  name?: string;
  path?: string;
  sha: string;
  type: "file" | "dir" | "symlink" | "submodule";
  content?: string;
  encoding?: string | null;
  target?: string;
  html_url?: string;
  download_url?: string;
};

export type Compare = {
  total_commits?: number;
};

export type GitCommit = {
  sha: string;
  commit: {
    message?: string;
    author: {
      name?: string;
      email?: string;
      date: string;
    };
    committer?: {
      name?: string;
      email?: string;
      date?: string;
    };
  };
  stats?: {
    additions?: number;
    deletions?: number;
    total?: number;
  };
};

export type User = {
  id?: number;
  login: string;
  login_name?: string;
  full_name?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  html_url?: string;
};

export type Organization = {
  id?: number;
  login: string;
  full_name?: string;
  avatar_url?: string;
  description?: string;
  website?: string;
  location?: string;
  visibility?: "public" | "limited" | "private";
};

export type Release = {
  id: number;
  tag_name?: string;
  target_commitish?: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  created_at?: string;
  published_at?: string;
  author?: User;
};

export type ActionRun = {
  id?: number;
  name?: string;
  status?: "success" | "failure" | "cancelled" | "running" | "waiting" | "queued";
  conclusion?: string;
  html_url?: string;
  head_branch?: string;
  head_sha?: string;
  event?: string;
  run_number?: number;
  workflow_id?: number;
};

export type ActionRunsResponse = {
  workflow_runs?: ActionRun[];
  total_count?: number;
};

export type ApiError = {
  message?: string;
  errors?: unknown;
  redirect?: string;
};
