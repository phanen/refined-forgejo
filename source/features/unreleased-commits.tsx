import "./unreleased-commits.css";

import React from "dom-chef";
import TagIcon from "octicons-plain-react/Tag";
import compareVersions from "tiny-version-compare";
import { CachedFunction } from "webext-storage-cache";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, cacheByRepo, getRepo } from "../forgejo-helpers/index.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type RepoTag = {
  name: string;
  commit: {
    id: string;
  };
};

type RepoState = {
  latestTag: string | false;
  aheadBy: number;
  defaultBranch: string;
};

const validVersion = /^[vr]?\d+(?:\.\d+)+/;
const isPrerelease = /^[vr]?\d+(?:\.\d+)+(?:-\d)/;

function getLatestVersionTag(tags: string[]): string {
  if (!tags.every(tag => validVersion.test(tag))) {
    return tags[0];
  }

  let releases = tags.filter(tag => !isPrerelease.test(tag));
  if (releases.length === 0) {
    releases = tags;
  }

  let latestVersion = releases[0];
  for (const release of releases) {
    if (compareVersions(latestVersion, release) < 0) {
      latestVersion = release;
    }
  }

  return latestVersion;
}

function encodeRef(ref: string): string {
  return encodeURIComponent(ref);
}

const repoState = new CachedFunction("tag-ahead-by", {
  async updater(): Promise<RepoState> {
    const repo = getRepo();
    if (!repo) {
      return { latestTag: false, aheadBy: 0, defaultBranch: "main" };
    }

    const repoInfo = await api.v1(`repos/${repo.owner}/${repo.name}`) as { default_branch?: string };
    const defaultBranch = repoInfo.default_branch || "main";
    const tags = (await api.v1(`repos/${repo.owner}/${repo.name}/tags?limit=20`) as RepoTag[]) ?? [];
    if (tags.length === 0) {
      return { latestTag: false, aheadBy: 0, defaultBranch };
    }

    const tagNames = tags.map(tag => tag.name);
    const latestTag = getLatestVersionTag(tagNames);
    const latestTagInfo = tags.find(tag => tag.name === latestTag);
    if (!latestTagInfo) {
      return { latestTag: false, aheadBy: 0, defaultBranch };
    }

    const compare = await api.v1(
      `repos/${repo.owner}/${repo.name}/compare/${encodeRef(latestTag)}...${encodeRef(defaultBranch)}`,
    ) as { total_commits?: number };

    return {
      latestTag,
      aheadBy: compare.total_commits ?? 0,
      defaultBranch,
    };
  },
  maxAge: { hours: 1 },
  staleWhileRevalidate: { days: 2 },
  cacheKey: cacheByRepo,
});

function createButton(latestTag: string, aheadBy: number, defaultBranch: string): HTMLElement {
  const commitCount = `${aheadBy} unreleased commit${aheadBy === 1 ? "" : "s"}`;
  return (
    <a
      className="ui basic small compact button rgf-unreleased-commits"
      href={buildRepoUrl("compare", `${encodeRef(latestTag)}...${encodeRef(defaultBranch)}`)}
      data-tooltip-content={`${commitCount} since ${latestTag}`}
      aria-label={`${commitCount} since ${latestTag}`}
    >
      <TagIcon className="rgf-unreleased-commits-icon tw-mr-1" />
      <sup className="tw-ml-1">+{aheadBy}</sup>
    </a>
  );
}

async function addToHome(button: Element): Promise<void> {
  if (button.closest(".rgf-unreleased-commits")) {
    return;
  }

  const { latestTag, aheadBy } = await repoState.get();
  if (!latestTag || aheadBy <= 0) {
    return;
  }

  const { defaultBranch } = await repoState.get();
  const sequence = button.closest(".button-sequence");
  const target = sequence ?? button.parentElement;
  if (!target) {
    return;
  }

  if (target.querySelector(".rgf-unreleased-commits")) {
    return;
  }

  target.append(createButton(latestTag, aheadBy, defaultBranch));
}

async function addToReleases(buttons: Element): Promise<void> {
  if (buttons.querySelector(".rgf-unreleased-commits")) {
    return;
  }

  const { latestTag, aheadBy } = await repoState.get();
  if (!latestTag || aheadBy <= 0) {
    return;
  }

  buttons.prepend(createButton(latestTag, aheadBy, (await repoState.get()).defaultBranch));
}

function initHome(signal: AbortSignal): void {
  observe(".branch-dropdown-button", addToHome, { signal });
}

function initReleases(signal: AbortSignal): void {
  observe(".release-list-buttons", addToReleases, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoHome,
  ],
  init: initHome,
}, {
  include: [
    pageDetect.isReleases,
  ],
  init: initReleases,
});
