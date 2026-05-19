import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const updateThreshold = 10_000;

function parseTime(element: Element | null | undefined): number {
  const datetime = element?.getAttribute("datetime");
  return datetime ? new Date(datetime).getTime() : Number.NaN;
}

function removeDuplicateUpdateTime(item: HTMLElement): void {
  const [stateChangeTime, updateTime] = item.querySelectorAll<HTMLElement>(
    "#issue-list .flex-item-body > span > relative-time",
  );
  if (!stateChangeTime || !updateTime) {
    return;
  }

  const stateChange = parseTime(stateChangeTime);
  const updated = parseTime(updateTime);
  if (!Number.isFinite(stateChange) || !Number.isFinite(updated)) {
    return;
  }

  if (updated - stateChange < updateThreshold) {
    updateTime.closest(".flex-text-inline")?.remove();
  }
}

function init(signal: AbortSignal): void {
  observe(".flex-item", element => {
    if (element instanceof HTMLElement) {
      removeDuplicateUpdateTime(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isIssueOrPRList,
  ],
  init,
});
