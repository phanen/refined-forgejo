import React from "dom-chef";

import features from "../feature-manager.js";
import { svg } from "../forgejo-helpers/svg.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getLatestChangeRequestedEvent(): HTMLElement | undefined {
  const events = document.querySelectorAll<HTMLElement>(".timeline-item.event");
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    const text = event.textContent?.replaceAll(/\s+/g, " ") ?? "";
    if (
      event.querySelector(".badge.tw-bg-red")
      && /requested changes|请求更改/i.test(text)
      && event.querySelector("a[href^=\"#issuecomment-\"]")
    ) {
      return event;
    }
  }

  return undefined;
}

function update(): void {
  const stateLabel = document.querySelector<HTMLElement>(".issue-title-meta .issue-state-label");
  if (!stateLabel) {
    return;
  }

  const event = getLatestChangeRequestedEvent();
  if (!event) {
    document.querySelector(".rgf-jump-to-change-requested-comment")?.remove();
    return;
  }

  const eventLink = event.querySelector<HTMLAnchorElement>("a[href^=\"#issuecomment-\"]");
  if (!eventLink) {
    return;
  }

  const existing = document.querySelector<HTMLAnchorElement>(".rgf-jump-to-change-requested-comment");
  if (existing) {
    existing.href = eventLink.href;
    return;
  }

  stateLabel.insertAdjacentElement(
    "afterend",
    <a
      className="rgf-jump-to-change-requested-comment ui tiny basic label tw-ml-2"
      href={eventLink.href}
      data-tooltip-content="Jump to the latest requested changes comment"
    >
      <span className="tw-mr-1">{svg("octicon-arrow-down", 14)}</span>
      Latest requested changes
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe([".timeline-item.event", ".issue-title-meta .issue-state-label"], update, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
  ],
  awaitDomReady: true,
  init,
});
