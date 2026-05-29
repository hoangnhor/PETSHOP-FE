import {
  CART_MERGE_MARKER,
  WISHLIST_MERGE_MARKER,
  clearAuthMergeMarkers,
} from "./authSync";

describe("authSync markers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("clearAuthMergeMarkers removes both merge markers", () => {
    localStorage.setItem(CART_MERGE_MARKER, "u1");
    localStorage.setItem(WISHLIST_MERGE_MARKER, "u1");

    clearAuthMergeMarkers();

    expect(localStorage.getItem(CART_MERGE_MARKER)).toBeNull();
    expect(localStorage.getItem(WISHLIST_MERGE_MARKER)).toBeNull();
  });
});
