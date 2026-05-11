import { axiosJWT } from "./UserServices";

const buildApiUrl = () => {
    const raw = (process.env.REACT_APP_API_URL || "https://petshopbe.onrender.com/api").trim();
    const normalized = raw.replace(/\/+$/, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const API_URL = buildApiUrl();

const authHeader = (access_token) => ({
    Authorization: `Bearer ${access_token}`,
});

export const createBill = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/bill/create`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const getAllBill = async (access_token, query = {}) => {
    const res = await axiosJWT.get(`${API_URL}/bill/getall`, {
        headers: authHeader(access_token),
        params: query,
    });
    return res.data;
};

export const getDetailsBill = async (id, access_token) => {
    const res = await axiosJWT.get(`${API_URL}/bill/get-details/${id}`, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const updateBillStatus = async (id, data, access_token) => {
    const res = await axiosJWT.patch(`${API_URL}/bill/update-status/${id}`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const cancelBill = async (id, data, access_token) => {
    const res = await axiosJWT.patch(`${API_URL}/bill/cancel/${id}`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const deleteBill = async (id, access_token) => {
    const res = await axiosJWT.delete(`${API_URL}/bill/delete/${id}`, {
        headers: authHeader(access_token),
    });
    return res.data;
};
