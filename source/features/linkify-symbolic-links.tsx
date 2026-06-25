import React from "dom-chef";

import features from "../feature-manager.js";
import type { ContentsResponse } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import type { RepoRef } from "../helpers/types.js";

type RepoSrcUrl = RepoRef & { path: string };

function parseSrcUrl(url: string): RepoSrcUrl | undefined {
  const pathname = new URL(url, location.origin).pathname;
  const match = pathname.match(/^\/(?:repo\/)?([^/]+)\/([^/]+)\/src\/(?:branch|tag|commit)\/([^/]+)\/(.+)$/);
  if (!match) {
    return undefined;
  }

  return {
    owner: decodeURIComponent(match[1]),
    repo: decodeURIComponent(match[2]),
    ref: decodeURIComponent(match[3]),
    path: decodeURIComponent(match[4]),
  };
}

function resolveTargetPath(currentPath: string, target: string): string | undefined {
  if (target.startsWith("/")) {
    return undefined;
  }

  const resolved = currentPath.split("/").slice(0, -1);
  for (const segment of target.split("/")) {
    if (!segment || segment === ".") {
      continue;
    }

    if (segment === "..") {
      if (resolved.length === 0) {
        return undefined;
      }
      resolved.pop();
      continue;
    }

    resolved.push(segment);
  }

  return resolved.join("/");
}

async function getContents(owner: string, repo: string, path: string, ref: string): Promise<ContentsResponse> {
  return await api.v1(
    `repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${
      encodeURIComponent(ref)
    }`,
  ) as ContentsResponse;
}

async function resolveSymlinkUrl(parsed: RepoSrcUrl): Promise<string | undefined> {
  let path = parsed.path;

  for (let depth = 0; depth < 20; depth++) {
    const contents = await getContents(parsed.owner, parsed.repo, path, parsed.ref);
    if (contents.type !== "symlink") {
      return contents.html_url;
    }

    if (!contents.target) {
      return undefined;
    }

    const nextPath = resolveTargetPath(path, contents.target);
    if (!nextPath) {
      return undefined;
    }

    path = nextPath;
  }

  return undefined;
}

async function addFollowSymlinkButton(container: Element): Promise<void> {
  if (container.querySelector("[data-kind='follow-symlink'], .rgf-follow-symlink")) {
    return;
  }

  const viewFileButton = container.querySelector<HTMLAnchorElement>("a.ui.basic.tiny.button[href*='/src/']");
  if (!viewFileButton) {
    return;
  }

  const parsed = parseSrcUrl(viewFileButton.href);
  if (!parsed) {
    return;
  }

  let followUrl: string | undefined;
  try {
    followUrl = await resolveSymlinkUrl(parsed);
  } catch {
    return;
  }

  if (!followUrl || followUrl === viewFileButton.href) {
    return;
  }

  container.prepend(
    <a
      className="rgf-follow-symlink ui basic tiny button"
      href={followUrl}
      data-kind="follow-symlink"
      rel="nofollow"
    >
      Follow symlink
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe(".diff-file-header-actions", addFollowSymlinkButton, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isPRFiles, pageDetect.isCommit],
  init,
});

/*

Test URLs:

- https://codeberg.org/phanium/test-rgf-priv/pulls/5/files
- https://codeberg.org/phanium/test-rgf-priv/commit/8ec68d26a5d5845883b4c94124d3a9be07ba4344

*/
