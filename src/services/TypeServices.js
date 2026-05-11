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

export const getAllType = async () => {
    const res = await axiosJWT.get(`${API_URL}/type/getall`);
    return res.data;
};

export const createType = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/type/create`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const updateType = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${API_URL}/type/update/${id}`, data, {
        headers: authHeader(access_token),
    });
    return res.data;
};

export const deleteType = async (id, access_token) => {
    const res = await axiosJWT.delete(`${API_URL}/type/delete/${id}`, {
        headers: authHeader(access_token),
    });
    return res.data;
};
