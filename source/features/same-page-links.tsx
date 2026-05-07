import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function fix(link: Element): void {
  const anchor = link as HTMLAnchorElement;
  anchor.removeAttribute("target");
}

function init(signal: AbortSignal): void {
  observe(
    [
      "a[target='_blank'][href*='/issues/']",
      "a[target='_blank'][href*='/pulls/']",
      "a[target='_blank'][href*='/commit/']",
      "a[target='_blank'][class*='linked']",
      "a[target='_blank'][class*='reference']",
    ].join(","),
    fix,
    { signal },
  );
}

features.add(import.meta.url, {
  include: [
    pageDetect.isIssueList,
    pageDetect.isIssue,
  ],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
- https://codeberg.org/ziglang/zig/issues
*/
