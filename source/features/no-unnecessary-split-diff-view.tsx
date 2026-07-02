import "./no-unnecessary-split-diff-view.css";

import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function manageSplitDiffState(tableBody: HTMLTableSectionElement): void {
  const container = tableBody.closest<HTMLElement>(".code-diff-split");
  if (!container) {
    return;
  }

  // A matched del/add pair shares one <tr class="del-code">; the right-side <td>s carry .add-code.
  // Probe columns directly so +1/-1 on the same line isn't misread as "only deletions".
  const hasDeletions = !!tableBody.querySelector("td.lines-code-old.del-code");
  const hasAdditions = !!tableBody.querySelector("td.lines-code-new.add-code");

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
