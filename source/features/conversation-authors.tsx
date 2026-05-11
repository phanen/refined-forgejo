import "./conversation-authors.css";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { isIssueOrPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import { getToken } from "../options-storage.js";

function getLoggedInUser(): string | undefined {
  const el = document.querySelector<HTMLElement>(".navbar-right .dropdown .header strong");
  return el?.textContent?.trim() || undefined;
}

async function init(signal: AbortSignal): Promise<void> {
  const username = getLoggedInUser();
  if (!username) {
    return;
  }

  let collaborators: string[] = [];
  const repo = getRepo();
  const token = await getToken();
  if (repo && token) {
    try {
      const data = await api.v3WithToken(
        `repos/${repo.owner}/${repo.name}/collaborators`,
        token,
      ) as Array<{ login: string }>;
      collaborators = data.map(u => u.login);
    } catch {
      // Collaborators fetch failed
    }
  }

  const collaboratorSet = new Set(collaborators);

  observe(
    ".issue-meta span > a[href^='/']:not(.index)",
    author => {
      const name = author.textContent?.trim();
      if (!name) {
        return;
      }

      if (name === username) {
        author.classList.add("rgf-own-conversation");
      } else if (collaboratorSet.has(name)) {
        author.classList.add("rgf-collaborator");
      }
    },
    { signal },
  );
}

features.add(import.meta.url, {
  include: [isIssueOrPRList],
  init,
});
