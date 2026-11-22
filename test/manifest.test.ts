import { describe, expect, it } from "vitest";

import { createManifest } from "../build/manifest.js";

describe("browser manifests", () => {
  it("uses a module service worker without Firefox-only fields in Chromium", () => {
    const manifest = createManifest("chromium");
    expect(manifest.background).toEqual({ service_worker: "assets/background.js", type: "module" });
    expect(manifest.browser_specific_settings).toBeUndefined();
    expect(manifest.minimum_chrome_version).toBe("123");
    expect(manifest.permissions).toContain("scripting");
  });

  it("preserves Firefox identity and uses a background module script", () => {
    const manifest = createManifest("firefox");
    expect(manifest.background).toEqual({ scripts: ["assets/background.js"], type: "module" });
    expect(manifest.browser_specific_settings.gecko.id).toBe("{d328bf9b-a278-49a7-9af7-ef9d989b2ee3}");
    expect(manifest.minimum_chrome_version).toBeUndefined();
  });

  it("rejects unsupported targets", () => {
    expect(() => createManifest("unknown")).toThrow("Unsupported browser");
  });
});
