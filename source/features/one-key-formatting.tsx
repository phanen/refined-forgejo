import delegate from "delegate-it";

import features from "../feature-manager.js";
import {
  isCompare,
  isConversation,
  isDeletingFile,
  isEditingFile,
  isNewFile,
  isNewIssue,
} from "../helpers/page-detect.js";

const formattingChars = new Map([
  ["`", "`"],
  ["'", "'"],
  ["\"", "\""],
  ["[", "]"],
  ["(", ")"],
  ["{", "}"],
  ["*", "*"],
  ["_", "_"],
  ["~", "~"],
  ["“", "”"],
  ["‘", "’"],
]);

const selectors = [
  "textarea.markdown-text-editor",
  "#issue_title",
  "#issue-title-editor input.js-quick-submit",
  "input[name='commit_summary']",
].join(", ");

function handleKeydown(event: KeyboardEvent): void {
  const field = event.target;
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return;
  }

  const matchingChar = formattingChars.get(event.key);
  if (!matchingChar) {
    return;
  }

  const [start, end] = [field.selectionStart, field.selectionEnd];
  if (start === null || end === null || start === end) {
    return;
  }

  if ((event.key === "'" || event.key === "\"") && end - start === 1 && field.value.slice(start, end) === event.key) {
    return;
  }

  event.preventDefault();
  field.setRangeText(`${event.key}${field.value.slice(start, end)}${matchingChar}`, start, end, "select");
}

function init(signal: AbortSignal): void {
  delegate(selectors, "keydown", handleKeydown, { signal, capture: true });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isCompare,
    isNewIssue,
    isNewFile,
    isEditingFile,
    isDeletingFile,
  ],
  init,
});
