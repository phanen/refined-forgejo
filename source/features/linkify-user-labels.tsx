import "./linkify-user-labels.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import { getFullName } from "../forgejo-helpers/user.js";
import { wrap } from "../helpers/dom-utils.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getAuthorUsername(label: HTMLElement): string | undefined {
  const container = label.closest<HTMLElement>(".comment, .timeline-item");
  const author = container?.querySelector<HTMLAnchorElement>(
    ".comment-header-left .author[href], .comment-header-left a.author[href], .timeline-item .author[href]",
  );
  if (!author) {
    return undefined;
  }

  try {
    const url = new URL(author.href, location.origin);
    return url.pathname.replace(/^\/+/, "").split("/")[0];
  } catch {
    return undefined;
  }
}

function getPRHeadInfo(): { repoPath: string; ref: string } | undefined {
  const pullDesc = document.querySelector(".pull-desc");
  if (!pullDesc) {
    return undefined;
  }

  // The first code block in pull-desc usually contains the head branch link
  const headLink = pullDesc.querySelector("code:first-of-type a");
  if (headLink) {
    const href = headLink.getAttribute("href");
    const match = href?.match(/^(\/.*)\/src\/(branch|tag)\/(.+)$/);
    if (match) {
      return { repoPath: match[1], ref: `${match[2]}/${match[3]}` };
    }
  }
  return undefined;
}

function getPRAuthorUsername(): string | undefined {
  const authorEl = document.querySelector(".pull-desc a:first-child");
  return authorEl?.getAttribute("href")?.replace(/^\//, "");
}

async function linkify(label: HTMLElement): Promise<void> {
  if (label.closest("a.rgf-linkify-user-labels")) {
    return;
  }

  const username = getAuthorUsername(label);
  if (!username) {
    return;
  }

  const fullName = await getFullName(username);
  const searchName = fullName ?? username;

  const repo = getRepo();
  if (!repo) {
    return;
  }

  let baseUrl = buildRepoUrl("commits");
  let ref = getCurrentBranch();

  // If on a PR page, try to be smarter
  if (pageDetect.isPR()) {
    const prAuthorUsername = getPRAuthorUsername();
    const headInfo = getPRHeadInfo();

    if (username === prAuthorUsername && headInfo) {
      // Prioritize the user's own branch if they are the PR author
      baseUrl = `${headInfo.repoPath}/commits`;
      ref = headInfo.ref;
    } else {
      // Otherwise use the PR target branch
      const prTarget = document.querySelector("#branch_target a");
      const match = prTarget?.getAttribute("href")?.match(/\/src\/(branch|tag)\/(.+)$/);
      if (match) {
        ref = `${match[1]}/${match[2]}`;
      }
    }
  }

  if (!ref) {
    ref = "branch/master"; // Fallback
  }

  const url = new URL(`${baseUrl}/${ref}/search`, location.origin);
  url.searchParams.set("q", `author:${searchName}`);

  wrap(
    label,
    <a className="rgf-linkify-user-labels" href={url.href} />,
  );
}

function init(signal: AbortSignal): void {
  observe(".comment .role-label, .timeline-item .role-label", element => {
    if (element instanceof HTMLElement) {
      void linkify(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
  ],
  init,
});
