import delegate, { type DelegateEvent } from "delegate-it";
import mem from "memoize";

import features from "../feature-manager.js";
import type { CommitPullRequest, GitCommit, LoadBranchesAndTags } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";

function extractCommitSha(commitLink: HTMLAnchorElement | null | undefined): string | undefined {
  const pathname = commitLink?.pathname;
  const match = pathname?.match(/\/commit\/([0-9a-f]{7,40})(?:$|[/?#])/i);
  return match?.[1];
}

function encodePathSegments(pathname: string): string {
  return pathname
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");
}

function getLineAnchor(row: HTMLElement): string | undefined {
  return row.querySelector<HTMLElement>(".lines-num span[id]")?.id || undefined;
}

function buildBlameUrl(commitSha: string, lineAnchor: string | undefined): string {
  const url = new URL(location.href);
  url.pathname = url.pathname.replace(/\/blame\/commit\/[^/]+\/+/, `/blame/commit/${encodeURIComponent(commitSha)}/`);
  url.hash = lineAnchor ? `#${lineAnchor}` : "";
  return url.href;
}

const getDeepReblameTarget = mem(
  async (owner: string, name: string, commitSha: string): Promise<string | undefined> => {
    try {
      const pullRequest = await api.v1(
        `repos/${owner}/${name}/commits/${encodeURIComponent(commitSha)}/pull`,
        { ignoreHttpStatus: true },
      ) as CommitPullRequest;

      if (pullRequest.number) {
        const commits = await api.v1(
          `repos/${owner}/${name}/pulls/${pullRequest.number}/commits?files=false&verification=false`,
        ) as GitCommit[];

        return commits[0]?.sha;
      }
    } catch {
      // Fall through to the branch-based lookup below.
    }

    try {
      const branchesAndTags = await api.v1(
        `/${owner}/${name}/commit/${encodeURIComponent(commitSha)}/load-branches-and-tags`,
      ) as LoadBranchesAndTags;

      const branchNames = [
        ...new Set(
          (branchesAndTags.branches ?? [])
            .map(branch => branch.name)
            .filter((name): name is string => !!name),
        ),
      ];
      const defaultBranch = branchesAndTags.default_branch;

      const candidateBranches = [
        ...branchNames.filter(branchName => branchName !== defaultBranch),
        ...(defaultBranch && branchNames.includes(defaultBranch) ? [defaultBranch] : []),
      ];

      for (const branchName of candidateBranches) {
        const comparePage = await api.fetch(
          `/${owner}/${name}/compare/${encodePathSegments(defaultBranch ?? branchName)}...${
            encodePathSegments(branchName)
          }`,
          { responseType: "text" },
        ) as string;
        const doc = new DOMParser().parseFromString(comparePage, "text/html");
        const pullLink = doc.querySelector<HTMLAnchorElement>("a[href*=\"/pulls/\"]");
        const pullNumber = pullLink?.pathname.match(/\/pulls\/(\d+)(?:$|[/?#])/)?.[1];
        if (!pullNumber) {
          continue;
        }

        const commits = await api.v1(
          `repos/${owner}/${name}/pulls/${pullNumber}/commits?files=false&verification=false`,
        ) as GitCommit[];

        if (commits.some(commit => commit.sha === commitSha)) {
          return commits[0]?.sha;
        }
      }
    } catch {
      // Ignore and fall back to the original reblame link.
    }

    return undefined;
  },
);

async function handleAltClick(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): Promise<void> {
  if (!event.altKey) {
    return;
  }

  event.preventDefault();

  const reblameLink = event.delegateTarget;
  const row = reblameLink.closest("tr");
  const commitLink = row?.querySelector<HTMLAnchorElement>(".blame-message a[href*='/commit/']");
  const commitSha = extractCommitSha(commitLink);
  if (!row || !commitSha) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  const deepReblameSha = await getDeepReblameTarget(repo.owner, repo.name, commitSha);
  if (!deepReblameSha) {
    location.href = reblameLink.href;
    return;
  }

  location.href = buildBlameUrl(deepReblameSha, getLineAnchor(row));
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isBlame,
  ],
  init(signal) {
    delegate(".lines-blame-btn a[href*='/blame/commit/']", "click", handleAltClick, { signal });
  },
});
