import "./fit-textareas.css";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function watchTextarea(textarea: Element): void {
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }
  if (textarea.classList.contains("rgf-fit-textareas")) {
    return;
  }

  textarea.classList.add("rgf-fit-textareas");
  textarea.removeAttribute("rows");
}

function init(signal: AbortSignal): void {
  observe("textarea", watchTextarea, { signal });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
- https://codeberg.org/ziglang/zig/issues
*/
