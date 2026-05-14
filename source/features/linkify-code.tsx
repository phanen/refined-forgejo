import "./linkify-code.css";

import { linkifyIssuesToDom } from "linkify-issues";
import { linkifyUrlsToDom } from "linkify-urls";

import features from "../feature-manager.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { isCommit, isCompare, isPRCommit, isPRCommits, isSingleFile } from "../helpers/page-detect.js";
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

  for (const node of [...element.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const issuesFragment = linkifyIssuesToDom(node.textContent, options);

      // Now we have a fragment that might contain A tags and TEXT nodes.
      // We should also linkify URLs in the remaining TEXT nodes.
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

      if (
        issuesFragment.childNodes.length > 1
        || (issuesFragment.firstChild
          && (issuesFragment.firstChild.nodeName === "A" || issuesFragment.firstChild.nodeType === Node.ELEMENT_NODE))
      ) {
        node.replaceWith(issuesFragment);
      }
    }
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
  include: [isSingleFile, isCommit, isPRCommit, isPRCommits, isCompare],
  init,
});
