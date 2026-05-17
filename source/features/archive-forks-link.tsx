import React from "dom-chef";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addForksLink(banner: Element): void {
  if (banner.querySelector(".rgf-archive-forks-link") || !banner.textContent?.includes("archived")) {
    return;
  }

  banner.append(
    " You can check out ",
    <a className="rgf-archive-forks-link" href={buildRepoUrl("forks")}>its forks</a>,
    ".",
  );
}

function init(signal: AbortSignal): void {
  observe(".ui.warning.message", addForksLink, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoHome,
  ],
  init,
});
