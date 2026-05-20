type ParsedBranch = {
  owner: string;
  repo: string;
  branch: string;
};

function parseBranchPath(pathname: string | undefined): ParsedBranch | undefined {
  if (!pathname) {
    return undefined;
  }

  const match = pathname.match(/^\/(?:repo\/)?([^/]+)\/([^/]+)\/src\/branch\/(.+)$/);
  if (!match) {
    return undefined;
  }

  return {
    owner: match[1],
    repo: match[2],
    branch: decodeURIComponent(match[3]),
  };
}

function parseBranchHref(href: string | null | undefined): ParsedBranch | undefined {
  if (!href) {
    return undefined;
  }

  return parseBranchPath(href.startsWith("/") ? href : new URL(href, location.origin).pathname);
}

function parseBranchFromCode(code: HTMLElement): ParsedBranch | undefined {
  const link = code.querySelector<HTMLAnchorElement>("a[href*='/src/branch/'], a[href*='/src/tag/'], a[href]");
  return parseBranchHref(link?.getAttribute("href"));
}

export function getHeadBranch(container: ParentNode = document): ParsedBranch | undefined {
  const codes = container.querySelectorAll<HTMLElement>("#pull-desc-display code, .issue-title-meta .pull-desc code");
  const headCode = [...codes].find(code => code.id !== "branch_target") ?? codes[0];

  return headCode ? parseBranchFromCode(headCode) : undefined;
}
