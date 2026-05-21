export type SiteEntry = {
  url: string;
  token: string;
};

export type ForgejoSite = SiteEntry & {
  origin: string;
  hostname: string;
  allowSubdomains: boolean;
};

export function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
}

function normalizeSite(rawSite: string): ForgejoSite | undefined {
  const trimmed = rawSite.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  try {
    const hadScheme = trimmed.includes("://");
    const url = new URL(hadScheme ? trimmed : `https://${trimmed}`);
    return {
      url: rawSite.trim(),
      origin: url.origin,
      hostname: url.hostname,
      allowSubdomains: !hadScheme && !url.port,
      token: "",
    };
  } catch {
    return undefined;
  }
}

function normalizeSiteEntry(site: Partial<SiteEntry> | null | undefined): ForgejoSite | undefined {
  const normalized = normalizeSite(String(site?.url ?? ""));
  if (!normalized) {
    return undefined;
  }

  return {
    ...normalized,
    token: String(site?.token ?? ""),
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
  if (site.allowSubdomains) {
    return url.hostname === site.hostname || url.hostname.endsWith(`.${site.hostname}`);
  }

  return url.origin === site.origin;
}

export function getPermissionOrigins(value: string | SiteEntry[] | undefined | null): string[] {
  const sites = parseSitesStrict(value);

  const origins = new Set<string>();

  for (const site of sites) {
    if (site.allowSubdomains) {
      origins.add(`*://${site.hostname}/*`);
      origins.add(`*://*.${site.hostname}/*`);
      continue;
    }

    origins.add(`${site.origin}/*`);
  }

  return [...origins];
}

export function getTokenForUrl(value: string | SiteEntry[] | undefined | null, url: URL): string | undefined {
  const site = parseSites(value).find(entry => matchesSite(url, entry) && entry.token.trim().length > 0);
  return site?.token.trim() || undefined;
}
