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
    return `${repo.pathParts[1]}/${repo.pathParts.slice(2).join("/")}`;
  }

  // 2. Try to find branch from the branch selector in the UI
  const branchSelector = document.querySelector(".branch-dropdown-button strong");
  if (branchSelector) {
    const isTag = !!branchSelector.closest(".js-branch-tag-selector")?.querySelector(".octicon-tag");
    return `${isTag ? "tag" : "branch"}/${branchSelector.textContent?.trim()}`;
  }

  return undefined;
}
