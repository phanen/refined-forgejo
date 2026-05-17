import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getRepo } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type RepoInfo = { fork: boolean; stars_count: number };
const deleteRepoSelector = "#delete-repo-modal";

async function shouldShowDeleteFork(): Promise<boolean> {
  const repo = getRepo();
  if (!repo) {
    return false;
  }

  const data = await api.v1(`repos/${repo.owner}/${repo.name}`) as RepoInfo;
  return data.fork && data.stars_count === 0;
}

function addDeleteForkButton(buttonRow: Element): void {
  if (buttonRow.querySelector(".rgf-quick-repo-deletion")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  buttonRow.append(
    <a className="ui small red button rgf-quick-repo-deletion" href={`${buildRepoUrl("settings")}#delete-repo-modal`}>
      Delete fork
    </a>,
  );
}

function openDeleteModal(dialog: Element): void {
  const modal = dialog as HTMLDialogElement;
  if (!modal.open) {
    modal.showModal();
  }
}

function autoFillRepoName(input: HTMLInputElement): void {
  const repo = getRepo();
  if (repo) {
    input.value = repo.nameWithOwner;
  }
}

async function initRepoRoot(signal: AbortSignal): Promise<void> {
  if (!(await shouldShowDeleteFork())) {
    return;
  }

  observe(".repo-buttons", addDeleteForkButton, { signal });
}

function initRepoSettings(signal: AbortSignal): void {
  if (location.hash !== deleteRepoSelector) {
    return;
  }

  observe(deleteRepoSelector, openDeleteModal, { signal });
  observe(`${deleteRepoSelector} input[name="repo_name"]`, input => {
    autoFillRepoName(input as HTMLInputElement);
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoHome,
  ],
  init: initRepoRoot,
}, {
  include: [
    pageDetect.isRepoSettings,
  ],
  init: initRepoSettings,
});
