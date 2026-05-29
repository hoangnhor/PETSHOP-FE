import { readLocalArray, readLocalJson, readLocalObject } from "./localStorage";

describe("localStorage utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("readLocalArray returns fallback array when JSON is invalid", () => {
    localStorage.setItem("wishlistItems", "{invalid-json");
    expect(readLocalArray("wishlistItems")).toEqual([]);
  });

  test("readLocalObject returns fallback object when stored value is array", () => {
    localStorage.setItem("checkout_saved_address", JSON.stringify(["not-object"]));
    expect(readLocalObject("checkout_saved_address", { city: "" })).toEqual({ city: "" });
  });

  test("readLocalJson returns fallback when key is missing", () => {
    expect(readLocalJson("not_found", null)).toBeNull();
  });
});
