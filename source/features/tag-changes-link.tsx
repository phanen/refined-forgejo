import React from "dom-chef";
import GitCompareIcon from "octicons-plain-react/GitCompare";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getTagName(element: Element | null, isTagsPage: boolean): string | undefined {
  if (!element) {
    return undefined;
  }
  const selector = isTagsPage ? ".release-tag-name a" : ".meta a.muted";
  return element.querySelector(selector)?.textContent?.trim();
}

function addCompareLink(element: Element): void {
  const isTagsPage = pageDetect.isTags();
  const selector = isTagsPage ? "tr" : "li";

  // 1. Try to add compare link to the current element (comparing with older/next sibling)
  renderCompareLink(element, isTagsPage);

  // 2. If this element just appeared, it might be the "next" sibling that a previous element was waiting for.
  // So we try to render the previous sibling as well.
  let previousElement = element.previousElementSibling;
  while (previousElement && !previousElement.matches(selector)) {
    previousElement = previousElement.previousElementSibling;
  }
  if (previousElement) {
    renderCompareLink(previousElement, isTagsPage);
  }
}

function renderCompareLink(element: Element, isTagsPage: boolean): void {
  if (element.querySelector(".rgf-tag-changes-link")) {
    return;
  }

  let nextElement = element.nextElementSibling;
  const selector = isTagsPage ? "tr" : "li";
  while (nextElement && !nextElement.matches(selector)) {
    nextElement = nextElement.nextElementSibling;
  }

  const currentTag = getTagName(element, isTagsPage);
  const previousTag = getTagName(nextElement, isTagsPage);

  if (currentTag && previousTag) {
    const compareUrl = buildRepoUrl("compare", `${previousTag}...${currentTag}`);
    const link = (
      <a className="muted rgf-tag-changes-link tw-mr-2" href={compareUrl}>
        <GitCompareIcon className="svg tw-mr-1" />
        Compare
      </a>
    );

    if (isTagsPage) {
      const downloadDiv = element.querySelector(".download");
      if (downloadDiv) {
        // Insert after "Release details" if it exists, otherwise append
        const detailsLink = downloadDiv.querySelector("a[href*='/releases/tag/']");
        if (detailsLink) {
          detailsLink.after(link);
        } else {
          downloadDiv.append(link);
        }
      }
    } else {
      // On releases page
      const detail = element.querySelector(".detail p.text.grey");
      if (detail) {
        detail.append(" | ", link);
      }
    }
  }
}

function init(signal: AbortSignal): void {
  if (pageDetect.isTags()) {
    observe("tr:has(.release-tag-name)", addCompareLink, { signal });
  } else if (pageDetect.isReleases()) {
    observe("#release-list > li", addCompareLink, { signal });
  }
}

void features.add(import.meta.url, {
  include: [pageDetect.isReleasesOrTags],
  init,
});
