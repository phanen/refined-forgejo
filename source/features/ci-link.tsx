import "./ci-link.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { svg } from "../forgejo-helpers/svg.js";
import { pRace } from "../helpers/p-utils.js";
import { hasRepoHeader } from "../helpers/page-detect.js";
import observe, { waitForElement } from "../helpers/selector-observer.js";

type RunStatus = "success" | "failure" | "cancelled" | "running" | "waiting";

const apiStatusMap: Record<string, string> = {
  success: "rgf-ci-success",
  failure: "rgf-ci-failure",
  cancelled: "rgf-ci-cancelled",
  running: "rgf-ci-pending",
  waiting: "rgf-ci-pending",
};

const statusConfig: Record<string, { icon: string; color: string }> = {
  "rgf-ci-success": { icon: "octicon-check", color: "green" },
  "rgf-ci-failure": { icon: "octicon-x", color: "red" },
  "rgf-ci-cancelled": { icon: "octicon-dot-fill", color: "yellow" },
  "rgf-ci-pending": { icon: "octicon-dot-fill", color: "yellow" },
};

function forgejoIcon(statusClass: string): HTMLElement {
  const cfg = statusConfig[statusClass] ?? statusConfig["rgf-ci-pending"];
  const html = svg(cfg.icon, 14);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "image/svg+xml");
  const el = doc.documentElement;
  el.classList.add("rgf-ci-svg", "text", cfg.color);
  return el;
}

async function statusFromDOM(repo: { owner: string; name: string }, signal?: AbortSignal): Promise<
  {
    statusClass: string;
    href: string;
    icon: HTMLElement;
  } | undefined
> {
  const el = await waitForElement("#repo-files-table .commit-status.icon", { signal });

  if (!el) {
    return undefined;
  }

  const icon = el as HTMLElement;
  const statusClass = icon.matches(".text.green")
    ? "rgf-ci-success"
    : icon.matches(".text.red")
    ? "rgf-ci-failure"
    : icon.matches(".text.yellow")
    ? "rgf-ci-pending"
    : undefined;

  if (!statusClass) {
    return undefined;
  }

  const existingLink = icon.closest<HTMLAnchorElement>("a[href]");
  const href = existingLink?.getAttribute("href") ?? `/${repo.owner}/${repo.name}/actions`;
  const cloned = icon.cloneNode(true) as HTMLElement;
  cloned.classList.remove("commit-status");
  return { statusClass, href, icon: cloned };
}

async function statusFromAPI(repo: { owner: string; name: string }, signal?: AbortSignal): Promise<
  {
    statusClass: string;
    href: string;
  } | undefined
> {
  try {
    const data = await api.v1(
      `repos/${repo.owner}/${repo.name}/actions/runs?limit=1`,
      { signal },
    ) as { workflow_runs?: Array<{ status: string; html_url: string }> };

    const run = data?.workflow_runs?.[0];
    const s = run?.status as RunStatus;
    if (!run || !apiStatusMap[s]) {
      return undefined;
    }

    return { statusClass: apiStatusMap[s], href: run.html_url ?? `/${repo.owner}/${repo.name}/actions` };
  } catch {
    return undefined;
  }
}

async function addLink(titleArea: Element, { signal }: { signal?: AbortSignal }): Promise<void> {
  if (titleArea.querySelector(".rgf-ci-link")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  let result: { statusClass: string; href: string; icon?: HTMLElement };
  try {
    result = await pRace(
      [
        s => statusFromDOM(repo, s),
        s => statusFromAPI(repo, s),
      ],
      signal,
    );
  } catch {
    return;
  }

  const target = titleArea.querySelector(".rgf-repo-info")
    ?? titleArea.querySelector("a.muted.tw-font-semibold");
  if (!target) {
    return;
  }

  target.after(
    <a className={`rgf-ci-link ${result.statusClass}`} href={result.href}>
      {result.icon ? <span className="rgf-ci-icon">{result.icon}</span> : forgejoIcon(result.statusClass)}
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe(".repo-header .flex-item-title", addLink, { signal });
}

features.add(import.meta.url, {
  include: [hasRepoHeader],
  init,
});
