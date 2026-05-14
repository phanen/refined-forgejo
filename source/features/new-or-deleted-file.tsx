import "./new-or-deleted-file.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

interface DiffFile {
  Name: string;
  NameHash: string;
  Type: number;
  Addition: number;
  Deletion: number;
}

function addStatusLabel(element: Element): void {
  const box = element as HTMLElement;
  const hash = box.id.replace("diff-", "");

  const apply = (): boolean => {
    const diffFileInfo = (window as any).config?.pageData?.diffFileInfo;
    if (!diffFileInfo?.files) {
      return false;
    }

    const file = diffFileInfo.files.find((f: DiffFile) => f.NameHash === hash);
    if (!file) {
      return false;
    }

    const header = box.querySelector(".diff-file-header");
    if (!header || header.querySelector(".rgf-file-status")) {
      return true; // Already handled or no header
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
    return true;
  };

  if (!apply()) {
    // Retry once for dynamically loaded content where script might run slightly later
    setTimeout(apply, 100);
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
