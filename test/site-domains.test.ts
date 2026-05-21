import { describe, expect, it } from "vitest";

import {
  getPermissionOrigins,
  getPrimarySiteOrigin,
  getTokenForUrl,
  matchesSite,
  parseSites,
  splitCommaSeparated,
} from "../source/helpers/site-domains.js";

describe("site-domains", () => {
  it("treats an empty list as disabled", () => {
    expect(getPrimarySiteOrigin("")).toBe("");
    expect(parseSites("")).toEqual([]);
    expect(getPermissionOrigins("")).toEqual([]);
  });

  it("parses hostnames and allows subdomains", () => {
    const sites = parseSites("forgejo.example.com");
    expect(sites).toEqual([
      {
        url: "forgejo.example.com",
        origin: "https://forgejo.example.com",
        hostname: "forgejo.example.com",
        allowSubdomains: true,
        token: "",
      },
    ]);
    expect(matchesSite(new URL("https://sub.forgejo.example.com/path"), sites[0])).toBe(true);
  });

  it("keeps exact origins when a scheme is provided", () => {
    const sites = parseSites("https://forgejo.example.com:3000");
    expect(sites).toEqual([
      {
        url: "https://forgejo.example.com:3000",
        origin: "https://forgejo.example.com:3000",
        hostname: "forgejo.example.com",
        allowSubdomains: false,
        token: "",
      },
    ]);
    expect(matchesSite(new URL("https://forgejo.example.com:3000/path"), sites[0])).toBe(true);
    expect(matchesSite(new URL("https://sub.forgejo.example.com:3000/path"), sites[0])).toBe(false);
  });

  it("builds permission origins for custom hosts", () => {
    expect(getPermissionOrigins("forgejo.example.com")).toEqual([
      "*://forgejo.example.com/*",
      "*://*.forgejo.example.com/*",
    ]);
  });

  it("selects site tokens by url", () => {
    expect(getTokenForUrl([
      { url: "forgejo.example.com", token: "" },
      { url: "forgejo.example.com", token: "site-token" },
    ], new URL("https://sub.forgejo.example.com/path"))).toBe("site-token");
  });

  it("splits comma-separated tokens", () => {
    expect(splitCommaSeparated(" first , second ,, third ")).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
