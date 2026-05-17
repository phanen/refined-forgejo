import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import getLoggedInUser from "../helpers/get-logged-in-user.js";
import {
  hasRepoHeader,
  isDashboard,
  isGlobalIssueList,
  isGlobalPRList,
  isUserProfile,
} from "../helpers/page-detect.js";

function focusSearch(): void {
  const searchInput = document.querySelector<HTMLInputElement>(
    "input[name=\"q\"], .navbar-search input, .repo-search input",
  );
  searchInput?.focus();
}

async function registerSharedHotkeys(signal: AbortSignal): Promise<void> {
  const username = await getLoggedInUser();
  const profileUrl = username ? `${location.origin}/${encodeURIComponent(username)}` : undefined;
  if (profileUrl) {
    registerHotkey("g m", profileUrl, { signal });
  }

  registerHotkey("s", focusSearch, { signal });
}

// TODO(upstream): https://codeberg.org/forgejo/forgejo/pulls/12409
async function initRepoNavigation(signal: AbortSignal): Promise<void> {
  registerHotkey("g h", buildRepoUrl(""), { signal });
  registerHotkey("g c", buildRepoUrl("commits"), { signal });
  registerHotkey("g i", buildRepoUrl("issues"), { signal });
  registerHotkey("g p", buildRepoUrl("pulls"), { signal });
  registerHotkey("g r", buildRepoUrl("releases"), { signal });
  registerHotkey("g a", buildRepoUrl("actions"), { signal });
  registerHotkey("g b", buildRepoUrl("branches"), { signal });
  registerHotkey("g t", buildRepoUrl("tags"), { signal });
  registerHotkey("g w", buildRepoUrl("wiki"), { signal });
  registerHotkey("g s", buildRepoUrl("settings"), { signal });

  await registerSharedHotkeys(signal);
}

async function initGlobalNavigation(signal: AbortSignal): Promise<void> {
  registerHotkey("g i", `${location.origin}/issues`, { signal });
  registerHotkey("g p", `${location.origin}/pulls`, { signal });
  await registerSharedHotkeys(signal);
}

void features.add(import.meta.url, {
  include: [
    hasRepoHeader,
  ],
  shortcuts: {
    "g h": "Go to Code",
    "g c": "Go to Commits",
    "g i": "Go to Issues",
    "g p": "Go to Pull requests",
    "g r": "Go to Releases",
    "g a": "Go to Actions",
    "g b": "Go to Branches",
    "g t": "Go to Tags",
    "g w": "Go to Wiki",
    "g s": "Go to Settings",
    "g m": "Go to Profile",
    "s": "Focus search",
  },
  init: initRepoNavigation,
}, {
  include: [
    isDashboard,
    isGlobalIssueList,
    isGlobalPRList,
    isUserProfile,
  ],
  shortcuts: {
    "g i": "Go to Issues",
    "g p": "Go to Pull requests",
    "g m": "Go to Profile",
    "s": "Focus search",
  },
  init: initGlobalNavigation,
});
