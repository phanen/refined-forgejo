import { executeInMainWorld } from "../helpers/main-world.js";
import type { User } from "./api-types.js";
import api from "./api.js";

type MentionValue = { name: string; avatar: string };

const avatarCache = new Map<string, string>();
let fetched = false;
let fetchPromise: Promise<void> | undefined;

async function fetchMentionValues(): Promise<void> {
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const mentions = await executeInMainWorld(() => (window as any).config?.mentionValues) as
        | MentionValue[]
        | undefined;
      if (mentions) {
        for (const mention of mentions) {
          if (mention.name && mention.avatar) {
            avatarCache.set(mention.name, mention.avatar);
          }
        }
      }
      fetched = true;
    } catch (error) {
      console.error("Error fetching mentionValues from main world:", error);
    }
  })();

  return fetchPromise;
}

export function resetAvatarCache(): void {
  fetchPromise = undefined;
  fetched = false;
  // We keep the cache itself to avoid re-fetching same avatars,
}

/**
 * Attempts to get an avatar URL from various sources to avoid API calls:
 */
export default async function getAvatarUrl(username: string): Promise<string | undefined> {
  // 1. Check local cache
  if (avatarCache.has(username)) {
    return avatarCache.get(username);
  }

  // 2. Try fetching from mentionValues if not done yet
  if (!fetched) {
    await fetchMentionValues();
    if (avatarCache.has(username)) {
      return avatarCache.get(username);
    }
  }

  // 3. Try to find an existing avatar in the DOM
  // Forgejo uses <img> with class "avatar" and usually alt or data-username or inside a link with username
  const domAvatar = document.querySelector<HTMLImageElement>(
    `img.avatar[alt^="${username}"], a[href$="/${username}"] img.avatar, a[href$="/${username}/"] img.avatar`,
  );
  if (domAvatar?.src) {
    avatarCache.set(username, domAvatar.src);
    return domAvatar.src;
  }

  // 4. Fallback to API
  try {
    const data = (await api.v1(`users/${username}`)) as User;
    const url = data.avatar_url;

    if (url) {
      avatarCache.set(username, url);
    }
    return url;
  } catch {
    return undefined;
  }
}
