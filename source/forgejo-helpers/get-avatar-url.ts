import api from "./api.js";

export default async function getAvatarUrl(username: string): Promise<string | undefined> {
  try {
    const data = await api.v1(`users/${username}`) as { avatar_url: string };
    const url = data.avatar_url;

    return url;
  } catch {
    return undefined;
  }
}
