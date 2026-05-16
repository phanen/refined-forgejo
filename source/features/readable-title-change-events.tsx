import "./readable-title-change-events.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function enhanceTitleChange(eventText: Element): void {
  if (eventText.classList.contains("rgf-title-change-event")) {
    return;
  }

  const author = eventText.querySelector("a.author");
  const oldTitle = eventText.querySelector("b:has(strike)");
  const titles = eventText.querySelectorAll("b");
  const newTitle = titles[titles.length - 1];
  const timestamp = eventText.querySelector("a[id^='event-']");

  if (!author || !oldTitle || !newTitle || oldTitle === newTitle || !timestamp) {
    return;
  }

  eventText.classList.add("rgf-title-change-event");
  eventText.textContent = "";
  eventText.append(
    <span className="rgf-title-change-summary">
      {author}
      {" changed title "}
      {timestamp}
    </span>,
    <span className="rgf-title-change-titles">
      {oldTitle}
      {newTitle}
    </span>,
  );
}

function init(signal: AbortSignal): void {
  observe(".timeline-item.event > .text.grey.muted-links:has(> b > strike)", enhanceTitleChange, { signal });
}

void features.add(import.meta.url, {
  init,
});
