import "./file-age-color.css";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const month = 30 * 24 * 60 * 60 * 1000;

function addHeatIndex(ageCell: Element): void {
  const cell = ageCell as HTMLElement;
  const relativeTime = cell.querySelector("relative-time");
  if (!relativeTime) {
    return;
  }

  const datetime = relativeTime.getAttribute("datetime");
  if (!datetime) {
    return;
  }

  const lastUpdate = new Date(datetime);
  const diff = Date.now() - lastUpdate.getTime();

  // Dim files older than 4 months; dimmer after 12
  if (diff > 4 * month) {
    cell.style.opacity = diff > 12 * month ? "0.6" : "0.8";
    return;
  }

  // Heat index: older files get lower index → more orange
  const value = -diff;
  const steps = 10;
  const interp = Math.max(0, Math.min(1, value / -2_000_000_000));
  const heatIndex = Math.max(1, steps - Math.floor(interp * steps));
  cell.setAttribute("data-rgf-heat", String(heatIndex));
}

function init(signal: AbortSignal): void {
  observe(
    "#repo-files-table td.text.right.age",
    addHeatIndex,
    { signal },
  );
}

features.add(import.meta.url, {
  init,
  include: [pageDetect.isRepoTree],
  exclude: [pageDetect.isRepoFile404],
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
