import React from "dom-chef";
import mem from "memoize";
import TagIcon from "octicons-plain-react/Tag";

import "./closing-remarks.css";
import features from "../feature-manager.js";
import type { LoadBranchesAndTags, RepositoryTag } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getRepo } from "../forgejo-helpers/index.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function isStableTag(tagName: string): boolean {
  return !tagName.includes("nightly") && /\d[.]\d/.test(tagName);
}

function getMergedCommitSha(): string | undefined {
  const mergedEvent = [...document.querySelectorAll<HTMLElement>(".timeline-item.event")].reverse().find(event =>
    event.querySelector(".badge.tw-bg-purple .octicon-git-merge")
  );
  const commitLink = mergedEvent?.querySelector<HTMLAnchorElement>("a.ui.sha[href*=\"/commit/\"]");
  return commitLink?.pathname.split("/").pop() ?? undefined;
}

function getMergedCommitShaFrom(element: Element): string | undefined {
  const event = element.closest<HTMLElement>(".timeline-item.event");
  const commitLink = event?.querySelector<HTMLAnchorElement>("a.ui.sha[href*=\"/commit/\"]");
  return commitLink?.pathname.split("/").pop() ?? undefined;
}

const findFirstStableTag = mem(
  async (_owner: string, _repo: string, sha: string): Promise<RepositoryTag | undefined> => {
    const { tags } = await api.fetch(
      buildRepoUrl("commit", sha, "load-branches-and-tags"),
    ) as LoadBranchesAndTags;
    for (let index = tags.length - 1; index >= 0; index -= 1) {
      const tag = tags[index];
      if (isStableTag(tag.name)) {
        return tag;
      }
    }

    return undefined;
  },
  {
    cacheKey: arguments_ => arguments_.join("/"),
  },
);

async function update(element: Element): Promise<void> {
  const pullDesc = element instanceof HTMLElement
      && element.matches(".issue-title-meta .pull-desc, .issue-title-meta #pull-desc-display")
    ? element
    : document.querySelector<HTMLElement>(".issue-title-meta .pull-desc, .issue-title-meta #pull-desc-display")
      ?? undefined;
  if (!pullDesc || pullDesc.dataset.rgfClosingRemarks === "done" || pullDesc.dataset.rgfClosingRemarks === "pending") {
    return;
  }

  const repo = getRepo();
  const mergedCommitSha = getMergedCommitShaFrom(element) ?? getMergedCommitSha();
  if (!repo || !mergedCommitSha) {
    return;
  }

  pullDesc.dataset.rgfClosingRemarks = "pending";
  try {
    const tag = await findFirstStableTag(repo.owner, repo.name, mergedCommitSha);
    if (!tag) {
      pullDesc.dataset.rgfClosingRemarks = "done";
      return;
    }

    pullDesc.insertAdjacentElement(
      "afterend",
      <span className="rgf-closing-remarks tw-ml-2 tw-inline-flex tw-items-center tw-gap-2">
        <a
          className="ui tiny basic label rgf-closing-remarks-tag"
          href={buildRepoUrl("releases", "tag", encodeURIComponent(tag.name))}
          data-tooltip-content="Visit the first tag reached by this merge"
        >
          <TagIcon className="rgf-closing-remarks-icon tw-mr-1" />
          {tag.name}
        </a>
      </span>,
    );
    pullDesc.dataset.rgfClosingRemarks = "done";
  } catch (error) {
    console.warn("closing-remarks failed", error);
    delete pullDesc.dataset.rgfClosingRemarks;
  }
}

function init(signal: AbortSignal): void {
  observe([".issue-title-meta .pull-desc", ".issue-title-meta #pull-desc-display", ".timeline-item.event"], update, {
    signal,
  });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
  ],
  awaitDomReady: true,
  init,
});
