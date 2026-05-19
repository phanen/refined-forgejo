import React from "dom-chef";
import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getCurrentBranch, getFilePath, getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

async function addPreviousVersionButton(historyButton: Element): Promise<void> {
  if (historyButton.parentElement?.querySelector(".rgf-previous-version")) {
    return;
  }

  const repo = getRepo();
  const path = getFilePath();
  if (!repo || !path) {
    return;
  }

  // Get current ref (branch, tag, or commit)
  let ref = getCurrentBranch();
  if (ref) {
    ref = ref.replace(/^(?:branch|tag)\//, "");
  } else if (repo.pathParts[0] === "src" && repo.pathParts[1] === "commit") {
    ref = repo.pathParts[2];
  } else if (repo.pathParts[0] === "commits" && repo.pathParts[1] === "commit") {
    ref = repo.pathParts[2];
  }

  if (!ref) {
    return;
  }

  // Create button immediately but in loading state
  const previousButton = (
    <a
      className="ui basic mini button rgf-previous-version disabled"
      title="Loading previous version..."
    >
      Previous
    </a>
  ) as unknown as HTMLAnchorElement;
  historyButton.after(previousButton);

  // Fetch commits for this file asynchronously
  const query = new URLSearchParams({ sha: ref, path, limit: "2" });

  try {
    const commits = await api.v1(`repos/${repo.owner}/${repo.name}/commits?${query.toString()}`) as Array<
      { sha: string }
    >;

    if (commits && commits.length >= 2) {
      const previousSha = commits[1].sha;
      const previousUrl = buildRepoUrl("src", "commit", previousSha, path);

      previousButton.href = previousUrl;
      previousButton.title = `Previous version: ${previousSha.slice(0, 7)}`;
      previousButton.classList.remove("disabled");
    } else {
      previousButton.title = "No previous version found";
    }
  } catch {
    previousButton.title = "Error loading previous version";
  }
}

function init(signal: AbortSignal): void {
  // Selector for the History button in file header.
  // Forgejo uses /commits/branch/... or /commits/commit/...
  observe(
    "a.ui.basic.button[href*='/commits/']",
    addPreviousVersionButton,
    { signal },
  );
}

features.add(import.meta.url, {
  include: [
    pageDetect.isSingleFile,
    pageDetect.isBlame,
  ],
  init,
});
