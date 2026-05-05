type ErrorHandler = (error: Error) => void;

const handlers = new Set<ErrorHandler>();

export function catchErrors(): void {
  window.addEventListener("error", event => {
    for (const handler of handlers) {
      handler(event.error);
    }
  });
}

export function disableErrorLogging(): void {
  handlers.clear();
}

export function registerErrorHandler(handler: ErrorHandler): void {
  handlers.add(handler);
}

export function parseFeatureNameFromStack(): string | undefined {
  const stack = new Error().stack;
  if (!stack) {
    return undefined;
  }

  const match = stack.match(/features\/(.*?)\./);
  return match?.[1];
}
