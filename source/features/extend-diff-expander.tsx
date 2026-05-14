import "./extend-diff-expander.css";
import delegate, { type DelegateEvent } from "delegate-it";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";

function expandDiff(event: DelegateEvent): void {
  const buttons = event.delegateTarget.querySelectorAll<HTMLButtonElement>(".code-expander-button");

  // If the user clicked one of the buttons directly, let the native handler take over.
  // delegate-it's event.target might be the button or an element inside it (like the SVG).
  for (const button of buttons) {
    if (event.target === button || button.contains(event.target as Node)) {
      return;
    }
  }

  // User clicked elsewhere in the row, trigger all buttons in this row.
  for (const button of buttons) {
    button.click();
  }
}

function init(signal: AbortSignal): void {
  document.body.classList.add("rgf-extend-diff-expander");
  delegate("tr.tag-code", "click", expandDiff, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
    pageDetect.isPR,
    pageDetect.isCompare,
  ],
  init,
});
