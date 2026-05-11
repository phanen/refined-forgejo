import api from "./api.js";

export default async function getAvatarUrl(username: string, size?: number): Promise<string | undefined> {
  try {
    const data = await api.v1(`users/${username}`) as { avatar_url: string };
    let url = data.avatar_url;
    if (size && url.includes("?")) {
      url += `&size=${size}`;
    } else if (size) {
      url += `?size=${size}`;
    }

    return url;
  } catch {
    return undefined;
  }
}
