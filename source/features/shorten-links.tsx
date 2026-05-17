import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

const repoSelectors = [
  ".comment-body .markup a[href]",
  ".comment-content .markup a[href]",
  ".comment-code-cloud .render-content a[href]",
  ".render-content a[href]",
  ".markup a[href]",
  ".markdown-body a[href]",
];

const topLevelRoutes = new Set([
  "admin",
  "api",
  "assets",
  "dashboard",
  "explore",
  "help",
  "issues",
  "login",
  "logout",
  "notifications",
  "org",
  "pulls",
  "repo",
  "search",
  "settings",
  "user",
]);

const codebergHosts = new Set([
  "codeberg.org",
  "www.codeberg.org",
]);

function decodePathname(pathname: string): string[] {
  return pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map(part => decodeURIComponent(part));
}

function stripProtocol(url: URL): string {
  return `${url.host}${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
}

function formatRepoPath(owner: string, repo: string, rest: string[], url: URL): string {
  if (rest.length === 0) {
    return `${owner}/${repo}${url.search}${url.hash}`;
  }

  const [section, ...tail] = rest;

  if (section === "src" || section === "raw" || section === "blame" || section === "commits") {
    const [refKind, ref, ...filePath] = tail;
    if (ref && (refKind === "branch" || refKind === "tag" || refKind === "commit")) {
      const shortRef = /^[\da-f]{7,40}$/i.test(ref) ? ref.slice(0, 7) : ref;
      const suffix = section === "src" || section === "raw"
        ? ""
        : ` (${section === "commits" ? "history" : section})`;
      return `${owner}/${repo}@${shortRef}${
        filePath.length > 0 ? `/${filePath.join("/")}` : ""
      }${suffix}${url.search}${url.hash}`;
    }
  }

  if (section === "commit") {
    const commit = tail[0];
    if (commit) {
      const match = commit.match(/^([\da-f]{7,40})(?:\.(diff|patch))?$/i);
      if (match) {
        const [, sha, extension] = match;
        return `${owner}/${repo}/commit/${sha.slice(0, 7)}${extension ? `.${extension}` : ""}${url.search}${url.hash}`;
      }
    }
  }

  if (section === "releases" && tail[0] === "tag" && tail[1]) {
    return `${owner}/${repo}@${tail[1]} (release)${url.search}${url.hash}`;
  }

  if (section === "compare") {
    return `${owner}/${repo}/compare/${tail.join("/")}${url.search}${url.hash}`;
  }

  if (section === "issues" || section === "pulls") {
    return `${owner}/${repo}/${section}${tail.length > 0 ? `/${tail[0]}` : ""}${url.search}${url.hash}`;
  }

  if (section === "releases" && tail[0] === "download" && tail[1] && tail[2]) {
    return `${owner}/${repo}@${tail[1]} ${tail.slice(2).join("/")} (download)${url.search}${url.hash}`;
  }

  return `${owner}/${repo}/${rest.join("/")}${url.search}${url.hash}`;
}

function shortenLink(link: HTMLAnchorElement): void {
  if (link.dataset.rgfShortened === "done") {
    return;
  }

  const codeChild = link.childElementCount === 1 ? link.firstElementChild : undefined;
  const isCodeWrappedLink = codeChild instanceof HTMLElement && codeChild.tagName === "CODE";

  if (link.childElementCount > 0 && !isCodeWrappedLink) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href) {
    return;
  }

  let url: URL;
  try {
    url = new URL(href, location.href);
  } catch {
    return;
  }

  if (!codebergHosts.has(url.hostname)) {
    return;
  }

  const text = link.textContent?.trim();
  if (
    !text
    || (
      !/^https?:\/\//i.test(text)
      && !isCodeWrappedLink
      && text !== stripProtocol(url)
    )
  ) {
    return;
  }

  const pathParts = decodePathname(url.pathname);
  if (pathParts[0] === "repo") {
    pathParts.shift();
  }

  let readable: string;

  if (pathParts.length === 1 && !topLevelRoutes.has(pathParts[0])) {
    readable = `@${pathParts[0]}${url.search}${url.hash}`;
  } else if (pathParts.length >= 2 && !topLevelRoutes.has(pathParts[0])) {
    const [owner, repo, ...rest] = pathParts;
    readable = formatRepoPath(owner, repo, rest, url);
  } else {
    readable = stripProtocol(url);
  }

  if (readable === text) {
    return;
  }

  link.title = text;
  if (isCodeWrappedLink && codeChild) {
    codeChild.textContent = readable;
  } else {
    link.textContent = readable;
  }
  link.dataset.rgfShortened = "done";
}

function init(signal: AbortSignal): void {
  observe(repoSelectors, element => {
    if (element instanceof HTMLAnchorElement) {
      shortenLink(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  init,
});
