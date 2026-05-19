import React from "dom-chef";

import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getHiddenState(holder: HTMLElement): boolean {
  return !!holder.querySelector(":scope > .comment-code-cloud.tw-hidden, :scope > .field.comment-code-cloud.tw-hidden");
}

function getCommentCount(holder: HTMLElement): number {
  return holder.querySelectorAll(":scope > .comment-code-cloud .comment, :scope > .field.comment-code-cloud .comment")
    .length;
}

function getNativeTextGroup(holder: HTMLElement): HTMLElement | undefined {
  return holder.querySelector<HTMLElement>(
    ".resolved-placeholder > .ui.grey.text, .collapsible-comment-box > .tw-flex.tw-items-center.tw-gap-2:first-child, .comment-header .comment-header-left",
  ) ?? undefined;
}

function update(holder: HTMLElement): void {
  const indicator = holder.querySelector<HTMLElement>(".rgf-hidden-review-comments-indicator");
  const hidden = getHiddenState(holder);
  const count = getCommentCount(holder);

  if (!hidden || !count) {
    indicator?.remove();
    return;
  }

  const text = `${count} hidden comment${count === 1 ? "" : "s"}`;

  if (indicator) {
    indicator.textContent = text;
    indicator.dataset.tooltipContent = text;
    return;
  }

  const target = getNativeTextGroup(holder);
  if (!target) {
    return;
  }

  const existingPreview = target.querySelector<HTMLElement>(".rgf-preview-hidden-comments");
  const indicatorNode = (
    <span
      className="ui tiny basic label rgf-hidden-review-comments-indicator tw-ml-2"
      data-tooltip-content={text}
    >
      {text}
    </span>
  );

  if (existingPreview) {
    target.insertBefore(indicatorNode, existingPreview);
  } else {
    target.append(indicatorNode);
  }
}

function updateAll(): void {
  for (const holder of document.querySelectorAll<HTMLElement>(".conversation-holder")) {
    update(holder);
  }
}

function init(signal: AbortSignal): void {
  observe(".conversation-holder", holder => {
    if (holder instanceof HTMLElement) {
      update(holder);
    }
  }, { signal });

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(".show-outdated, .hide-outdated")) {
      setTimeout(updateAll, 0);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
    pageDetect.isPRFiles,
  ],
  awaitDomReady: true,
  init,
});
