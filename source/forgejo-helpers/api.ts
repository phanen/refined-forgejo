import mem from "memoize";
import { getToken } from "../options-storage.js";

const apiUrl = () => `${location.origin}/api/v1/`;

type ApiOptions = {
  ignoreHttpStatus?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
};

async function apiFetch(
  path: string,
  options: ApiOptions = {},
): Promise<unknown> {
  const { ignoreHttpStatus = false, method = "GET", body, headers = {} } = options;

  const url = new URL(path, apiUrl());
  const response = await fetch(url.href, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (response.ok || ignoreHttpStatus) {
    return data;
  }

  throw new Error(data.message || `API error: ${response.status}`);
}

const v3 = mem(apiFetch);

async function apiFetchWithToken(path: string): Promise<unknown> {
  const token = await getToken();
  const headers: HeadersInit = token ? { Authorization: `token ${token}` } : {};
  return apiFetch(path, { headers });
}

const api = {
  v3,
  v3uncached: apiFetch,
  v3WithToken: mem(apiFetchWithToken),
};

export default api;
