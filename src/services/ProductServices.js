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

export const getAllProductsUnlimited = async (query = {}) => {
    const pageSize = Math.min(Math.max(Number(query?.limit || 500), 1), 1000);
    const baseQuery = { ...query, limit: pageSize };
    const firstPage = await getAllProduct({ ...baseQuery, page: 0 });
    const firstItems = Array.isArray(firstPage?.data) ? firstPage.data : [];
    const total = Number(firstPage?.total || firstItems.length || 0);
    if (firstItems.length >= total) {
        return {
            ...firstPage,
            data: firstItems,
            total,
            totalPage: Math.ceil(total / pageSize),
        };
    }

    const totalPages = Math.max(Number(firstPage?.totalPage || Math.ceil(total / pageSize) || 1), 1);
    const pages = [firstItems];
    for (let page = 1; page < totalPages; page += 1) {
        const pageRes = await getAllProduct({ ...baseQuery, page });
        const items = Array.isArray(pageRes?.data) ? pageRes.data : [];
        pages.push(items);
        if (items.length < pageSize) break;
    }

    const mergedItems = pages.flat();
    return {
        ...firstPage,
        data: mergedItems,
        total: Math.max(total, mergedItems.length),
        totalPage: Math.ceil(Math.max(total, mergedItems.length) / pageSize),
    };
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
