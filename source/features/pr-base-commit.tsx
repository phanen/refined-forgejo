import React from "dom-chef";

import features from "../feature-manager.js";
import type { Compare, RepositoryBranch } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import { getHeadBranch } from "../helpers/pr-base-commit.js";
import observe from "../helpers/selector-observer.js";

const branchCache = new Map<string, Promise<RepositoryBranch | undefined>>();
const compareCache = new Map<string, Promise<Compare | undefined>>();

function encodeRef(ref: string): string {
  return ref.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

async function getBranchCommit(owner: string, repo: string, branch: string): Promise<string | undefined> {
  const key = `${owner}/${repo}/${branch}`;
  let promise = branchCache.get(key);
  if (!promise) {
    promise = api.v1(`repos/${owner}/${repo}/branches/${encodeRef(branch)}`)
      .then(data => data as RepositoryBranch)
      .catch(() => undefined);
    branchCache.set(key, promise);
  }

  return (await promise)?.commit?.id;
}

async function getCompareCount(owner: string, repo: string, head: string, base: string): Promise<number | undefined> {
  const key = `${owner}/${repo}/${head}...${base}`;
  let promise = compareCache.get(key);
  if (!promise) {
    promise = api.v1(
      `repos/${owner}/${repo}/compare/${encodeRef(head)}...${encodeRef(base)}?files=false&verification=false`,
    )
      .then(data => data as Compare)
      .catch(() => undefined);
    compareCache.set(key, promise);
  }

  return (await promise)?.total_commits;
}

async function addInfo(container: Element): Promise<void> {
  if (container.querySelector(".rgf-pr-base-commit")) {
    return;
  }

  const repo = getRepo();
  const head = getHeadBranch();
  const baseBranch = document.querySelector<HTMLElement>("#pull-target-branch")?.dataset.branch?.trim();

  if (!repo || !head || !baseBranch) {
    return;
  }

  const [headCommit, baseCommit] = await Promise.all([
    getBranchCommit(head.owner, head.repo, head.ref),
    getBranchCommit(repo.owner, repo.name, baseBranch),
  ]);

  if (!headCommit || !baseCommit) {
    return;
  }

  const behindBy = await getCompareCount(head.owner, head.repo, headCommit, baseCommit);
  if (!behindBy || behindBy <= 0) {
    return;
  }

  const baseCommitLink = buildRepoUrl("commit", baseCommit);
  container.prepend(
    <div className="rgf-pr-base-commit item">
      It's <a href={baseCommitLink}>{behindBy} commit{behindBy === 1 ? "" : "s"}</a> behind (base commit:{" "}
      <a href={baseCommitLink}>{baseCommit.slice(0, 7)}</a>)
    </div>,
  );
}

function init(signal: AbortSignal): void {
  observe(".merge-section", element => {
    if (element instanceof HTMLElement) {
      void addInfo(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPR,
  ],
  init,
});
