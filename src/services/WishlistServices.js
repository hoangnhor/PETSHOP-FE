import { axiosJWT } from "./UserServices";
import { API_URL } from "./apiConfig";

const authHeader = (access_token) => ({
  ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
});

export const getMyWishlist = async (access_token) => {
  const res = await axiosJWT.get(`${API_URL}/wishlist/me`, {
    headers: authHeader(access_token),
  });
  return res.data;
};

export const addWishlistItem = async (productIdOrPayload, access_token) => {
  const productId =
    typeof productIdOrPayload === "string"
      ? productIdOrPayload
      : productIdOrPayload?.productId;
  const res = await axiosJWT.post(
    `${API_URL}/wishlist/me/items`,
    { productId },
    { headers: authHeader(access_token) }
  );
  return res.data;
};

export const removeWishlistItem = async (productId, access_token) => {
  const res = await axiosJWT.delete(`${API_URL}/wishlist/me/items/${productId}`, {
    headers: authHeader(access_token),
  });
  return res.data;
};

export const clearMyWishlist = async (access_token) => {
  const res = await axiosJWT.delete(`${API_URL}/wishlist/me`, {
    headers: authHeader(access_token),
  });
  return res.data;
};
