import "./small-user-avatars.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

const avatarCache = new Map<string, string>();
const avatarSize = 14;

async function getAvatarUrl(username: string): Promise<string | undefined> {
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }

  try {
    const response = await fetch(`/api/v1/users/${username}`);
    if (!response.ok) {
      return undefined;
    }

    const data = await response.json() as { avatar_url: string };
    avatarCache.set(username, data.avatar_url);
    return data.avatar_url;
  } catch {
    return undefined;
  }
}

async function addAvatar(authorLink: Element): Promise<void> {
  const link = authorLink as HTMLAnchorElement;
  const username = link.textContent?.trim();
  if (!username || link.querySelector(".rgf-small-user-avatar")) {
    return;
  }

  // Skip non-user single-segment paths (e.g. /explore, /notifications)
  const segments = link.pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return;
  }

  const avatarUrl = await getAvatarUrl(username);
  if (!avatarUrl) {
    return;
  }

  link.classList.add("rgf-has-small-avatar");
  link.prepend(
    <img
      className="avatar avatar-user rgf-small-user-avatar"
      src={avatarUrl}
      width={avatarSize}
      height={avatarSize}
      alt=""
    />,
  );
}

function init(signal: AbortSignal): void {
  observe(
    [
      "a.author", // Comment author links (shared/user/authorlink.tmpl)
      ".issue-meta span > a[href^='/']:not([href*='register'], [href*='login'], [href*='password'], [href*='sign_up'])", // Issue list: single-segment user links
    ],
    addAvatar,
    { signal },
  );
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues
- https://codeberg.org/ziglang/zig/issues/1
*/
