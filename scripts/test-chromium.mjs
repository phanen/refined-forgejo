import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const extension = resolve("distribution-chromium");
const profile = await mkdtemp(join(tmpdir(), "refined-forgejo-chromium-"));
const context = await chromium.launchPersistentContext(profile, {
  timeout: 30_000,
  channel: "chromium",
  headless: true,
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
});

try {
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker", { timeout: 30_000 });
  const errors = [];
  const missingSelectorWarnings = [];
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "warning" && message.text().includes("Selector not found on page:")) {
      missingSelectorWarnings.push(message.text());
    }
  });
  const id = new URL(worker.url()).host;
  await page.goto(`chrome-extension://${id}/options.html`);
  await page.locator(".site-url").first().waitFor();
  assert.ok(await page.locator(".site-row").count() > 0);
  assert.deepEqual(await worker.evaluate(() => chrome.runtime.getManifest().background), {
    service_worker: "assets/background.js",
    type: "module",
  });
  await page.waitForFunction(async () => {
    const stored = await chrome.storage.local.get("refined-forgejo:install-options-opened");
    return stored["refined-forgejo:install-options-opened"] === true;
  });
  await page.evaluate(async () => {
    const { default: observe } = await import(chrome.runtime.getURL("assets/helpers/selector-observer.js"));
    const controller = new AbortController();
    try {
      observe(".rgf-absent-fixture", () => {}, { signal: controller.signal });
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Selector observer did not detect an inserted element")),
          5000,
        );
        observe(".rgf-present-fixture", element => {
          clearTimeout(timeout);
          element.remove();
          resolve();
        }, { signal: controller.signal });
        const element = document.createElement("div");
        element.className = "rgf-present-fixture";
        element.textContent = "Observer fixture";
        document.body.append(element);
      });
      await new Promise(resolve => setTimeout(resolve, 1200));
    } finally {
      controller.abort();
    }
  });
  assert.deepEqual(errors, []);
  assert.deepEqual(missingSelectorWarnings, []);
  console.log(
    "Chromium extension passed: service worker, options, first-run storage, and selector observation without false warnings.",
  );
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
}
