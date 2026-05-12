import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

const STORAGE_KEY = "rgf-scroll-expanded";

function areaKey(area: Element): string {
  const parent = area.closest("[id]");
  const parentId = parent?.id || "page";
  const index = Array.from(
    area.parentElement?.querySelectorAll(area.tagName) ?? [],
  ).indexOf(area);
  return `${parentId}::${area.tagName}::${index}`;
}

function saveState(area: Element, expanded: boolean): void {
  const key = areaKey(area);
  try {
    const state: Record<string, boolean> = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "{}",
    );
    if (expanded) {
      state[key] = true;
    } else {
      delete state[key];
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable
  }
}

function isStoredExpanded(area: Element): boolean {
  try {
    const state: Record<string, boolean> = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "{}",
    );
    return !!state[areaKey(area)];
  } catch {
    return false;
  }
}

function toggleScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;

  const rect = area.getBoundingClientRect();
  const hiddenAbove = Math.max(0, -rect.top);
  const firstLineContent = area.scrollTop + hiddenAbove;
  const firstLineScreen = Math.max(0, rect.top);

  if (area.classList.contains("rgf-scrollable-expanded")) {
    if (firstLineScreen === 0) {
      window.scrollTo(0, window.scrollY + rect.top);
    }

    area.classList.remove("rgf-scrollable-expanded");
    area.scrollTop = Math.min(firstLineContent, area.scrollHeight - area.clientHeight);
    saveState(area, false);
    return;
  }

  if (area.scrollHeight <= area.clientHeight) {
    return;
  }

  area.classList.add("rgf-scrollable-expanded");
  window.scrollTo(0, window.scrollY + rect.top + firstLineContent - firstLineScreen);
  saveState(area, true);
}

function init(signal: AbortSignal): void {
  // Restore expanded state from sessionStorage
  observe(
    ".comment-body blockquote, .comment-body pre, .markup blockquote, .markup pre",
    (area) => {
      if (isStoredExpanded(area)) {
        area.classList.add("rgf-scrollable-expanded");
      }
    },
    { signal },
  );

  delegate(
    ".comment-body blockquote, .comment-body pre, .markup blockquote, .markup pre",
    "click",
    toggleScroll,
    { signal },
  );
}

void features.addCssFeature(import.meta.url);
features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues/1
*/
