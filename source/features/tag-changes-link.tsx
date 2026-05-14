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
  if (element.querySelector(".rgf-tag-changes-link")) {
    return;
  }

  const isTagsPage = pageDetect.isTags();
  let nextElement = element.nextElementSibling;
  while (nextElement && !nextElement.matches(isTagsPage ? "tr" : "li")) {
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
        detail.append(
          " | ",
          link,
        );
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
