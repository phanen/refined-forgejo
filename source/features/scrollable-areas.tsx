import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

const scrollableSelector = [
  ".comment-body blockquote",
  ".comment-body pre",
  ".markup blockquote",
  ".markup pre",
].join(",");

function disableScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;
  if (area.scrollHeight <= area.clientHeight) {
    return;
  }

  window.scrollBy(0, area.scrollTop);
  area.classList.add("rgf-scrollable-expanded");
}

function init(signal: AbortSignal): void {
  delegate(scrollableSelector, "click", disableScroll, { signal });
}

void features.addCssFeature(import.meta.url);
features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues/1
*/
