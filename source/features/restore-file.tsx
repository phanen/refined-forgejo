import React from "dom-chef";

import features from "../feature-manager.js";
import type { ContentsResponse, PullRequest } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import pageDetect from "../helpers/page-detect.js";
import { getHeadBranch } from "../helpers/pr-base-commit.js";
import observe from "../helpers/selector-observer.js";
import type { RepoRef } from "../helpers/types.js";

function getTargetBranch(): RepoRef | undefined {
  return getHeadBranch(document);
}

function getFileInfo(file: HTMLElement): { oldPath: string; newPath: string } | undefined {
  const oldPath = file.dataset.oldFilename || "";
  const newPath = file.dataset.newFilename || "";

  if (!oldPath || !newPath) {
    return undefined;
  }

  return { oldPath, newPath };
}

function getPullIndex(): string | undefined {
  return location.pathname.match(/\/pulls\/(\d+)\/files(?:\/|$)/)?.[1];
}

const pullCache = new Map<string, Promise<PullRequest | undefined>>();

async function getBeforeCommitId(owner: string, repo: string, index: string): Promise<string | undefined> {
  const key = `${owner}/${repo}/${index}`;
  let promise = pullCache.get(key);
  if (!promise) {
    promise = api.v1(`repos/${owner}/${repo}/pulls/${index}`)
      .then(data => data as PullRequest)
      .catch(() => undefined);
    pullCache.set(key, promise);
  }

  return (await promise)?.merge_base?.trim() || undefined;
}

async function getContents(
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<ContentsResponse | undefined> {
  try {
    const encodedPath = path.split("/").map(segment => encodeURIComponent(segment)).join("/");
    return await api.v1(
      `repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    ) as ContentsResponse;
  } catch {
    return undefined;
  }
}

async function restoreFile(file: HTMLElement): Promise<void> {
  const target = getTargetBranch();
  const info = getFileInfo(file);
  const pullIndex = getPullIndex();
  if (!target || !info || !pullIndex) {
    return;
  }

  const beforeCommit = await getBeforeCommitId(target.owner, target.repo, pullIndex);
  if (!beforeCommit) {
    return;
  }

  const commitMessage = prompt(`Discard changes to ${info.oldPath}`, `Discard changes to ${info.oldPath}`);
  if (!commitMessage) {
    return;
  }

  const currentFile = await getContents(target.owner, target.repo, info.newPath, target.ref);
  if (!currentFile?.sha) {
    return;
  }

  const oldFile = await getContents(target.owner, target.repo, info.oldPath, beforeCommit);
  const isNewFile = !oldFile;
  const isRenamed = info.oldPath !== info.newPath;

  if (!isNewFile && oldFile?.content === undefined) {
    return;
  }

  const message = { message: commitMessage };

  if (isNewFile) {
    await api.v1(
      `repos/${target.owner}/${target.repo}/contents/${
        info.newPath.split("/").map(segment => encodeURIComponent(segment)).join("/")
      }`,
      {
        method: "DELETE",
        body: {
          ...message,
          branch: target.ref,
          sha: currentFile.sha,
        },
      },
    );
  } else {
    await api.v1(
      `repos/${target.owner}/${target.repo}/contents/${
        info.newPath.split("/").map(segment => encodeURIComponent(segment)).join("/")
      }`,
      {
        method: "PUT",
        body: {
          ...message,
          branch: target.ref,
          sha: currentFile.sha,
          content: oldFile.content,
          from_path: isRenamed ? info.oldPath : undefined,
        },
      },
    );
  }

  location.reload();
}

function addButton(file: Element): void {
  if (!(file instanceof HTMLElement)) {
    return;
  }

  if (file.querySelector(".rgf-restore-file")) {
    return;
  }

  const actions = file.querySelector(".diff-file-header-actions, .file-header-right .file-actions");
  if (!actions) {
    return;
  }

  actions.prepend(
    <button type="button" className="ui mini basic button rgf-restore-file">
      Discard changes
    </button>,
  );
}

function init(signal: AbortSignal): void {
  observe(".diff-file-box", addButton, { signal });
  document.addEventListener("click", event => {
    const target = (event.target as Element | null)?.closest?.(".rgf-restore-file");
    if (!target) {
      return;
    }

    const file = target.closest(".diff-file-box");
    if (file) {
      void restoreFile(file as HTMLElement);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPRFiles,
  ],
  init,
});
