import "./more-dropdown-links.css";

import React from "dom-chef";
import GitBranchIcon from "octicons-plain-react/GitBranch";
import GitCommitIcon from "octicons-plain-react/GitCommit";
import GitCompareIcon from "octicons-plain-react/GitCompare";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { hasRepoHeader } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type OverflowMenuElement = Element & {
  updateItems?: () => void;
};

function wrapLabel(text: string): JSX.Element {
  return <span className="resize-for-semibold" data-text={text}>{text}</span>;
}

function addLinks(overflowMenu: OverflowMenuElement, menuItemsEl: Element): void {
  if (menuItemsEl.querySelector(".rgf-more-link")) {
    return;
  }

  // Commits link is already built-in in Forgejo, and constructing a robust URL for all edge cases (branch/tag/commit) is complex.
  // We omit it here to avoid redundancy and broken links.

  // Find the Settings tab or the overflow dropdown to insert before them
  const settingsTab = menuItemsEl.querySelector("a.item[href$='/settings']");

  const items = [
    { label: "Compare", href: buildRepoUrl("compare"), icon: GitCompareIcon },
    { label: "Branches", href: buildRepoUrl("branches"), icon: GitBranchIcon },
    { label: "Tags", href: buildRepoUrl("tags"), icon: GitCommitIcon },
  ];

  let isFirst = true;
  for (const { label, href, icon: Icon } of items) {
    // Don't add if a matching link already exists in the nav
    if (menuItemsEl.querySelector(`a[href$="${href}"]`)) {
      continue;
    }

    const newLink = (
      <a className={`item rgf-more-link ${isFirst ? "rgf-more-link-first" : ""}`} href={href}>
        <Icon className="svg" /> {wrapLabel(label)}
      </a>
    );

    if (settingsTab) {
      settingsTab.before(newLink);
    } else {
      menuItemsEl.append(newLink);
    }

    isFirst = false;
  }

  overflowMenu.updateItems?.();
}

function init(signal: AbortSignal): void {
  observe(".secondary-nav > overflow-menu > .overflow-menu-items", menuItemsEl => {
    const repoOverflowMenu = menuItemsEl.parentElement as OverflowMenuElement | null;
    if (!repoOverflowMenu) {
      return;
    }

    addLinks(repoOverflowMenu, menuItemsEl);
  }, { signal });
}

features.add(import.meta.url, {
  include: [hasRepoHeader],
  awaitDomReady: true,
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
