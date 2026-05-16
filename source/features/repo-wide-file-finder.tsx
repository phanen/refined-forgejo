import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import pageDetect from "../helpers/page-detect.js";

function init(signal: AbortSignal): void {
  const ref = getCurrentBranch();
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
