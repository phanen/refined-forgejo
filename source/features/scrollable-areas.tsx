import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

function toggleScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;
  if (area.scrollHeight <= area.clientHeight) {
    return;
  }

  if (area.classList.contains("rgf-scrollable-expanded")) {
    area.classList.remove("rgf-scrollable-expanded");
  } else {
    window.scrollBy(0, area.scrollTop);
    area.classList.add("rgf-scrollable-expanded");
  }
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
