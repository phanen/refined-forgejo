import React from "dom-chef";

import type { ListenerOptions } from "../helpers/types.js";
import { isMac } from "./index.js";

export function registerHotkey(
  hotkey: string,
  functionOrUrl: VoidFunction | string,
  { signal }: ListenerOptions = {},
): void {
  const element = typeof functionOrUrl === "string"
    ? <a hidden href={functionOrUrl} data-hotkey={hotkey} />
    : <button hidden type="button" data-hotkey={hotkey} onClick={functionOrUrl} />;

  document.body.prepend(element);

  signal?.addEventListener("abort", () => {
    element.remove();
  });
}

export function addHotkey(button: HTMLAnchorElement | HTMLButtonElement | undefined, hotkey: string): void {
  if (button) {
    const hotkeys = new Set(button.dataset.hotkey?.split(","));
    hotkeys.add(hotkey);
    button.dataset.hotkey = [...hotkeys].join(",");
  }
}

export const modKey = isMac ? "cmd" : "ctrl";

function getHotkey(event: KeyboardEvent): string {
  const hotkey = [];
  if (event.ctrlKey) {
    hotkey.push("ctrl");
  }
  if (event.metaKey) {
    hotkey.push(isMac ? "cmd" : "meta");
  }
  if (event.altKey) {
    hotkey.push("alt");
  }
  if (event.shiftKey && event.key.length > 1) {
    hotkey.push("shift");
  }

  const key = event.key.toLowerCase();
  if (key !== "control" && key !== "meta" && key !== "alt" && key !== "shift") {
    hotkey.push(key === " " ? "space" : key);
  }

  return hotkey.join("+");
}

let lastKey = "";
let lastKeyTime = 0;

function handleKeyDown(event: KeyboardEvent): void {
  if (
    event.defaultPrevented
    || !(event.target instanceof HTMLElement)
    || event.target.isContentEditable
    || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
  ) {
    return;
  }

  const key = getHotkey(event);
  if (!key) {
    return;
  }

  const now = Date.now();
  const sequence = now - lastKeyTime < 1500 && lastKey ? `${lastKey} ${key}` : undefined;
  const elements = document.querySelectorAll<HTMLElement>("[data-hotkey]");

  if (sequence) {
    for (const element of elements) {
      const hotkeys = element.dataset.hotkey?.split(",") ?? [];
      if (hotkeys.includes(sequence)) {
        element.click();
        lastKey = "";
        event.preventDefault();
        return;
      }
    }
  }

  for (const element of elements) {
    const hotkeys = element.dataset.hotkey?.split(",") ?? [];
    if (hotkeys.includes(key)) {
      element.click();
      lastKey = "";
      event.preventDefault();
      return;
    }
  }

  lastKey = key;
  lastKeyTime = now;
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", handleKeyDown);
}
