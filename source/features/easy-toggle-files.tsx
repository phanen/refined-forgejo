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

function init(signal: AbortSignal): void {
  delegate(".file-header", "click", toggleFile, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
    pageDetect.isPR,
    pageDetect.isCompare,
  ],
  init,
});
