import "./sticky-sidebar.css";

import { onAbort } from "abort-utils";
import debounce from "debounce-fn";

import features from "../feature-manager.js";
import { isIssueOrPR } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const minimumViewportWidthForSidebar = 768;

const sidebarSelector = ".issue-content-right";

let sidebar: HTMLElement | undefined;
const onResize = debounce(updateStickiness, { wait: 100 });
const sidebarObserver = new ResizeObserver(onResize);

function toggleHoverState(event: MouseEvent): void {
  const isHovered = event.type === "mouseenter";
  if (isHovered) {
    sidebarObserver.disconnect();
  } else {
    sidebarObserver.observe(sidebar!);
  }
}

function trackSidebar(signal: AbortSignal, found: Element): void {
  sidebar = found as HTMLElement;
  sidebar.style.height = "min-content";

  sidebarObserver.observe(sidebar);
  onAbort(signal, sidebarObserver, () => {
    sidebar = undefined;
  });

  sidebar.addEventListener("mouseenter", toggleHoverState, { signal });
  sidebar.addEventListener("mouseleave", toggleHoverState, { signal });
}

function updateStickiness(): void {
  if (!sidebar) {
    return;
  }

  const offset = 20;
  sidebar.classList.toggle(
    "rgf-sticky-sidebar",
    window.innerWidth >= minimumViewportWidthForSidebar
      && sidebar.offsetHeight + offset <= window.innerHeight,
  );
}

function init(signal: AbortSignal): void {
  document.documentElement.setAttribute("rgf-sticky-sidebar-enabled", "");
  observe(sidebarSelector, trackSidebar.bind(undefined, signal), { signal });
  window.addEventListener("resize", onResize, { signal });
}

features.add(import.meta.url, {
  include: [
    isIssueOrPR,
  ],
  exclude: [
    () => screen.availWidth < minimumViewportWidthForSidebar,
  ],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues/1
- https://codeberg.org/ziglang/zig/pulls/1
*/
