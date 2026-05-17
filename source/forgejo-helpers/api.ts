import mem from "memoize";
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
  const authHeaders: HeadersInit = token ? { Authorization: `token ${token}` } : {};

  const response = await fetch(toRequestUrl(path), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      accept: responseType === "text"
        ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        : "application/json",
      ...authHeaders,
      ...headers,
    },
    signal,
  });

  const text = await response.text();
  const data = responseType === "text" ? text : text ? JSON.parse(text) : {};

  if (response.ok || ignoreHttpStatus) {
    return data;
  }

  throw new Error(data.message || `API error: ${response.status}`);
}

const v1 = mem(apiFetch);

const api = {
  v1,
  fetch: apiFetch,
};

export default api;
