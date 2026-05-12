import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

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
    return;
  }

  if (area.scrollHeight <= area.clientHeight) {
    return;
  }

  area.classList.add("rgf-scrollable-expanded");
  window.scrollTo(0, window.scrollY + rect.top + firstLineContent - firstLineScreen);
}

function init(signal: AbortSignal): void {
  // Collapse all expanded blocks before page unload
  globalThis.addEventListener("beforeunload", () => {
    for (
      const area of document.querySelectorAll<HTMLElement>(
        ".comment-body pre, .comment-body blockquote, .markup pre, .markup blockquote",
      )
    ) {
      if (area.classList.contains("rgf-scrollable-expanded")) {
        area.classList.remove("rgf-scrollable-expanded");
        area.scrollTop = 0;
      }
    }
  }, { signal });

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
