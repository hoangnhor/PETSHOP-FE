import { axiosJWT } from "./UserServices";
import { API_URL } from "./apiConfig";
import { requestWithCache } from "./apiCache";

const authHeader = (access_token) => ({
    ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
});

export const getAllType = async () => {
    return requestWithCache("type:getall", async () => {
        const res = await axiosJWT.get(`${API_URL}/type/getall`);
        return res.data;
    }, {
        fallbackMessage: "Không thể tải danh sách danh mục",
    });
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
