import React from "dom-chef";

import { isMac } from "./index.js";

type Options = { signal?: AbortSignal };

export function registerHotkey(
  hotkey: string,
  functionOrUrl: VoidFunction | string,
  { signal }: Options = {},
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
