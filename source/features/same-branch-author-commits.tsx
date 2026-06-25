import mem from "memoize";
import features from "../feature-manager.js";
import type { GitCommit } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const getCommitAuthorEmail = mem(async (sha: string): Promise<string | undefined> => {
  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  try {
    const response = await api.v1(`repos/${repo.owner}/${repo.name}/git/commits/${sha}`) as GitCommit;
    return response.commit?.author?.email?.trim() || undefined;
  } catch {
    return undefined;
  }
});

function getCommitSha(container: HTMLElement): string | undefined {
  const row = container.closest("tr");
  const shaLink = row?.querySelector<HTMLAnchorElement>("td.sha > a.sha[href]")
    ?? row?.querySelector<HTMLAnchorElement>("td.sha a.sha[href], td.sha a[href]")
    ?? container.querySelector<HTMLAnchorElement>("a.sha[href], .sha a[href]");
  const href = shaLink?.getAttribute("href");
  if (!href) {
    return undefined;
  }

  const match = href.match(/\/commit\/([a-f0-9]{7,40})/i) ?? href.match(/\/commits\/([a-f0-9]{7,40})/i);
  return match?.[1];
}

function getAuthorAnchor(container: HTMLElement): HTMLAnchorElement | undefined {
  return container.querySelector<HTMLAnchorElement>("a.author[href], a.author-wrapper[href]") ?? undefined;
}

async function updateLink(container: HTMLElement): Promise<void> {
  const authorLink = getAuthorAnchor(container);
  if (!authorLink) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  const sha = getCommitSha(container);
  if (!sha) {
    return;
  }

  const email = await getCommitAuthorEmail(sha);
  if (!email) {
    return;
  }

  let ref = getCurrentBranch();
  if (location.pathname.includes("/pulls/")) {
    const prTarget = document.querySelector("#branch_target a");
    const match = prTarget?.getAttribute("href")?.match(/\/src\/(branch|tag)\/(.+)$/);
    if (match) {
      ref = `${match[1]}/${match[2]}`;
    }
  }

  ref ??= "branch/master";

  const url = new URL(buildRepoUrl("commits", ref, "search"), location.origin);
  url.searchParams.set("q", `author:${email}`);
  authorLink.href = url.href;
}

function init(signal: AbortSignal): void {
  observe("#commits-table td.author", element => {
    if (element instanceof HTMLElement) {
      void updateLink(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommitList,
  ],
  init,
});
