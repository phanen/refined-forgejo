import "./fit-textareas.css";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function watchTextarea(textarea: Element): void {
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }
  if (textarea.classList.contains("rgh-fit-textareas")) {
    return;
  }

  textarea.classList.add("rgh-fit-textareas");
  textarea.removeAttribute("rows");
}

function init(signal: AbortSignal): void {
  observe("textarea", watchTextarea, { signal });
}

features.add(import.meta.url, {
  init,
});
