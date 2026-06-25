// Shared utility types used across features and helpers.

export type RepoRef = {
  owner: string;
  repo: string;
  ref: string;
};

export type PullRequestLocator = {
  owner: string;
  repo: string;
  index: string;
};

export type ListenerOptions = {
  signal?: AbortSignal;
};

export type ObserverOptions = ListenerOptions & {
  once?: boolean;
  ancestor?: number;
};
