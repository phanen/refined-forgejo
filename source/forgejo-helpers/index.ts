export type RepositoryInfo = {
  nameWithOwner: string;
  owner: string;
  name: string;
  path: string;
  pathParts: string[];
};

const reservedTopLevelPaths = new Set([
  "explore",
]);

export function getRepo(): RepositoryInfo | undefined {
  const match = location.pathname.match(/^\/(?:repo\/)?([^/]+)\/([^/]+)/);
  if (!match) {
    return undefined;
  }

  if (reservedTopLevelPaths.has(match[1])) {
    return undefined;
  }

  const rest = location.pathname.slice(match[0].length).replace(/^\/+/, "");
  const pathParts = rest ? rest.split("/") : [];

  return {
    nameWithOwner: `${match[1]}/${match[2]}`,
    owner: match[1],
    name: match[2],
    path: pathParts.join("/"),
    pathParts,
  };
}

export function buildRepoUrl(...parts: string[]): string {
  const match = location.pathname.match(/^\/(?:repo\/)?[^/]+\/[^/]+/);
  if (!match) {
    return location.href;
  }
  return `${match[0]}/${parts.join("/")}`;
}

export function getUser(): string | undefined {
  const match = location.pathname.match(/\/([^\/]+)\/?$/);
  return match?.[1];
}

export function getCurrentBranch(): string | undefined {
  const repo = getRepo();
  if (!repo) {
    return undefined;
  }

  // 1. Try to get branch or tag from URL
  if (
    ["src", "commits", "blame", "raw"].includes(repo.pathParts[0])
    && ["branch", "tag"].includes(repo.pathParts[1])
  ) {
    // Determine where the branch part ends by looking at the page metadata or UI if possible
    // For now, assume everything after repo.pathParts[1] is the branch name if we're on a single file page
    // but this is often wrong if there's a path.
    const branchSelector = document.querySelector(".branch-dropdown-button strong");
    if (branchSelector) {
      const isTag = !!branchSelector.closest(".js-branch-tag-selector")?.querySelector(".octicon-tag");
      return `${isTag ? "tag" : "branch"}/${branchSelector.textContent?.trim()}`;
    }

    // If no UI selector, we might be in a state where we can't easily distinguish branch from path
    // in the URL without more context. Fallback to just the next part.
    return `${repo.pathParts[1]}/${repo.pathParts[2]}`;
  }

  // 2. Try to find branch from the branch selector in the UI
  const branchSelector = document.querySelector(".branch-dropdown-button strong");
  if (branchSelector) {
    const isTag = !!branchSelector.closest(".js-branch-tag-selector")?.querySelector(".octicon-tag");
    return `${isTag ? "tag" : "branch"}/${branchSelector.textContent?.trim()}`;
  }

  return undefined;
}

export function getFilePath(): string | undefined {
  const repo = getRepo();
  if (!repo || !["src", "blame", "raw", "commits"].includes(repo.pathParts[0])) {
    return undefined;
  }

  // Handle /src/commit/SHA/PATH style URLs
  if (repo.pathParts[1] === "commit") {
    return repo.pathParts.slice(3).join("/");
  }

  const branch = getCurrentBranch();
  if (!branch) {
    return undefined;
  }

  // branch is "branch/NAME" or "tag/NAME"
  const branchName = branch.split("/").slice(1).join("/");

  // pathParts are [TYPE, "branch"|"tag"|"commit", REF, ...PATH]
  // We need to find where REF ends.
  const refIndex = repo.pathParts.indexOf(branchName, 2);
  if (refIndex !== -1) {
    return repo.pathParts.slice(refIndex + 1).join("/");
  }

  return undefined;
}
