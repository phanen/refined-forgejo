import "./locked-issue.css";

import React from "dom-chef";
import LockIcon from "octicons-plain-react/Lock";
import features from "../feature-manager.js";
import type { Issue } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getIssueIndex(): number | undefined {
  const repo = getRepo();
  const index = repo?.pathParts[1];
  if (!repo || !["issues", "pulls"].includes(repo.pathParts[0] ?? "") || !index) {
    return undefined;
  }

  const parsed = Number.parseInt(index, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function update(stateLabel: HTMLElement, signal: AbortSignal): Promise<void> {
  if (document.querySelector(".rgf-locked-issue")) {
    return;
  }

  const repo = getRepo();
  const index = getIssueIndex();
  if (!repo || !index) {
    return;
  }

  try {
    const issue = await api.v1(`repos/${repo.owner}/${repo.name}/issues/${index}`, { signal }) as Issue;
    if (!issue.is_locked) {
      return;
    }

    stateLabel.insertAdjacentElement(
      "afterend",
      <span className="ui small basic label tw-ml-2 rgf-locked-issue">
        <LockIcon className="tw-mr-1 rgf-locked-issue-icon" />
        Locked
      </span>,
    );
  } catch {
    // Ignore API errors; the label is just an enhancement.
  }
}

function init(signal: AbortSignal): void {
  observe(".issue-title-meta .issue-state-label", element => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    void update(element, signal);
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
  ],
  awaitDomReady: true,
  init,
});
