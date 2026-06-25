import mem from "memoize";
import type { User } from "./api-types.js";
import api from "./api.js";

export const getFullName = mem(async (username: string): Promise<string | undefined> => {
  try {
    const data = await api.v1(`users/${username}`) as User;
    return data.full_name ?? data.name;
  } catch {
    return undefined;
  }
});
