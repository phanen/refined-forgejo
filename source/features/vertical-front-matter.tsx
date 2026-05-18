import React from "dom-chef";
import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function transpose(table: HTMLTableElement): void {
  const keys = Array.from(table.tHead?.rows[0]?.cells ?? []);
  const values = Array.from(table.tBodies[0]?.rows[0]?.cells ?? []);

  if (keys.length === 0 || values.length === 0 || keys.length !== values.length) {
    return;
  }

  const newBody = (
    <tbody>
      {keys.map((key, i) => (
        <tr>
          <th className="tw-text-left tw-pr-4 tw-whitespace-nowrap">{key.textContent}</th>
          <td className="tw-w-full">{Array.from(values[i].childNodes)}</td>
        </tr>
      ))}
    </tbody>
  );

  table.textContent = "";
  table.append(newBody);
  table.classList.add("rgf-vertical-front-matter");
}

function init(signal: AbortSignal): void {
  observe([
    ".markup > table:first-child",
    ".markup > details:first-child > table",
  ], (table) => {
    if (table instanceof HTMLTableElement && !table.classList.contains("rgf-vertical-front-matter")) {
      // Front matter tables can be rendered as:
      // 1. A 2-row table (header + values) -> Horizontal, needs transposition
      // 2. A multi-row table where each row is a key-value pair -> Already vertical
      // We only want to transpose if it's currently horizontal (exactly 2 rows: 1 thead tr + 1 tbody tr)
      // Use .rows instead of querySelectorAll to avoid counting rows in nested tables
      const rowsCount = table.rows.length;
      const headerCellsCount = table.tHead?.rows[0]?.cells.length ?? 0;
      if (rowsCount === 2 && headerCellsCount > 0) {
        transpose(table);
      }
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isSingleFile,
  ],
  init,
});
