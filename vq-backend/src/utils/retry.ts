import { isDatabaseConnectivityError } from "./databaseConnectivity.js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RetryOptions = {
  attempts?: number;
  delaysMs?: number[];
};

// Read-only BFF endpoints can safely retry a short transient DB outage once or
// twice. We keep the retry window small so requests recover quickly without
// turning into long hangs.
export const retryOnDatabaseConnectivity = async <T>(
  work: () => Promise<T>,
  options: RetryOptions = {},
) => {
  const attempts = options.attempts ?? 3;
  const delaysMs = options.delaysMs ?? [150, 400];

  let lastError: unknown;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      if (!isDatabaseConnectivityError(error) || index >= attempts - 1) {
        throw error;
      }

      await delay(delaysMs[index] ?? delaysMs[delaysMs.length - 1] ?? 200);
    }
  }

  throw lastError;
};
