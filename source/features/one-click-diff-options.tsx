import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { pageDetect } from "../helpers/page-detect.js";

function isShowAllWhitespace(): boolean {
  const radios = [
    ...document.querySelectorAll<HTMLInputElement>("#diff-container .ui.dropdown .menu input[type='radio']"),
  ];
  const checkedRadio = radios.find(radio => radio.checked);
  if (checkedRadio) {
    return checkedRadio === radios[0];
  }

  const whitespace = new URL(location.href).searchParams.get("whitespace");
  if (whitespace) {
    return whitespace === "show-all";
  }

  return true;
}

function toggleWhitespace(): void {
  const isShowAll = isShowAllWhitespace();
  const selector = isShowAll
    ? "#diff-container .ui.dropdown .menu a.item[href*='whitespace=ignore-all']"
    : "#diff-container .ui.dropdown .menu a.item[href*='whitespace=show-all']";

  const link = document.querySelector<HTMLAnchorElement>(selector);
  if (link) {
    link.click();
    return;
  }

  const url = new URL(location.href);
  url.searchParams.set("whitespace", isShowAll ? "ignore-all" : "show-all");
  location.href = url.href;
}

function toggleDiffStyle(): void {
  const url = new URL(location.href);
  const currentDiff = document.querySelector<HTMLElement>(
    "#diff-container .file-body.code-diff-split, #diff-container .file-body.code-diff-unified",
  );
  const isSplit = currentDiff?.classList.contains("code-diff-split") ?? false;

  if (!isSplit) {
    url.searchParams.set("style", "split");
  } else {
    url.searchParams.set("style", "unified");
  }
  location.href = url.href;
}

function init(signal: AbortSignal): void {
  registerHotkey("d w", toggleWhitespace, { signal });
  registerHotkey("d s", toggleDiffStyle, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPRFiles,
    pageDetect.isCommit,
    pageDetect.isCompare,
  ],
  shortcuts: {
    "d w": "Toggle whitespace",
    "d s": "Toggle split/unified view",
  },
  init,
});
