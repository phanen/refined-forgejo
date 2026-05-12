import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

function toggleScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;

  if (area.classList.contains("rgf-scrollable-expanded")) {
    const blockOffset = area.getBoundingClientRect().top;
    if (blockOffset >= 0) {
      const prevHeight = area.scrollHeight;
      area.classList.remove("rgf-scrollable-expanded");
      window.scrollBy(0, area.scrollHeight - prevHeight);
      return;
    }

    // Block is above viewport: keep page scroll, map viewport position to scrollTop
    const contentPos = Math.max(0, -area.getBoundingClientRect().top);
    area.classList.remove("rgf-scrollable-expanded");
    area.scrollTop = Math.min(contentPos, area.scrollHeight - area.clientHeight);
    return;
  }

  if (area.scrollHeight <= area.clientHeight) {
    return;
  }

  const blockOffset = area.getBoundingClientRect().top;
  if (blockOffset >= 0) {
    const prevHeight = area.scrollHeight;
    area.classList.add("rgf-scrollable-expanded");
    area.dataset.rgfFullHeight = String(area.scrollHeight);
    window.scrollBy(0, area.scrollHeight - prevHeight);
    return;
  }

  // Block is above viewport: save scrollTop, expand without page scroll change
  area.dataset.rgfScrollTop = String(area.scrollTop);
  area.classList.add("rgf-scrollable-expanded");
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
