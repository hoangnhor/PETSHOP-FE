import axios from "axios";
import { API_URL, getApiErrorMessage } from "./apiConfig";

export const getAllServices = async (params = {}) => {
  try {
    const res = await axios.get(`${API_URL}/service/getall`, { params });
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tải danh sách dịch vụ"));
  }
};

export const getServiceBySlug = async (slug) => {
  try {
    const res = await axios.get(`${API_URL}/service/slug/${slug}`);
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tải chi tiết dịch vụ"));
  }
};
