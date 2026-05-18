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

  // Using ListPullRequests API (GET /repos/{owner}/{repo}/pulls)
  // This allows filtering by 'head' to find ALL PRs originating from this branch,
  // regardless of their 'base' branch (important for stacked PRs).
  // The 'head' parameter in Forgejo's ListPullRequests expects just the branch name
  // for the current repository.
  const allPulls = await api.v1(`repos/${repo.owner}/${repo.name}/pulls?state=all&head=${branch}`, { signal }) as any[];

  // Forgejo API has a bug where ?head=branch returns ALL PRs in the repo.
  // We must filter manually to ensure head.ref matches the current branch.
  const pulls = allPulls.filter(pr => pr.head.ref === branch);

  if (signal.aborted || pulls.length === 0) {
    return;
  }

  // Find the first flex group in the row to append the PR links to
  const group = container.querySelector(".tw-flex.tw-items-center");
  if (!group) {
    return;
  }

  group.append(
    ...pulls.map(pr => {
      const stateClass = pr.merged ? "merged" : pr.state;
      return (
        <a href={pr.html_url} className="ui label basic tw-flex tw-items-center tw-gap-1 rgf-branch-pr">
          <GitPullRequestIcon
            className={`tw-flex tw-items-center rgf-branch-pr-icon-${stateClass}`}
            width={16}
            height={16}
          />
          <span>#{pr.number}</span>
        </a>
      );
    }),
  );
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
