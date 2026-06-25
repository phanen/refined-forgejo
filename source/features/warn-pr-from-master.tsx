import React from "dom-chef";

import features from "../feature-manager.js";
import type { Repository } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { isCompare } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import type { RepoRef } from "../helpers/types.js";

function parseCompareUrl(): RepoRef | undefined {
  const repo = getRepo();
  if (!repo || !repo.path.startsWith("compare/")) {
    return undefined;
  }

  const comparePath = repo.path.slice("compare/".length);
  const separatorMatch = comparePath.match(/^(.+?)(\.{3}|\.\.)(.+)$/);
  if (!separatorMatch) {
    return undefined;
  }

  const right = separatorMatch[3];
  const colonIndex = right.lastIndexOf(":");
  if (colonIndex === -1) {
    return {
      owner: repo.owner,
      repo: repo.name,
      ref: decodeURIComponent(right),
    };
  }

  const headRepo = right.slice(0, colonIndex);
  const ref = decodeURIComponent(right.slice(colonIndex + 1));
  const [owner, repoName] = headRepo.split("/", 2);
  if (!owner || !repoName) {
    return undefined;
  }

  return {
    owner: decodeURIComponent(owner),
    repo: decodeURIComponent(repoName),
    ref,
  };
}

async function shouldWarn(): Promise<boolean> {
  const compare = parseCompareUrl();
  if (!compare) {
    return false;
  }

  try {
    const repoDetails = await api.v1(`repos/${compare.owner}/${compare.repo}`) as Repository;
    return repoDetails.default_branch === compare.ref;
  } catch {
    return false;
  }
}

function addWarning(form: HTMLElement): void {
  if (form.querySelector(".rgf-warn-pr-from-master")) {
    return;
  }

  form.prepend(
    <div className="ui small warning message tw-mb-3 rgf-warn-pr-from-master">
      Creating a PR from the default branch is usually not a good idea. Consider using a feature branch instead.
    </div>,
  );
}

function init(signal: AbortSignal): void {
  observe(".pullrequest-form", element => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    void (async () => {
      if (await shouldWarn()) {
        addWarning(element);
      }
    })();
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isCompare,
  ],
  init,
});
