import features from "../feature-manager.js";
import { isIssueOrPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addSortToLink(link: HTMLAnchorElement): void {
  if (link.host !== location.host) {
    return;
  }

  const url = new URL(link.href);

  if (url.searchParams.has("sort")) {
    return;
  }

  url.searchParams.set("sort", "latest_updated");
  link.href = url.toString();
}

function updateConversationLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    ".issue-list-item a[href*=\"/issues/\"], .issue-list-item a[href*=\"/pulls/\"], a[href*=\"/issues\"]:not([href*=\"/issues/\"]), a[href*=\"/pulls\"]:not([href*=\"/pulls/\"])",
  );

  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href || !href.includes("/issues") && !href.includes("/pulls")) {
      continue;
    }

    if (link.closest(".pagination, .filter-tabs")) {
      continue;
    }

    addSortToLink(link);
  }
}

function init(signal: AbortSignal): void {
  observe(".issue-list, .pull-request-list, .repo-header, .repository-menu", updateConversationLinks, { signal });
}

features.add(import.meta.url, {
  include: [
    isIssueOrPRList,
  ],
  init,
});
