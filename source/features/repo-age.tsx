import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { svg } from "../forgejo-helpers/svg.js";
import observe from "../helpers/selector-observer.js";

type RepoInfo = {
  created_at: string;
};

const clockSvg = (() => {
  const html = svg("octicon-clock", 16);
  const doc = new DOMParser().parseFromString(html, "image/svg+xml");
  return doc.documentElement;
})();

const gridStyle = document.createElement("style");
gridStyle.textContent = `
@media (min-width: 768px) {
  .repository .repository-summary .repository-menu.rgf-5col {
    grid-template-columns: repeat(5, 1fr);
  }
}
@media (max-width: 767.98px) {
  .repository .repository-summary .repository-menu.rgf-5col {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .repository .repository-summary .repository-menu.rgf-5col > .item {
    flex: 0 0 33.333%;
  }
}
`;

async function addAge(menu: Element, { signal }: { signal?: AbortSignal }): Promise<void> {
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

  // Inject page-level <style> (not content script CSS) so the media query
  // properly interacts with Forgejo's own @media rules.  Inline style
  // would override the responsive breakpoint because of higher priority.
  if (!gridStyle.isConnected) {
    document.head.append(gridStyle);
  }
  signal?.addEventListener("abort", () => gridStyle.remove(), { once: true });
  menu.classList.add("rgf-5col");

  menu.append(
    <span className="item rgf-repo-age-item">
      {clockSvg.cloneNode(true)}
      <relative-time format="duration" datetime={data.created_at} />
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
