import "./list-prs-for-branch.css";
import React from "dom-chef";
import GitPullRequestIcon from "octicons-plain-react/GitPullRequest";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

async function addPrLinks(container: HTMLElement, signal: AbortSignal): Promise<void> {
  const repo = getRepo();
  const branchInfo = getCurrentBranch();
  if (!repo || !branchInfo || !branchInfo.startsWith("branch/")) {
    return;
  }

  const branch = branchInfo.replace("branch/", "");
  const defaultBranch = document.querySelector("meta[name=\"_default_branch\"]")?.getAttribute("content") ?? "main";

  // GET /repos/{owner}/{repo}/pulls/{base}/{head}
  try {
    const pr = await api.v1(`repos/${repo.owner}/${repo.name}/pulls/${defaultBranch}/${branch}`, { signal }) as any;

    if (signal.aborted || !pr) {
      return;
    }

    // Find the first flex group in the row to append the PR links to
    const group = container.querySelector(".tw-flex.tw-items-center");
    if (!group) {
      return;
    }

    const stateClass = pr.merged ? "merged" : pr.state;

    group.append(
      <a href={pr.html_url} className="ui label basic tw-flex tw-items-center tw-gap-1 rgf-branch-pr">
        <GitPullRequestIcon
          className={`tw-flex tw-items-center rgf-branch-pr-icon-${stateClass}`}
          width={16}
          height={16}
        />
        <span>#{pr.number}</span>
      </a>,
    );
  } catch (error: any) {
    if (error.status !== 404) {
      console.error("Failed to fetch PR for branch:", error);
    }
  }
}

function init(signal: AbortSignal): void {
  observe(".repo-button-row", (container) => {
    void addPrLinks(container as HTMLElement, signal);
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoCommitList,
  ],
  init,
});
