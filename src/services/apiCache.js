import { getApiErrorMessage } from "./apiConfig";

const STORAGE_PREFIX = "petshop-api-cache:";
const STORAGE_VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const normalizeKey = (key) => String(key || "").trim();

const storageKeyFor = (key) => `${STORAGE_PREFIX}${normalizeKey(key)}`;

const shouldFallBackToCache = (error) => {
  const status = Number(error?.response?.status || 0);
  if (!status) return true;
  if (status >= 500) return true;
  return false;
};

export const readCachedResponse = (key) => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(storageKeyFor(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) return null;
    if (!parsed.savedAt || Date.now() - Number(parsed.savedAt) > MAX_AGE_MS) return null;
    return parsed.data ?? null;
  } catch (error) {
    return null;
  }
};

export const writeCachedResponse = (key, data) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      storageKeyFor(key),
      JSON.stringify({
        version: STORAGE_VERSION,
        savedAt: Date.now(),
        data,
      })
    );
  } catch (error) {
    // Best-effort only.
  }
};

export const requestWithCache = async (
  key,
  requestFn,
  { fallbackMessage = "Có lỗi xảy ra, vui lòng thử lại." } = {}
) => {
  try {
    const response = await requestFn();
    writeCachedResponse(key, response);
    return response;
  } catch (error) {
    if (shouldFallBackToCache(error)) {
      const cached = readCachedResponse(key);
      if (cached !== null) return cached;
    }
    throw new Error(getApiErrorMessage(error, fallbackMessage));
  }
};
