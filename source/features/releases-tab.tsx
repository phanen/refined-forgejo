import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";

function init(signal: AbortSignal): void {
  registerHotkey("g r", buildRepoUrl("releases"), { signal });
}

void features.add(import.meta.url, {
  shortcuts: {
    "g r": "Go to Releases",
  },
  init,
});
