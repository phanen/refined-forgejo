import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function addSortToListLink(link: Element): void {
  const anchor = link as HTMLAnchorElement;
  if (anchor.host !== location.host) {
    return;
  }

  const url = new URL(anchor.href);

  // Skip if already sorted, paginated, or points to an individual issue/pr
  if (url.searchParams.has("sort") || url.searchParams.has("page")) {
    return;
  }

  if (!url.pathname.includes("/issues") && !url.pathname.includes("/pulls")) {
    return;
  }

  // Exclude links to individual issues/PRs (those have a number after /issues/ or /pulls/)
  if (/\/(?:issues|pulls)\/\d+/.test(url.pathname)) {
    return;
  }

  url.searchParams.set("sort", "recentupdate");
  anchor.href = url.toString();
}

function init(signal: AbortSignal): void {
  observe(
    [
      "a[href*=\"/issues\"]",
      "a[href*=\"/pulls\"]",
    ],
    addSortToListLink,
    { signal },
  );
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues
*/
