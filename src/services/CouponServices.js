import axios from "axios";
import { API_URL } from "./apiConfig";

export const validateCoupon = async ({ code, orderValue }) => {
  const res = await axios.post(`${API_URL}/coupon/validate`, { code, orderValue });
  return res.data;
};
