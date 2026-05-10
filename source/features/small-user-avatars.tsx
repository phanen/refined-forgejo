import "./small-user-avatars.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import getAvatarUrl from "../forgejo-helpers/get-avatar-url.js";
import observe from "../helpers/selector-observer.js";

const avatarSize = 14;

async function addAvatar(authorLink: Element): Promise<void> {
  const link = authorLink as HTMLAnchorElement;
  const username = link.textContent?.trim();
  if (!username || link.querySelector(".rgf-small-user-avatar")) {
    return;
  }

  const segments = link.pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return;
  }

  const avatarUrl = await getAvatarUrl(username, avatarSize);
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
      "a.mention",
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
