import React from "dom-chef";

import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function rerunAllJobs(): void {
  const rerunAllButton = document.querySelector<HTMLButtonElement>(
    ".action-info-summary-actions .link-action[data-url$='/rerun']",
  );
  rerunAllButton?.click();
}

function rerunFailedJobs(): void {
  const failedRerunButtons = document.querySelectorAll<HTMLElement>(
    ".job-brief-item .octicon-x-circle-fill",
  );

  for (const icon of failedRerunButtons) {
    icon.closest(".job-brief-item")?.querySelector<HTMLElement>(".job-brief-rerun")?.click();
  }
}

function addRerunFailedButton(container: Element): void {
  if (container.querySelector(".rgf-rerun-failed-btn")) {
    return;
  }

  const rerunAllButton = container.querySelector<HTMLButtonElement>(".link-action[data-url$='/rerun']");
  if (!rerunAllButton) {
    return;
  }

  const rerunFailedBtn = (
    <button
      type="button"
      className="ui basic small compact button rgf-rerun-failed-btn"
      onClick={rerunFailedJobs}
    >
      Rerun failed
    </button>
  );

  rerunAllButton.before(rerunFailedBtn);
}

function init(signal: AbortSignal): void {
  observe(".action-info-summary-actions", addRerunFailedButton, { signal });
  registerHotkey("r f", rerunFailedJobs, { signal });
  registerHotkey("r a", rerunAllJobs, { signal });
}

void features.add(import.meta.url, {
  shortcuts: {
    "r f": "Re-run failed jobs",
    "r a": "Re-run all jobs",
  },
  include: [
    pageDetect.isActionRun,
  ],
  init,
});
