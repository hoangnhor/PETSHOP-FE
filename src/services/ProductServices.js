import { axiosJWT } from "./UserServices";
import { API_URL } from "./apiConfig";

const authHeader = (access_token) => ({
    Authorization: `Bearer ${access_token}`,
});

export const getAllProduct = async (query = {}) => {
    const res = await axiosJWT.get(`${API_URL}/product/getall`, { params: query });
    return res.data;
};

export const createProduct = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/product/create`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const getDetailsProduct = async (id) => {
    const res = await axiosJWT.get(`${API_URL}/product/get-details/${id}`);
    return res.data;
};

export const searchProduct = async (keyword) => {
    const res = await axiosJWT.get(`${API_URL}/product/search?keyword=${encodeURIComponent(keyword)}`);
    return res.data;
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
