import "./clean-footer.css";

import delegate from "delegate-it";

import features from "../feature-manager.js";

function init(signal: AbortSignal): void {
  delegate(".page-footer", "click", () => {
    document.querySelector(".page-footer")?.classList.toggle("rgf-footer-expanded");
  }, { signal });
}

void features.addCssFeature(import.meta.url);
features.add(import.meta.url, {
  init,
});
