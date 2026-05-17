import React from "dom-chef";
import GitPullRequestIcon from "octicons-plain-react/GitPullRequest";
import IssueOpenedIcon from "octicons-plain-react/IssueOpened";

import "./conversation-links-on-repo-lists.css";
import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function addConversationLinks(starLink: HTMLAnchorElement): void {
  const item = starLink.closest(".flex-item");
  const trailing = item?.querySelector(".flex-item-trailing");

  if (!item || !trailing || item.querySelector(".rgf-repo-list-conversation-links")) {
    return;
  }

  const baseUrl = new URL(starLink.href);
  const repoBase = baseUrl.pathname.replace(/\/(stars|forks)$/, "");
  const issuesUrl = `${baseUrl.origin}${repoBase}/issues`;
  const pullsUrl = `${baseUrl.origin}${repoBase}/pulls`;

  trailing.append(
    <div className="rgf-repo-list-conversation-links">
      <a className="flex-text-inline" href={issuesUrl} data-tooltip-content="Issues" aria-label="Issues">
        <IssueOpenedIcon className="rgf-repo-list-conversation-links-icon" />
      </a>
      <a
        className="flex-text-inline"
        href={pullsUrl}
        data-tooltip-content="Pull requests"
        aria-label="Pull requests"
      >
        <GitPullRequestIcon className="rgf-repo-list-conversation-links-icon" />
      </a>
    </div>,
  );
}

function init(signal: AbortSignal): void {
  observe([
    ".flex-item-trailing a[href$='/stars']",
    ".flex-item-trailing a[href$='/forks']",
  ], element => {
    if (element instanceof HTMLAnchorElement) {
      addConversationLinks(element);
    }
  }, { signal });
}

features.add(import.meta.url, {
  init,
});
