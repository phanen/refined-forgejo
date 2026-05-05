import "./actions-run-removal.css";

import React from "dom-chef";
import SquareCircleIcon from "octicons-plain-react/SquareCircle";
import TrashIcon from "octicons-plain-react/Trash";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function addQuickButtons(kebabButton: Element): void {
  const row = kebabButton.closest(".job, .run, .box-row, [class*='run'], tr");
  if (!row) {
    return;
  }

  const cancelForm = row.querySelector("form[action*='cancel']") as HTMLFormElement | null;
  const deleteButton = row.querySelector("button[class*='delete'], button[title*='delete' i]") as HTMLButtonElement | null;

  if (cancelForm && !row.querySelector(".rgf-actions-cancel-btn")) {
    const btn = document.createElement("button");
    btn.className = "rgf-actions-cancel-btn timeline-comment-action btn-link p-1";
    btn.setAttribute("aria-label", "Cancel workflow run");
    btn.type = "submit";
    btn.formAction = cancelForm.action;
    btn.append(<SquareCircleIcon />);
    btn.addEventListener("click", () => {
      setTimeout(() => cancelForm.requestSubmit(), 0);
    });
    row.append(btn);
  }

  if (deleteButton && !row.querySelector(".rgf-actions-delete-btn")) {
    const btn = document.createElement("button");
    btn.className = "rgf-actions-delete-btn timeline-comment-action btn-link p-1";
    btn.setAttribute("aria-label", "Delete workflow run");
    btn.append(<TrashIcon />);
    btn.addEventListener("click", () => {
      deleteButton.click();
    });
    row.append(btn);
  }
}

async function init(signal: AbortSignal): Promise<void> {
  observe(
    [
      ".octicon-kebab-horizontal",
      "[class*='kebab']",
      "[class*='menu']",
      "[class*='more']",
    ].join(","),
    addQuickButtons,
    {signal},
  );
}

features.add(import.meta.url, {
  include: [() => location.pathname.includes("/actions/")],
  init,
});