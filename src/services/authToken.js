let accessToken = '';
const AUTH_SESSION_MARKER = 'petshop_auth_session_seen';

const emitTokenChanged = (token) => {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
    window.dispatchEvent(new CustomEvent('petshop-access-token-changed', { detail: token || '' }));
};

const writeSessionMarker = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(AUTH_SESSION_MARKER, '1');
    } catch (error) {
        // Ignore storage errors (private mode, quota, etc.)
    }
};

const clearSessionMarker = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(AUTH_SESSION_MARKER);
    } catch (error) {
        // Ignore storage errors.
    }
};

export const setAccessToken = (token) => {
    accessToken = typeof token === 'string' ? token : '';
    if (accessToken) writeSessionMarker();
    emitTokenChanged(accessToken);
    return accessToken;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
    accessToken = '';
    clearSessionMarker();
    emitTokenChanged('');
};

export const hasAuthSessionMarker = () => {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(AUTH_SESSION_MARKER) === '1';
    } catch (error) {
        return false;
    }
};
