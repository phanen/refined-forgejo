import "./more-dropdown-links.css";

import React from "dom-chef";
import GitBranchIcon from "octicons-plain-react/GitBranch";
import GitCommitIcon from "octicons-plain-react/GitCommit";
import GitCompareIcon from "octicons-plain-react/GitCompare";
import TelescopeIcon from "octicons-plain-react/Telescope";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { hasRepoHeader } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addLinks(overflowMenu: Element): void {
  if (overflowMenu.querySelector(".rgf-more-link")) {
    return;
  }

  // Commits link is already built-in in Forgejo, and constructing a robust URL for all edge cases (branch/tag/commit) is complex.
  // We omit it here to avoid redundancy and broken links.

  const itemsContainer = overflowMenu.querySelector(".overflow-menu-items");
  if (!itemsContainer) {
    return;
  }

  // Find the Settings tab to insert before it, ensuring it also stays on the right
  const settingsTab = itemsContainer.querySelector("a.item[href$='/settings']");

  const items = [
    { label: "Compare", href: buildRepoUrl("compare"), icon: GitCompareIcon },
    { label: "Branches", href: buildRepoUrl("branches"), icon: GitBranchIcon },
    { label: "Tags", href: buildRepoUrl("tags"), icon: GitCommitIcon },
    { label: "Activity", href: buildRepoUrl("activity"), icon: TelescopeIcon },
  ];

  let isFirst = true;
  for (const { label, href, icon: Icon } of items) {
    // Don't add if a matching link already exists in the nav
    if (document.querySelector(`overflow-menu a[href$="${href}"]`)) {
      continue;
    }

    const newLink = (
      <a className={`item rgf-more-link ${isFirst ? "rgf-more-link-first" : ""}`} href={href}>
        <Icon className="svg" />
        {label}
      </a>
    );

    if (settingsTab) {
      settingsTab.before(newLink);
    } else {
      itemsContainer.append(newLink);
    }

    isFirst = false;
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
