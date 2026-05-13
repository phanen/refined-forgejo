import "./more-dropdown-links.css";

import React from "dom-chef";
import GitBranchIcon from "octicons-plain-react/GitBranch";
import GitCommitIcon from "octicons-plain-react/GitCommit";
import GitCompareIcon from "octicons-plain-react/GitCompare";
import TelescopeIcon from "octicons-plain-react/Telescope";

import features from "../feature-manager.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { hasRepoHeader } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addLinks(overflowMenu: Element): void {
  if (overflowMenu.querySelector(".rgf-more-link")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  const itemsContainer = overflowMenu.querySelector(".overflow-menu-items");
  if (!itemsContainer) {
    return;
  }

  const items = [
    { label: "Compare", href: `/${repo.nameWithOwner}/compare`, icon: GitCompareIcon },
    { label: "Commits", href: `/${repo.nameWithOwner}/commits`, icon: GitCommitIcon },
    { label: "Branches", href: `/${repo.nameWithOwner}/branches`, icon: GitBranchIcon },
    { label: "Tags", href: `/${repo.nameWithOwner}/tags`, icon: GitCommitIcon },
    { label: "Activity", href: `/${repo.nameWithOwner}/activity`, icon: TelescopeIcon },
  ];

  for (const { label, href, icon: Icon } of items) {
    // Don't add if a matching link already exists in the nav
    if (document.querySelector(`overflow-menu a[href$="${href}"]`)) {
      continue;
    }

    itemsContainer.append(
      <a className="item rgf-more-link" href={href}>
        <Icon />
        {label}
      </a>,
    );
  }

  // Trigger overflow-menu to re-measure and include new items
  window.dispatchEvent(new Event("resize"));
}

function init(signal: AbortSignal): void {
  observe("overflow-menu", addLinks, { signal });
}

features.add(import.meta.url, {
  include: [hasRepoHeader],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
