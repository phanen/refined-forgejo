import "./sticky-csv-header.css";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addStickyHeader(scrollContainer: Element, { signal }: { signal?: AbortSignal }): void {
  if (
    !(scrollContainer instanceof HTMLElement)
    || scrollContainer.previousElementSibling?.classList.contains("rgf-sticky-csv-header")
  ) {
    return;
  }

  const table = scrollContainer.querySelector<HTMLTableElement>("table.data-table");
  const sourceRow = table?.querySelector<HTMLTableRowElement>("tr:first-child");
  if (!table || !sourceRow) {
    return;
  }

  const sticky = document.createElement("div");
  sticky.className = "rgf-sticky-csv-header";

  const stickyTable = document.createElement("table");
  stickyTable.className = table.className;
  const stickyBody = document.createElement("tbody");
  stickyBody.append(sourceRow.cloneNode(true));
  stickyTable.append(stickyBody);
  sticky.append(stickyTable);

  scrollContainer.before(sticky);

  const fileHeader = scrollContainer.closest(".non-diff-file-content")?.querySelector<HTMLElement>(".file-header");

  const sync = (): void => {
    const topOffset = fileHeader?.getBoundingClientRect().height ?? 0;
    const rowHeight = sourceRow.getBoundingClientRect().height;
    const tableRect = table.getBoundingClientRect();

    sticky.style.top = `${topOffset}px`;
    sticky.style.width = `${scrollContainer.clientWidth}px`;
    stickyTable.style.width = `${table.getBoundingClientRect().width}px`;
    stickyTable.style.transform = `translateX(${-scrollContainer.scrollLeft}px)`;

    const shouldShow = tableRect.top < topOffset && tableRect.bottom > topOffset + rowHeight;
    sticky.classList.toggle("rgf-sticky-csv-header-visible", shouldShow);
  };

  sync();

  const resizeObserver = new ResizeObserver(sync);
  resizeObserver.observe(scrollContainer);
  resizeObserver.observe(table);
  if (fileHeader) {
    resizeObserver.observe(fileHeader);
  }

  window.addEventListener("scroll", sync, { signal, passive: true });
  scrollContainer.addEventListener("scroll", sync, { signal, passive: true });

  signal?.addEventListener("abort", () => {
    resizeObserver.disconnect();
    sticky.remove();
  }, { once: true });
}

function init(signal: AbortSignal): void {
  observe(".repository.file.list .file-view.csv", addStickyHeader, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isSingleFile],
  init,
});
