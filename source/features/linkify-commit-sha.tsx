import React from "dom-chef";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function linkify(element: HTMLElement): void {
  if (element.closest("a")) {
    return;
  }

  const sha = element.textContent?.trim();
  if (!sha || !/^[\da-f]{7,40}$/.test(sha)) {
    return;
  }

  const link = (
    <a
      className="rgf-linkify-commit-sha"
      href={buildRepoUrl("commit", sha)}
      style={{ color: "inherit", fontWeight: "inherit" }}
    >
      {sha}
    </a>
  );

  element.textContent = "";
  element.append(link);
}

function init(signal: AbortSignal): void {
  // Forgejo uses .sha in commit lists
  observe(".sha, [class*='sha'], [class*='commit-sha']", linkify, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isPRCommits],
  init,
});
