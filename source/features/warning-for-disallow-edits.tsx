import React from "dom-chef";

import features from "../feature-manager.js";
import { isCompare, isPR } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const checkboxSelectors = [
  "#allow-edits-from-maintainers input[type='checkbox']",
  "input[name='allow_maintainer_edit']",
];

function addWarning(checkbox: HTMLInputElement): void {
  const container = checkbox.closest(".inline.field, .field, .ui.checkbox");
  if (!container) {
    return;
  }

  let warning = container.querySelector<HTMLElement>(".rgf-warning-for-disallow-edits");
  if (!warning) {
    warning = (
      <div className="ui small warning message tw-mt-2 tw-mb-0 rgf-warning-for-disallow-edits">
        Maintainers may need to edit this PR. Turning this off can slow down fixes and reviews.
      </div>
    ) as HTMLElement;
    container.append(warning);
  }

  warning.classList.toggle("tw-hidden", checkbox.checked);
}

function init(signal: AbortSignal): void {
  observe(checkboxSelectors, element => {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }

    addWarning(element);
    element.addEventListener("input", () => addWarning(element), { signal });
    element.addEventListener("change", () => addWarning(element), { signal });
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isCompare,
    isPR,
  ],
  init,
});
