import "./more-file-links.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getUrl(baseUrl: string, newType: string): string {
  return baseUrl.replace(/\/(src|raw|blame|commits)\//, `/${newType}/`);
}

function addMoreLinks(container: Element): void {
  if (container.querySelector(".rgf-more-file-links")) {
    return;
  }

  // Find the "View file" button. Forgejo uses a generic <a> with "ui basic tiny button" classes.
  // We look for one that contains /src/ in the href.
  const viewFileButton = container.querySelector<HTMLAnchorElement>(
    "a.ui.button[href*=\"/src/\"], a.ui.button[href*=\"/raw/\"]",
  );
  if (!viewFileButton) {
    return;
  }

  const baseUrl = viewFileButton.href;

  viewFileButton.after(
    <div className="rgf-more-file-links">
      <a className="ui basic tiny button" href={getUrl(baseUrl, "raw")} data-turbo="false">
        Raw
      </a>
      <a className="ui basic tiny button" href={getUrl(baseUrl, "blame")}>
        Blame
      </a>
      <a className="ui basic tiny button" href={getUrl(baseUrl, "commits")}>
        History
      </a>
    </div>,
  );
}

async function init(signal: AbortSignal): Promise<void> {
  observe(".diff-file-header-actions, details.repo-search-result", addMoreLinks, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
    pageDetect.isPR,
    pageDetect.isCompare,
    pageDetect.isRepoSearch,
  ],
  init,
});
