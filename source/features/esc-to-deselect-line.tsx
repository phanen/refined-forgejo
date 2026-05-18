import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import pageDetect from "../helpers/page-detect.js";

function deselect(): void {
  if (location.hash.startsWith("#L") || /#diff-[\da-f]+L\d+/.test(location.hash)) {
    history.replaceState(null, "", location.pathname + location.search);

    // Forgejo highlights selected lines using the .active class on <tr> or <td>
    // We limit this to common code containers to avoid accidentally deactivating UI elements
    const lineContainers = [
      ".code-view",
      ".code-table",
      ".diff-body",
      ".blame",
      ".render-content",
    ];

    const selector = lineContainers.map(c => `${c} .active, ${c} .selected`).join(", ");
    for (const element of document.querySelectorAll(selector)) {
      element.classList.remove("active", "selected");
    }

    for (const button of document.querySelectorAll(".code-line-button")) {
      button.remove();
    }
  }
}

function init(signal: AbortSignal): void {
  registerHotkey("escape", deselect, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isSingleFile,
    pageDetect.isBlame,
    pageDetect.isCommit,
    pageDetect.isPRFiles,
  ],
  shortcuts: {
    escape: "Deselect line",
  },
  init,
});
