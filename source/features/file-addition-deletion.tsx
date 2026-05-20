import React from "dom-chef";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";

type DiffFile = {
  Name: string;
  NameHash: string;
  Addition: number;
  Deletion: number;
};

let currentFiles: DiffFile[] | undefined;

function parseFilesFromScript(script: HTMLScriptElement): DiffFile[] | undefined {
  const match = script.textContent?.match(/const diffDataFiles = (\[[\s\S]*?\]);/);
  if (!match) {
    return undefined;
  }

  try {
    const jsonText = match[1]
      .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*):/g, "$1\"$2\":")
      .replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(jsonText) as DiffFile[];
  } catch {
    return undefined;
  }
}

function getFilesFromScripts(): DiffFile[] | undefined {
  const files = new Map<string, DiffFile>();

  for (const script of document.querySelectorAll<HTMLScriptElement>("script#diff-data-script")) {
    const diffFiles = parseFilesFromScript(script);
    if (!diffFiles) {
      continue;
    }

    for (const file of diffFiles) {
      files.set(file.NameHash, file);
    }
  }

  return [...files.values()];
}

function getFileStats(file: HTMLElement): DiffFile | undefined {
  const hash = file.id.replace(/^diff-/, "");
  return currentFiles?.find(entry => entry.NameHash.toLowerCase() === hash.toLowerCase());
}

function createSummary(addition: number, deletion: number): HTMLElement {
  return (
    <span className="rgf-file-addition-deletion tw-mx-2 tw-whitespace-nowrap">
      <span className="text green">+{addition}</span> <span className="text red">-{deletion}</span>
    </span>
  ) as HTMLElement;
}

function addStats(file: Element): void {
  if (!(file instanceof HTMLElement)) {
    return;
  }

  if (file.dataset.rgfFileAdditionDeletion === "done" || file.dataset.rgfFileAdditionDeletion === "pending") {
    return;
  }

  file.dataset.rgfFileAdditionDeletion = "pending";

  const statsBar = file.querySelector<HTMLElement>(".diff-stats-bar");
  const host = statsBar?.parentElement;
  if (!statsBar || !host) {
    delete file.dataset.rgfFileAdditionDeletion;
    return;
  }

  if (host.querySelector(".rgf-file-addition-deletion")) {
    file.dataset.rgfFileAdditionDeletion = "done";
    return;
  }

  const stats = getFileStats(file);
  if (!stats) {
    return;
  }

  for (const node of [...host.childNodes]) {
    if (node === statsBar) {
      break;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      node.remove();
    }
  }

  host.insertBefore(createSummary(stats.Addition, stats.Deletion), statsBar);
  file.dataset.rgfFileAdditionDeletion = "done";
}

function refreshAndRender(): void {
  currentFiles = getFilesFromScripts();
  if (!currentFiles) {
    return;
  }

  for (const file of document.querySelectorAll<HTMLElement>(".diff-file-box[id^='diff-']")) {
    addStats(file);
  }
}

function init(signal: AbortSignal): void {
  void refreshAndRender();

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) {
          continue;
        }

        if (node.matches("script#diff-data-script") || node.querySelector("script#diff-data-script")) {
          void refreshAndRender();
          return;
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  signal.addEventListener("abort", () => {
    observer.disconnect();
  });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPRFiles,
  ],
  awaitDomReady: true,
  init,
});
