import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { ConfigProvider } from 'antd';
import DefaultComponents from './components/DefaultComponents/DefaultComponents';
import Loading from './components/LoadingComponent/Loading';
import { routes } from './routes';
import * as UserServices from './services/UserServices';
import { updateUser } from './redux/slides/userSlider';
import { isJsonString } from './utils';

function ProtectedRoute({ children, isPrivate, isAdminRoute }) {
  const user = useSelector((state) => state.user);
  const accessToken = localStorage.getItem('access_token');

  if (isPrivate && !accessToken) {
    return <Navigate to="/" />;
  }

  let isAdminFromToken = false;
  if (accessToken) {
    try {
      const token = isJsonString(accessToken) ? JSON.parse(accessToken) : accessToken;
      isAdminFromToken = Boolean(jwtDecode(token)?.isAdmin);
    } catch (error) {
      isAdminFromToken = false;
    }
  }

  if (isAdminRoute && !user.isAdmin && !isAdminFromToken) {
    return <Navigate to="/" />;
  }

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
  const [isPending, setIsLoading] = useState(false);

  const handleDecoded = useCallback(() => {
    let storageData = localStorage.getItem('access_token');
    let decoded = {};
    if (storageData) {
      try {
        storageData = isJsonString(storageData) ? JSON.parse(storageData) : storageData;
        decoded = jwtDecode(storageData);
      } catch (error) {
        console.error('Token không hợp lệ:', error);
        localStorage.removeItem('access_token');
        return { decoded: null, storageData: null };
      }
    }
    return { decoded, storageData };
  }, []);

  const handleGetDetailsUser = useCallback(async (id, token) => {
    try {
      const res = await UserServices.getDetailsUser(id, token);
      dispatch(updateUser({ ...res?.data, access_token: token }));
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error.message);
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const { storageData, decoded } = handleDecoded();
        const currentTime = new Date().getTime() / 1000;

        if (decoded?.id && decoded?.exp > currentTime && storageData) {
          await handleGetDetailsUser(decoded.id, storageData);
        } else if (storageData) {
          const data = await UserServices.refreshToken();
          const newAccessToken = data?.access_token;
          if (!newAccessToken) throw new Error('Không thể làm mới phiên đăng nhập');

          localStorage.setItem('access_token', JSON.stringify(newAccessToken));
          const refreshedDecoded = jwtDecode(newAccessToken);
          if (refreshedDecoded?.id) {
            await handleGetDetailsUser(refreshedDecoded.id, newAccessToken);
          }
        }
      } catch (error) {
        localStorage.removeItem('access_token');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [handleDecoded, handleGetDetailsUser]);

  useEffect(() => {
    const interceptorId = UserServices.axiosJWT.interceptors.request.use(
      async (config) => {
        const currentTime = new Date().getTime() / 1000;
        const { decoded, storageData } = handleDecoded();
        config.headers = config.headers || {};

        if (decoded?.exp && decoded.exp < currentTime) {
          const data = await UserServices.refreshToken();
          const newAccessToken = data?.access_token;
          localStorage.setItem('access_token', JSON.stringify(newAccessToken));
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } else if (storageData && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${storageData}`;
        }

        return config;
      },
      (err) => Promise.reject(err)
    );

    return () => UserServices.axiosJWT.interceptors.request.eject(interceptorId);
  }, [handleDecoded]);

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
      <div>
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
                      <ProtectedRoute isPrivate={route.isPrivate} isAdminRoute={route.isAdmin}>
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
    </ConfigProvider>
  );
}

export default App;
