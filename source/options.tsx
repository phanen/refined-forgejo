import "./options.css";
import { featuresMeta } from "./feature-data.js";
import {
  getPermissionOrigins,
  getPrimarySiteOrigin,
  parseSites,
  type SiteEntry,
  splitCommaSeparated,
} from "./helpers/site-domains.js";
import optionsStorage from "./options-storage.js";

const siteValidationControllers = new WeakMap<HTMLDivElement, AbortController>();
const installOptionsShownKey = "refined-forgejo:install-options-opened";
const installSitesChecklistOpenedKey = "refined-forgejo:install-sites-checklist-opened";

type SiteValidationState = "pending" | "valid" | "invalid" | "";

function setSiteValidation(row: HTMLDivElement, state: SiteValidationState, message: string): void {
  const validation = row.querySelector<HTMLSpanElement>(".site-validation");
  if (!validation) {
    return;
  }

  validation.dataset.state = state;
  validation.textContent = message;
}

function getSiteOrigin(row: HTMLDivElement): string {
  const url = row.querySelector<HTMLInputElement>(".site-url")?.value.trim() ?? "";
  return getPrimarySiteOrigin([{ url, token: "" }]);
}

async function validateSiteToken(row: HTMLDivElement): Promise<void> {
  const url = row.querySelector<HTMLInputElement>(".site-url")?.value.trim() ?? "";
  const token = row.querySelector<HTMLInputElement>(".site-token")?.value.trim() ?? "";
  const parsedSite = parseSites([{ url, token: "" }])[0];
  const validation = row.querySelector<HTMLSpanElement>(".site-validation");
  if (!validation) {
    return;
  }

  siteValidationControllers.get(row)?.abort();

  if (!token) {
    setSiteValidation(row, "", "");
    return;
  }

  if (!parsedSite) {
    setSiteValidation(row, "invalid", "Invalid site");
    return;
  }

  const tokens = splitCommaSeparated(token);
  if (tokens.length === 0) {
    setSiteValidation(row, "", "");
    return;
  }

  const controller = new AbortController();
  siteValidationControllers.set(row, controller);
  setSiteValidation(row, "pending", "Checking…");

  try {
    for (const candidate of tokens) {
      const response = await fetch(new URL("/api/v1/user", parsedSite.origin).href, {
        headers: { Authorization: `token ${candidate}` },
        signal: controller.signal,
      });

      if (response.ok) {
        setSiteValidation(row, "valid", "Valid");
        return;
      }

      if (response.status !== 401 && response.status !== 403) {
        setSiteValidation(row, "invalid", `Error ${response.status}`);
        return;
      }
    }

    setSiteValidation(row, "invalid", "Invalid");
  } catch {
    if (!controller.signal.aborted) {
      setSiteValidation(row, "invalid", "Validation failed");
    }
  } finally {
    if (siteValidationControllers.get(row) === controller) {
      siteValidationControllers.delete(row);
    }
  }
}

async function validateAllSites(): Promise<void> {
  await Promise.all([...document.querySelectorAll<HTMLDivElement>(".site-row")].map(row => validateSiteToken(row)));
}

async function syncSitePermissionCheckbox(row: HTMLDivElement): Promise<boolean> {
  const url = row.querySelector<HTMLInputElement>(".site-url")?.value.trim() ?? "";
  const checkbox = row.querySelector<HTMLInputElement>(".site-enabled");
  if (!checkbox) {
    return false;
  }

  const origins = getPermissionOrigins([{ url, token: "", enabled: true }]);

  if (origins.length === 0) {
    if (checkbox.checked) {
      checkbox.checked = false;
      return true;
    }
    return false;
  }

  const granted = await chrome.permissions.contains({ origins });
  if (checkbox.checked !== granted) {
    checkbox.checked = granted;
    updateOnboardingState(row);
    return true;
  }

  return false;
}

async function syncAllSitePermissionCheckboxes(): Promise<void> {
  let changed = false;
  for (const row of document.querySelectorAll<HTMLDivElement>(".site-row")) {
    changed ||= await syncSitePermissionCheckbox(row);
  }

  if (changed) {
    await saveOptions();
  }
}

