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
  owner: { login: string; avatar_url: string };
};

async function addInfo(leading: Element): Promise<void> {
  const repo = getRepo();
  if (!repo || leading.classList.contains("rgf-processed")) {
    return;
  }

  leading.classList.add("rgf-processed");
  const data = await api.v3(`repos/${repo.owner}/${repo.name}`) as RepoInfo;

  // Replace leading SVG (mirror/repo icon) with owner's avatar
  const svg = leading.querySelector("svg");
  if (svg) {
    // Skip the fork icon: trailing already shows fork info natively
    if (!svg.classList.contains("octicon-repo-forked")) {
      const trailing = leading.closest(".flex-item")?.querySelector(".flex-item-trailing");
      if (trailing) {
        const clonedSvg = svg.cloneNode(true) as HTMLElement;
        clonedSvg.classList.add("rgf-moved-icon");
        trailing.prepend(clonedSvg);
      }
    }

    // Replace with owner avatar
    leading.innerHTML = "";
    const avatar = (
      <img
        className="ui avatar tw-align-middle"
        src={data.owner.avatar_url}
        width={24}
        height={24}
        alt={`@${data.owner.login}`}
      />
    );
    leading.append(avatar);
  }

  // Add indicators (star, fork, private) near the repo title
  const titleArea = leading.closest(".flex-item")?.querySelector(".flex-item-title");
  if (!titleArea || titleArea.querySelector(".rgf-repo-info")) {
    return;
  }

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

  const repoLink = titleArea.querySelector("a.muted.tw-font-semibold");
  if (repoLink) {
    repoLink.after(container);
  }
}

function init(signal: AbortSignal): void {
  observe(
    ".repo-header .flex-item-leading",
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
