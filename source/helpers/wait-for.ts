export default async function waitFor(
  condition: () => unknown,
  { timeout = 10000 } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = async (): Promise<void> => {
      try {
        if (await condition()) {
          resolve();
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for condition"));
        return;
      }

      requestAnimationFrame(() => {
        void check();
      });
    };

    void check();
  });
}
