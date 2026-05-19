import mem from "memoize";
import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getCurrentBranch, getRepo } from "../forgejo-helpers/index.js";
import pageDetect, { isConversation, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

type CommitResponse = {
  commit?: {
    author?: {
      email?: string;
    };
  };
};

const getCommitAuthorEmail = mem(async (sha: string): Promise<string | undefined> => {
  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  try {
    const response = await api.v1(`repos/${repo.owner}/${repo.name}/git/commits/${sha}`) as CommitResponse;
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
  return container.querySelector<HTMLAnchorElement>(".author[href], .author-wrapper[href]") ?? undefined;
}

async function updateLinks(container: HTMLElement): Promise<void> {
  const authorLink = getAuthorAnchor(container);
  const avatar = container.querySelector<HTMLElement>("img.avatar");

  if (!authorLink) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  const sha = getCommitSha(container);
  const email = sha ? await getCommitAuthorEmail(sha) : undefined;
  const searchName = email ?? authorLink.textContent?.trim() ?? "";
  if (!searchName) {
    return;
  }

  if (avatar) {
    const profileHref = authorLink.getAttribute("href");
    if (profileHref?.startsWith("/")) {
      if (!avatar.closest("a")) {
        const profileLink = document.createElement("a");
        profileLink.href = profileHref;
        avatar.parentNode?.insertBefore(profileLink, avatar);
        profileLink.appendChild(avatar);
      } else {
        avatar.closest("a")!.href = profileHref;
      }
    }
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
  url.searchParams.set("q", `author:${searchName}`);
  authorLink.href = url.href;
}

function init(signal: AbortSignal): void {
  observe([
    ".comment-header-left",
    ".timeline-item .flex-text-block",
    "#commits-table td.author",
  ], element => {
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
