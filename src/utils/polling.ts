export async function waitUntil<T>(
  operation: () => Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs = 15000,
  intervalMs = 250
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  let lastValue: T | undefined;

  while (Date.now() < deadline) {
    try {
      lastValue = await operation();
      if (predicate(lastValue)) return lastValue;
    } catch (error) {
      lastError = error;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  const lastState = lastValue === undefined
    ? "no value observed"
    : `last value: ${JSON.stringify(lastValue)}`;
  const errorText = lastError ? `; last error: ${String(lastError)}` : "";
  throw new Error(`Condition not met within ${timeoutMs} ms; ${lastState}${errorText}`);
}
