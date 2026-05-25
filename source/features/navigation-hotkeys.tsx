import features from "../feature-manager.js";
import { buildRepoUrl } from "../forgejo-helpers/index.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import getLoggedInUser from "../helpers/get-logged-in-user.js";
import {
  hasRepoHeader,
  isDashboard,
  isExplore,
  isGlobalIssueList,
  isGlobalPRList,
  isNotifications,
  isUserProfile,
} from "../helpers/page-detect.js";

function focusSearch(): void {
  const searchInput = document.querySelector<HTMLInputElement>(
    "input[name=\"q\"], .navbar-search input, .repo-search input",
  );
  searchInput?.focus();
}

function goToProfile(): void {
  void getLoggedInUser().then(username => {
    if (username) {
      location.assign(`${location.origin}/${encodeURIComponent(username)}`);
    }
  });
}

function registerSharedHotkeys(signal: AbortSignal): void {
  registerHotkey("g m", goToProfile, { signal });
  registerHotkey("g n", "/notifications", { signal });
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

  registerSharedHotkeys(signal);
}

async function initGlobalNavigation(signal: AbortSignal): Promise<void> {
  registerHotkey("g i", "/issues", { signal });
  registerHotkey("g p", "/pulls", { signal });
  registerSharedHotkeys(signal);
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
    "g n": "Go to Notifications",
    "s": "Focus search",
  },
  init: initRepoNavigation,
}, {
  include: [
    isExplore,
    isDashboard,
    isGlobalIssueList,
    isGlobalPRList,
    isNotifications,
    isUserProfile,
  ],
  shortcuts: {
    "g i": "Go to Issues",
    "g p": "Go to Pull requests",
    "g m": "Go to Profile",
    "g n": "Go to Notifications",
    "s": "Focus search",
  },
  init: initGlobalNavigation,
});
