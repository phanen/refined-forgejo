import React from "dom-chef";

import features from "../feature-manager.js";
import type { Release } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

async function convertToDraft(event: React.MouseEvent): Promise<void> {
  const button = event.currentTarget as HTMLButtonElement;
  if (!confirm("Are you sure you want to convert this release to a draft?")) {
    return;
  }

  button.disabled = true;
  button.textContent = "Converting...";

  try {
    const repo = getRepo()!;
    const tag = location.pathname.split("/").pop()!;

    // 1. Get the release ID from the tag
    const release = await api.v1(`repos/${repo.owner}/${repo.name}/releases/tags/${tag}`) as Release;

    // 2. Patch the release to be a draft
    await api.v1(`repos/${repo.owner}/${repo.name}/releases/${release.id}`, {
      method: "PATCH",
      body: {
        draft: true,
        tag_name: tag, // Required by some versions of Gitea/Forgejo when patching
      },
    });

    // 3. Redirect to the edit page of the draft
    location.href = location.pathname.replace("/tag/", "/edit/");
  } catch (error) {
    button.disabled = false;
    button.textContent = "Convert to draft";
    console.error("Failed to convert release to draft:", error);
    alert("Failed to convert release to draft. See console for details.");
  }
}

function addConvertButton(element: Element): void {
  const editButton = element as HTMLAnchorElement;
  if (document.querySelector(".rgf-convert-to-draft")) {
    return;
  }

  const button = (
    <button
      className="ui basic button rgf-convert-to-draft tw-mr-2"
      type="button"
      onClick={convertToDraft}
    >
      Convert to draft
    </button>
  );

  editButton.before(button);
}

function init(signal: AbortSignal): void {
  // We only add the button if the user can already see the "Edit" button (has permission)
  observe("a[href*='/releases/edit/']", addConvertButton, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isSingleReleaseOrTag],
  init,
});
