import React from "dom-chef";
import mem from "memoize";

import features from "../feature-manager.js";
import type { PullRequest } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { isPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import type { PullRequestLocator } from "../helpers/types.js";

function getPullInfo(row: HTMLElement): PullRequestLocator | undefined {
  const link = row.querySelector<HTMLAnchorElement>(".issue-title[href*='/pulls/']");
  if (!link) {
    return undefined;
  }

  const match = link.pathname.match(/^\/(?:repo\/)?([^/]+)\/([^/]+)\/pulls\/(\d+)$/);
  if (!match) {
    return undefined;
  }

  return {
    owner: match[1],
    repo: match[2],
    index: match[3],
  };
}

const getPull = mem(async (owner: string, repo: string, index: string): Promise<PullRequest | undefined> => {
  try {
    return await api.v1(`repos/${owner}/${repo}/pulls/${index}`) as PullRequest;
  } catch {
    return undefined;
  }
}, {
  cacheKey: arguments_ => arguments_.join("/"),
});

async function updateRow(row: HTMLElement): Promise<void> {
  if (row.dataset.rgfPrListLinesChanged === "done" || row.dataset.rgfPrListLinesChanged === "pending") {
    return;
  }

  const pullInfo = getPullInfo(row);
  if (!pullInfo) {
    row.dataset.rgfPrListLinesChanged = "done";
    return;
  }

  const meta = row.querySelector<HTMLElement>(".flex-item-body.issue-meta");
  if (!meta) {
    return;
  }

  row.dataset.rgfPrListLinesChanged = "pending";

  const pull = await getPull(pullInfo.owner, pullInfo.repo, pullInfo.index);
  const additions = pull?.additions ?? 0;
  const deletions = pull?.deletions ?? 0;
  const changedFiles = pull?.changed_files ?? pull?.changedFiles ?? 0;

  if (row.querySelector(".rgf-pr-list-lines-changed")) {
    row.dataset.rgfPrListLinesChanged = "done";
    return;
  }

  meta.append(
    <span
      className="rgf-pr-list-lines-changed flex-text-inline tw-ml-2"
      data-tooltip-content={`${changedFiles} file${changedFiles === 1 ? "" : "s"} changed`}
    >
      <span className="text green">+{additions}</span> <span className="text red">-{deletions}</span>
    </span>,
  );

  row.dataset.rgfPrListLinesChanged = "done";
}

function init(signal: AbortSignal): void {
  observe(".issue-list .flex-item", element => {
    if (element instanceof HTMLElement && element.querySelector(".issue-title[href*='/pulls/']")) {
      void updateRow(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isPRList,
  ],
  init,
});
