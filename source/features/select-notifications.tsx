import "./select-notifications.css";

import React from "dom-chef";
import TriangleDownIcon from "octicons-plain-react/TriangleDown";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type TypeFilter = "all" | "issues" | "pulls" | "repos";
type StatusFilter = "all" | "unread" | "read" | "pinned";

const storage = {
  get type(): TypeFilter {
    return (sessionStorage.getItem("rgf-select-notifications-type") as TypeFilter) || "all";
  },
  set type(value: TypeFilter) {
    sessionStorage.setItem("rgf-select-notifications-type", value);
  },
  get status(): StatusFilter {
    return (sessionStorage.getItem("rgf-select-notifications-status") as StatusFilter) || "all";
  },
  set status(value: StatusFilter) {
    sessionStorage.setItem("rgf-select-notifications-status", value);
  },
};

let currentType = storage.type;
let currentStatus = storage.status;
const selectionOverrides = new Map<string, boolean>();

function isIssue(item: HTMLElement): boolean {
  return !!item.querySelector(".octicon-issue-opened, .octicon-issue-closed");
}

function isPull(item: HTMLElement): boolean {
  return !!item.querySelector(
    ".octicon-git-pull-request, .octicon-git-pull-request-closed, .octicon-git-pull-request-draft, .octicon-git-merge",
  );
}

function isRepo(item: HTMLElement): boolean {
  return !!item.querySelector(".octicon-repo");
}

function matchesType(item: HTMLElement): boolean {
  switch (currentType) {
    case "issues":
      return isIssue(item);
    case "pulls":
      return isPull(item);
    case "repos":
      return isRepo(item);
    default:
      return true;
  }
}

function matchesStatus(item: HTMLElement): boolean {
  switch (currentStatus) {
    case "unread":
      return item.dataset.status === "1";
    case "read":
      return item.dataset.status === "2";
    case "pinned":
      return item.dataset.status === "3";
    default:
      return true;
  }
}

function isTypeActive(type: TypeFilter): boolean {
  return currentType === type;
}

function isStatusActive(status: StatusFilter): boolean {
  return currentStatus === status;
}

function updateSelection(): void {
  for (const item of document.querySelectorAll<HTMLElement>(".notifications-item")) {
    const match = matchesType(item) && matchesStatus(item);
    const selection = selectionOverrides.get(item.id) ?? match;
    item.classList.toggle("rgf-notification-selected", selection);
    const checkbox = item.querySelector<HTMLInputElement>(".rgf-notification-check");
    if (checkbox) {
      checkbox.checked = selection;
    }
  }
}

function setType(value: TypeFilter): void {
  currentType = value;
  storage.type = value;
  selectionOverrides.clear();
  updateSelection();
}

function setStatus(value: StatusFilter): void {
  currentStatus = value;
  storage.status = value;
  selectionOverrides.clear();
  updateSelection();
}

function createMenu(): HTMLElement {
  return (
    <details className="dropdown dir-rtl rgf-notification-select">
      <summary className="options" aria-label="Select notifications">
        <span>Select by</span>
        <TriangleDownIcon className="dropdown icon" />
      </summary>
      <div className="content">
        <div className="header">Type</div>
        <ul>
          <li>
            <a href="#" className={`item ${isTypeActive("all") ? "active" : ""}`} data-type="all">All</a>
          </li>
          <li>
            <a href="#" className={`item ${isTypeActive("issues") ? "active" : ""}`} data-type="issues">Issues</a>
          </li>
          <li>
            <a href="#" className={`item ${isTypeActive("pulls") ? "active" : ""}`} data-type="pulls">Pull requests</a>
          </li>
          <li>
            <a href="#" className={`item ${isTypeActive("repos") ? "active" : ""}`} data-type="repos">Repositories</a>
          </li>
        </ul>
        <hr />
        <div className="header">Status</div>
        <ul>
          <li>
            <a href="#" className={`item ${isStatusActive("all") ? "active" : ""}`} data-status="all">All</a>
          </li>
          <li>
            <a href="#" className={`item ${isStatusActive("unread") ? "active" : ""}`} data-status="unread">Unread</a>
          </li>
          <li>
            <a href="#" className={`item ${isStatusActive("read") ? "active" : ""}`} data-status="read">Read</a>
          </li>
          <li>
            <a href="#" className={`item ${isStatusActive("pinned") ? "active" : ""}`} data-status="pinned">Pinned</a>
          </li>
        </ul>
      </div>
    </details>
  ) as HTMLElement;
}

function addMenu(toolbar: Element): void {
  if (toolbar.querySelector(".rgf-notification-select")) {
    return;
  }

  toolbar.append(createMenu());
}

function addCheckbox(item: Element): void {
  if (!(item instanceof HTMLElement)) {
    return;
  }

  if (item.querySelector(".rgf-notification-check")) {
    return;
  }

  const icon = item.querySelector(".notifications-icon");
  if (!icon) {
    return;
  }

  icon.insertAdjacentElement(
    "beforebegin",
    <input
      type="checkbox"
      className="rgf-notification-check"
      aria-label="Select notification"
      onClick={event => event.stopPropagation()}
      onChange={event => {
        const checkbox = event.currentTarget;
        selectionOverrides.set(item.id, checkbox.checked);
        updateSelection();
      }}
    />,
  );

  updateSelection();
}

function init(signal: AbortSignal): void {
  observe(".page-content.user.notification .tw-flex.tw-items-center.tw-justify-between", addMenu, { signal });
  observe(".notifications-item", addCheckbox, { signal });

  document.addEventListener("click", event => {
    const target = (event.target as Element | null)?.closest?.("[data-type], [data-status]");
    if (!target) {
      return;
    }

    const widget = target.closest("details.rgf-notification-select");
    const element = target as HTMLElement;
    if (element.dataset.type) {
      setType(element.dataset.type as TypeFilter);
    } else if (element.dataset.status) {
      setStatus(element.dataset.status as StatusFilter);
    }

    widget?.removeAttribute("open");
  }, { signal });

  updateSelection();
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isNotifications,
  ],
  awaitDomReady: true,
  init,
});
