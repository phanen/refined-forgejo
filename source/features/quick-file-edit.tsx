import "./quick-file-edit.css";

import React from "dom-chef";
import PencilIcon from "octicons-plain-react/Pencil";

import features from "../feature-manager.js";
import { isArchivedRepoAsync, isPermalink } from "../github-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addEditLink(fileLink: Element): void {
  const link = fileLink as HTMLAnchorElement;
  const row = link.closest("tr.entry");
  if (!row || row.querySelector(".rgf-quick-file-edit")) {
    return;
  }

  // Skip directories
  if (row.querySelector(".octicon-file-directory-fill")) {
    return;
  }

  // Build edit URL from the existing file link href
  // href: /{owner}/{repo}/src/branch/{branch}/{path}
  const href = link.getAttribute("href") || "";
  const editHref = href.replace("/src/branch/", "/_edit/");
  if (editHref === href) {
    return; // Not on a branch (e.g. tag), can't edit
  }

  const editLink = (
    <a
      href={editHref}
      className="rgf-quick-file-edit"
      data-tooltip-content="Edit file"
      aria-label="Edit file"
    >
      <PencilIcon width={14} height={14} />
    </a>
  );

  link.after(editLink);
}

function init(signal: AbortSignal): void {
  observe(
    "#repo-files-table tbody tr.entry td.name a.muted",
    addEditLink,
    { signal },
  );
}

features.add(import.meta.url, {
  init,
  include: [
    pageDetect.isRepoTree,
  ],
  exclude: [
    pageDetect.isRepoFile404,
    isArchivedRepoAsync,
    isPermalink,
  ],
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/src/main
*/
