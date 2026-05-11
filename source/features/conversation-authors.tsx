import "./conversation-authors.css";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { isIssueOrPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getLoggedInUser(): string | undefined {
  const el = document.querySelector<HTMLElement>(".navbar-right .dropdown .header strong");
  return el?.textContent?.trim() || undefined;
}

async function init(signal: AbortSignal): Promise<void> {
  const username = getLoggedInUser();
  if (!username) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  // Fetch repo info to get owner and org status
  let owner = "";
  let isOrg = false;
  try {
    const repoInfo = await api.v1WithToken(
      `repos/${repo.owner}/${repo.name}`,
    ) as { owner: { login: string; type: string } };
    owner = repoInfo.owner.login;
    isOrg = repoInfo.owner.type === "Organization";
  } catch {
    return;
  }

  // Fetch collaborators
  let collaborators: string[] = [];
  try {
    const data = await api.v1WithToken(
      `repos/${repo.owner}/${repo.name}/collaborators`,
    ) as Array<{ login: string }>;
    collaborators = data.map(u => u.login);
  } catch {
    // Collaborators fetch failed
  }

  // Fetch org members if applicable
  let orgMembers: string[] = [];
  if (isOrg) {
    try {
      const data = await api.v1WithToken(
        `orgs/${repo.owner}/members`,
      ) as Array<{ login: string }>;
      orgMembers = data.map(u => u.login);
    } catch {
      // Org members fetch failed
    }
  }

  const collaboratorSet = new Set(collaborators);
  const orgMemberSet = new Set(orgMembers);

  observe(
    ".issue-meta span > a[href^='/']:not(.index)",
    author => {
      const name = author.textContent?.trim();
      if (!name) {
        return;
      }

      if (name === username) {
        author.classList.add("rgf-own-conversation");
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
      }
    },
    { signal },
  );
}

features.add(import.meta.url, {
  include: [isIssueOrPRList],
  init,
});
