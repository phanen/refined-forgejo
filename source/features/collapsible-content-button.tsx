import "./collapsible-content-button.css";

import delegate, { type DelegateEvent } from "delegate-it";
import React from "dom-chef";
import FoldDownIcon from "octicons-plain-react/FoldDown";
import { insertTextIntoField } from "text-field-edit";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function addContent({ delegateTarget }: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
  const editor = delegateTarget.closest(".combo-markdown-editor");
  if (!editor) {
    return;
  }

  const field = editor.querySelector<HTMLTextAreaElement>("textarea.markdown-text-editor");
  if (!field) {
    return;
  }

  const selection = field.value.slice(field.selectionStart, field.selectionEnd);
  const newContent = [
    "<details>",
    "<summary>Details</summary>",
    "",
    selection,
    "",
    "</details>",
  ].join("\n");

  field.focus();
  insertTextIntoField(field, newContent);

  // Restore selection to the content area (between summary and closing details)
  field.setSelectionRange(
    field.value.lastIndexOf("</summary>", field.selectionStart) + "</summary>".length + 2,
    field.value.lastIndexOf("</details>", field.selectionStart) - 2,
  );
}

function append(group: Element): void {
  const btn = (
    <button
      type="button"
      className="markdown-toolbar-button rgf-collapsible-content-btn"
      data-md-button
      data-tooltip-content="Add collapsible content"
      aria-label="Add collapsible content"
    >
      <FoldDownIcon />
    </button>
  );
  group.append(btn);
}

function init(signal: AbortSignal): void {
  observe(
    ".combo-markdown-editor markdown-toolbar .markdown-toolbar-group:last-child",
    append,
    { signal },
  );
  delegate(".rgf-collapsible-content-btn", "click", addContent, { signal });
}

features.add(import.meta.url, {
  init,
});
