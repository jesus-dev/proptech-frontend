export function createTimeoutSignal(timeout: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== 'undefined') {
      const maybeTimeout: unknown = (AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal }).timeout;
      if (typeof maybeTimeout === 'function') {
        return maybeTimeout(timeout);
      }
    }
  } catch (error) {
  }

  if (typeof AbortController === 'undefined') {
    return undefined;
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller.signal;
}
