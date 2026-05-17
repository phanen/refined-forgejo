import React from "dom-chef";

import "./unread-anywhere.css";

import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addButton(bell: Element): void {
  const parent = bell.parentElement;
  if (!parent || parent.querySelector(".rgf-unread-anywhere")) {
    return;
  }

  bell.insertAdjacentElement(
    "afterend",
    <a
      className="rgf-unread-anywhere"
      href={`${location.origin}/notifications?q=unread`}
      data-tooltip-content="Open unread notifications"
      aria-label="Open unread notifications"
    >
      <svg className="svg octicon-arrow-up-right" viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
        <path d="M10.75 1.5a.75.75 0 0 0 0 1.5h1.69L7.22 8.22a.75.75 0 1 0 1.06 1.06L13.5 4.06v1.69a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5Z" />
        <path d="M3.75 3.5A2.25 2.25 0 0 0 1.5 5.75v6.5a2.25 2.25 0 0 0 2.25 2.25h6.5a2.25 2.25 0 0 0 2.25-2.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .414-.336.75-.75.75h-6.5a.75.75 0 0 1-.75-.75v-6.5c0-.414.336-.75.75-.75h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
      </svg>
    </a>,
  );
}

function init(): void {
  observe("#navbar a[href$='/notifications']", addButton);
}

void features.add(import.meta.url, {
  include: [
    pageDetect.hasRepoHeader,
    pageDetect.isDashboard,
    pageDetect.isUserProfile,
    pageDetect.isGlobalIssueList,
    pageDetect.isGlobalPRList,
  ],
  init,
});
