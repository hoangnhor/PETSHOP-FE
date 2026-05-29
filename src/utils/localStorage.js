export const readLocalJson = (key, fallbackValue = null) => {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return fallbackValue;
    }
    return JSON.parse(rawValue);
  } catch (error) {
    return fallbackValue;
  }
};

export const readLocalArray = (key) => {
  const parsed = readLocalJson(key, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const readLocalObject = (key, fallbackValue = {}) => {
  const parsed = readLocalJson(key, fallbackValue);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed;
  }
  return fallbackValue;
};
