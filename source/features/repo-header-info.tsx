import "./repo-header-info.css";

import React from "dom-chef";
import LockIcon from "octicons-plain-react/Lock";
import RepoForkedIcon from "octicons-plain-react/RepoForked";
import StarIcon from "octicons-plain-react/Star";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import observe from "../helpers/selector-observer.js";

type RepoInfo = {
  fork: boolean;
  private: boolean;
  stars_count: number;
  forks_count: number;
  parent?: { full_name: string; html_url: string };
};

async function addInfo(titleArea: Element): Promise<void> {
  const repo = getRepo();
  if (!repo || titleArea.querySelector(".rgf-repo-info")) {
    return;
  }

  const data = await api.v3(`repos/${repo.owner}/${repo.name}`) as RepoInfo;

  const container = (
    <span className="rgf-repo-info rgf-repo-info-icons">
      {data.private && <LockIcon width={14} height={14} />}
      {data.fork && <RepoForkedIcon width={14} height={14} />}
      {data.stars_count > 0 && (
        <>
          <StarIcon width={14} height={14} />
          <span className="rgf-star-count">{data.stars_count}</span>
        </>
      )}
    </span>
  );

  // Append after the repo name (second <a> in flex-item-title)
  const repoLink = titleArea.querySelector("a.muted.tw-font-semibold");
  if (repoLink) {
    repoLink.after(container);
  }
}

function init(signal: AbortSignal): void {
  observe(
    ".repo-header .flex-item-title",
    addInfo,
    { signal },
  );
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
