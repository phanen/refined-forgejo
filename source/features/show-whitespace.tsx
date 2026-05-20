import "./show-whitespace.css";

import { onAbort } from "abort-utils";

import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import showWhiteSpacesOnLine from "../helpers/show-whitespace-on-line.js";

const lineSelector = ".code-inner, .chroma .line, pre";

const viewportObserver = new IntersectionObserver(changes => {
  for (const { target: line, isIntersecting } of changes) {
    if (!isIntersecting) {
      continue;
    }

    const shouldAvoidSurroundingSpaces = Boolean(line.closest(".blob-wrapper-embedded"));
    showWhiteSpacesOnLine(line, shouldAvoidSurroundingSpaces);
    viewportObserver.unobserve(line);
  }
});

function observeLine(line: Element): void {
  viewportObserver.observe(line);
}

function init(signal: AbortSignal): void {
  observe(lineSelector, observeLine, { signal });
  onAbort(signal, viewportObserver);
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoHome,
    pageDetect.isSingleFile,
    pageDetect.isPRFiles,
    pageDetect.isCommit,
    pageDetect.isPRCommit,
    pageDetect.isCompare,
  ],
  init,
});
