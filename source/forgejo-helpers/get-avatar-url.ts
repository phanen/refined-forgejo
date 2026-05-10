const avatarCache = new Map<string, string>();

export default async function getAvatarUrl(username: string, size?: number): Promise<string | undefined> {
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }

  try {
    const response = await fetch(`/api/v1/users/${username}`);
    if (!response.ok) {
      return undefined;
    }

    const data = await response.json() as { avatar_url: string };
    let url = data.avatar_url;
    if (size && url.includes("?")) {
      url += `&size=${size}`;
    } else if (size) {
      url += `?size=${size}`;
    }

    avatarCache.set(username, url);
    return url;
  } catch {
    return undefined;
  }
}
