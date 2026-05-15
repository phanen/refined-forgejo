import "./easy-toggle-files.css";
import delegate, { type DelegateEvent } from "delegate-it";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";

function toggleFile(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const header = event.delegateTarget;

  // Don't toggle if the user clicked a link or a button inside the header
  if ((event.target as Element).closest("a, button")) {
    return;
  }

  const toggleButton = header.querySelector<HTMLElement>(".fold-file");
  if (!toggleButton) {
    return;
  }

  if (event.altKey) {
    const allButtons = document.querySelectorAll<HTMLElement>(".fold-file");
    for (const button of allButtons) {
      button.click();
    }
  } else {
    toggleButton.click();
  }
}

function toggleSearchResults(event: DelegateEvent<MouseEvent, HTMLHeadingElement>): void {
  if (!event.altKey) {
    return;
  }

  event.preventDefault();
  const header = event.delegateTarget;
  const details = header.closest("details.repo-search-result") as HTMLDetailsElement | null;
  if (!details) {
    return;
  }

  const shouldOpen = !details.open;
  const allDetails = document.querySelectorAll<HTMLDetailsElement>("details.repo-search-result");
  for (const d of allDetails) {
    d.open = shouldOpen;
  }
}

function init(signal: AbortSignal): void {
  delegate(".diff-file-header", "click", toggleFile, { signal });
  delegate("details.repo-search-result > summary > h4", "click", toggleSearchResults, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
    pageDetect.isPR,
    pageDetect.isCompare,
    pageDetect.isRepoSearch,
  ],
  init,
});
