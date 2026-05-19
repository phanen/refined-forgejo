import features from "../feature-manager.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import { getFullName } from "../forgejo-helpers/user.js";
import pageDetect, { isConversation, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

async function updateLinks(container: HTMLElement): Promise<void> {
  const authorLink = container.querySelector<HTMLAnchorElement>(".author[href], .author-wrapper[href]");
  const avatar = container.querySelector<HTMLElement>("img.avatar");

  if (!authorLink) {
    return;
  }

  const href = authorLink.getAttribute("href");
  const username = href?.startsWith("/") ? href.split("/")[1] : undefined;
  if (!username) {
    return;
  }

  const fullName = await getFullName(username);
  console.warn("DEBUGPRINT[2349]: same-branch-author-commits.tsx:21: fullName=", fullName);
  const searchName = fullName ?? username;

  // 1. Update Avatar Link to point to Profile
  if (avatar && username) {
    if (!avatar.closest("a")) {
      const profileLink = document.createElement("a");
      profileLink.href = `/${username}`;
      avatar.parentNode?.insertBefore(profileLink, avatar);
      profileLink.appendChild(avatar);
    } else {
      const avatarAnchor = avatar.closest("a")!;
      avatarAnchor.href = `/${username}`;
    }
  }

  // 2. Update Username Link to filter commits
  const repo = getRepo();
  if (!repo) {
    return;
  }

  let ref = getCurrentBranch();
  // Handle PR commit list
  if (location.pathname.includes("/pulls/")) {
    const prTarget = document.querySelector("#branch_target a");
    const match = prTarget?.getAttribute("href")?.match(/\/src\/(branch|tag)\/(.+)$/);
    if (match) {
      ref = `${match[1]}/${match[2]}`;
    }
  }

  if (!ref) {
    ref = "branch/master";
  }

  const url = new URL(buildRepoUrl("commits", ref, "search"), location.origin);
  url.searchParams.set("q", `author:${searchName}`);
  authorLink.href = url.href;
}

function init(signal: AbortSignal): void {
  // Target:
  // - .comment-header-left: Issue/PR comments
  // - .timeline-item .flex-text-block: Timeline events
  // - #commits-table td.author: Commit list
  observe([
    ".comment-header-left",
    ".timeline-item .flex-text-block",
    "#commits-table td.author",
  ], (element) => {
    if (element instanceof HTMLElement) {
      void updateLinks(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
    pageDetect.isCommitList,
  ],
  init,
});
