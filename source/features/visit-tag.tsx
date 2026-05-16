import React from "dom-chef";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { svg } from "../forgejo-helpers/svg.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const visitTagSvg = (() => {
  const html = svg("octicon-arrow-up-right", 16);
  const doc = new DOMParser().parseFromString(html, "image/svg+xml");
  return doc.documentElement;
})();

function addVisitTagLink(branchSelector: Element): void {
  const container = branchSelector.closest(".js-branch-tag-selector");
  if (!container || container.querySelector(".rgf-visit-tag")) {
    return;
  }

  const tag = branchSelector.querySelector("strong")?.textContent?.trim();
  if (!tag) {
    return;
  }

  container.classList.add("tw-flex", "tw-items-center");

  const link = (
    <a
      className="rgf-visit-tag ui basic small compact button tw-flex tw-items-center tw-m-0 tw-ml-1"
      href={buildRepoUrl("releases", "tag", encodeURIComponent(tag))}
      data-tooltip-content="Visit tag"
      aria-label="Visit tag"
    >
      {visitTagSvg.cloneNode(true)}
    </a>
  );

  container.append(link);
}

function init(signal: AbortSignal): void {
  observe(".branch-dropdown-button:has(.octicon-tag)", addVisitTagLink, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoTree,
    pageDetect.isSingleFile,
  ],
  init,
});

/*

Test URLs:

- https://codeberg.org/ziglang/zig/src/tag/0.15.1
- https://codeberg.org/ziglang/zig/src/tag/0.15.1/lib/std/Build.zig

*/
