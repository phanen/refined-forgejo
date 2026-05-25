import React from "dom-chef";
import mem from "memoize";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type Commit = {
  stats?: {
    additions?: number;
    deletions?: number;
  };
};

const getCommit = mem(async (owner: string, repo: string, sha: string): Promise<Commit | undefined> => {
  try {
    return await api.v1(
      `repos/${owner}/${repo}/git/commits/${encodeURIComponent(sha)}?files=false&verification=false`,
    ) as Commit;
  } catch {
    return undefined;
  }
}, {
  cacheKey: arguments_ => arguments_.join("/"),
});

function getSha(row: HTMLElement): string | undefined {
  const link = row.querySelector<HTMLAnchorElement>(".sha a[href], td.sha a[href]");
  if (!link) {
    return undefined;
  }

  return new URL(link.href).pathname.split("/").pop();
}

async function addLinesChanged(row: HTMLElement): Promise<void> {
  if (row.dataset.rgfCommitLinesChanged === "done" || row.dataset.rgfCommitLinesChanged === "pending") {
    return;
  }
  row.dataset.rgfCommitLinesChanged = "pending";

  const sha = getSha(row);
  if (!sha) {
    row.dataset.rgfCommitLinesChanged = "done";
    return;
  }

  const repo = getRepo();
  if (!repo) {
    row.dataset.rgfCommitLinesChanged = "done";
    return;
  }

  const commit = await getCommit(repo.owner, repo.name, sha);
  const additions = commit?.stats?.additions ?? 0;
  const deletions = commit?.stats?.deletions ?? 0;
  const total = additions + deletions;
  const messageCell = row.querySelector<HTMLElement>("td.message");
  if (!messageCell || row.querySelector(".rgf-commit-lines-changed")) {
    row.dataset.rgfCommitLinesChanged = "done";
    return;
  }

  messageCell.append(
    <span
      className="rgf-commit-lines-changed tw-ml-2 tw-float-right tw-whitespace-nowrap"
      data-tooltip-content={`${total} line${total === 1 ? "" : "s"} changed`}
    >
      <span className="text green">+{additions}</span> <span className="text red">-{deletions}</span>
    </span>,
  );

  row.dataset.rgfCommitLinesChanged = "done";
}

function init(signal: AbortSignal): void {
  observe(".commit-list tr", element => {
    if (element instanceof HTMLElement) {
      void addLinesChanged(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPRCommitList,
    pageDetect.isCommitList,
  ],
  init,
});
