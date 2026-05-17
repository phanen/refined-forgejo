import React from "dom-chef";

import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addButton(bell: Element): void {
  const button = bell.parentElement?.querySelector(".rgf-unread-anywhere");
  if (button) {
    return;
  }

  bell.insertAdjacentElement(
    "afterend",
    <a
      className="item not-mobile tw-mx-0 rgf-unread-anywhere"
      href={`${location.origin}/notifications?q=unread`}
      data-tooltip-content="Open unread notifications"
      aria-label="Open unread notifications"
    >
      <div className="notification-icon-relative">
        <svg className="svg octicon-bell-fill" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M8 0a5 5 0 0 0-5 5v1.5c0 .7-.2 1.4-.6 2L1 11.5A1.5 1.5 0 0 0 2.3 14h11.4A1.5 1.5 0 0 0 15 11.5L13.6 8.5a4 4 0 0 1-.6-2V5a5 5 0 0 0-5-5Zm0 16a2 2 0 0 0 1.9-1.4H6.1A2 2 0 0 0 8 16Z" />
        </svg>
      </div>
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
