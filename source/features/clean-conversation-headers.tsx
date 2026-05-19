import React from "dom-chef";
import ArrowLeftIcon from "octicons-plain-react/ArrowLeft";

import features from "../feature-manager.js";
import { isConversation } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import "./clean-conversation-headers.css";

function cleanPullRequestHeader(pullDesc: HTMLElement): void {
  // Forgejo format: <user> merged/wants to merge X commits from <head> into <base> <time>
  const codes = pullDesc.querySelectorAll("code");
  if (codes.length !== 2) {
    return;
  }

  const headBranch = codes[0];
  const baseBranch = codes[1];
  const time = pullDesc.querySelector("relative-time");

  // Find user link if it's inside (non-merged PRs)
  // We exclude links that are inside code blocks
  const userLink = [...pullDesc.querySelectorAll("a[href^=\"/\"]")].find(a => !a.closest("code"));

  // Refined GitHub style: user base ← head time
  const container = (
    <span className="rgf-clean-pull-desc">
      {userLink ? userLink.cloneNode(true) : null} {baseBranch.cloneNode(true)}
      <ArrowLeftIcon className="rgf-arrow-left-icon" />
      {headBranch.cloneNode(true)} {time ? time.cloneNode(true) : null}
    </span>
  );

  pullDesc.replaceChildren(container);
}

function cleanIssueHeader(timeDesc: HTMLElement): void {
  // Forgejo format: <user> opened this issue <time> · <N> comments
  // We want to hide the "· <N> comments" part.
  const nodes = [...timeDesc.childNodes];
  const dotIndex = nodes.findIndex(node => node.nodeType === Node.TEXT_NODE && node.textContent?.includes("·"));

  if (dotIndex !== -1) {
    // Remove the dot and everything after it
    while (timeDesc.childNodes.length > dotIndex) {
      timeDesc.lastChild?.remove();
    }
  }
}

void features.add(import.meta.url, {
  include: [
    isConversation,
  ],
  init: () => {
    observe(".pull-desc", element => {
      cleanPullRequestHeader(element as HTMLElement);
    });
    observe(".time-desc", element => {
      cleanIssueHeader(element as HTMLElement);
    });
  },
});
