import "./conversation-authors.css";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { isIssueOrPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import waitFor from "../helpers/wait-for.js";

async function getLoggedInUser(): Promise<string | undefined> {
  let username: string | undefined;
  await waitFor(() => {
    const headers = document.querySelectorAll<HTMLElement>(".navbar-right .dropdown .header strong");
    username = headers[headers.length - 1]?.textContent?.trim() || undefined;
    return !!username;
  }).catch(() => {/* not logged in */});
  return username;
}

async function init(signal: AbortSignal): Promise<void> {
  const repo = getRepo();
  if (!repo) {
    return;
  }

  const owner = repo.owner;

  // Fetch username in background — don't block other role detection
  const usernamePromise = getLoggedInUser();

  // Fetch collaborators and org members concurrently
  const [collaboratorsData, orgMembersData] = await Promise.all([
    api.v1WithToken(`repos/${repo.owner}/${repo.name}/collaborators`).catch(() => []),
    api.v1WithToken(`orgs/${repo.owner}/members`).catch(() => []),
  ]);

  const collaborators = (collaboratorsData as Array<{ login: string }>).map(u => u.login);
  const orgMembers = (orgMembersData as Array<{ login: string }>).map(u => u.login);

  const collaboratorSet = new Set(collaborators);
  const orgMemberSet = new Set(orgMembers);

  function addRole(author: Element): void {
    const name = author.textContent?.trim();
    if (!name) {
      return;
    }

    if (name === owner) {
      author.classList.add("rgf-owner");
      return;
    }

    if (collaboratorSet.has(name)) {
      author.classList.add("rgf-collaborator");
      return;
    }

    if (orgMemberSet.has(name)) {
      author.classList.add("rgf-org-member");
      return;
    }

    // Own-conversation check last — doesn't block other role detection
    void usernamePromise.then(username => {
      if (name === username) {
        author.classList.add("rgf-own-conversation");
      }
    });
  }

  observe(".issue-meta span > a[href^='/']:not(.index)", addRole, { signal });
}

features.add(import.meta.url, {
  include: [isIssueOrPRList],
  init,
});