function updateSiteTokenLink(row: HTMLDivElement): void {
  const link = row.querySelector<HTMLAnchorElement>(".site-token-title");
  if (!link) {
    return;
  }

  const origin = getSiteOrigin(row);
  link.href = origin ? `${origin}/user/settings/applications` : "#";
}

function updateAllSiteTokenLinks(): void {
  for (const row of document.querySelectorAll<HTMLDivElement>(".site-row")) {
    updateSiteTokenLink(row);
  }
}

function buildFeatureList(): void {
  const container = document.querySelector(".js-features");
  if (!container) {
    return;
  }

  for (const feature of featuresMeta) {
    const id = `feature:${feature.id}`;
    const featureElement = document.createElement("div");
    featureElement.className = `feature status-${feature.status}`;
    featureElement.dataset.text = `${feature.id} ${feature.status}`.toLowerCase();

    const statusLabel = {
      done: "✓ Done",
      todo: "○ Todo",
      native: "◎ Built-in",
      "N/A": "⊘ N/A",
    }[feature.status] ?? feature.status;

    const s = feature.status as string;
    const isDisabled = s === "N/A" || s === "native";
    const isChecked = s === "done" || s === "native";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = id;
    checkbox.id = feature.id;
    checkbox.className = "feature-checkbox";
    checkbox.disabled = isDisabled;
    checkbox.checked = isChecked;

    const info = document.createElement("div");
    info.className = "info";

    const label = document.createElement("label");
    label.className = "feature-name";
    label.htmlFor = feature.id;
    label.textContent = feature.id;

    const status = document.createElement("span");
    status.className = "feature-status";
    status.textContent = statusLabel;

    info.append(label, status);
    featureElement.append(checkbox, info);

    container.append(featureElement);
  }
}

function featuresFilterHandler(this: HTMLInputElement): void {
  const keywords = this.value.toLowerCase().split(/\s+/).filter(Boolean);
  for (const feature of document.querySelectorAll(".feature") as NodeListOf<HTMLElement>) {
    const text = feature.dataset.text || "";
    feature.classList.toggle("hidden", !keywords.every(word => text.includes(word)));
  }
}

function getSitesList(): HTMLDivElement | null {
  return document.getElementById("sites-list") as HTMLDivElement | null;
}

function collectSites(): SiteEntry[] {
  return [...document.querySelectorAll<HTMLElement>(".site-row")].map(row => {
    const url = row.querySelector<HTMLInputElement>(".site-url")?.value.trim() ?? "";
    const token = row.querySelector<HTMLInputElement>(".site-token")?.value.trim() ?? "";
    const enabled = row.querySelector<HTMLInputElement>(".site-enabled")?.checked ?? true;
    return { url, token, enabled };
  });
}

function updateSiteLinks(): void {
  updateAllSiteTokenLinks();
}

function updateOnboardingState(row: HTMLDivElement): void {
  const urlInput = row.querySelector<HTMLInputElement>(".site-url");
  const enabledInput = row.querySelector<HTMLInputElement>(".site-enabled");
  const tokenInput = row.querySelector<HTMLInputElement>(".site-token");
  row.dataset.onboardingUrlEmpty = urlInput?.value.trim() ? "false" : "true";
  row.dataset.onboardingEnabled = enabledInput?.checked ? "true" : "false";
  row.dataset.onboardingTokenEmpty = tokenInput?.value.trim() ? "false" : "true";
}

