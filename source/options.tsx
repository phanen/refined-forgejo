import "./options.css";
import { featuresMeta } from "./feature-data.js";
import { getPermissionOrigins, getPrimarySiteOrigin, type SiteEntry } from "./helpers/site-domains.js";
import optionsStorage from "./options-storage.js";

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
    return { url, token };
  });
}

function updateSiteLinks(): void {
  const tokenLink = document.getElementById("token-link");
  if (!(tokenLink instanceof HTMLAnchorElement)) {
    return;
  }

  const primaryOrigin = getPrimarySiteOrigin(collectSites());
  tokenLink.href = primaryOrigin ? `${primaryOrigin}/user/settings/applications` : "#";
}

function createSiteRow(site: SiteEntry = { url: "", token: "" }): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "site-row";

  const urlLabel = document.createElement("label");
  urlLabel.className = "site-input";

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
  tokenLabel.className = "site-input";

  const tokenTitle = document.createElement("span");
  tokenTitle.textContent = "Token";

  const tokenInput = document.createElement("input");
  tokenInput.type = "text";
  tokenInput.className = "site-token monospace-field token-field";
  tokenInput.spellcheck = false;
  tokenInput.autocomplete = "off";
  tokenInput.autocapitalize = "off";
  tokenInput.placeholder = "token1, token2";
  tokenInput.value = site.token;

  tokenLabel.append(tokenTitle, tokenInput);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "site-remove";
  removeButton.setAttribute("aria-label", "Remove site");
  removeButton.textContent = "Remove";

  const persistSiteState = () => {
    updateSiteLinks();
    void saveOptions();
  };

  urlInput.addEventListener("input", updateSiteLinks);
  urlInput.addEventListener("change", persistSiteState);
  tokenInput.addEventListener("change", persistSiteState);
  removeButton.addEventListener("click", () => {
    row.remove();
    persistSiteState();
  });

  row.append(urlLabel, tokenLabel, removeButton);
  return row;
}

function renderSites(sites: SiteEntry[]): void {
  const list = getSitesList();
  if (!list) {
    return;
  }

  list.replaceChildren(...sites.map(site => createSiteRow(site)));
}

function getSiteRows(): SiteEntry[] {
  return collectSites();
}

async function loadOptions(): Promise<void> {
  const options = await optionsStorage.getAll();

  for (const input of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[name]")) {
    const key = input.name;
    const value = options[key];

    if (input instanceof HTMLInputElement && input.type === "checkbox") {
      input.checked = value !== false;
    } else if (input instanceof HTMLTextAreaElement) {
      input.value = String(value ?? "");
    } else if (input instanceof HTMLInputElement) {
      input.value = String(value ?? "");
    }
  }

  renderSites(options.sites);
  updateSiteLinks();
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

async function enableListedSites(): Promise<void> {
  const origins = getPermissionOrigins(getSiteRows());
  if (origins.length === 0) {
    alert("No valid site domains were found.");
    return;
  }

  const granted = await chrome.permissions.request({ origins });
  if (granted) {
    alert("Site access granted. Reload the enabled tabs to load the extension there.");
    return;
  }

  alert("Site access was not granted.");
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
  await chrome.storage.local.clear();
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
  document.querySelector("#enable-sites")?.addEventListener("click", enableListedSites);
  document.querySelector("#add-site")?.addEventListener("click", addSiteRow);
  document.querySelector("#clear-cache")?.addEventListener("click", clearCache);
  document.querySelector(".js-export")?.addEventListener("click", handleExport);
  document.querySelector(".js-import")?.addEventListener("click", handleImport);

  document.getElementById("js-failed")?.remove();
}

void init();
