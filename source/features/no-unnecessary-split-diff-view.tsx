import "./no-unnecessary-split-diff-view.css";

import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function manageSplitDiffState(tableBody: HTMLTableSectionElement): void {
  const container = tableBody.closest<HTMLElement>(".code-diff-split");
  if (!container) {
    return;
  }

  const hasDeletions = !!tableBody.querySelector("tr.del-code");
  const hasAdditions = !!tableBody.querySelector("tr.add-code");

  container.classList.toggle("rgf-no-unnecessary-split-diff-view", hasDeletions !== hasAdditions);
  container.classList.toggle("rgf-only-additions", hasAdditions && !hasDeletions);
  container.classList.toggle("rgf-only-deletions", hasDeletions && !hasAdditions);
}

function init(signal: AbortSignal): void {
  observe(".code-diff-split tbody", element => {
    if (element instanceof HTMLTableSectionElement) {
      manageSplitDiffState(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPR,
    pageDetect.isCompare,
    pageDetect.isSingleCommit,
  ],
  init,
});
