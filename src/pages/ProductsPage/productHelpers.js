export const PRODUCTS_PER_PAGE = 12;

export const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const detectSpeciesFromTypeName = (typeName = "", fallbackText = "") => {
  const normalized = normalizeText(typeName);
  if (normalized.includes(" cho ") || normalized.startsWith("cho ") || normalized.endsWith(" cho") || normalized.includes("dog") || normalized.includes("cun")) return "dog";
  if (normalized.includes(" meo ") || normalized.startsWith("meo ") || normalized.endsWith(" meo") || normalized.includes("cat")) return "cat";

  const byName = normalizeText(fallbackText);
  if (byName.includes("meo") || byName.includes("cat")) return "cat";
  if (byName.includes("cho") || byName.includes("dog") || byName.includes("cun")) return "dog";
  return "other";
};

export const normalizeSpecies = (value = "") => {
  const normalized = normalizeText(value);
  if (normalized === "dog" || normalized === "cho") return "dog";
  if (normalized === "cat" || normalized === "meo") return "cat";
  return "other";
};

export const isCareGroupProduct = (item = {}) => {
  const text = normalizeText(`${item?.name || ""} ${item?.type?.name || ""} ${item?.category || ""}`);
  return text.includes("cham soc") || text.includes("groom") || text.includes("ve sinh") || text.includes("sua tam") || text.includes("luoc");
};

export const isHealthGroupProduct = (item = {}) => {
  const text = normalizeText(`${item?.name || ""} ${item?.type?.name || ""} ${item?.category || ""}`);
  return text.includes("suc khoe") || text.includes("vitamin") || text.includes("thu y") || text.includes("y te") || text.includes("bo sung");
};

export const getProductTypeId = (product) => String(product?.type?._id || product?.type || "");

export const getFinalPrice = (product) => {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
};

const seededScore = (seed = "") => {
  const source = String(seed || "petshop");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 1000003;
  }
  return (hash % 11) / 10;
};

export const getProductRating = (product = {}) => {
  const value = Number(product?.rating);
  if (Number.isFinite(value) && value > 0) return Math.min(5, Math.max(0, value));
  const base = 4 + seededScore(product?._id || product?.name || "");
  return Number(base.toFixed(1));
};

export const firstImage = (image = "") =>
  String(image)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";

export const pageTokens = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};
