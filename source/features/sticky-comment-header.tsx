import "./sticky-comment-header.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import getAvatarUrl from "../forgejo-helpers/get-avatar-url.js";
import { isIssueOrPR } from "../helpers/page-detect";
import observe from "../helpers/selector-observer.js";

function removeStickyAvatar(authorLink: HTMLAnchorElement | null): void {
  authorLink?.querySelector(".rgf-sticky-avatar")?.remove();
}

async function addAvatar(header: Element, { signal }: { signal?: AbortSignal }): Promise<void> {
  if (header.querySelector(".inline-timeline-avatar")) {
    removeStickyAvatar(header.querySelector<HTMLAnchorElement>("a.author"));
    return;
  }

  const authorLink = header.querySelector<HTMLAnchorElement>("a.author");
  if (!authorLink || authorLink.querySelector(".rgf-sticky-avatar")) {
    return;
  }

  const username = authorLink.textContent?.trim();
  if (!username) {
    return;
  }

  const avatarUrl = await getAvatarUrl(username);
  if (!avatarUrl) {
    return;
  }

  const avatar = (
    <img
      className="ui avatar rgf-sticky-avatar"
      src={avatarUrl}
      width={14}
      height={14}
      alt=""
    />
  );
  authorLink.prepend(avatar);

  // Detect sticky state via IntersectionObserver:
  // with top: -1px, the element's intersectionRatio < 1 when pinned
  const stickyObserver = new IntersectionObserver(
    ([entry]) => {
      avatar.classList.toggle("rgf-sticky-avatar-visible", entry.intersectionRatio < 1);
    },
    { threshold: [1] },
  );
  stickyObserver.observe(header);
  signal?.addEventListener("abort", () => stickyObserver.disconnect());
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
