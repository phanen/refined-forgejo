export type SiteEntry = {
  url: string;
  token: string;
  enabled?: boolean;
};

export type ForgejoSite = SiteEntry & {
  origin: string;
  hostname: string;
};

export function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
}

function parseSiteUrl(rawSite: string): URL | undefined {
  const trimmed = rawSite.trim();
  if (!trimmed) {
    return undefined;
  }

  const lowerCased = trimmed.toLowerCase();

  try {
    return new URL(lowerCased.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return undefined;
  }
}

function isBareHost(site: Pick<SiteEntry, "url">): boolean {
  const trimmed = site.url.trim();
  if (!trimmed) {
    return false;
  }

  const url = parseSiteUrl(trimmed);
  return url !== undefined && !trimmed.toLowerCase().includes("://") && !url.port;
}

function normalizeSite(rawSite: string): ForgejoSite | undefined {
  const url = parseSiteUrl(rawSite);
  if (!url) {
    return undefined;
  }

  return {
    url: rawSite.trim(),
    origin: url.origin,
    hostname: url.hostname,
    token: "",
  };
}

function normalizeSiteEntry(site: Partial<SiteEntry> | null | undefined): ForgejoSite | undefined {
  const normalized = normalizeSite(String(site?.url ?? ""));
  if (!normalized) {
    return undefined;
  }

  return {
    ...normalized,
    token: String(site?.token ?? ""),
    enabled: site?.enabled !== false,
  };
}

function parseSitesRaw(value: string | SiteEntry[] | undefined | null): ForgejoSite[] {
  if (Array.isArray(value)) {
    return value.map(normalizeSiteEntry).filter((site): site is ForgejoSite => !!site);
  }

  return (value ?? "")
    .split(/[\n,]+/)
    .map(site => normalizeSite(site))
    .filter((site): site is ForgejoSite => !!site)
    .map(site => ({
      ...site,
      token: "",
      enabled: true,
    }));
}

export function parseSites(value: string | SiteEntry[] | undefined | null): ForgejoSite[] {
  return parseSitesRaw(value);
}

export function parseSitesStrict(value: string | SiteEntry[] | undefined | null): ForgejoSite[] {
  return parseSitesRaw(value);
}

export function getPrimarySiteOrigin(value: string | SiteEntry[] | undefined | null): string {
  return parseSites(value)[0]?.origin ?? "";
}

export function matchesSite(url: URL, site: ForgejoSite): boolean {
  if (isBareHost(site)) {
    return url.hostname === site.hostname || url.hostname.endsWith(`.${site.hostname}`);
  }

  return url.origin === site.origin;
}

export function findSiteForUrl(value: string | SiteEntry[] | undefined | null, url: URL): ForgejoSite | undefined {
  return parseSites(value).find(site => matchesSite(url, site));
}

export function getPermissionOrigins(value: string | SiteEntry[] | undefined | null): string[] {
  const sites = parseSitesStrict(value);

  const origins = new Set<string>();

  for (const site of sites) {
    if (isBareHost(site)) {
      origins.add(`*://${site.hostname}/*`);
      continue;
    }

    origins.add(`${site.origin}/*`);
  }

  return [...origins];
}

export function getTokenForUrl(value: string | SiteEntry[] | undefined | null, url: URL): string | undefined {
  const site = parseSites(value).find(entry => {
    return entry.enabled !== false && matchesSite(url, entry) && entry.token.trim().length > 0;
  });
  return site?.token.trim() || undefined;
}
