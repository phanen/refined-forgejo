import delegate from "delegate-it";
import React from "dom-chef";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function updateButtonText(): void {
  const btn = document.querySelector<HTMLButtonElement>(".rgf-open-all-conversations");
  if (!btn) return;

  const hasSelected = document.querySelector(".flex-item input.issue-checkbox:checked");
  btn.textContent = hasSelected ? "Open selected" : "Open all";
}

function openConversations(): void {
  const selectedLinks = [
    ...document.querySelectorAll<HTMLAnchorElement>(".flex-item:has(input.issue-checkbox:checked) .issue-title"),
  ];
  const allLinks = [...document.querySelectorAll<HTMLAnchorElement>(".issue-title")];

  const urls = selectedLinks.length > 0
    ? selectedLinks.map((link) => link.href)
    : allLinks.map((link) => link.href);

  if (urls.length > 25) {
    console.warn("Selected too many links. Is the selector still correct?");
  }

  for (const url of urls) {
    window.open(url, "_blank");
  }
}

function addOpenAllButton(toolbar: Element): void {
  const switchEl = toolbar.querySelector(".switch");
  if (!switchEl || toolbar.querySelector(".rgf-open-all-conversations")) {
    return;
  }

  switchEl.after(
    <button
      type="button"
      className="ui basic small button rgf-open-all-conversations tw-ml-2"
    >
      Open all
    </button>,
  );
}

function init(signal: AbortSignal): void {
  observe(".issue-list-toolbar-left", addOpenAllButton, { signal });
  delegate("button.rgf-open-all-conversations", "click", openConversations, { signal });
  delegate(".issue-checkbox, .issue-checkbox-all", "change", updateButtonText, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isIssueList,
    pageDetect.isPRList,
  ],
  init,
});
