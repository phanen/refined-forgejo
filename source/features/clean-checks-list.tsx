import "./clean-checks-list.css";

import features from "../feature-manager.js";
import { isPR } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getPriority(item: HTMLElement): number {
  if (item.querySelector(".text.red")) {
    return 0;
  }
  if (item.querySelector(".text.yellow")) {
    return 1;
  }
  if (item.querySelector(".text.green")) {
    return 2;
  }
  return 3;
}

function sortChecks(panel: Element): void {
  if (!(panel instanceof HTMLElement)) {
    return;
  }

  if (panel.dataset.rgfCleanChecksList === "done") {
    return;
  }

  const list = panel.querySelector<HTMLElement>(".commit-status-list");
  if (!list) {
    return;
  }

  const items = [...list.querySelectorAll<HTMLElement>(".commit-status-item")];
  if (!items.length) {
    return;
  }

  items.sort((a, b) => getPriority(a) - getPriority(b) || a.textContent!.localeCompare(b.textContent!));
  list.append(...items);
  panel.dataset.rgfCleanChecksList = "done";
}

function init(signal: AbortSignal): void {
  observe(".commit-status-panel", sortChecks, { signal });
}

void features.add(import.meta.url, {
  include: [
    isPR,
  ],
  init,
});
