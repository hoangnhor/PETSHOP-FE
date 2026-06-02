import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { App as AntdApp, ConfigProvider } from 'antd';
import DefaultComponents from './components/DefaultComponents/DefaultComponents';
import Loading from './components/LoadingComponent/Loading';
import { routes } from './routes';
import * as UserServices from './services/UserServices';
import { resetUser, updateUser } from './redux/slides/userSlider';
import { clearAccessToken, getAccessToken, hasAuthSessionMarker, setAccessToken } from './services/authToken';
import { clearAuthMergeMarkers } from './constants/authSync';
import { syncAuthAfterLogin } from './services/authMergeServices';
import ToastProvider from './components/ui/feedback/ToastProvider';
import { warmupBackend } from './services/backendWarmup';
import { BackendStatusBanner, BackendStatusDot } from './components/ui';

function ProtectedRoute({ children, isPrivate, isAdminRoute, authReady }) {
  const user = useSelector((state) => state.user);
  const hasAccessToken = Boolean(user?.access_token);

  if (isPrivate && !authReady) return null;
  if (isPrivate && !hasAccessToken) return <Navigate to="/" />;
  if (isAdminRoute && !user?.isAdmin) return <Navigate to="/" />;
  return children;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isPending, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [backendStatus, setBackendStatus] = useState("warming");
  const BANNER_DISMISS_TTL_MS = 10 * 60 * 1000;
  const BANNER_DISMISS_KEY = "petshop-backend-banner-dismissed-at";
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(BANNER_DISMISS_KEY);
      const dismissedAt = Number(raw || 0);
      return Number.isFinite(dismissedAt) && dismissedAt > 0 && Date.now() - dismissedAt < BANNER_DISMISS_TTL_MS;
    } catch (error) {
      return false;
    }
  });

  const reportMergeError = useCallback((scope, error) => {
    const message = error?.message || `Không thể đồng bộ ${scope}`;
    console.warn(`[auth-merge:${scope}]`, message, error);
  }, []);

  const decodeToken = useCallback((token) => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }, []);

  const syncUserToken = useCallback(
    (token, decoded = null) => {
      const parsedDecoded = decoded || decodeToken(token);
      dispatch(
        updateUser({
          id: parsedDecoded?.id || user?.id || '',
          name: user?.name || (parsedDecoded?.email ? 'Tài khoản' : ''),
          email: parsedDecoded?.email || user?.email || '',
          phone: user?.phone || '',
          address: user?.address || '',
          avatar: user?.avatar || '',
          access_token: token || '',
          isAdmin: Boolean(parsedDecoded?.isAdmin),
        })
      );
    },
    [decodeToken, dispatch, user]
  );

  const handleGetDetailsUser = useCallback(
    async (id, token) => {
      const res = await UserServices.getDetailsUser(id, token);
      dispatch(updateUser({ ...res?.data, access_token: token }));
    },
    [dispatch]
  );

  useEffect(() => {
    let isActive = true;
    const warmup = async () => {
      setBackendStatus("warming");
      setBannerDismissed(false);
      const result = await warmupBackend({ attempts: 6, timeoutMs: 2500, baseDelayMs: 1800 });
      if (!isActive) return;
      setBackendStatus(result.ok ? "ready" : "degraded");
    };

    void warmup();
    return () => {
      isActive = false;
    };
  }, []);

  const handleRetryBackend = useCallback(async () => {
    setBannerDismissed(false);
    setBackendStatus("warming");
    const result = await warmupBackend({ attempts: 6, timeoutMs: 2500, baseDelayMs: 1800 });
    setBackendStatus(result.ok ? "ready" : "degraded");
  }, []);

  const handleDismissBackendBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      window.sessionStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
    } catch (error) {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      setIsLoading(true);
      try {
        let token = getAccessToken();
        const decoded = decodeToken(token);
        const now = Date.now() / 1000;

        const shouldTryRefresh = hasAuthSessionMarker();
        if ((!token || !decoded?.exp || decoded.exp <= now) && shouldTryRefresh) {
          const refreshRes = await UserServices.refreshToken();
          token = refreshRes?.access_token || '';
        }

        if (!token) throw new Error('Không có access token hợp lệ');

        setAccessToken(token);
        const parsedDecoded = decodeToken(token);
        const syncResult = await syncAuthAfterLogin(token, (payload) => dispatch(updateUser(payload)));
        if (syncResult.failedCount > 0) {
          reportMergeError('auth-sync', new Error(`Đồng bộ chưa hoàn tất (${syncResult.failedCount} lỗi)`));
        }

        if (parsedDecoded?.id) {
          await handleGetDetailsUser(parsedDecoded.id, token);
        } else {
          dispatch(
            updateUser({
              access_token: token,
              name: 'Tài khoản',
              email: parsedDecoded?.email || '',
              id: parsedDecoded?.id || '',
              isAdmin: Boolean(parsedDecoded?.isAdmin),
            })
          );
        }
      } catch (error) {
        clearAuthMergeMarkers();
        clearAccessToken();
        dispatch(resetUser());
      } finally {
        setAuthReady(true);
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [decodeToken, dispatch, handleGetDetailsUser, reportMergeError]);

  useEffect(() => {
    const syncFromTokenEvent = (event) => {
      const nextToken = String(event?.detail || '');
      if (!nextToken) {
        clearAuthMergeMarkers();
        dispatch(resetUser());
        return;
      }
      syncUserToken(nextToken, decodeToken(nextToken));
    };

    window.addEventListener('petshop-access-token-changed', syncFromTokenEvent);
    return () => window.removeEventListener('petshop-access-token-changed', syncFromTokenEvent);
  }, [decodeToken, dispatch, syncUserToken]);

  useEffect(() => {
    UserServices.setAuthFailureHandler(() => {
      clearAuthMergeMarkers();
      dispatch(resetUser());
    });
    return () => {
      UserServices.setAuthFailureHandler(null);
    };
  }, [dispatch]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1A1A1A',
          colorInfo: '#1A1A1A',
          colorSuccess: '#A67C52',
          colorWarning: '#D4B483',
          colorError: '#8a3d3d',
          borderRadius: 12,
          colorBgContainer: '#ffffff',
          colorBorder: 'rgba(198,169,105,.28)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <AntdApp>
        <ToastProvider />
        <div>
          {!bannerDismissed && backendStatus !== "ready" ? (
            <BackendStatusBanner
              status={backendStatus}
              onRetry={handleRetryBackend}
              onDismiss={handleDismissBackendBanner}
            />
          ) : null}
          {bannerDismissed || backendStatus !== "ready" ? (
            <BackendStatusDot
              status={backendStatus}
              onRetry={handleRetryBackend}
              onShowBanner={() => setBannerDismissed(false)}
            />
          ) : null}
          <Loading isPending={isPending}>
            <Router>
              <ScrollToTop />
              <Routes>
                {routes.map((route) => {
                  const Page = route.page;
                  const Layout = route.isShowHeader ? DefaultComponents : Fragment;
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ProtectedRoute
                          isPrivate={route.isPrivate}
                          isAdminRoute={route.isAdmin}
                          authReady={authReady}
                        >
                          <Layout>
                            <Page />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                  );
                })}
              </Routes>
            </Router>
          </Loading>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
