import React from "dom-chef";

import "./unread-anywhere.css";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

async function openUnreadNotifications(): Promise<void> {
  const html = await api.fetch("/notifications?div-only=true&q=unread", { responseType: "text" }) as string;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links = [
    ...doc.querySelectorAll<HTMLAnchorElement>(
      "#notification_table .notifications-item[data-status='1'] .notifications-link[href]",
    ),
  ]
    .map(link => link.href);

  if (links.length === 0) {
    return;
  }

  if (links.length >= 10 && !confirm(`This will open ${links.length} new tabs. Continue?`)) {
    return;
  }

  for (const url of links) {
    window.open(url, "_blank", "noopener");
  }
}

function addButton(bell: Element): void {
  const parent = bell.parentElement;
  if (!parent || parent.querySelector(".rgf-unread-anywhere")) {
    return;
  }

  bell.insertAdjacentElement(
    "afterend",
    (
      <button
        type="button"
        className="rgf-unread-anywhere"
        data-tooltip-content="Open unread notifications"
        aria-label="Open unread notifications"
        onClick={() => {
          void openUnreadNotifications();
        }}
      >
        <svg className="svg octicon-arrow-up-right" viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
          <path d="M10.75 1.5a.75.75 0 0 0 0 1.5h1.69L7.22 8.22a.75.75 0 1 0 1.06 1.06L13.5 4.06v1.69a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5Z" />
          <path d="M3.75 3.5A2.25 2.25 0 0 0 1.5 5.75v6.5a2.25 2.25 0 0 0 2.25 2.25h6.5a2.25 2.25 0 0 0 2.25-2.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .414-.336.75-.75.75h-6.5a.75.75 0 0 1-.75-.75v-6.5c0-.414.336-.75.75-.75h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
        </svg>
      </button>
    ),
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
