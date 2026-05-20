import React from "dom-chef";

import features from "../feature-manager.js";
import { executeInMainWorld } from "../helpers/main-world.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import waitFor from "../helpers/wait-for.js";

type DiffFile = {
  Name: string;
  NameHash: string;
  Addition: number;
  Deletion: number;
};

let cachedFiles: DiffFile[] | undefined;
let lastFetch = 0;

async function getFilesFromMainWorld(): Promise<DiffFile[] | undefined> {
  if (Date.now() - lastFetch < 250 && cachedFiles) {
    return cachedFiles;
  }

  cachedFiles = await executeInMainWorld(() =>
    (window as Window & {
      config?: {
        pageData?: {
          diffFileInfo?: {
            files?: DiffFile[];
          };
        };
      };
    }).config?.pageData?.diffFileInfo?.files
  );
  lastFetch = Date.now();
  return cachedFiles;
}

async function getFileStats(file: HTMLElement): Promise<DiffFile | undefined> {
  const hash = file.id.replace(/^diff-/, "");
  let files: DiffFile[] | undefined;

  try {
    await waitFor(async () => {
      files = await getFilesFromMainWorld();
      return files?.some(entry => entry.NameHash.toLowerCase() === hash.toLowerCase());
    }, { timeout: 5000 });
  } catch {
    return undefined;
  }

  return files?.find(entry => entry.NameHash.toLowerCase() === hash.toLowerCase());
}

function createSummary(addition: number, deletion: number): HTMLElement {
  return (
    <span className="rgf-file-addition-deletion tw-mx-2 tw-whitespace-nowrap">
      <span className="text green">+{addition}</span> <span className="text red">-{deletion}</span>
    </span>
  ) as HTMLElement;
}

async function addStats(file: Element): Promise<void> {
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

  const stats = await getFileStats(file);
  if (!stats) {
    delete file.dataset.rgfFileAdditionDeletion;
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

function init(signal: AbortSignal): void {
  observe(".diff-file-box", addStats, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPRFiles,
  ],
  init,
});
