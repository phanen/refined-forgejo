import mem from "memoize";
import { getToken } from "../options-storage.js";

const apiUrl = () => `${location.origin}/api/v1/`;

export type ApiOptions = {
  ignoreHttpStatus?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

async function apiFetch(
  path: string,
  options: ApiOptions = {},
): Promise<unknown> {
  const { ignoreHttpStatus = false, method = "GET", body, headers = {}, signal } = options;

  const token = await getToken();
  const authHeaders: HeadersInit = token ? { Authorization: `token ${token}` } : {};

  const url = new URL(path, apiUrl());
  const response = await fetch(url.href, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...authHeaders,
      ...headers,
    },
    signal,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

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
