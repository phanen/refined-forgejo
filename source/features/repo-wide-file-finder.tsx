import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { executeInMainWorld } from "../helpers/main-world.js";
import pageDetect from "../helpers/page-detect.js";

function normalizeRef(ref: string | undefined): string | undefined {
  if (!ref) {
    return undefined;
  }

  if (ref.includes("/") || ref.startsWith("commit/")) {
    return ref;
  }

  return `branch/${ref}`;
}

async function getRef(): Promise<string | undefined> {
  const currentRef = normalizeRef(getCurrentBranch());
  if (currentRef) {
    return currentRef;
  }

  const branchDropdownDataList = await executeInMainWorld(() =>
    (window as Window & {
      config?: {
        pageData?: {
          branchDropdownDataList?: Array<{
            branchNameSubURL?: string;
            refName?: string;
          }>;
        };
      };
    }).config?.pageData?.branchDropdownDataList
  );

  const fallback = branchDropdownDataList?.[0];
  return normalizeRef(fallback?.branchNameSubURL ?? fallback?.refName);
}

async function init(signal: AbortSignal): Promise<void> {
  const ref = await getRef();
  if (!ref) {
    return;
  }

  registerHotkey("t", buildRepoUrl("find", ref), { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.hasRepoHeader,
  ],
  exclude: [
    pageDetect.isFileFinder,
    pageDetect.isPRFiles,
  ],
  shortcuts: {
    t: "Find file in repository",
  },
  init,
});
