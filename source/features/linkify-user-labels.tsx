import "./linkify-user-labels.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import { getFullName } from "../forgejo-helpers/user.js";
import { wrap } from "../helpers/dom-utils.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

async function linkify(label: HTMLElement): Promise<void> {
  if (label.closest("a.rgf-linkify-user-labels")) {
    return;
  }

  const container = label.closest<HTMLElement>(".comment, .timeline-item");
  const authorLink = container?.querySelector<HTMLAnchorElement>(
    ".comment-header-left .author[href], .comment-header-left a.author[href], .timeline-item .author[href]",
  );

  const href = authorLink?.getAttribute("href");
  const username = href?.startsWith("/") ? href.split("/")[1] : undefined;
  if (!username) {
    return;
  }

  const fullName = await getFullName(username);
  const searchName = fullName ?? username;

  const repo = getRepo();
  if (!repo) {
    return;
  }

  const baseUrl = buildRepoUrl("commits");
  let ref = getCurrentBranch();

  // If on a PR page, use the target branch (Base Branch) of the PR
  if (pageDetect.isPR()) {
    const prTarget = document.querySelector("#branch_target a");
    const match = prTarget?.getAttribute("href")?.match(/\/src\/(branch|tag)\/(.+)$/);
    if (match) {
      ref = `${match[1]}/${match[2]}`;
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
