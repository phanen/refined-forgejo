import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getUser } from "../forgejo-helpers/index.js";
import getLoggedInUser from "../helpers/get-logged-in-user.js";
import { isUserProfile } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const followBadgeCache = new Map<string, Promise<boolean>>();

async function userFollowsMe(viewedUser: string, signedInUser: string): Promise<boolean> {
  const key = `${viewedUser} -> ${signedInUser}`;
  let promise = followBadgeCache.get(key);

  if (!promise) {
    promise = api.fetch(`users/${viewedUser}/following/${signedInUser}`, {
      ignoreHttpStatus: true,
      responseType: "text",
    }).then(response => response === "");
    followBadgeCache.set(key, promise);
  }

  return promise;
}

function addBadge(container: Element, followsYou: boolean): void {
  if (!followsYou || container.querySelector(".rgf-follows-you")) {
    return;
  }

  container.append(<div className="rgf-follows-you text grey">Follows you</div>);
}

async function init(signal: AbortSignal): Promise<void> {
  const viewedUser = getUser();
  const signedInUser = await getLoggedInUser();

  if (!viewedUser || !signedInUser || viewedUser === signedInUser) {
    return;
  }

  const followsYou = await userFollowsMe(viewedUser, signedInUser);
  if (signal.aborted) {
    return;
  }

  observe("#profile-avatar-card .profile-avatar-name", element => {
    addBadge(element, followsYou);
  }, { signal });
}

features.add(import.meta.url, {
  include: [isUserProfile],
  init,
});
