import delegate from "delegate-it";

import features from "../feature-manager.js";
import { isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function jumpToFirstNonViewedFile(): void {
  for (const file of document.querySelectorAll<HTMLElement>(".diff-file-box")) {
    if (!file.querySelector(".viewed-file-checked-form")) {
      location.replace(`#${file.id}`);
      return;
    }
  }

  window.scrollTo(0, document.body.scrollHeight);
}

function init(signal: AbortSignal): void {
  observe(["#viewed-files-summary", "#viewed-files-summary-label"], element => {
    if (element instanceof HTMLElement) {
      element.style.cursor = "pointer";
    }
  }, { signal });

  delegate("#viewed-files-summary, #viewed-files-summary-label", "click", jumpToFirstNonViewedFile, { signal });
}

void features.add(import.meta.url, {
  include: [
    isPRFiles,
  ],
  init,
});
