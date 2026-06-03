import { jwtDecode } from "jwt-decode";
import * as UserServices from "./UserServices";
import * as CartServices from "./CartServices";
import * as WishlistServices from "./WishlistServices";
import { readLocalArray } from "../utils/localStorage";
import { CART_MERGE_MARKER, WISHLIST_MERGE_MARKER } from "../constants/authSync";

const CART_MERGE_LOCK = "cart_login_merge_lock";
const WISHLIST_MERGE_LOCK = "wishlist_login_merge_lock";

export const buildUserMarker = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded?.id ? String(decoded.id) : String(decoded?.email || "auth-user");
  } catch (error) {
    return "auth-user";
  }
};

export const hydrateUserFromToken = async (token, applyUser) => {
  try {
    const decoded = jwtDecode(token);
    if (decoded?.id) {
      const details = await UserServices.getDetailsUser(decoded.id, token);
      applyUser({ ...details?.data, access_token: token });
      return;
    }
    applyUser({ access_token: token, name: "Tài khoản", isAdmin: Boolean(decoded?.isAdmin) });
  } catch (error) {
    applyUser({ access_token: token });
  }
};

export const mergeGuestCartOnLogin = async (token, userMarker) => {
  if (localStorage.getItem(CART_MERGE_MARKER) === userMarker) return;
  if (localStorage.getItem(CART_MERGE_LOCK) === userMarker) return;
  localStorage.setItem(CART_MERGE_LOCK, userMarker);

  try {
  const localItems = readLocalArray("cartItems")
    .map((item) => ({
      ...item,
      idsp: String(item?.idsp || "").trim(),
      quantity: Number(item?.quantity || 0),
    }))
    .filter((item) => Boolean(item.idsp) && Number.isInteger(item.quantity) && item.quantity > 0);
  if (!localItems.length) {
    localStorage.setItem("cartItems", JSON.stringify([]));
    localStorage.setItem(CART_MERGE_MARKER, userMarker);
    return;
  }

  // Merge theo từng item để tránh fail toàn bộ khi một sản phẩm vượt tồn kho/không còn bán.
  const normalizedLocalMap = new Map();
  localItems.forEach((item) => {
    const productId = String(item.idsp || "");
    if (!productId) return;
    normalizedLocalMap.set(
      productId,
      Number(normalizedLocalMap.get(productId) || 0) + Number(item.quantity || 0)
    );
  });

  const localEntries = Array.from(normalizedLocalMap.entries()).filter(
    ([productId, qty]) => productId && Number.isInteger(qty) && qty > 0
  );

  let mergeFailedCount = 0;
  if (localEntries.length) {
    try {
      await CartServices.updateMyCart(
        {
          items: localEntries.map(([productId, quantity]) => ({
            productId,
            quantity,
          })),
        },
        token
      );
    } catch (error) {
      const results = await Promise.allSettled(
        localEntries.map(([productId, quantity]) =>
          CartServices.addCartItem({ productId, quantity }, token)
        )
      );
      mergeFailedCount = results.filter((result) => result.status === "rejected").length;
    }
  }

  const finalServerCart = await CartServices.getMyCart(token);
  const finalItems = (finalServerCart?.data?.items || []).map((item) => ({
    idsp: item.productId,
    quantity: Number(item.quantity || 1),
    name: item.name || "",
    image: item.image || "",
    price: Number(item.price || 0),
    discount: Number(item.discount || 0),
    countInStock: Number(item.countInStock || 0),
    category: item.category || "Sản phẩm",
  }));

  if (mergeFailedCount > 0 && finalItems.length === 0) {
    throw new Error("Không thể đồng bộ giỏ hàng, vui lòng thử lại");
  }

  localStorage.setItem("cartItems", JSON.stringify(finalItems));
  localStorage.setItem(CART_MERGE_MARKER, userMarker);
  window.dispatchEvent(new Event("cart-updated"));
  if (mergeFailedCount > 0) {
    throw new Error(`Đồng bộ giỏ hàng chưa hoàn tất (${mergeFailedCount} sản phẩm lỗi)`);
  }
  } finally {
    if (localStorage.getItem(CART_MERGE_LOCK) === userMarker) {
      localStorage.removeItem(CART_MERGE_LOCK);
    }
  }
};

export const mergeGuestWishlistOnLogin = async (token, userMarker) => {
  if (localStorage.getItem(WISHLIST_MERGE_MARKER) === userMarker) return;
  if (localStorage.getItem(WISHLIST_MERGE_LOCK) === userMarker) return;
  localStorage.setItem(WISHLIST_MERGE_LOCK, userMarker);

  try {
  const localWishlistItems = readLocalArray("wishlistItems")
    .map((item) => ({ ...item, idsp: String(item?.idsp || "").trim() }))
    .filter((item) => Boolean(item.idsp));
  const localIds = [...new Set(localWishlistItems.map((item) => item.idsp))];
  if (!localIds.length) {
    localStorage.setItem("wishlistItems", JSON.stringify([]));
    localStorage.setItem(WISHLIST_MERGE_MARKER, userMarker);
    return;
  }

  const serverRes = await WishlistServices.getMyWishlist(token);
  const serverIds = (serverRes?.data?.productIds || [])
    .map((item) => {
      if (typeof item === "string") return item;
      return item?._id || item?.id || item?.productId || "";
    })
    .filter(Boolean)
    .map((id) => String(id));
  const serverSet = new Set(serverIds);
  const missingIds = localIds.filter((id) => !serverSet.has(id));

  if (missingIds.length) {
    const syncResults = await Promise.allSettled(
      missingIds.map((id) => WishlistServices.addWishlistItem(id, token))
    );
    const failedCount = syncResults.filter(
      (result) => result.status === "rejected" || result?.value?.status !== "OK"
    ).length;
    if (failedCount > 0) {
      throw new Error(`Không thể đồng bộ ${failedCount} sản phẩm yêu thích`);
    }
  }

  const latestServerRes = await WishlistServices.getMyWishlist(token);
  const latestWishlistItems = Array.isArray(latestServerRes?.data?.productIds)
    ? latestServerRes.data.productIds
    : [];
  const nextWishlistLocal = latestWishlistItems.length
    ? latestWishlistItems.map((item) => ({
        idsp: String(item?._id || item?.id || item?.productId || ""),
        name: item?.name || "",
        image: item?.image || "",
        price: Number(item?.price || 0),
        discount: Number(item?.discount || 0),
        countInStock: Number(item?.countInStock || 0),
      })).filter((item) => Boolean(item.idsp))
    : localWishlistItems;

  localStorage.setItem("wishlistItems", JSON.stringify(nextWishlistLocal));
  localStorage.setItem(WISHLIST_MERGE_MARKER, userMarker);
  window.dispatchEvent(new Event("wishlist-updated"));
  } finally {
    if (localStorage.getItem(WISHLIST_MERGE_LOCK) === userMarker) {
      localStorage.removeItem(WISHLIST_MERGE_LOCK);
    }
  }
};

export const syncAuthAfterLogin = async (token, applyUser) => {
  if (!token) {
    throw new Error("Thiếu access token");
  }
  const userMarker = buildUserMarker(token);
  await hydrateUserFromToken(token, applyUser);
  const mergeResults = await Promise.allSettled([
    mergeGuestCartOnLogin(token, userMarker),
    mergeGuestWishlistOnLogin(token, userMarker),
  ]);
  const failedCount = mergeResults.filter((result) => result.status === "rejected").length;
  return {
    userMarker,
    failedCount,
    mergeResults,
  };
};
