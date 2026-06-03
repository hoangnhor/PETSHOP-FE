import axios from 'axios';
import { API_URL, getApiErrorMessage } from './apiConfig';
import { clearAccessToken, getAccessToken, setAccessToken } from './authToken';
import { readCachedResponse, writeCachedResponse, requestWithCache } from "./apiCache";

export const axiosJWT = axios.create();
axiosJWT.defaults.timeout = 15000;
axiosJWT.defaults.withCredentials = true;
axios.defaults.timeout = 15000;
axios.defaults.withCredentials = true;
let refreshTokenPromise = null;
let authFailureHandler = null;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FORCE_SIGN_OUT_403_MESSAGES = new Set([
    "Tài khoản không được phép truy cập",
    "Xác thực thất bại",
    "Token không được cung cấp",
]);
const FORCE_SIGN_OUT_CODES = new Set([
    "TOKEN_MISSING",
    "TOKEN_INVALID",
    "ACCOUNT_FORBIDDEN",
    "UNAUTHORIZED",
]);

const resolveAccessToken = (explicitToken) => explicitToken || getAccessToken();
const shouldForceSignOut = (error) => {
    const statusCode = Number(error?.response?.status || 0);
    const code = String(error?.response?.data?.code || "").trim().toUpperCase();
    if (FORCE_SIGN_OUT_CODES.has(code)) return true;
    if (statusCode === 401) return true;
    if (statusCode !== 403) return false;
    const message = String(error?.response?.data?.message || "").trim();
    return FORCE_SIGN_OUT_403_MESSAGES.has(message);
};

const handleAuthFailure = (reason = "unauthorized") => {
    clearAccessToken();
    if (typeof authFailureHandler === "function") {
        authFailureHandler(reason);
    }
};

export const setAuthFailureHandler = (handler) => {
    authFailureHandler = typeof handler === "function" ? handler : null;
};

const createAuthConfig = (accessToken) => {
    const token = resolveAccessToken(accessToken);
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const requestRefreshToken = async () => {
    const res = await axios.post(`${API_URL}/user/refresh-token`, null, {
        withCredentials: true,
    });
    if (res?.data?.access_token) {
        setAccessToken(res.data.access_token);
    }
    return res.data;
};

axiosJWT.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (!token) return config;
        const nextConfig = { ...config };
        nextConfig.headers = nextConfig.headers || {};
        if (!nextConfig.headers.Authorization) {
            nextConfig.headers.Authorization = `Bearer ${token}`;
        }
        return nextConfig;
    },
    (error) => Promise.reject(error)
);

// Interceptor để làm mới token
axiosJWT.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const statusCode = Number(error?.response?.status || 0);

        if (statusCode === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await refreshToken();
                const newAccessToken = res.access_token;
                if (!newAccessToken) throw new Error('Phiên đăng nhập đã hết hạn');
                setAccessToken(newAccessToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosJWT(originalRequest);
            } catch (refreshError) {
                handleAuthFailure('refresh-failed');
                return Promise.reject(refreshError);
            }
        }
        if (shouldForceSignOut(error)) {
            handleAuthFailure(statusCode === 403 ? 'blocked-or-invalid-session' : 'request-unauthorized');
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (data) => {
    try {
        const res = await axios.post(`${API_URL}/user/sign-in`, data, {
            withCredentials: true,
        });
        if (res?.data?.access_token) {
            setAccessToken(res.data.access_token);
        }
        return res.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Không thể đăng nhập'));
    }
};

export const SignupUser = async (data) => {
    try {
        const res = await axios.post(`${API_URL}/user/sign-up`, data);
        return res.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Không thể đăng ký tài khoản'));
    }
};

export const getDetailsUser = async (id, access_token) => {
    const token = resolveAccessToken(access_token);
    if (!token) {
        throw new Error('Chưa đăng nhập');
    }

    const cacheKey = `user:details:${id}:${token}`;
    try {
        const res = await axiosJWT.get(`${API_URL}/user/get-details/${id}`, createAuthConfig(token));
        writeCachedResponse(cacheKey, res.data);
        return res.data;
    } catch (error) {
        const statusCode = Number(error?.response?.status || 0);
        const responseMessage = String(error?.response?.data?.message || "").trim();
        const shouldSignOut =
            statusCode === 401 ||
            (statusCode === 403 && FORCE_SIGN_OUT_403_MESSAGES.has(responseMessage));

        if (shouldSignOut) {
            handleAuthFailure('get-details-auth-failed');
            throw new Error(getApiErrorMessage(error, 'Không thể tải thông tin người dùng'));
        }

        const cached = readCachedResponse(cacheKey);
        if (cached !== null) return cached;

        throw new Error(getApiErrorMessage(error, 'Không thể tải thông tin người dùng'));
    }
};

export const refreshToken = async () => {
    if (refreshTokenPromise) return refreshTokenPromise;
    refreshTokenPromise = (async () => {
        const retryDelays = [0, 1200, 2400, 4000];
        let lastError = null;

        for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
            if (retryDelays[attempt] > 0) {
                await sleep(retryDelays[attempt]);
            }

            try {
                return await requestRefreshToken();
            } catch (error) {
                lastError = error;
                const status = Number(error?.response?.status || 0);
                if (status && status >= 400 && status < 500 && status !== 502 && status !== 503 && status !== 504) {
                    throw new Error(getApiErrorMessage(error, 'Phiên đăng nhập đã hết hạn'));
                }
            }
        }

        throw new Error(getApiErrorMessage(lastError, 'Phiên đăng nhập đã hết hạn'));
    })().finally(() => {
        refreshTokenPromise = null;
    });
    return refreshTokenPromise;
};

export const logoutUser = async () => {
    try {
        const res = await axios.post(`${API_URL}/user/log-out`, null, {
            withCredentials: true,
        });
        clearAccessToken();
        return res.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Không thể đăng xuất'));
    }
};

export const updateUser = async (id, data, access_token) => {
    try {
        const res = await axiosJWT.put(`${API_URL}/user/update/${id}`, data, createAuthConfig(access_token));
        return res.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Không thể cập nhật người dùng'));
    }
};

export const createUser = async (data, access_token) => {
    const res = await axiosJWT.post(`${API_URL}/user/create`, data, createAuthConfig(access_token));
    return res.data;
};

export const getAllUser = async (access_token, query = {}) => {
    const token = resolveAccessToken(access_token);
    return requestWithCache(`user:getall:${token}:${JSON.stringify(query)}`, async () => {
        const res = await axiosJWT.get(`${API_URL}/user/getall`, {
            ...createAuthConfig(token),
            params: query,
        });
        return res.data;
    }, {
        fallbackMessage: 'Không thể tải danh sách người dùng',
    });
};

export const deleteUser = async (id, access_token) => {
    const res = await axiosJWT.delete(`${API_URL}/user/delete/${id}`, createAuthConfig(access_token));
    return res.data;
};
