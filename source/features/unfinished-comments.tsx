import delegate from "delegate-it";

import features from "../feature-manager.js";
import { isCompare, isConversation, isNewIssue, isPRFiles } from "../helpers/page-detect.js";

const prefix = "✏️ Comment - ";

let submitting: ReturnType<typeof setTimeout> | undefined;

function isFieldDirty(field: HTMLTextAreaElement): boolean {
  return field.value !== field.textContent;
}

function hasDraftComments(): boolean {
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>("textarea:not([id^='convert-to-issue-body'])"))
    .some(isFieldDirty);
}

function disableOnSubmit(): void {
  clearTimeout(submitting);
  submitting = setTimeout(() => {
    submitting = undefined;
  }, 2000);
}

function updateDocumentTitle(): void {
  if (submitting) {
    return;
  }

  document.title = document.title.replace(prefix, "");
  if (document.visibilityState === "hidden" && hasDraftComments()) {
    document.title = prefix + document.title;
  }
}

function init(signal: AbortSignal): void {
  delegate("form", "submit", disableOnSubmit, { signal, capture: true });
  document.addEventListener("visibilitychange", updateDocumentTitle, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
    isCompare,
    isNewIssue,
  ],
  init,
});
