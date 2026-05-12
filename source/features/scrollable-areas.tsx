import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

function toggleScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;

  if (area.classList.contains("rgf-scrollable-expanded")) {
    const saved = Number(area.dataset.rgfScrollTop || 0);
    area.classList.remove("rgf-scrollable-expanded");
    area.scrollTop = Math.min(saved, area.scrollHeight - area.clientHeight);
    return;
  }

  if (area.scrollHeight <= area.clientHeight) {
    return;
  }

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
