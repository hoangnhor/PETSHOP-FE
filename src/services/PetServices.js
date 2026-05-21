import { axiosJWT } from "./UserServices";
import { API_URL, getApiErrorMessage } from "./apiConfig";

export const getMyPets = async (accessToken) => {
  try {
    const res = await axiosJWT.get(`${API_URL}/pet/my`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tải danh sách thú cưng"));
  }
};

export const createPet = async (payload, accessToken) => {
  try {
    const res = await axiosJWT.post(`${API_URL}/pet/create`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tạo thú cưng"));
  }
};

export const updatePet = async (id, payload, accessToken) => {
  try {
    const res = await axiosJWT.put(`${API_URL}/pet/update/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể cập nhật thú cưng"));
  }
};

export const deletePet = async (id, accessToken) => {
  try {
    const res = await axiosJWT.delete(`${API_URL}/pet/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể xóa thú cưng"));
  }
};
