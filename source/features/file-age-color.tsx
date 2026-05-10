import "./file-age-color.css";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

const month = 30 * 24 * 60 * 60 * 1000;
const heatColor = [194, 78, 0]; // #c24e00 orange

function lerpColor(ratio: number): string {
  // Mix heatColor (ratio) toward gray (1 - ratio)
  const gray = 120; // approximate mid-gray
  const r = Math.round(heatColor[0] * ratio + gray * (1 - ratio));
  const g = Math.round(heatColor[1] * ratio + gray * (1 - ratio));
  const b = Math.round(heatColor[2] * ratio + gray * (1 - ratio));
  return `rgb(${r}, ${g}, ${b})`;
}

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
  const ratio = heatIndex / steps; // 1.0 (hottest) to 0.1 (coolest)
  cell.style.color = lerpColor(ratio);
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
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
