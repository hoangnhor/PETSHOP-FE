import axios from "axios";
import { API_URL } from "./apiConfig";
import { requestWithCache } from "./apiCache";

export const getAllServices = async (params = {}) => {
  return requestWithCache(`service:getall:${JSON.stringify(params)}`, async () => {
    const res = await axios.get(`${API_URL}/service/getall`, { params });
    return res.data;
  }, {
    fallbackMessage: "Không thể tải danh sách dịch vụ",
  });
};

export const getServiceBySlug = async (slug) => {
  return requestWithCache(`service:slug:${slug}`, async () => {
    const res = await axios.get(`${API_URL}/service/slug/${slug}`);
    return res.data;
  }, {
    fallbackMessage: "Không thể tải chi tiết dịch vụ",
  });
};
