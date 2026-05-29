export const CART_MERGE_MARKER = "cart_login_merge_marker";
export const WISHLIST_MERGE_MARKER = "wishlist_login_merge_marker";

export const clearAuthMergeMarkers = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_MERGE_MARKER);
  localStorage.removeItem(WISHLIST_MERGE_MARKER);
};
