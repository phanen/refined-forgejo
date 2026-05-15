import features from "../feature-manager.js";
import { botLinksCommitSelectors } from "../forgejo-helpers/selectors.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import "./dim-bots.css";

function dim(botIndicator: Element): void {
  botIndicator.closest(".flex-item, tr")?.classList.add("rgf-dim-bots");
}

function init(signal: AbortSignal): void {
  observe(botLinksCommitSelectors, dim, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommitList,
    pageDetect.isPRList,
  ],
  init,
});
