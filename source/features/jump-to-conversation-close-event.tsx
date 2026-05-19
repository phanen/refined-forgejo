import "./jump-to-conversation-close-event.css";

import React from "dom-chef";
import features from "../feature-manager.js";
import { wrap } from "../helpers/dom-utils.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getLastCloseEvent(): HTMLElement | undefined {
  const events = document.querySelectorAll<HTMLElement>(".timeline-item.event");
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (event.querySelector(".badge .octicon-circle-slash, .badge .octicon-git-merge")) {
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

  const closeEvent = getLastCloseEvent();
  if (!closeEvent) {
    return;
  }

  const eventLink = closeEvent.querySelector<HTMLAnchorElement>("a[href*=\"#\"]");
  if (!eventLink) {
    return;
  }

  const existing = stateLabel.closest<HTMLAnchorElement>("a.rgf-jump-to-conversation-close-event");
  if (existing) {
    existing.href = eventLink.href;
    return;
  }

  wrap(
    stateLabel,
    <a
      className="rgf-jump-to-conversation-close-event"
      href={eventLink.href}
      data-tooltip-content="Scroll to most recent close event"
    />,
  );
}

function init(signal: AbortSignal): void {
  observe(".timeline-item.event, .issue-title-meta .issue-state-label", update, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
  ],
  awaitDomReady: true,
  init,
});
