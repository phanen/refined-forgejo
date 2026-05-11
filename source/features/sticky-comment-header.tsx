import "./sticky-comment-header.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import getAvatarUrl from "../forgejo-helpers/get-avatar-url.js";
import { isIssueOrPR } from "../helpers/page-detect";
import observe from "../helpers/selector-observer.js";

async function addAvatar(header: Element): Promise<void> {
  const authorLink = header.querySelector<HTMLAnchorElement>("a.author");
  if (!authorLink || authorLink.querySelector(".rgf-sticky-avatar")) {
    return;
  }

  const username = authorLink.textContent?.trim();
  if (!username) {
    return;
  }

  const avatarUrl = await getAvatarUrl(username, 14);
  if (!avatarUrl) {
    return;
  }

  const avatar = (
    <img
      className="avatar avatar-user rgf-sticky-avatar"
      src={avatarUrl}
      width={14}
      height={14}
      alt=""
    />
  );
  authorLink.prepend(avatar);
}

function init(signal: AbortSignal): void {
  observe(".comment-header", addAvatar, { signal });
}

features.add(import.meta.url, {
  init,
  include: [isIssueOrPR],
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues/1
*/
