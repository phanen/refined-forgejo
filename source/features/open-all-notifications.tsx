import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { isNotifications } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import { selectAllNotifications } from "./select-notifications.js";

function getSelectedItems(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLInputElement>(".rgf-notification-check:checked")]
    .map(checkbox => checkbox.closest<HTMLElement>(".notifications-item"))
    .filter((item): item is HTMLElement => !!item);
}

function getSelectedLinks(): string[] {
  return getSelectedItems()
    .map(item => item.querySelector<HTMLAnchorElement>(".notifications-link[href]")?.href)
    .filter((href): href is string => !!href);
}

async function openSelectedNotifications(): Promise<void> {
  const links = getSelectedLinks();
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

async function markSelectedAsRead(event?: SubmitEvent): Promise<void> {
  event?.preventDefault();

  const items = getSelectedItems();
  if (items.length === 0) {
    return;
  }

  const params = new URLSearchParams(location.search);
  const page = params.get("page") ?? "";
  const q = params.get("q") ?? "";

  for (const item of items) {
    const notificationId = item.id.replace(/^notification_/, "");
    const body = new FormData();
    body.set("notification_id", notificationId);
    body.set("status", "read");
    if (page) {
      body.set("page", page);
    }
    if (q) {
      body.set("q", q);
    }

    await api.fetch("/notifications/status", {
      method: "POST",
      body,
      ignoreHttpStatus: true,
      responseType: "text",
    });
  }

  location.reload();
}

function updateReadButton(label: string): void {
  const button = document.querySelector<HTMLButtonElement>(
    "#notification_div form[action$='/notifications/purge'] button",
  );
  if (!button) {
    return;
  }

  button.title = label;
  button.setAttribute("data-tooltip-content", label);
  button.setAttribute("aria-label", label);
}

function addButtons(container: Element): void {
  if (!container.querySelector(".rgf-select-all-notifications")) {
    container.insertAdjacentElement(
      "afterbegin",
      (
        <button type="button" className="ui basic button rgf-select-all-notifications">
          Select all
        </button>
      ),
    );
  }

  if (!container.querySelector(".rgf-open-selected-notifications")) {
    container.append(
      <button type="button" className="ui basic button rgf-open-selected-notifications">
        Open selected
      </button>,
    );
  }
}

function updateButtons(): void {
  const selectedCount = document.querySelectorAll(".rgf-notification-check:checked").length;
  const openButton = document.querySelector<HTMLButtonElement>(".rgf-open-selected-notifications");
  if (openButton) {
    openButton.disabled = selectedCount === 0;
  }
}

function init(signal: AbortSignal): void {
  observe("#notification_div .button-row", addButtons, { signal });
  observe(".notifications-item", updateButtons, { signal });
  observe("#notification_div form[action$='/notifications/purge']", () => updateReadButton("Mark selected as read"), {
    signal,
  });

  document.addEventListener("change", event => {
    if ((event.target as Element | null)?.matches?.(".rgf-notification-check")) {
      updateButtons();
    }
  }, { signal });

  document.addEventListener("submit", event => {
    if ((event.target as Element | null)?.matches?.("#notification_div form[action$='/notifications/purge']")) {
      void markSelectedAsRead(event as SubmitEvent);
    }
  }, { signal });

  document.addEventListener("click", event => {
    const target = (event.target as Element | null)?.closest?.(
      ".rgf-select-all-notifications, .rgf-open-selected-notifications",
    );
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    if (target.classList.contains("rgf-select-all-notifications")) {
      selectAllNotifications();
    } else if (target.classList.contains("rgf-open-selected-notifications")) {
      void openSelectedNotifications();
    }
  }, { signal });

  updateButtons();
}

void features.add(import.meta.url, {
  include: [
    isNotifications,
  ],
  init,
});
