import { $ } from "select-dom";

import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import observe from "../helpers/selector-observer.js";

function rerunAllJobs(): void {
  const rerunButton = $("button[class*='rerun'], button[title*='rerun' i], a[href*='rerun']") as
    | HTMLButtonElement
    | null;
  if (rerunButton) {
    rerunButton.click();
  }
}

function rerunFailedJobs(): void {
  const failedButton = $("button[class*='failed'], button[title*='failed' i]") as HTMLButtonElement | null;
  if (failedButton) {
    failedButton.click();
  }
}

function replaceRerunDropdown(menu: Element, { signal }: { signal?: AbortSignal }): void {
  const menuButton = menu.querySelector("button, a");
  if (!menuButton?.textContent?.trim().toLowerCase().includes("rerun")) {
    return;
  }

  registerHotkey("r f", rerunFailedJobs, { signal });
  registerHotkey("r a", rerunAllJobs, { signal });

  const container = menu.parentElement;
  if (!container) {
    return;
  }

  const rerunAllBtn = document.createElement("button");
  rerunAllBtn.className = "btn btn-sm rgf-rerun-btn";
  rerunAllBtn.textContent = "Rerun all";
  rerunAllBtn.addEventListener("click", rerunAllJobs);

  const rerunFailedBtn = document.createElement("button");
  rerunFailedBtn.className = "btn btn-sm btn-secondary rgf-rerun-failed-btn";
  rerunFailedBtn.textContent = "Rerun failed";
  rerunFailedBtn.addEventListener("click", rerunFailedJobs);

  container.append(rerunAllBtn);
  container.append(rerunFailedBtn);
  menu.classList.add("d-none");
}

async function init(signal: AbortSignal): Promise<void> {
  observe(
    "[class*='dropdown'], [class*='menu'], action-menu, details[class*='menu']",
    replaceRerunDropdown,
    { signal },
  );
}

features.add(import.meta.url, {
  shortcuts: {
    "r f": "Re-run failed jobs",
    "r a": "Re-run all jobs",
  },
  include: [() => location.pathname.includes("/actions/runs/")],
  init,
});
