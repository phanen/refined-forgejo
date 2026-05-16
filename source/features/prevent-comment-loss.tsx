import features from "../feature-manager.js";
import {
  isEditingRelease,
  isIssueOrPR,
  isMilestone,
  isNewIssue,
  isNewRelease,
  isWiki,
} from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function makePreviewLinksSafe(panel: Element): void {
  for (const link of panel.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
}

function watchPreviewPanel(panel: Element, signal: AbortSignal): void {
  makePreviewLinksSafe(panel);

  const observer = new MutationObserver(() => {
    makePreviewLinksSafe(panel);
  });

  observer.observe(panel, {
    childList: true,
    subtree: true,
  });

  signal.addEventListener("abort", () => {
    observer.disconnect();
  });
}

function init(signal: AbortSignal): void {
  observe(".combo-markdown-editor .ui.tab[data-tab-panel=\"markdown-previewer\"]", panel => {
    watchPreviewPanel(panel, signal);
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isIssueOrPR,
    isNewIssue,
    isNewRelease,
    isEditingRelease,
    isMilestone,
    isWiki,
  ],
  init,
});
