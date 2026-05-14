import "./more-dropdown-links.css";

import React from "dom-chef";
import GitBranchIcon from "octicons-plain-react/GitBranch";
import GitCommitIcon from "octicons-plain-react/GitCommit";
import GitCompareIcon from "octicons-plain-react/GitCompare";
import TelescopeIcon from "octicons-plain-react/Telescope";

import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch } from "../forgejo-helpers/index.js";
import { hasRepoHeader } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addLinks(overflowMenu: Element): void {
  if (overflowMenu.querySelector(".rgf-more-link")) {
    return;
  }

  const branchOrTag = getCurrentBranch();
  // Commits link is already built-in in Forgejo, and constructing a robust URL for all edge cases (branch/tag/commit) is complex.
  // We omit it here to avoid redundancy and broken links.

  const itemsContainer = overflowMenu.querySelector(".overflow-menu-items");
  if (!itemsContainer) {
    return;
  }

  const items = [
    { label: "Compare", href: buildRepoUrl("compare"), icon: GitCompareIcon },
    { label: "Branches", href: buildRepoUrl("branches"), icon: GitBranchIcon },
    { label: "Tags", href: buildRepoUrl("tags"), icon: GitCommitIcon },
    { label: "Activity", href: buildRepoUrl("activity"), icon: TelescopeIcon },
  ];

  for (const { label, href, icon: Icon } of items) {
    // Don't add if a matching link already exists in the nav
    if (document.querySelector(`overflow-menu a[href$="${href}"]`)) {
      continue;
    }

    itemsContainer.append(
      <a className="item rgf-more-link" href={href}>
        <Icon className="svg" />
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
