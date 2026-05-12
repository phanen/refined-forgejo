import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

function toggleScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;

  // Save block's screen position before toggle
  const savedBlockOffset = area.getBoundingClientRect().top;

  if (area.classList.contains("rgf-scrollable-expanded")) {
    // Collapse: save internal scroll position, remove class
    const savedScrollTop = Number(area.dataset.rgfScrollTop || 0);
    area.classList.remove("rgf-scrollable-expanded");
    area.scrollTop = Math.min(savedScrollTop, area.scrollHeight - area.clientHeight);
  } else {
    if (area.scrollHeight <= area.clientHeight) {
      return;
    }

    // Expand: save internal scroll position, add class
    area.dataset.rgfScrollTop = String(area.scrollTop);
    area.classList.add("rgf-scrollable-expanded");
  }

  // Restore block's screen position to where it was before toggle
  const newBlockOffset = area.getBoundingClientRect().top;
  window.scrollBy(0, newBlockOffset - savedBlockOffset);
}

function init(signal: AbortSignal): void {
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
