import features from "../feature-manager.js";
import { isEditable } from "../helpers/dom-utils.js";
import pageDetect from "../helpers/page-detect.js";

function getSelectedItem(): HTMLElement | undefined {
  const target = document.querySelector<HTMLElement>(":target");
  return target?.closest(".timeline-item[id], .diff-file-box[id]") ?? target ?? undefined;
}

function getOpenTarget(item: HTMLElement): HTMLAnchorElement | undefined {
  if (item.matches(".diff-file-box")) {
    return item.querySelector<HTMLAnchorElement>(".diff-file-name a.file-link[href]") ?? undefined;
  }

  return (
    item.querySelector<HTMLAnchorElement>(
      "a[id^='event-'][href^='#'], a[href^='#issuecomment-'], a[href^='#issue-'], a[href^='#event-']",
    )
      ?? item.querySelector<HTMLAnchorElement>("a[href]")
      ?? undefined
  );
}

function openInNewTab(event: KeyboardEvent): void {
  if (isEditable(event.target) || !event.shiftKey || event.key.toLowerCase() !== "o") {
    return;
  }

  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    return;
  }

  const link = getOpenTarget(selectedItem);
  if (!link) {
    return;
  }

  event.preventDefault();
  window.open(link.href, "_blank", "noopener");
}

function init(signal: AbortSignal): void {
  document.addEventListener("keydown", openInNewTab, { signal });
}

void features.add(import.meta.url, {
  shortcuts: {
    "shift o": "Open selection in new tab",
  },
  include: [
    pageDetect.isIssueOrPR,
    pageDetect.isPRFiles,
  ],
  init,
});
