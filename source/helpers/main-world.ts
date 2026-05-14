/**
 * Executes a function in the main world (page context) and returns the result.
 * Results must be JSON-serializable.
 */
export async function executeInMainWorld<T>(fn: () => T): Promise<T> {
  return new Promise((resolve) => {
    const scriptId = `rgf-bridge-${Math.random().toString(36).slice(2)}`;
    const eventName = `rgf-response-${scriptId}`;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      window.removeEventListener(eventName, handler);
      resolve(detail);
    };

    window.addEventListener(eventName, handler);

    const script = document.createElement("script");
    script.id = scriptId;
    script.textContent = `
      (function() {
        try {
          const result = (${fn.toString()})();
          // Use JSON serialization to bypass Proxy/Object issues across worlds
          const serialized = JSON.parse(JSON.stringify(result));
          window.dispatchEvent(new CustomEvent('${eventName}', { detail: serialized }));
        } catch (e) {
          window.dispatchEvent(new CustomEvent('${eventName}', { detail: null }));
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  });
}
