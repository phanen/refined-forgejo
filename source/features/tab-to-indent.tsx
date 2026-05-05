import { eventHandler } from "indent-textarea";

import features from "../feature-manager.js";

function handleKeydown(event: KeyboardEvent): void {
  if (event.target instanceof HTMLTextAreaElement) {
    eventHandler(event);
  }
}

function init(signal: AbortSignal): void {
  document.addEventListener("keydown", handleKeydown, { signal });
}

features.add(import.meta.url, {
  init,
});
