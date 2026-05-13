export async function pEveryFunction<Item>(
  array: Item[],
  predicate: (item: Item) => Promise<boolean>,
): Promise<boolean> {
  for (const item of array) {
    if (!await predicate(item)) {
      return false;
    }
  }
  return true;
}

export async function pSomeFunction<Item>(
  array: Item[],
  predicate: (item: Item) => Promise<boolean>,
): Promise<boolean> {
  for (const item of array) {
    if (await predicate(item)) {
      return true;
    }
  }
  return false;
}

export async function pRace<T>(
  tasks: Array<(signal: AbortSignal) => Promise<T | undefined>>,
  signal?: AbortSignal,
): Promise<T> {
  const c = new AbortController();
  const cleanup = () => c.abort();
  signal?.addEventListener("abort", cleanup, { once: true });
  try {
    const result = await Promise.race(tasks.map(t => t(c.signal)));
    if (result === undefined) {
      throw new Error("no result");
    }
    return result;
  } finally {
    c.abort();
  }
}
