import "./quick-label-removal.css";
import React from "dom-chef";
import XIcon from "octicons-plain-react/X";
import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { isConversation } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getLabelDropdown(label: HTMLElement): HTMLElement | null {
  const labelId = label.id.replace("label_", "");
  return document.querySelector<HTMLElement>(`.select-label.dropdown .filter.menu .item[data-id="${labelId}"]`);
}

function getLabelHost(label: HTMLElement): HTMLElement | null {
  return label.querySelector<HTMLElement>(".scope-right")
    ?? label.querySelector<HTMLElement>(".ui.label");
}

async function removeLabel(label: HTMLElement): Promise<void> {
  const dropdown = document.querySelector<HTMLElement>(".select-label.dropdown .filter.menu[data-action='update']");
  const menuItem = getLabelDropdown(label);
  const issueId = dropdown?.getAttribute("data-issue-id");
  const updateUrl = dropdown?.getAttribute("data-update-url");
  const labelId = label.id.replace("label_", "");
  if (!menuItem || !issueId || !updateUrl) {
    return;
  }

  const labelList = label.closest(".ui.labels.list");
  const noSelect = labelList?.querySelector<HTMLElement>(".no-select");
  const menuCheck = menuItem.querySelector<HTMLElement>(".octicon-check");

  label.classList.add("rgf-quick-label-removal-pending");
  menuItem.classList.remove("checked");
  menuCheck?.classList.add("tw-invisible");

  try {
    await api.fetch(updateUrl, {
      method: "POST",
      body: new URLSearchParams({
        action: "detach",
        issue_ids: issueId,
        id: labelId,
      }),
    });

    label.remove();
    if (labelList && !labelList.querySelector(".item:not(.rgf-quick-label-removal-pending)")) {
      noSelect?.classList.remove("tw-hidden");
    }
  } catch (error) {
    console.error(error);
    label.classList.remove("rgf-quick-label-removal-pending");
    menuItem.classList.add("checked");
    menuCheck?.classList.remove("tw-invisible");
    if (labelList?.querySelector(".item:not(.rgf-quick-label-removal-pending)")) {
      noSelect?.classList.add("tw-hidden");
    }
  }
}

function addQuickRemoval(label: HTMLElement): void {
  if (label.querySelector(".rgf-quick-label-removal") || label.closest(".disabled")) {
    return;
  }

  // Only add if user has permission (dropdown gear icon exists)
  if (!document.querySelector(".select-label.dropdown:not(.disabled)")) {
    return;
  }

  const labelHost = getLabelHost(label);
  if (!labelHost) {
    return;
  }

  const removeButton = (
    <button
      type="button"
      className="rgf-quick-label-removal"
      title="Remove label"
      aria-label="Remove label"
      onMouseDown={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        void removeLabel(label);
      }}
    >
      <XIcon width={14} height={14} />
    </button>
  );

  labelHost.classList.add("rgf-quick-label-removal-host");
  labelHost.append(removeButton);
}

function init(signal: AbortSignal): void {
  observe(".ui.labels.list .item[id^='label_']", element => {
    if (element instanceof HTMLElement) {
      addQuickRemoval(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
  ],
  init,
});
