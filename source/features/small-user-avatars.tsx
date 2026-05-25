import "./small-user-avatars.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import getAvatarUrl from "../forgejo-helpers/get-avatar-url.js";
import observe from "../helpers/selector-observer.js";

const avatarSize = 14;

async function addAvatar(authorLink: Element): Promise<void> {
  const link = authorLink as HTMLAnchorElement;
  const username = link.textContent?.trim().replace(/^@/, "");
  if (!username || link.querySelector(".rgf-small-user-avatar")) {
    return;
  }

  // Skip if the parent timeline item already shows an avatar (events, etc.)
  if (link.closest(".timeline-item")?.querySelector("a.avatar")) {
    return;
  }

  // Skip if there's an existing avatar in the same container (releases page, etc.)
  // We don't want to duplicate it or change its size by adding our class
  if (link.parentElement?.querySelector("img.avatar")) {
    return;
  }

  // Skip author links inside the comment header (avatar handled by sticky-comment-header)
  if (link.closest(".comment-header-left")) {
    return;
  }

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
      className="ui avatar rgf-small-user-avatar"
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
      "a.author",
      "a.mention",
      ".issue-meta span > a[href^='/']:not([href*='register'], [href*='login'], [href*='password'], [href*='sign_up'])",
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
