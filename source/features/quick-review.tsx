import delegate, { type DelegateEvent } from "delegate-it";
import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import getLoggedInUser from "../helpers/get-logged-in-user.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import { getToken } from "../options-storage.js";

async function quickApprove(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
  const approval = event.altKey ? "" : prompt("Approve instantly? You can add a custom message or leave empty");
  if (approval === null) {
    return;
  }

  const index = Number.parseInt(location.pathname.match(/\/pulls\/(\d+)/)?.[1] ?? "", 10);
  if (!index) {
    return;
  }

  const repoLink = location.pathname.split("/").slice(1, 3).join("/");
  const url = `repos/${repoLink}/pulls/${index}/reviews`;

  try {
    await api.v1(url, {
      method: "POST",
      body: {
        event: "APPROVE",
        body: approval,
      },
    });
    location.reload();
  } catch (error) {
    console.error(error);
  }
}

async function addSidebarReviewButtons(list: Element): Promise<void> {
  const sidebarList = list as HTMLElement;
  if (sidebarList.dataset.rgfQuickReview === "done" || sidebarList.dataset.rgfQuickReview === "pending") {
    return;
  }
  sidebarList.dataset.rgfQuickReview = "pending";

  try {
    const reviewPath = location.pathname.replace(/\/(?:files|commits)\/?$/, "");
    const container = (
      <div className="item tw-flex tw-items-center tw-gap-2 rgf-quick-review-actions">
        <a
          href={`${reviewPath}/files#review-changes-modal`}
          className="btn-link Link--muted Link--inTextBlock"
          data-turbo-frame="repo-content-turbo-frame"
          data-hotkey="v"
          data-tooltip-content="Review now"
        >
          Review now
        </a>
      </div>
    );

    const [loggedInUser, token] = await Promise.all([getLoggedInUser(), getToken()]);
    const prAuthor = document.querySelector<HTMLAnchorElement>(".issue-title-meta .pull-desc a[href]")
      ?.getAttribute("href")
      ?.split("/")
      .filter(Boolean)
      .slice(-1)[0];
    if (token && !(loggedInUser && prAuthor && prAuthor === loggedInUser)) {
      container.append(
        <button
          type="button"
          className="btn-link Link--muted Link--inTextBlock rgf-quick-approve"
          data-tooltip-content="Approve now"
        >
          Approve now
        </button>,
      );
    }

    list.append(container);
  } finally {
    sidebarList.dataset.rgfQuickReview = "done";
  }
}

function init(signal: AbortSignal): void {
  observe(".select-reviewers-modify.dropdown + .ui.assignees.list", element => {
    if (element instanceof HTMLElement) {
      void addSidebarReviewButtons(element);
    }
  }, { signal });

  delegate(".rgf-quick-approve", "click", quickApprove, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPR,
  ],
  init,
});
