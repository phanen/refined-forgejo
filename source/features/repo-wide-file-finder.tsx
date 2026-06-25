import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { executeInMainWorld } from "../helpers/main-world.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type BranchDropdownEntry = {
  branchNameSubURL?: string;
  refName?: string;
};

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
          branchDropdownDataList?: BranchDropdownEntry[];
        };
      };
    }).config?.pageData?.branchDropdownDataList
  );

  const fallback = branchDropdownDataList?.[0];
  return normalizeRef(fallback?.branchNameSubURL ?? fallback?.refName);
}

async function addHotkey(header: Element): Promise<void> {
  const ref = await getRef();
  if (!ref) {
    return;
  }

  // Use a unique class to prevent double registration if the element is re-observed
  if (header.classList.contains("rgf-file-finder-hotkey-added")) {
    return;
  }
  header.classList.add("rgf-file-finder-hotkey-added");

  registerHotkey("t", buildRepoUrl("find", ref));
}

async function init(signal: AbortSignal): Promise<void> {
  // Observe the branch dropdown button which is essential for determining the context
  observe(".branch-dropdown-button", addHotkey, { signal });
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
