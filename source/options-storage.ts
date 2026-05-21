import mem from "memoize";
import { getTokenForUrl, type SiteEntry } from "./helpers/site-domains.js";

export type RGFOptions = {
  actionUrl: string;
  customCss: string;
  defaultToken: string;
  personalToken?: string;
  sites: SiteEntry[];
  logging: boolean;
  domains?: string;
  [x: string]: unknown;
};

const defaultSites: SiteEntry[] = [
  { url: "codeberg.org", token: "" },
  { url: "git.disroot.org", token: "" },
  { url: "forge.fedoraproject.org", token: "" },
];

const defaults: RGFOptions = {
  actionUrl: location.origin,
  customCss: "",
  defaultToken: "",
  sites: defaultSites.map(site => ({ ...site })),
  logging: false,
};

function normalizeSites(value: unknown): SiteEntry[] {
  if (Array.isArray(value)) {
    return value.map(site => ({
      url: String((site as Partial<SiteEntry>)?.url ?? "").trim(),
      token: String((site as Partial<SiteEntry>)?.token ?? ""),
    }));
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]+/)
      .map(url => ({ url: url.trim(), token: "" }))
      .filter(site => site.url.length > 0);
  }

  return [];
}

export function isFeatureDisabled(options: RGFOptions, id: string): boolean {
  return options[`feature:${id}`] === false;
}

const optionsStorage = {
  async getAll(): Promise<RGFOptions> {
    const stored = (await chrome.storage.sync.get()) as Partial<RGFOptions> & Record<string, unknown>;
    const sites = "sites" in stored
      ? normalizeSites(stored.sites)
      : "domains" in stored
      ? normalizeSites(stored.domains)
      : defaultSites.map(site => ({ ...site }));

    return {
      ...defaults,
      ...stored,
      defaultToken: typeof stored.defaultToken === "string"
        ? stored.defaultToken
        : typeof stored.personalToken === "string"
        ? stored.personalToken
        : "",
      personalToken: typeof stored.personalToken === "string"
        ? stored.personalToken
        : typeof stored.defaultToken === "string"
        ? stored.defaultToken
        : "",
      sites,
      domains: sites.map(site => site.url).join("\n"),
    };
  },
};

async function getTokenImpl(): Promise<string> {
  const result = await optionsStorage.getAll();
  return getTokenForUrl(result.sites, new URL(location.href)) || result.defaultToken || result.personalToken || "";
}

export const getToken = mem(getTokenImpl);

export default optionsStorage;