function createSiteRow(site: SiteEntry = { url: "", token: "", enabled: true }): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "site-row";

  const enabledLabel = document.createElement("label");
  enabledLabel.className = "site-input site-enabled-label";

  const enabledTitle = document.createElement("span");
  enabledTitle.textContent = "Granted";

  const enabledInput = document.createElement("input");
  enabledInput.type = "checkbox";
  enabledInput.className = "site-enabled";
  enabledInput.checked = site.enabled !== false;

  enabledLabel.append(enabledTitle, enabledInput);

  const urlLabel = document.createElement("label");
  urlLabel.className = "site-input site-url-label";

  const urlTitle = document.createElement("span");
  urlTitle.textContent = "Site";

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.className = "site-url monospace-field";
  urlInput.spellcheck = false;
  urlInput.autocomplete = "off";
  urlInput.autocapitalize = "off";
  urlInput.placeholder = "codeberg.org";
  urlInput.value = site.url;

  urlLabel.append(urlTitle, urlInput);

  const tokenLabel = document.createElement("label");
  tokenLabel.className = "site-input site-token-label";

  const tokenTitle = document.createElement("a");
  tokenTitle.className = "site-token-title";
  tokenTitle.textContent = "Token";
  tokenTitle.target = "_blank";
  tokenTitle.rel = "noreferrer";

  const tokenInput = document.createElement("input");
  tokenInput.type = "text";
  tokenInput.className = "site-token monospace-field token-field";
  tokenInput.spellcheck = false;
  tokenInput.autocomplete = "off";
  tokenInput.autocapitalize = "off";
  tokenInput.placeholder = "token1, token2";
  tokenInput.value = site.token;

  const tokenValidation = document.createElement("span");
  tokenValidation.className = "site-validation";
  tokenValidation.setAttribute("aria-live", "polite");

  const tokenHeader = document.createElement("div");
  tokenHeader.className = "site-token-header";
  tokenHeader.append(tokenTitle, tokenValidation);

  tokenLabel.append(tokenHeader, tokenInput);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "site-remove";
  removeButton.setAttribute("aria-label", "Remove site");
  removeButton.title = "Remove site";
  removeButton.textContent = "🗑";

  const persistSiteState = () => {
    updateSiteLinks();
    updateOnboardingState(row);
    void saveOptions();
  };

  enabledInput.addEventListener("change", async () => {
    const site = {
      url: urlInput.value.trim(),
      token: tokenInput.value.trim(),
    };
    const enabled = enabledInput.checked;
    const granted = await setSitePermissionsEnabled(site, enabled);

    if (enabled && !granted) {
      enabledInput.checked = !enabled;
    }

    persistSiteState();
    void syncSitePermissionCheckbox(row);
  });
  urlInput.addEventListener("input", () => {
    updateSiteLinks();
    updateOnboardingState(row);
  });
  urlInput.addEventListener("change", () => {
    persistSiteState();
    void validateSiteToken(row);
    void syncSitePermissionCheckbox(row);
  });
  tokenInput.addEventListener("change", () => {
    persistSiteState();
    void validateSiteToken(row);
  });
  tokenInput.addEventListener("input", () => {
    updateOnboardingState(row);
  });
  tokenInput.addEventListener("blur", () => {
    void validateSiteToken(row);
  });
  removeButton.addEventListener("click", () => {
    siteValidationControllers.get(row)?.abort();
    const site = {
      url: row.querySelector<HTMLInputElement>(".site-url")?.value.trim() ?? "",
      token: row.querySelector<HTMLInputElement>(".site-token")?.value.trim() ?? "",
      enabled: row.querySelector<HTMLInputElement>(".site-enabled")?.checked ?? true,
    };
    row.remove();
    void removeSitePermissions(site, getSiteRows());
    persistSiteState();
  });

  updateOnboardingState(row);
  row.append(enabledLabel, urlLabel, tokenLabel, removeButton);
  return row;
}

function renderSites(sites: SiteEntry[]): void {
  const list = getSitesList();
  if (!list) {
    return;
  }

  list.replaceChildren(...sites.map(site => createSiteRow(site)));
  updateAllSiteTokenLinks();
  void validateAllSites();
  void syncAllSitePermissionCheckboxes();
  for (const row of list.querySelectorAll<HTMLDivElement>(".site-row")) {
    updateOnboardingState(row);
  }
}

function getSiteRows(): SiteEntry[] {
  return collectSites();
}

function openSitesChecklist(): void {
  document.querySelector<HTMLDetailsElement>("#sites")?.classList.add("install-onboarding");
  document.querySelector<HTMLDetailsElement>("#sites")?.setAttribute("open", "");
}

async function openSitesChecklistOnFirstLoad(): Promise<void> {
  const { [installSitesChecklistOpenedKey]: installSitesChecklistOpened } = await chrome.storage.local.get(
    installSitesChecklistOpenedKey,
  );

  if (installSitesChecklistOpened === true) {
    return;
  }

  openSitesChecklist();
  await chrome.storage.local.set({ [installSitesChecklistOpenedKey]: true });
}

