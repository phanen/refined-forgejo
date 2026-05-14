import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { pageDetect } from "../helpers/page-detect.js";

function init(signal: AbortSignal): void {
  registerHotkey("c", buildRepoUrl("releases/new"), { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isReleases],
  shortcuts: {
    c: "Create a new release",
  },
  init,
});
