export type RGHOptions = {
  actionUrl: string;
  customCss: string;
  personalToken: string;
  logging: boolean;
  [x: string]: unknown;
};

const defaults: RGHOptions = {
  actionUrl: location.origin,
  customCss: "",
  personalToken: "",
  logging: false,
};

export async function getToken(): Promise<string> {
  const result = (await chrome.storage.sync.get("personalToken")) as {
    personalToken?: string;
  };
  return result.personalToken || "";
}

export function isFeatureDisabled(options: RGHOptions, id: string): boolean {
  return options[`feature:${id}`] === false;
}

const optionsStorage = {
  async getAll(): Promise<RGHOptions> {
    const stored = (await chrome.storage.sync.get()) as RGHOptions;
    return { ...defaults, ...stored };
  },
};

export default optionsStorage;
