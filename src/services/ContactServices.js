import axios from "axios";
import { API_URL, getApiErrorMessage } from "./apiConfig";

export const createContact = async (payload) => {
  try {
    const res = await axios.post(`${API_URL}/contact/create`, payload);
    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể gửi liên hệ"));
  }
};
