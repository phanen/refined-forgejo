const shortcutMap = new Map<string, string>();

export { shortcutMap };

export function getFeatureId(url: string): string {
  const lastSlash = url.lastIndexOf("/");
  const featureId = url.slice(lastSlash + 1, url.lastIndexOf("."));
  return featureId;
}

const timer = new Map<string, number>();

export const log = {
  setup(_options: { logging?: boolean }): void {
  },
  info(_action: string, ..._messages: string[]): void {
  },
  http(_url: string): void {
  },
};

export function listenToAjaxedLoad(): void {
  document.addEventListener("turbo:load", () => {
    timer.clear();
  });
}