async function loadOptions(): Promise<void> {
  const options = await optionsStorage.getAll();

  for (const input of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[name]")) {
    const key = input.name;
    const value = options[key];

    if (input instanceof HTMLInputElement && input.type === "checkbox") {
      input.checked = value !== false;
    } else if (input instanceof HTMLInputElement) {
      input.value = typeof value === "string" ? value : "";
    } else {
      input.value = typeof value === "string" ? value : "";
    }
  }

  renderSites(options.sites);
  updateSiteLinks();
  void openSitesChecklistOnFirstLoad();
}

async function removeSitePermissions(site: SiteEntry, remainingSites: SiteEntry[]): Promise<void> {
  const origins = getPermissionOrigins([site]);
  if (origins.length === 0) {
    return;
  }

  const remainingOrigins = new Set(getPermissionOrigins(remainingSites));
  const removableOrigins = origins.filter(origin => !remainingOrigins.has(origin));
  if (removableOrigins.length === 0) {
    return;
  }

  await chrome.permissions.remove({ origins: removableOrigins });
}

async function setSitePermissionsEnabled(site: SiteEntry, enabled: boolean): Promise<boolean> {
  const origins = getPermissionOrigins([site]);
  if (origins.length === 0) {
    return false;
  }

  if (enabled) {
    return chrome.permissions.request({ origins });
  }

  return chrome.permissions.remove({ origins });
}

async function saveOptions(): Promise<void> {
  const options = { ...await optionsStorage.getAll() } as Record<string, unknown>;

  for (const input of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[name]")) {
    if (input instanceof HTMLInputElement && input.type === "checkbox") {
      options[input.name] = input.checked;
      continue;
    }

    options[input.name] = input.value;
  }

  options.sites = getSiteRows();
  delete options.domains;

  await chrome.storage.sync.set(options);
}

function addSiteRow(): void {
  const list = getSitesList();
  if (!list) {
    return;
  }

  list.append(createSiteRow());
  list.lastElementChild?.querySelector<HTMLInputElement>(".site-url")?.focus();
  updateSiteLinks();
  void saveOptions();
}

async function clearCache(): Promise<void> {
  const { [installOptionsShownKey]: installOptionsShown } = await chrome.storage.local.get(installOptionsShownKey);

  await chrome.storage.local.clear();

  if (installOptionsShown === true) {
    await chrome.storage.local.set({ [installOptionsShownKey]: true });
  }

  alert("Cache cleared");
}

function handleExport(): void {
  optionsStorage.getAll().then(options => {
    const { domains, ...exportable } = options;
    const blob = new Blob([JSON.stringify(exportable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refined-forgejo-options.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function handleImport(): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    try {
      const options = JSON.parse(text);
      await chrome.storage.sync.set(options);
      alert("Options imported. Reload the page to see changes.");
    } catch {
      alert("Invalid JSON file");
    }
  };
  input.click();
}

function init(): void {
  buildFeatureList();
  void loadOptions();
  chrome.permissions.onAdded.addListener(() => {
    void syncAllSitePermissionCheckboxes();
  });
  chrome.permissions.onRemoved.addListener(() => {
    void syncAllSitePermissionCheckboxes();
  });
  window.addEventListener("focus", () => {
    void syncAllSitePermissionCheckboxes();
  });
  window.addEventListener("pageshow", () => {
    void syncAllSitePermissionCheckboxes();
  });

  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[name]").forEach(input => {
    if (input instanceof HTMLInputElement && input.type === "checkbox") {
      input.addEventListener("change", () => saveOptions());
      return;
    }

    if (input instanceof HTMLInputElement) {
      input.addEventListener("change", () => saveOptions());
      return;
    }

    if (input instanceof HTMLTextAreaElement) {
      input.addEventListener("change", () => saveOptions());
    }
  });

  document.querySelector("input#filter-features")?.addEventListener("input", featuresFilterHandler);
  document.querySelector("#add-site")?.addEventListener("click", addSiteRow);
  document.querySelector("#clear-cache")?.addEventListener("click", clearCache);
  document.querySelector(".js-export")?.addEventListener("click", handleExport);
  document.querySelector(".js-import")?.addEventListener("click", handleImport);

  document.getElementById("js-failed")?.remove();
}

void init();
