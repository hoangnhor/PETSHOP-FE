import { axiosJWT } from "./UserServices";
import { API_URL, getApiErrorMessage } from "./apiConfig";

export const createAppointment = async (payload, accessToken) => {
  try {
    const res = await axiosJWT.post(`${API_URL}/appointment/create`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tạo lịch hẹn"));
  }
};

export const getMyAppointments = async (accessToken, params = {}) => {
  try {
    const res = await axiosJWT.get(`${API_URL}/appointment/getall`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tải lịch hẹn"));
  }
};

export const getAllAppointmentsAdmin = async (accessToken, params = {}) => {
  try {
    const res = await axiosJWT.get(`${API_URL}/appointment/admin/getall`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tải danh sách lịch hẹn"));
  }
};

export const updateAppointment = async (id, payload, accessToken) => {
  try {
    const res = await axiosJWT.put(`${API_URL}/appointment/update/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể cập nhật lịch hẹn"));
  }
};

export const cancelAppointment = async (id, payload, accessToken) => {
  try {
    const res = await axiosJWT.patch(`${API_URL}/appointment/cancel/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể hủy lịch hẹn"));
  }
};
