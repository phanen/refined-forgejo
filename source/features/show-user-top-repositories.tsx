import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addLink(form: HTMLFormElement): void {
  if (form.querySelector(".rgf-top-repositories")) {
    return;
  }

  if (!form.querySelector("input[name='tab'][value='repositories']")) {
    return;
  }

  const filterMenu = form.querySelector(".ui.small.dropdown.type.jump.item");
  if (!filterMenu) {
    return;
  }

  const url = new URL(location.href);
  url.search = new URLSearchParams({
    tab: "repositories",
    sort: "moststars",
  }).toString();

  const link = document.createElement("a");
  link.className = "ui small basic button rgf-top-repositories";
  link.href = url.href;
  link.textContent = "Top repositories";
  filterMenu.before(link);
}

function init(signal: AbortSignal): void {
  observe("#repo-search-form", element => {
    if (element instanceof HTMLFormElement) {
      addLink(element);
    }
  }, {
    signal,
  });
}

features.add(import.meta.url, {
  include: [
    pageDetect.isUserProfile,
  ],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang
*/
