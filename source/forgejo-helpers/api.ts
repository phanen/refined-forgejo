import mem from "memoize";
import { getToken } from "../options-storage.js";

const apiUrl = () => `${location.origin}/api/v1/`;

type ApiOptions = {
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

  const url = new URL(path, apiUrl());
  const response = await fetch(url.href, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
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

async function apiFetchWithToken(path: string, signal?: AbortSignal): Promise<unknown> {
  const token = await getToken();
  const headers: HeadersInit = token ? { Authorization: `token ${token}` } : {};
  return apiFetch(path, { headers, signal });
}

const api = {
  v1,
  v1uncached: apiFetch,
  v1WithToken: mem(apiFetchWithToken),
};

export default api;
