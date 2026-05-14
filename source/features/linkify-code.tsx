import "./linkify-code.css";

import { linkifyIssuesToDom } from "linkify-issues";
import { linkifyUrlsToDom } from "linkify-urls";

import features from "../feature-manager.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { isCommit, isCompare, isPRCommit, isPRCommits, isRepoSearch, isSingleFile } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function linkify(element: Element): void {
  const repo = getRepo();
  if (!repo) {
    return;
  }

  const options = {
    user: repo.owner,
    repository: repo.name,
    baseUrl: location.origin,
    attributes: {
      class: "rgf-linkified-code",
    },
  } as const;

  // Forgejo search highlights wrap parts of the URL in spans (e.g., https://<span class="search-highlight">c</span>odeberg...).
  // We normalize the content to a string to detect the full URL, then replace the element's content.
  const content = element.textContent;
  if (!content) {
    return;
  }

  const issuesFragment = linkifyIssuesToDom(content, options);

  for (const subNode of [...issuesFragment.childNodes]) {
    if (subNode.nodeType === Node.TEXT_NODE && subNode.textContent?.trim()) {
      const urlsFragment = linkifyUrlsToDom(subNode.textContent, {
        attributes: {
          class: "rgf-linkified-code",
        },
      });
      if (
        urlsFragment.childNodes.length > 1 || (urlsFragment.firstChild && urlsFragment.firstChild.nodeName === "A")
      ) {
        subNode.replaceWith(urlsFragment);
      }
    }
  }

  // Only replace if we actually found something to linkify
  if (issuesFragment.querySelector("a")) {
    element.textContent = "";
    element.append(issuesFragment);
  }
}

// Selector for Forgejo code lines
// Blobs: .chroma .line
// Diffs: .code-inner
const codeSelector = ".chroma .line, .code-inner";

function init(signal: AbortSignal): void {
  observe(codeSelector, linkify, { signal });
}

features.add(import.meta.url, {
  include: [isSingleFile, isCommit, isPRCommit, isPRCommits, isCompare, isRepoSearch],
  init,
});

/*

## Test URLs

- URLs/Issue in PR files: https://codeberg.org/phanium/test-rgf-priv/pulls/4/files
- URLs/Issue in regular files: https://codeberg.org/phanium/test-rgf-priv/src/commit/64df02ba4b211d2c14fd7d42cc1f176abdc06f68/link
- Code Search: https://codeberg.org/phanium/test-rgf-priv/search/branch/main?path=&q=code&mode=exact
- * no global search
- * no large repo search: https://codeberg.org/Codeberg/Community/issues/379#issuecomment-2155382

*/
