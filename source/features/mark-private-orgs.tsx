import React from "dom-chef";
import EyeClosedIcon from "octicons-plain-react/EyeClosed";

import features from "../feature-manager.js";
import type { Organization } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { getUser } from "../forgejo-helpers/index.js";
import getLoggedInUser from "../helpers/get-logged-in-user.js";
import { isUserProfile } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

import "./mark-private-orgs.css";

const publicOrganizationsNames = new Map<string, Promise<Set<string>>>();

async function getPublicOrganizations(username: string): Promise<Set<string>> {
  let promise = publicOrganizationsNames.get(username);

  if (!promise) {
    promise = api.v1(`users/${username}/orgs`)
      .then(response => new Set((response as Organization[]).map(organization => organization.login)))
      .catch(() => new Set<string>());
    publicOrganizationsNames.set(username, promise);
  }

  return promise;
}

function normalizeOrganizationName(href: string): string {
  return href.replace(/^\/(?:orgs|organizations)\//, "");
}

function markPrivateOrg(link: HTMLAnchorElement, publicOrganizations: Set<string>): void {
  if (link.dataset.rgfPrivateOrg === "done") {
    return;
  }

  const orgName = normalizeOrganizationName(new URL(link.href).pathname);
  if (publicOrganizations.has(orgName)) {
    link.dataset.rgfPrivateOrg = "done";
    return;
  }

  link.classList.add("rgf-private-org");
  link.dataset.rgfPrivateOrg = "done";
  link.insertAdjacentElement(
    "beforeend",
    <EyeClosedIcon className="rgf-private-org-icon" width={12} height={12} aria-hidden="true" />,
  );
}

async function init(signal: AbortSignal): Promise<void> {
  const viewedUser = getUser();
  const signedInUser = await getLoggedInUser();

  if (!viewedUser || !signedInUser || viewedUser !== signedInUser) {
    return;
  }

  const publicOrganizations = await getPublicOrganizations(viewedUser);
  if (signal.aborted) {
    return;
  }

  observe("#profile-avatar-card .user-orgs a", element => {
    if (element instanceof HTMLAnchorElement) {
      markPrivateOrg(element, publicOrganizations);
    }
  }, { signal });
}

features.add(import.meta.url, {
  include: [isUserProfile],
  init,
});
