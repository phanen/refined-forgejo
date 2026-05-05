import "./reactions-avatars.css";

import React from "dom-chef";
import { flatZip } from "flat-zip";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

const avatarLimit = 20;
const avatarSize = 16;

const avatarCache = new Map<string, string>();

async function getAvatarUrl(username: string): Promise<string | undefined> {
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }

  try {
    const response = await fetch(`https://codeberg.org/api/v1/users/${username}`);
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    avatarCache.set(username, data.avatar_url);
    return data.avatar_url;
  } catch {
    return undefined;
  }
}

type Participant = {
  button: Element;
  username: string;
  imageUrl: string;
};

async function getParticipants(button: Element): Promise<Participant[]> {
  const title = button.getAttribute("title")?.trim();
  if (!title) {
    return [];
  }

  const usernames = title.split(",").map(u => u.trim()).filter(Boolean);
  const imageUrls = await Promise.all(usernames.map(u => getAvatarUrl(u)));

  const participants: Participant[] = [];
  for (let i = 0; i < usernames.length; i++) {
    const imageUrl = imageUrls[i];
    if (imageUrl) {
      participants.push({ button, username: usernames[i], imageUrl });
    }
  }

  return participants;
}

async function showAvatarsOn(reactionContainer: Element): Promise<void> {
  const buttons = reactionContainer.querySelectorAll(".comment-reaction-button");
  const allParticipants = await Promise.all(
    Array.from(buttons).map(button => getParticipants(button)),
  );

  const flatParticipants = flatZip(allParticipants, avatarLimit);

  for (const { button, username, imageUrl } of flatParticipants) {
    const avatar = (
      <span className="rgf-reactions-avatar" style={{ marginLeft: "0px" }}>
        <img
          src={imageUrl}
          width={avatarSize}
          height={avatarSize}
          alt={username}
          title={username}
          style={{ display: "block", borderRadius: "50%", border: "2px solid var(--color-bg-primary)" }}
        />
      </span>
    );
    button.append(avatar);
  }
}

async function init(signal: AbortSignal): Promise<void> {
  observe(".reactions", showAvatarsOn, { signal });
}

features.add(import.meta.url, {
  init,
});
