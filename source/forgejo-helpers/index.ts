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

  // 1. Try to get branch or tag from URL - prioritize URL
  // We look for /TYPE/REF where TYPE is branch or tag
  const path = location.pathname;
  const match = path.match(/\/(?:src|commits|blame|raw)\/(branch|tag)\/(.+)$/);
  if (match) {
    const type = match[1];
    let ref = match[2];

    // For commits page, we can accurately determine the ref even with slashes
    if (path.includes("/commits/")) {
      ref = ref.replace(/\/search$/, "");
      return `${type}/${ref}`;
    }

    // For other pages (src, blame), we take the first segment as a fallback
    // This is still better than guessing 'tag' vs 'branch' from the UI icons
    const firstSegment = ref.split("/")[0];
    return `${type}/${firstSegment}`;
  }

  // 2. Fallback to UI only if not in URL (e.g. repo home)
  const branchSelector = document.querySelector(".branch-dropdown-button");
  const branchName = branchSelector?.querySelector("strong")?.textContent?.trim();
  if (branchSelector && branchName) {
    // Only trust the UI if the URL didn't give us a clear branch/tag type
    const isTag = !!branchSelector.querySelector(".octicon-tag");
    return `${isTag ? "tag" : "branch"}/${branchName}`;
  }

  // 3. Try to get from PR target branch
  const prTarget = document.querySelector("#branch_target a");
  if (prTarget) {
    const href = prTarget.getAttribute("href");
    const match = href?.match(/\/src\/(branch|tag)\/([^/]+)/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
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
