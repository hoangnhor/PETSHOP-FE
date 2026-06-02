export const buildApiUrl = () => {
    const raw = (process.env.REACT_APP_API_URL || "http://localhost:3030/api").trim();
    const normalized = raw.replace(/\/+$/, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const API_URL = buildApiUrl();

export const buildBackendBaseUrl = () => {
    const normalized = API_URL.replace(/\/+$/, "");
    return normalized.endsWith("/api") ? normalized.slice(0, -4) : normalized;
};

export const BACKEND_BASE_URL = buildBackendBaseUrl();

export const getApiErrorMessage = (error, fallback = "Có lỗi xảy ra, vui lòng thử lại.") => {
    return error?.response?.data?.message || error?.message || fallback;
};
