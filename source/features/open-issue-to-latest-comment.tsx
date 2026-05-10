import features from "../feature-manager.js";
import { isIssueOrPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addHash(link: Element): void {
  const anchor = link as HTMLAnchorElement;

  // Only target links that have a comment count (contain the discussion icon)
  if (!anchor.querySelector(".octicon-comment-discussion")) {
    return;
  }

  anchor.hash = "#comment-form";
}

function init(signal: AbortSignal): void {
  observe(
    ".flex-item-trailing .text.grey a",
    addHash,
    { signal },
  );
}

features.add(import.meta.url, {
  include: [
    isIssueOrPRList,
  ],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues
- https://codeberg.org/ziglang/zig/pulls
*/
