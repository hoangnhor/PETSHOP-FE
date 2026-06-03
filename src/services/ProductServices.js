import { axiosJWT } from "./UserServices";
import { API_URL } from "./apiConfig";
import { requestWithCache } from "./apiCache";

const authHeader = (access_token) => ({
    ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
});

export const getAllProduct = async (query = {}) => {
    const cacheKey = `product:getall:${JSON.stringify(query)}`;
    return requestWithCache(cacheKey, async () => {
        const res = await axiosJWT.get(`${API_URL}/product/getall`, { params: query });
        return res.data;
    }, {
        fallbackMessage: "Không thể tải danh sách sản phẩm",
    });
};

export const createProduct = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/product/create`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const getDetailsProduct = async (id) => {
    return requestWithCache(`product:details:${id}`, async () => {
        const res = await axiosJWT.get(`${API_URL}/product/get-details/${id}`);
        return res.data;
    }, {
        fallbackMessage: "Không thể tải thông tin sản phẩm",
    });
};

export const searchProduct = async (keyword) => {
    return requestWithCache(`product:search:${keyword}`, async () => {
        const res = await axiosJWT.get(`${API_URL}/product/search?keyword=${encodeURIComponent(keyword)}`);
        return res.data;
    }, {
        fallbackMessage: "Không thể tìm kiếm sản phẩm",
    });
};

export const updateProduct = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${API_URL}/product/update/${id}`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const deleteProduct = async (id, access_token) => {
    const res = await axiosJWT.delete(`${API_URL}/product/delete/${id}`, {
        headers: authHeader(access_token),
    });
    return res.data;
};
