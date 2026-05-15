import delegate from "delegate-it";
import React from "dom-chef";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";

function openAll(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(".issue-title a.title, a.issue-title");
  const urls = [...links].map((link) => link.href);

  if (urls.length > 25) {
    console.warn("Selected too many links. Is the selector still correct?");
  }

  for (const url of urls) {
    window.open(url, "_blank");
  }
}

function init(signal: AbortSignal): void {
  const checkbox = document.querySelector(".issue-checkbox-all");
  if (!checkbox) {
    return;
  }

  checkbox.after(
    <button
      type="button"
      className="ui basic small button rgf-open-all-conversations tw-ml-2"
    >
      Open all
    </button>,
  );

  delegate("button.rgf-open-all-conversations", "click", openAll, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isIssueList,
    pageDetect.isPRList,
  ],
  init,
});
