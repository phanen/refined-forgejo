import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";

function onBackdropClick({ delegateTarget: modal, target }: DelegateEvent): void {
  if (!target) {
    return;
  }
  if (modal === target || modal.contains(target as Node)) {
    return;
  }
  modal.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape", code: "Escape" }));
}

function init(signal: AbortSignal): void {
  delegate("[class*='modal'], [class*='dialog'], .modal, .dialog", "click", onBackdropClick, { signal });
}

features.add(import.meta.url, {
  include: [
    pageDetect.isRepoTree,
    pageDetect.isSettings,
  ],
  init,
});
