import mem from "memoize";
import api from "./api.js";

export const getFullName = mem(async (username: string): Promise<string | undefined> => {
  try {
    const data = await api.v1(`users/${username}`) as { full_name?: string; name?: string };
    return data.full_name ?? data.name;
  } catch {
    return undefined;
  }
});
