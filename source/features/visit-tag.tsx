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

function addVisitTagLink(button: Element): void {
  const container = button.closest(".button-sequence, .file-header-right, .repo-button-row");
  if (!container || container.querySelector(".rgf-visit-tag")) {
    return;
  }

  const tag = document.querySelector<HTMLElement>(".branch-dropdown-button strong")?.textContent?.trim();
  if (!tag) {
    return;
  }

  container.append(
    <a
      className="rgf-visit-tag ui basic compact button"
      href={buildRepoUrl("releases", "tag", encodeURIComponent(tag))}
      data-tooltip-content="Visit tag"
      aria-label="Visit tag"
    >
      {visitTagSvg.cloneNode(true)}
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe(".branch-dropdown-button:has(.octicon-tag), .file-header-right .button-sequence", addVisitTagLink, {
    signal,
  });
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
