import { BACKEND_BASE_URL } from "./apiConfig";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs = 3000) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const warmupBackend = async ({
  attempts = 4,
  timeoutMs = 3000,
  baseDelayMs = 1000,
} = {}) => {
  const url = `${BACKEND_BASE_URL}/health`;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, timeoutMs);
      if (response.ok) {
        return { ok: true, attempts: attempt };
      }
    } catch (error) {
      // Retry on cold start / network failures.
    }

    if (attempt < attempts) {
      await sleep(baseDelayMs * attempt);
    }
  }

  return { ok: false, attempts };
};
