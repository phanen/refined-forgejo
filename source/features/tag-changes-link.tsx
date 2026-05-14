import React from "dom-chef";
import GitCompareIcon from "octicons-plain-react/GitCompare";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getTagName(element: Element, isTagsPage: boolean): string | undefined {
  if (isTagsPage) {
    return element.querySelector(".release-tag-name a")?.textContent?.trim();
  }
  // On releases page
  return (
    element.querySelector(".release-list-title a")?.textContent?.trim()
    || element.querySelector(".release-tag-info a:first-child")?.textContent?.trim()
  );
}

function addCompareLink(element: Element): void {
  if (element.querySelector(".rgf-tag-changes-link")) {
    return;
  }

  const isTagsPage = pageDetect.isTags();
  const nextElement = element.nextElementSibling;
  if (!nextElement) {
    return;
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
        // Insert before "Release details" if it exists, otherwise append
        const detailsLink = downloadDiv.querySelector("a[href*='/releases/tag/']");
        if (detailsLink) {
          detailsLink.before(link);
        } else {
          downloadDiv.append(link);
        }
      }
    } else {
      // On releases page, we can add it to the buttons container
      const buttonsContainer = element.querySelector(".release-list-buttons");
      if (buttonsContainer) {
        buttonsContainer.prepend(link);
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
