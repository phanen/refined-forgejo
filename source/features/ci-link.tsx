import "./ci-link.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { svg } from "../forgejo-helpers/svg.js";
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

function forgejoIcon(statusClass: string): HTMLElement {
  const name = statusClass === "rgf-ci-success"
    ? "octicon-check"
    : statusClass === "rgf-ci-failure"
    ? "octicon-x"
    : "octicon-dot-fill";

  const html = svg(name, 14);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "image/svg+xml");
  return doc.documentElement;
}

async function statusFromDOM(repo: { owner: string; name: string }): Promise<
  {
    statusClass: string;
    href: string;
    icon: HTMLElement;
  } | undefined
> {
  const el = await Promise.race([
    waitForElement(".commit-status.icon"),
    new Promise<undefined>(resolve => setTimeout(() => resolve(undefined), 3000)),
  ]);

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

async function statusFromAPI(repo: { owner: string; name: string }): Promise<
  {
    statusClass: string;
    href: string;
  } | undefined
> {
  try {
    const data = await api.v1WithToken(
      `repos/${repo.owner}/${repo.name}/actions/runs?limit=1`,
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

function firstValid<T>(...promises: Promise<T | undefined>[]): Promise<T> {
  for (const p of promises) {
    p.catch(() => {});
  }

  return new Promise((resolve, reject) => {
    let settled = 0;
    for (const p of promises) {
      void p.then(r => {
        if (r !== undefined) {
          resolve(r);
        } else if (++settled === promises.length) {
          reject(new Error("no valid result"));
        }
      }).catch(() => {
        if (++settled === promises.length) {
          reject(new Error("no valid result"));
        }
      });
    }
  });
}

async function addLink(titleArea: Element): Promise<void> {
  if (titleArea.querySelector(".rgf-ci-link")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  let result: { statusClass: string; href: string; icon?: HTMLElement };
  try {
    result = await firstValid(statusFromDOM(repo), statusFromAPI(repo));
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
