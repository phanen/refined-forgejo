import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type IssueInfo = {
  updated_at?: string;
};

const issueCache = new Map<number, Promise<IssueInfo | undefined>>();

function getPinnedIssueNumber(card: HTMLElement): number | undefined {
  const issueLink = card.querySelector<HTMLAnchorElement>(".issue-card-title[href]");
  const match = issueLink?.pathname.match(/\/issues\/(\d+)(?:$|[?#])/);
  if (!match) {
    return undefined;
  }

  return Number.parseInt(match[1], 10);
}

async function getIssueInfo(issueNumber: number): Promise<IssueInfo | undefined> {
  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  let promise = issueCache.get(issueNumber);
  if (!promise) {
    promise = api.v1(`repos/${repo.owner}/${repo.name}/issues/${issueNumber}`)
      .then(data => data as IssueInfo)
      .catch(() => undefined);
    issueCache.set(issueNumber, promise);
  }

  return promise;
}

async function updatePinnedIssueCard(card: HTMLElement): Promise<void> {
  if (card.dataset.rgfPinnedIssuesUpdateTime === "done") {
    return;
  }
  card.dataset.rgfPinnedIssuesUpdateTime = "done";

  const issueNumber = getPinnedIssueNumber(card);
  const meta = card.querySelector<HTMLElement>(".meta > span");
  if (!issueNumber || !meta) {
    return;
  }

  const issueInfo = await getIssueInfo(issueNumber);
  const updatedAt = issueInfo?.updated_at;
  if (!updatedAt) {
    return;
  }

  meta.replaceChildren(
    <span className="rgh-pinned-issue-number">#{issueNumber}</span>,
    " updated ",
    <relative-time datetime={updatedAt} />,
  );
}

function init(signal: AbortSignal): void {
  observe("#issue-pins .issue-card", element => {
    if (element instanceof HTMLElement) {
      void updatePinnedIssueCard(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoIssueList,
  ],
  init,
});
