import "./new-or-deleted-file.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import { executeInMainWorld } from "../helpers/main-world.js";
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

let cachedFiles: DiffFile[] | undefined;
let lastFetch = 0;

async function getFilesFromMainWorld(): Promise<DiffFile[] | undefined> {
  // Optimization: don't bridge more than once every 250ms
  if (Date.now() - lastFetch < 250 && cachedFiles) {
    return cachedFiles;
  }

  cachedFiles = await executeInMainWorld(() => (window as any).config?.pageData?.diffFileInfo?.files);
  lastFetch = Date.now();
  return cachedFiles;
}

async function addStatusLabel(element: Element): Promise<void> {
  const box = element as HTMLElement;
  // Ensure we only process actual file boxes, not 'diff-incomplete'
  if (!box.id.startsWith("diff-") || box.id === "diff-incomplete") {
    return;
  }
  const hash = box.id.replace("diff-", "");

  let files: DiffFile[] | undefined;

  try {
    await waitFor(
      async () => {
        files = await getFilesFromMainWorld();
        // Case-insensitive match to be safe
        return files?.some((f: DiffFile) => f.NameHash.toLowerCase() === hash.toLowerCase());
      },
      { timeout: 5000 },
    );
  } catch {
    return;
  }

  const file = files?.find((f: DiffFile) => f.NameHash.toLowerCase() === hash.toLowerCase());
  if (!file) {
    return;
  }

  const header = box.querySelector(".diff-file-header");
  if (!header || header.querySelector(".rgf-file-status")) {
    return;
  }

  let statusLabel = "";
  let statusClass = "";

  // DiffFileType from gitdiff.go: 1: Add, 2: Change, 3: Del, 4: Rename, 5: Copy
  if (file.Type === 1) {
    statusLabel = "NEW";
    statusClass = "rgf-new";
  } else if (file.Type === 3) {
    statusLabel = "DELETED";
    statusClass = "rgf-deleted";
  } else if (file.Type === 4) {
    statusLabel = "RENAMED";
    statusClass = "rgf-renamed";
  } else if (file.Type === 5) {
    statusLabel = "COPIED";
    statusClass = "rgf-copied";
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
