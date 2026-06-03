import { axiosJWT } from "./UserServices";
import { API_URL } from "./apiConfig";
import { requestWithCache } from "./apiCache";

const authHeader = (access_token) => ({
  ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
});

export const getMyCart = async (access_token) => {
  return requestWithCache(`cart:me:${access_token || "public"}`, async () => {
    const res = await axiosJWT.get(`${API_URL}/cart/me`, {
      headers: authHeader(access_token),
    });
    return res.data;
  }, {
    fallbackMessage: "Không thể tải giỏ hàng",
  });
};

export const updateMyCart = async (data, access_token) => {
  const res = await axiosJWT.put(`${API_URL}/cart/me`, data, {
    headers: authHeader(access_token),
  });
  return res.data;
};

export const addCartItem = async (data, access_token) => {
  const res = await axiosJWT.post(`${API_URL}/cart/me/items`, data, {
    headers: authHeader(access_token),
  });
  return res.data;
};

export const removeCartItem = async (productId, access_token) => {
  const res = await axiosJWT.delete(`${API_URL}/cart/me/items/${productId}`, {
    headers: authHeader(access_token),
  });
  return res.data;
};

export const clearMyCart = async (access_token) => {
  const res = await axiosJWT.delete(`${API_URL}/cart/me`, {
    headers: authHeader(access_token),
  });
  return res.data;
};
