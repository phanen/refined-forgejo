import "./actions-run-removal.css";

import React from "dom-chef";
import SquareCircleIcon from "octicons-plain-react/SquareCircle";
import TrashIcon from "octicons-plain-react/Trash";

import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getRunLink(row: Element): string | null {
  return row.querySelector<HTMLAnchorElement>(".flex-item-title[href*='/actions/runs/']")?.href ?? null;
}

function isRunningRun(row: Element): boolean {
  return !!row.querySelector(".octicon-meter, .octicon-clock, .octicon-blocked");
}

function addQuickButtons(row: Element): void {
  if (row.querySelector(".rgf-actions-run-removal-buttons")) {
    return;
  }

  const runLink = getRunLink(row);
  if (!runLink) {
    return;
  }

  const trailing = row.querySelector(".flex-item-trailing");
  if (!trailing) {
    return;
  }

  const buttons = document.createElement("span");
  buttons.className = "rgf-actions-run-removal-buttons";

  if (isRunningRun(row)) {
    buttons.append(
      <button
        type="button"
        className="btn interact-bg tw-p-2 rgf-actions-run-removal-btn link-action"
        data-url={`${runLink}/cancel`}
        aria-label="Cancel workflow run"
      >
        <SquareCircleIcon />
      </button>,
    );
  } else {
    buttons.append(
      <button
        type="button"
        className="btn interact-bg tw-p-2 rgf-actions-run-removal-btn link-action"
        data-url={`${runLink}/delete`}
        data-modal-confirm="Delete workflow run?"
        aria-label="Delete workflow run"
      >
        <TrashIcon />
      </button>,
    );
  }

  trailing.append(buttons);
}

function init(signal: AbortSignal): void {
  observe(".run-list .flex-item", addQuickButtons, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isAction,
  ],
  init,
});
