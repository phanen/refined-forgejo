import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import { is404, isConversation, isPRFiles, isRepoTree, isSingleCommit, isSingleFile } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type RepoDetails = {
  default_branch?: string;
};

const repoCache = new Map<string, Promise<RepoDetails | undefined>>();

function getCurrentFilePath(): string | undefined {
  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  if (repo.pathParts[0] !== "src") {
    return undefined;
  }

  return repo.pathParts.slice(3).join("/");
}

async function getDefaultBranch(owner: string, repo: string): Promise<string | undefined> {
  const key = `${owner}/${repo}`;
  let promise = repoCache.get(key);
  if (!promise) {
    promise = api.v1(`repos/${owner}/${repo}`)
      .then(data => data as RepoDetails)
      .catch(() => undefined);
    repoCache.set(key, promise);
  }
  return (await promise)?.default_branch;
}

async function getApiRef(): Promise<string | undefined> {
  const branch = getCurrentBranch();
  if (branch) {
    return branch.replace(/^(?:branch|tag)\//, "");
  }

  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  return getDefaultBranch(repo.owner, repo.name);
}

async function findCommitAtDate(date: string): Promise<string | undefined> {
  const repo = getRepo();
  const branch = await getApiRef();
  if (!repo || !branch) {
    return undefined;
  }

  const path = getCurrentFilePath();
  for (let page = 1; page <= 10; page += 1) {
    const query = new URLSearchParams({
      sha: branch,
      page: String(page),
      limit: "100",
    });
    if (path) {
      query.set("path", path);
    }

    const commits = await api.v1(`repos/${repo.owner}/${repo.name}/commits?${query.toString()}`) as Array<
      { sha: string; commit: { author: { date: string } } }
    >;
    if (!commits.length) {
      return undefined;
    }

    for (const commit of commits) {
      if (new Date(commit.commit.author.date).getTime() <= new Date(date).getTime()) {
        return commit.sha;
      }
    }

    if (new Date(commits[commits.length - 1].commit.author.date).getTime() <= new Date(date).getTime()) {
      return commits[commits.length - 1].sha;
    }
  }

  return undefined;
}

async function getTimeMachineTarget(date: string): Promise<string | false> {
  const repo = getRepo();
  if (!repo) {
    return false;
  }

  const sha = await findCommitAtDate(date);
  if (!sha) {
    return false;
  }

  const filePath = getCurrentFilePath();
  const target = filePath
    ? buildRepoUrl("src", "commit", sha, filePath)
    : buildRepoUrl("src", "commit", sha);
  const targetUrl = new URL(target, location.href);
  targetUrl.searchParams.set("rgf-link-date", date);
  return targetUrl.href;
}

async function applyTimeMachine(signal: AbortSignal): Promise<void | false> {
  const url = new URL(location.href);
  const date = url.searchParams.get("rgf-link-date");
  if (!date) {
    return false;
  }

  const repo = getRepo();
  if (!repo) {
    return false;
  }

  if (repo.pathParts[0] === "src" && repo.pathParts[1] === "commit") {
    observe("a[href]", element => {
      if (element instanceof HTMLAnchorElement) {
        addTimeMachineDateToLink(element);
      }
    }, { signal });
    return false;
  }

  const target = await getTimeMachineTarget(date);
  if (!target) {
    return false;
  }

  location.replace(target);
}

function addTimeMachineDateToLink(anchor: HTMLAnchorElement): void {
  if (anchor.dataset.rgfTimeMachineLink === "done") {
    return;
  }

  const currentDate = new URL(location.href).searchParams.get("rgf-link-date");
  if (!currentDate) {
    return;
  }

  const url = new URL(anchor.href);
  if (url.host !== location.host) {
    return;
  }

  if (url.searchParams.has("rgf-link-date")) {
    anchor.dataset.rgfTimeMachineLink = "done";
    return;
  }

  if (url.pathname === location.pathname && url.search === location.search && url.hash) {
    anchor.dataset.rgfTimeMachineLink = "done";
    return;
  }

  url.searchParams.set("rgf-link-date", currentDate);
  anchor.href = url.href;
  anchor.dataset.rgfTimeMachineLink = "done";
}

async function addTimeMachineDropdownLink(menu: HTMLElement): Promise<void> {
  if (menu.querySelector(".rgf-time-machine-link")) {
    return;
  }

  const timestamp = menu.closest(".header")?.querySelector<HTMLElement>("relative-time[datetime]");
  const date = timestamp?.getAttribute("datetime");
  if (!date) {
    return;
  }

  const target = await getTimeMachineTarget(date);
  if (!target || menu.querySelector(".rgf-time-machine-link")) {
    return;
  }

  menu.append(
    <div className="divider"></div>,
    <a
      className="item context rgf-time-machine-link"
      href={target}
      role="menuitem"
      data-turbo="false"
    >
      View repo at this time
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe(".context-dropdown .menu", element => {
    if (element instanceof HTMLElement) {
      void addTimeMachineDropdownLink(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isSingleCommit,
    isRepoTree,
    isSingleFile,
    isPRFiles,
  ],
  init,
}, {
  asLongAs: [
    () => new URL(location.href).searchParams.has("rgf-link-date"),
  ],
  include: [
    is404,
    isSingleFile,
    isSingleCommit,
    isRepoTree,
  ],
  init: applyTimeMachine,
});
