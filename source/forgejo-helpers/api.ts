import mem from "memoize";
import { splitCommaSeparated } from "../helpers/site-domains.js";
import { getToken } from "../options-storage.js";

const apiUrl = () => `${location.origin}/api/v1/`;

function toRequestUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return new URL(path, location.origin).href;
  }

  return new URL(path, apiUrl()).href;
}

export type ApiOptions = {
  ignoreHttpStatus?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  responseType?: "json" | "text";
};

async function apiFetch(
  path: string,
  options: ApiOptions = {},
): Promise<unknown> {
  const { ignoreHttpStatus = false, method = "GET", body, headers = {}, signal, responseType = "json" } = options;

  const token = await getToken();
  const tokens = splitCommaSeparated(token);
  const authTokens = tokens.length > 0 ? tokens : [""];
  const isFormBody = body instanceof FormData || body instanceof URLSearchParams;

  let lastData: unknown = {};
  let lastStatus = 0;

  for (const candidate of authTokens) {
    const response = await fetch(toRequestUrl(path), {
      method,
      body: isFormBody ? body : (body ? JSON.stringify(body) : undefined),
      headers: {
        ...(isFormBody ? {} : { "Content-Type": "application/json" }),
        accept: responseType === "text"
          ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          : "application/json",
        ...(candidate ? { Authorization: `token ${candidate}` } : {}),
        ...headers,
      },
      signal,
    });

    const text = await response.text();
    const data = responseType === "text" ? text : text ? JSON.parse(text) : {};
    lastData = data;
    lastStatus = response.status;

    if (response.ok) {
      return data;
    }

    const isAuthError = response.status === 401 || response.status === 403;
    if (!isAuthError) {
      if (ignoreHttpStatus) {
        return data;
      }
      break;
    }

    if (ignoreHttpStatus && candidate === authTokens.at(-1)) {
      return data;
    }
  }

  const errorMessage = (lastData as { message?: string })?.message || `API error: ${lastStatus}`;
  throw new Error(errorMessage);
}

const v1 = mem(apiFetch);

const api = {
  v1,
  fetch: apiFetch,
};

export default api;
