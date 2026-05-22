import { getPermissionOrigins, parseSites } from "./helpers/site-domains.js";
import optionsStorage from "./options-storage.js";

const contentScriptId = "refined-forgejo-content-script";
const installOptionsShownKey = "refined-forgejo:install-options-opened";
let installOptionsPromise: Promise<void> | undefined;

async function updateActionState(siteCount: number, enabledSiteCount: number): Promise<void> {
  const enabled = enabledSiteCount > 0;
  const title = siteCount === 0
    ? "Refined Forgejo is disabled. No sites are configured."
    : enabled
    ? `Refined Forgejo is enabled for ${enabledSiteCount} site${enabledSiteCount === 1 ? "" : "s"}.`
    : "Refined Forgejo is disabled. Click the extension icon to open options and enable listed sites.";

  await chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#2da44e" : "#cf222e",
  });
  await chrome.action.setBadgeText({
    text: siteCount === 0 || !enabled ? "OFF" : "ON",
  });
  await chrome.action.setTitle({ title });
}

async function syncContentScripts(): Promise<void> {
  const { sites } = await optionsStorage.getAll();
  const parsedSites = parseSites(sites);

  await chrome.scripting.unregisterContentScripts({ ids: [contentScriptId] }).catch(() => {});

  const grantedSites = new Set<string>();
  let enabledSiteCount = 0;

  for (const site of parsedSites) {
    const origins = getPermissionOrigins([site]);
    if (origins.length === 0) {
      continue;
    }

    const hasPermission = await chrome.permissions.contains({ origins });
    if (hasPermission) {
      enabledSiteCount++;
      for (const origin of origins) {
        grantedSites.add(origin);
      }
    }
  }

  if (grantedSites.size > 0) {
    await chrome.scripting.registerContentScripts([{
      id: contentScriptId,
      matches: [...grantedSites],
      css: ["assets/refined-forgejo.css"],
      js: ["assets/content-script.js"],
      runAt: "document_start",
      allFrames: true,
      persistAcrossSessions: true,
    }]);
  }

  await updateActionState(parsedSites.length, enabledSiteCount);
}

async function openOptionsPageOnFirstRun(): Promise<void> {
  if (installOptionsPromise) {
    await installOptionsPromise;
    return;
  }

  installOptionsPromise = (async () => {
    const { [installOptionsShownKey]: installOptionsShown } = await chrome.storage.local.get(installOptionsShownKey);

    if (installOptionsShown === true) {
      return;
    }

    await chrome.runtime.openOptionsPage();
    await chrome.storage.local.set({ [installOptionsShownKey]: true });
  })();

  try {
    await installOptionsPromise;
  } finally {
    installOptionsPromise = undefined;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void openOptionsPageOnFirstRun();
  void syncContentScripts();
});

chrome.runtime.onStartup.addListener(() => {
  void openOptionsPageOnFirstRun();
  void syncContentScripts();
});

chrome.permissions.onAdded.addListener(() => {
  void syncContentScripts();
});

chrome.permissions.onRemoved.addListener(() => {
  void syncContentScripts();
});

chrome.storage.onChanged.addListener((_, areaName) => {
  if (areaName === "sync") {
    void syncContentScripts();
  }
});

void openOptionsPageOnFirstRun();

chrome.action.onClicked.addListener(async () => {
  await chrome.runtime.openOptionsPage();
});

console.log("Refined Forgejo background script loaded");
