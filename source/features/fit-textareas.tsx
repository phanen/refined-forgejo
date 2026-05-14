import "./fit-textareas.css";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function fitTextarea(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function watchTextarea(textarea: Element): void {
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }
  if (textarea.classList.contains("rgf-fit-textareas")) {
    return;
  }

  textarea.classList.add("rgf-fit-textareas");
  textarea.removeAttribute("rows");

  if (!CSS.supports("field-sizing", "content")) {
    textarea.addEventListener("input", () => {
      fitTextarea(textarea);
    });
    fitTextarea(textarea);
  }
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
