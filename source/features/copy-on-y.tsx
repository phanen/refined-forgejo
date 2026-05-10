import features from "../feature-manager.js";

async function copyUrl(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback: document.execCommand('copy')
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function handler({ key, target }: KeyboardEvent): void {
  if (key !== "y") {
    return;
  }

  if (
    target instanceof HTMLTextAreaElement
    || target instanceof HTMLInputElement
    || (target instanceof HTMLElement && target.isContentEditable)
  ) {
    return;
  }

  void copyUrl(location.href);
}

function init(signal: AbortSignal): void {
  globalThis.addEventListener("keyup", handler, { signal });
}

features.add(import.meta.url, {
  init,
});
