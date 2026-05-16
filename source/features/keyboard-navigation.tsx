import features from "../feature-manager.js";
import { isEditable } from "../helpers/dom-utils.js";
import pageDetect from "../helpers/page-detect.js";

const navigableItemSelector = [
  ".timeline-item[id]",
  ".diff-file-box[id]",
].join(", ");

function getSelectedItem(): HTMLElement | undefined {
  const target = document.querySelector<HTMLElement>(":target");
  return target?.closest(navigableItemSelector) ?? target ?? undefined;
}

function getNavigableItems(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(navigableItemSelector)];
}

function getViewedCheckbox(item: HTMLElement): HTMLInputElement | undefined {
  return item.querySelector<HTMLInputElement>(".viewed-file-form input[type='checkbox']") ?? undefined;
}

function handleShortcut(event: KeyboardEvent): void {
  if (isEditable(event.target)) {
    return;
  }

  const key = event.key.toLowerCase();
  if (!"jkx".includes(key)) {
    return;
  }

  const currentItem = getSelectedItem();

  if (key === "x") {
    if (!currentItem) {
      return;
    }

    const checkbox = getViewedCheckbox(currentItem);
    if (!checkbox) {
      return;
    }

    event.preventDefault();
    checkbox.click();
    return;
  }

  const items = getNavigableItems();
  if (!items.length) {
    return;
  }

  const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
  const direction = key === "j" ? 1 : -1;
  const nextIndex = Math.min(Math.max(0, currentIndex + direction), items.length - 1);

  if (nextIndex === currentIndex) {
    return;
  }

  event.preventDefault();
  location.replace(`#${items[nextIndex].id}`);
}

function init(signal: AbortSignal): void {
  document.addEventListener("keydown", handleShortcut, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isIssueOrPR,
    pageDetect.isPRFiles,
  ],
  shortcuts: {
    j: "Focus the comment/file below",
    k: "Focus the comment/file above",
    x: "Mark the file as viewed/unviewed",
  },
  init,
});
