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

function compactRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "now";
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m`;
  const days = Math.floor(hours / 24);
  if (days < 1) return `${hours}h`;
  const months = Math.floor(days / 30);
  if (months < 1) return `${days}d`;
  const years = Math.floor(days / 365);
  if (years < 1) return `${months}mo`;
  return `${years}y`;
}

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
      <span className="rgf-age-text">{compactRelativeTime(data.created_at)}</span>
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
