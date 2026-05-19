import { type DelegateEvent } from "delegate-it";
import delegate from "delegate-it";

import features from "../feature-manager.js";
import { isPRFiles } from "../helpers/page-detect.js";

const fileSelector = ".diff-file-box";
const viewedCheckboxSelector = ".viewed-file-form input[type='checkbox']";

let previousFile: HTMLElement | undefined;

function getFile(input: HTMLInputElement): HTMLElement | undefined {
  return input.closest<HTMLElement>(fileSelector) ?? undefined;
}

function getVisibleViewedInputs(): HTMLInputElement[] {
  return [...document.querySelectorAll<HTMLInputElement>(viewedCheckboxSelector)].filter(input => {
    const file = getFile(input);
    if (!file) {
      return false;
    }

    if ("checkVisibility" in file && !file.checkVisibility()) {
      return false;
    }

    return !file.hidden;
  });
}

function getFilesInRange(currentFile: HTMLElement): HTMLElement[] {
  const files = [...document.querySelectorAll<HTMLElement>(fileSelector)];
  const currentIndex = files.indexOf(currentFile);
  const previousIndex = previousFile ? files.indexOf(previousFile) : 0;

  return files.slice(Math.min(previousIndex, currentIndex), Math.max(previousIndex, currentIndex) + 1);
}

function batchToggle(checkbox: HTMLInputElement): void {
  const targetChecked = checkbox.checked;

  for (const other of getVisibleViewedInputs()) {
    if (other === checkbox || other.checked === targetChecked) {
      continue;
    }

    other.click();
  }
}

function handleClick(event: DelegateEvent<MouseEvent, HTMLInputElement>): void {
  if (!event.isTrusted) {
    return;
  }

  const checkbox = event.delegateTarget;
  const currentFile = getFile(checkbox);
  if (!currentFile) {
    return;
  }

  if (event.altKey) {
    batchToggle(checkbox);
  } else if (event.shiftKey) {
    const targetChecked = checkbox.checked;
    const selectedFiles = getFilesInRange(currentFile);
    for (const file of selectedFiles) {
      const other = file.querySelector<HTMLInputElement>(viewedCheckboxSelector);
      if (!other || other === checkbox || other.checked === targetChecked) {
        continue;
      }

      if ("checkVisibility" in file && !file.checkVisibility()) {
        continue;
      }

      other.click();
    }
  }

  previousFile = currentFile;
}

function init(signal: AbortSignal): void {
  delegate(viewedCheckboxSelector, "click", handleClick, { signal });

  signal.addEventListener("abort", () => {
    previousFile = undefined;
  });
}

void features.add(import.meta.url, {
  include: [
    isPRFiles,
  ],
  init,
});
