import "./highlight-non-default-base-branch.css";

import features from "../feature-manager.js";
import type { Repository, RepositoryBranch } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { isIssueOrPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const repoCache = new Map<string, Promise<Repository | undefined>>();
const branchExistsCache = new Map<string, Promise<boolean>>();

function parseBranchLink(link: HTMLAnchorElement): { owner: string; repo: string; branch: string } | undefined {
  const match = link.pathname.match(/^\/(?:repo\/)?([^/]+)\/([^/]+)\/src\/branch\/(.+)$/);
  if (!match) {
    return undefined;
  }

  return {
    owner: match[1],
    repo: match[2],
    branch: decodeURIComponent(match[3]),
  };
}

async function getDefaultBranch(owner: string, repo: string): Promise<string | undefined> {
  const key = `${owner}/${repo}`;
  let promise = repoCache.get(key);
  if (!promise) {
    promise = api.v1(`repos/${owner}/${repo}`)
      .then(data => data as Repository)
      .catch(() => undefined);
    repoCache.set(key, promise);
  }
  return (await promise)?.default_branch;
}

async function branchExists(owner: string, repo: string, branch: string): Promise<boolean> {
  const key = `${owner}/${repo}/${branch}`;
  let promise = branchExistsCache.get(key);
  if (!promise) {
    promise = api.v1(`repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`, { ignoreHttpStatus: true })
      .then(data => !!(data as RepositoryBranch).name)
      .catch(() => false);
    branchExistsCache.set(key, promise);
  }
  return promise;
}

async function annotateBaseBranch(link: HTMLAnchorElement): Promise<void> {
  const parsed = parseBranchLink(link);
  if (!parsed || link.dataset.rgfBaseBranch === "done") {
    return;
  }

  link.dataset.rgfBaseBranch = "done";
  const defaultBranch = await getDefaultBranch(parsed.owner, parsed.repo);
  if (!defaultBranch) {
    return;
  }

  const exists = await branchExists(parsed.owner, parsed.repo, parsed.branch);
  const branchContainer = link.closest<HTMLElement>(".branch");
  if (!branchContainer) {
    return;
  }

  if (!exists) {
    branchContainer.classList.add("rgf-deleted-pr-branch");
    return;
  }

  if (parsed.branch !== defaultBranch) {
    branchContainer.classList.add("rgf-non-default-base-branch");
  }
}

function init(signal: AbortSignal): void {
  observe("#issue-list .issue-meta-branch .branch a", element => {
    if (element instanceof HTMLAnchorElement) {
      void annotateBaseBranch(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isIssueOrPRList,
  ],
  init,
});
