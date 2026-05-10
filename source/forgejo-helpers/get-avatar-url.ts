const avatarCache = new Map<string, Promise<string | undefined>>();

export default async function getAvatarUrl(username: string, size?: number): Promise<string | undefined> {
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }

  const promise = fetch(`/api/v1/users/${username}`)
    .then(async response => {
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

      return url;
    })
    .catch(() => undefined);

  avatarCache.set(username, promise);
  return promise;
}
