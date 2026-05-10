export type RGFOptions = {
  actionUrl: string;
  customCss: string;
  personalToken: string;
  logging: boolean;
  [x: string]: unknown;
};

const defaults: RGFOptions = {
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

export function isFeatureDisabled(options: RGFOptions, id: string): boolean {
  return options[`feature:${id}`] === false;
}

const optionsStorage = {
  async getAll(): Promise<RGFOptions> {
    const stored = (await chrome.storage.sync.get()) as RGFOptions;
    return { ...defaults, ...stored };
  },
};

export default optionsStorage;
