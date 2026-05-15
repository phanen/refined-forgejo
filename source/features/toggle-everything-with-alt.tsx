import delegate, { type DelegateEvent } from "delegate-it";
import features from "../feature-manager.js";

function toggleAllCheckboxes(event: DelegateEvent<MouseEvent, HTMLInputElement>): void {
  if (!event.altKey) {
    return;
  }

  const checkbox = event.delegateTarget;
  const isChecked = checkbox.checked;

  // Find other checkboxes in the same container or list
  const list = checkbox.closest(".flex-list, .ui.list, table, .issue-list, #repo-files-table");
  if (!list) {
    return;
  }

  const otherCheckboxes = list.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"]");
  for (const other of otherCheckboxes) {
    if (other !== checkbox && !other.disabled) {
      other.checked = isChecked;
      other.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}

function toggleAllFoldButtons(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
  if (!event.altKey) {
    return;
  }

  const button = event.delegateTarget;
  const allButtons = document.querySelectorAll<HTMLElement>(".fold-file");
  for (const other of allButtons) {
    if (other !== button) {
      other.click();
    }
  }
}

function init(signal: AbortSignal): void {
  delegate("input[type=\"checkbox\"]", "click", toggleAllCheckboxes, { signal });
  delegate(".fold-file", "click", toggleAllFoldButtons, { signal });
}

void features.add(import.meta.url, {
  init,
});
