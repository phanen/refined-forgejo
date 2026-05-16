import features from "../feature-manager.js";
import { addHotkey } from "../github-helpers/hotkey.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addTabsHotkeys(tabMenu: Element): void {
  const tabs = [...tabMenu.querySelectorAll<HTMLAnchorElement>(".item[href]")];
  if (!tabs.length) {
    return;
  }

  const selectedIndex = tabs.findIndex(tab => tab.classList.contains("active"));
  const lastIndex = tabs.length - 1;

  for (const [index, tab] of tabs.entries()) {
    addHotkey(tab, `g ${index + 1}`);

    if (selectedIndex < 0) {
      continue;
    }

    if (index === selectedIndex - 1 || (selectedIndex === 0 && index === lastIndex)) {
      addHotkey(tab, "g arrowleft");
    } else if (index === selectedIndex + 1 || (selectedIndex === lastIndex && index === 0)) {
      addHotkey(tab, "g arrowright");
    }
  }
}

function init(signal: AbortSignal): void {
  observe(".ui.pull.tabs .ui.top.attached.pull.tabular.menu", addTabsHotkeys, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isPR,
  ],
  shortcuts: {
    "g 1": "Go to PR tab 1",
    "g 2": "Go to PR tab 2",
    "g 3": "Go to PR tab 3",
    "g ←": "Go to previous PR tab",
    "g →": "Go to next PR tab",
  },
  init,
});
