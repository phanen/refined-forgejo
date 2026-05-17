import delegate from "delegate-it";
import React from "dom-chef";

import features from "../feature-manager.js";
import { modKey } from "../github-helpers/hotkey.js";
import { isCompare, isEditingFile, isNewFile, isNewIssue } from "../helpers/page-detect.js";

const selectors = [
  "#issue_title",
  "#issue-title-editor input.js-quick-submit",
  "input[name='commit_summary']",
];

function addWarning(field: HTMLInputElement): void {
  if (field.parentElement?.querySelector(".rgf-avoid-accidental-submissions")) {
    return;
  }

  const warning = (
    <p className="rgf-avoid-accidental-submissions tw-mt-2 tw-text-sm tw-text-muted">
      A submission via <kbd>enter</kbd> has been prevented. You can press <kbd>enter</kbd> again or use{" "}
      <kbd>{modKey}</kbd>
      <kbd>enter</kbd>.
    </p>
  );

  if (field.closest("#issue-title-editor")) {
    field.parentElement?.after(warning);
  } else {
    field.parentElement?.after(warning);
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "Enter" || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return;
  }

  const field = event.target;
  if (!(field instanceof HTMLInputElement)) {
    return;
  }

  const isRelevant = selectors.some(selector => field.matches(selector));
  if (!isRelevant) {
    return;
  }

  event.preventDefault();
  addWarning(field);
}

function init(signal: AbortSignal): void {
  delegate(selectors, "keydown", onKeydown, { signal, capture: true });
}

void features.add(import.meta.url, {
  include: [
    isCompare,
    isEditingFile,
    isNewFile,
    isNewIssue,
  ],
  init,
});
