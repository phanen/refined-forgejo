import "./quick-review-comment-deletion.css";

import delegate, { type DelegateEvent } from "delegate-it";
import React from "dom-chef";
import TrashIcon from "octicons-plain-react/Trash";

import features from "../feature-manager.js";
import { isConversation, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function clickDelete(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
  const button = event.delegateTarget;
  const editZone = button.closest(".edit-content-zone");
  const comment = editZone?.closest(".comment");
  const deleteButton = comment?.querySelector<HTMLElement>(".delete-comment");
  deleteButton?.click();
}

function addDeleteButton(actions: Element): void {
  if (actions.querySelector(".rgf-review-comment-delete-button")) {
    return;
  }

  const cancelButton = actions.querySelector("button.cancel, button.ui.basic.cancel.button");
  if (!cancelButton) {
    return;
  }

  cancelButton.insertAdjacentElement(
    "beforebegin",
    <button type="button" className="ui tiny red button rgf-review-comment-delete-button">
      <TrashIcon />
    </button>,
  );
}

function init(signal: AbortSignal): void {
  observe(".edit-content-zone:not(.tw-hidden) .text.right.edit", addDeleteButton, { signal });
  delegate(".rgf-review-comment-delete-button", "click", clickDelete, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
  ],
  init,
});
