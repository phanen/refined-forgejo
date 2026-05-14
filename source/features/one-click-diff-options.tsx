import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { pageDetect } from "../helpers/page-detect.js";

function toggleWhitespace(): void {
  const url = new URL(location.href);
  const current = url.searchParams.get("whitespace") || "show-all";
  if (current === "show-all") {
    url.searchParams.set("whitespace", "ignore-all");
  } else {
    url.searchParams.set("whitespace", "show-all");
  }
  location.href = url.href;
}

function toggleDiffStyle(): void {
  const url = new URL(location.href);
  const current = url.searchParams.get("style") || "unified";
  if (current === "unified") {
    url.searchParams.set("style", "split");
  } else {
    url.searchParams.set("style", "unified");
  }
  location.href = url.href;
}

function init(signal: AbortSignal): void {
  registerHotkey("d w", toggleWhitespace, { signal });
  registerHotkey("d s", toggleDiffStyle, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPRFiles,
    pageDetect.isCommit,
    pageDetect.isCompare,
  ],
  shortcuts: {
    "d w": "Toggle whitespace",
    "d s": "Toggle split/unified view",
  },
  init,
});
