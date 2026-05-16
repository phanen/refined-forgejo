import features from "../feature-manager.js";
import delay from "../helpers/delay.js";
import onetime from "../helpers/onetime.js";

function isExternalImage(image: HTMLImageElement): boolean {
  const src = image.currentSrc || image.src;
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    return false;
  }

  try {
    return new URL(src, location.href).origin !== location.origin;
  } catch {
    return false;
  }
}

async function retryFailedImage(image: HTMLImageElement): Promise<void> {
  if (image.dataset.rgfReloadFailedProxiedImage === "1" || !isExternalImage(image)) {
    return;
  }

  console.warn("Refined Forgejo: image failed loading, will retry", image.src);
  image.dataset.rgfReloadFailedProxiedImage = "1";

  await delay(5000);

  if (!image.isConnected) {
    return;
  }

  try {
    const cloned = image.cloneNode() as HTMLImageElement;
    await cloned.decode();
    image.replaceWith(cloned);
  } catch {
    // Keep the failed image in place if the retry also fails.
  }
}

function initOnce(): void {
  document.addEventListener(
    "error",
    event => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        void retryFailedImage(target);
      }
    },
    { capture: true },
  );

  for (const image of document.querySelectorAll<HTMLImageElement>("img")) {
    if (image.complete && image.naturalWidth === 0) {
      void retryFailedImage(image);
    }
  }
}

void features.add(import.meta.url, {
  init: onetime(initOnce),
});
