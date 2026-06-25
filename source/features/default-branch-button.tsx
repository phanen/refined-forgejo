import React from "dom-chef";
import ChevronLeftIcon from "octicons-plain-react/ChevronLeft";

import features from "../feature-manager.js";
import type { Repository } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import "./default-branch-button.css";

const repoInfoCache = new Map<string, Promise<Repository | undefined>>();

async function getDefaultBranch(owner: string, repo: string): Promise<string | undefined> {
  const key = `${owner}/${repo}`;
  let promise = repoInfoCache.get(key);
  if (!promise) {
    promise = api.v1(`repos/${owner}/${repo}`)
      .then(data => data as Repository)
      .catch(() => undefined);
    repoInfoCache.set(key, promise);
  }

  return (await promise)?.default_branch;
}

function buildDefaultUrl(defaultBranch: string): string | undefined {
  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  const currentBranch = getCurrentBranch()?.replace(/^branch\//, "");
  if (!currentBranch || currentBranch === defaultBranch) {
    return undefined;
  }

  const pathname = location.pathname;
  if (/\/commits\//.test(pathname)) {
    const currentBranchSegment = currentBranch;
    const defaultBranchSegment = encodeURIComponent(defaultBranch);
    return pathname.replace(
      new RegExp(`(/commits/)${currentBranchSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=/|$)`),
      `$1${defaultBranchSegment}`,
    );
  }

  if (/\/src\/branch\//.test(pathname)) {
    const currentBranchSegment = currentBranch;
    const defaultBranchSegment = encodeURIComponent(defaultBranch);
    return pathname.replace(
      new RegExp(`(/src/branch/)${currentBranchSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=/|$)`),
      `$1${defaultBranchSegment}`,
    );
  }

  if (pageDetect.isRepoHome()) {
    return buildRepoUrl("src", "branch", encodeURIComponent(defaultBranch));
  }

  return undefined;
}

async function addButton(anchor: Element): Promise<void> {
  if (anchor.parentElement?.querySelector(".rgf-default-branch-button")) {
    return;
  }

  const currentBranch = getCurrentBranch();
  if (currentBranch?.startsWith("tag/")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  const defaultBranch = await getDefaultBranch(repo.owner, repo.name);
  if (!defaultBranch) {
    return;
  }

  const href = buildDefaultUrl(defaultBranch);
  if (!href) {
    return;
  }

  const button = (
    <a
      className="ui basic small compact button rgf-default-branch-button"
      href={href}
      data-tooltip-content="View on the default branch"
      aria-label="View on the default branch"
    >
      <ChevronLeftIcon />
    </a>
  );

  anchor.insertAdjacentElement("afterend", button);
}

function init(signal: AbortSignal): void {
  observe(".branch-dropdown-button", addButton, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoTree,
    pageDetect.isSingleFile,
    pageDetect.isRepoCommitListRoot,
  ],
  init,
});
