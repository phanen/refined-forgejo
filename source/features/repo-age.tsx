import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { svg } from "../forgejo-helpers/svg.js";
import { getRepo } from "../forgejo-helpers/index.js";
import observe from "../helpers/selector-observer.js";

type RepoInfo = {
  created_at: string;
};

const clockSvg = (() => {
  const html = svg("octicon-clock", 16);
  const doc = new DOMParser().parseFromString(html, "image/svg+xml");
  return doc.documentElement;
})();

async function addAge(menu: Element): Promise<void> {
  if (menu.querySelector(".rgf-repo-age-item")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  let data: RepoInfo;
  try {
    data = await api.v1WithToken(`repos/${repo.owner}/${repo.name}`) as RepoInfo;
  } catch {
    return;
  }

  (menu as HTMLElement).style.gridTemplateColumns = "repeat(5, 1fr)";

  menu.append(
    <span className="item rgf-repo-age-item">
      {clockSvg.cloneNode(true)}
      <relative-time datetime={data.created_at} />
    </span>,
  );
}

function init(signal: AbortSignal): void {
  observe(".repository-menu", addAge, { signal });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
