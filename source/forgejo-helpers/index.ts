export function getRepo(): { nameWithOwner: string; owner: string; name: string; path: string; pathParts: string[] } | undefined {
  const match = location.pathname.match(/^\/(?:repo\/)?([^/]+)\/([^/]+)/);
  if (!match) {
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
  const repo = getRepo();
  if (!repo) {
    return location.href;
  }
  return `/${repo.nameWithOwner}/${parts.join("/")}`;
}

export function getUser(): string | undefined {
  const match = location.pathname.match(/\/([^\/]+)\/?$/);
  return match?.[1];
}
