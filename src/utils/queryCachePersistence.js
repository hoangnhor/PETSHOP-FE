import { dehydrate, hydrate } from "@tanstack/react-query";

const STORAGE_KEY = "petshop-react-query-cache";
const STORAGE_VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 400;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const loadPersistedQueryCache = () => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) return null;
    if (!parsed.savedAt || Date.now() - Number(parsed.savedAt) > MAX_AGE_MS) return null;
    return parsed.state || null;
  } catch (error) {
    return null;
  }
};

export const hydrateQueryCache = (queryClient) => {
  const state = loadPersistedQueryCache();
  if (!state) return false;

  try {
    hydrate(queryClient, state);
    return true;
  } catch (error) {
    return false;
  }
};

export const persistQueryCache = (queryClient) => {
  if (!canUseStorage()) return () => {};

  let timerId = null;

  const saveNow = () => {
    try {
      const state = dehydrate(queryClient);
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          savedAt: Date.now(),
          state,
        })
      );
    } catch (error) {
      // Ignore quota / serialization errors. Cache persistence is best-effort.
    }
  };

  const scheduleSave = () => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = window.setTimeout(saveNow, SAVE_DEBOUNCE_MS);
  };

  scheduleSave();
  const unsubscribe = queryClient.getQueryCache().subscribe(scheduleSave);

  return () => {
    if (timerId) {
      clearTimeout(timerId);
    }
    unsubscribe();
  };
};
