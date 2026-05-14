import "./new-or-deleted-file.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import waitFor from "../helpers/wait-for.js";

interface DiffFile {
  Name: string;
  NameHash: string;
  Type: number;
  Addition: number;
  Deletion: number;
}

async function addStatusLabel(element: Element): Promise<void> {
  const box = element as HTMLElement;
  const hash = box.id.replace("diff-", "");

  // Robustly wait for the file data to be populated in Forgejo's global state.
  // This is necessary because data for dynamically loaded files (via "Show More")
  // is appended via a deferred <script type="module"> after the DOM elements are added.
  try {
    await waitFor(() => {
      const files = (window as any).config?.pageData?.diffFileInfo?.files;
      return files?.some((f: DiffFile) => f.NameHash === hash);
    }, { timeout: 3000 });
  } catch {
    return; // Data didn't appear in time
  }

  const file = (window as any).config.pageData.diffFileInfo.files.find((f: DiffFile) => f.NameHash === hash);
  const header = box.querySelector(".diff-file-header");
  if (!header || header.querySelector(".rgf-file-status")) {
    return;
  }

  let statusLabel = "";
  let statusClass = "";

  if (file.Type === 1) { // DiffFileAdd
    statusLabel = "NEW";
    statusClass = "rgf-new";
  } else if (file.Type === 3) { // DiffFileDel
    statusLabel = "DELETED";
    statusClass = "rgf-deleted";
  }

  if (statusLabel) {
    const fileNameContainer = header.querySelector(".diff-file-name");
    if (fileNameContainer) {
      const fileLink = fileNameContainer.querySelector(".file-link");
      if (fileLink) {
        fileLink.after(
          <span className={`ui label rgf-file-status ${statusClass}`}>
            {statusLabel}
          </span>,
        );
      } else {
        fileNameContainer.append(
          <span className={`ui label rgf-file-status ${statusClass}`}>
            {statusLabel}
          </span>,
        );
      }
    }
  }
}

function init(signal: AbortSignal): void {
  observe(".diff-file-box[id^=\"diff-\"]", addStatusLabel, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
    pageDetect.isPRFiles,
    pageDetect.isCompare,
  ],
  init,
});
