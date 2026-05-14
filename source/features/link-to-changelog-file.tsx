import React from "dom-chef";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addChangelogLink(container: Element): void {
  if (container.querySelector(".rgf-changelog-link")) {
    return;
  }

  container.append(
    <a className="secondary button rgf-changelog-link" href={buildRepoUrl("src/branch/main/CHANGELOG.md")}>
      Changelog
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe(".release-list-buttons", addChangelogLink, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isReleases],
  init,
});
