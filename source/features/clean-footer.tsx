import "./clean-footer.css";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function handleClick(footer: Element, { signal }: { signal?: AbortSignal }): void {
  footer.addEventListener("click", () => {
    footer.classList.toggle("rgf-footer-expanded");
  }, { signal });
}

function init(signal: AbortSignal): void {
  observe(".page-footer", handleClick, { signal });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
