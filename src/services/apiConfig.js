export const buildApiUrl = () => {
    const raw = (process.env.REACT_APP_API_URL || "https://petshopbe.onrender.com/api").trim();
    const normalized = raw.replace(/\/+$/, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const API_URL = buildApiUrl();

export const getApiErrorMessage = (error, fallback = "Có lỗi xảy ra, vui lòng thử lại.") => {
    return error?.response?.data?.message || error?.message || fallback;
};
