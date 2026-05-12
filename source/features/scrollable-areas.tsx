import "./scrollable-areas.css";

import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";

function toggleScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  const area = event.delegateTarget;

  if (area.classList.contains("rgf-scrollable-expanded")) {
    const rect = area.getBoundingClientRect();
    const beforeScrollY = window.scrollY;

    const hiddenAbove = Math.max(0, -rect.top);
    const firstLineContent = area.scrollTop + hiddenAbove;
    const firstLineScreen = Math.max(0, rect.top);

    console.log("collapse — content offset:", firstLineContent, "screen offset:", firstLineScreen);

    // 第一步：调整外部滚动
    if (firstLineScreen === 0) {
      const blockPageTop = beforeScrollY + rect.top;
      area.classList.remove("rgf-scrollable-expanded");
      window.scrollTo(0, blockPageTop);
    } else {
      area.classList.remove("rgf-scrollable-expanded");
    }

    // 第二步：调整内部滚动，保持折叠前的第一行在同一屏幕位置
    area.scrollTop = Math.min(firstLineContent, area.scrollHeight - area.clientHeight);
    return;
  }

  const rect = area.getBoundingClientRect();
  const beforeScrollY = window.scrollY;

  const hiddenAbove = Math.max(0, -rect.top);
  const firstLineContent = area.scrollTop + hiddenAbove;
  const firstLineScreen = Math.max(0, rect.top);

  const blockPageTop = beforeScrollY + rect.top;
  const targetScrollY = blockPageTop + firstLineContent - firstLineScreen;

  area.classList.add("rgf-scrollable-expanded");
  window.scrollTo(0, targetScrollY);
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
