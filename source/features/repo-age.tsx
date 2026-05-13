import "./repo-age.css";

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

const ageStyle = document.createElement("style");
ageStyle.textContent = `
.repository .repository-summary .item.rgf-has-age {
  justify-content: space-between;
  gap: 0;
}
`;

async function addAge(menu: Element): Promise<void> {
  const sizeItem = menu.querySelector(".item svg.octicon-database")?.closest(".item") as HTMLElement | null;
  if (!sizeItem || sizeItem.querySelector("relative-time")) {
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

  const dbSvg = sizeItem.querySelector("svg.octicon-database");
  const dbText = sizeItem.textContent?.trim();

  sizeItem.classList.add("rgf-has-age");
  sizeItem.innerHTML = "";

  sizeItem.append(
    <span className="rgf-age-left">
      {dbSvg}
      <span>{dbText}</span>
    </span>,
    <span className="rgf-age-right">
      {clockSvg.cloneNode(true)}
      <relative-time datetime={data.created_at} />
    </span>,
  );
}

function init(signal: AbortSignal): void {
  document.head.append(ageStyle);
  signal.addEventListener("abort", () => ageStyle.remove());
  observe(".repository-menu", addAge, { signal });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
