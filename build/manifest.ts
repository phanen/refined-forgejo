import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export function createManifest(browser: string) {
  if (browser !== "firefox" && browser !== "chromium") {
    throw new Error(`Unsupported browser: ${browser}`);
  }

  const manifest = JSON.parse(readFileSync(new URL("../source/manifest.json", import.meta.url), "utf8"));
  try {
    manifest.version = execFileSync("git", ["describe", "--tags", "--abbrev=0"], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim().replace(/^v/, "");
  } catch {
    // NOTE: Source archives may not contain Git metadata; retain the manifest version.
  }
  if (browser === "chromium") {
    delete manifest.browser_specific_settings;
    delete manifest.background.scripts;
  } else {
    delete manifest.minimum_chrome_version;
    delete manifest.background.service_worker;
  }
  return manifest;
}
