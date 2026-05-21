import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { ConfigProvider } from 'antd';
import DefaultComponents from './components/DefaultComponents/DefaultComponents';
import Loading from './components/LoadingComponent/Loading';
import { routes } from './routes';
import * as UserServices from './services/UserServices';
import * as CartServices from './services/CartServices';
import * as WishlistServices from './services/WishlistServices';
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
  const CART_MERGE_MARKER = 'cart_login_merge_token';
  const WISHLIST_MERGE_MARKER = 'wishlist_login_merge_token';

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

  const mergeGuestCartAfterLogin = useCallback(async (token) => {
    try {
      const mergeMarker = localStorage.getItem(CART_MERGE_MARKER);
      if (mergeMarker === token) return;

      const localItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
        .filter((item) => item?.idsp && Number(item?.quantity || 0) > 0)
        .map((item) => ({
          idsp: item.idsp,
          quantity: Number(item.quantity || 1),
          name: item.name || '',
          image: item.image || '',
          price: Number(item.price || 0),
          discount: Number(item.discount || 0),
          countInStock: Number(item.countInStock || 0),
          category: item.category || 'Sản phẩm',
        }));

      if (!localItems.length) {
        localStorage.setItem(CART_MERGE_MARKER, token);
        return;
      }

      const serverRes = await CartServices.getMyCart(token);
      const serverItems = (serverRes?.data?.items || []).map((item) => ({
        idsp: item.productId,
        quantity: Number(item.quantity || 1),
        name: item.name || '',
        image: item.image || '',
        price: Number(item.price || 0),
        discount: Number(item.discount || 0),
        countInStock: Number(item.countInStock || 0),
        category: item.category || 'Sản phẩm',
      }));

      const mergedMap = new Map();
      serverItems.forEach((item) => {
        mergedMap.set(item.idsp, { ...item });
      });
      localItems.forEach((item) => {
        const existed = mergedMap.get(item.idsp);
        if (!existed) {
          mergedMap.set(item.idsp, { ...item });
          return;
        }
        mergedMap.set(item.idsp, { ...existed, quantity: Number(existed.quantity || 0) + Number(item.quantity || 0) });
      });

      const mergedItems = Array.from(mergedMap.values()).filter((item) => item.idsp && Number(item.quantity || 0) > 0);
      await CartServices.updateMyCart(
        {
          items: mergedItems.map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) })),
        },
        token
      );

      localStorage.setItem('cartItems', JSON.stringify(mergedItems));
      localStorage.setItem(CART_MERGE_MARKER, token);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      // Giữ dữ liệu local để tránh mất giỏ nếu merge thất bại
    }
  }, []);

  const mergeGuestWishlistAfterLogin = useCallback(async (token) => {
    try {
      const mergeMarker = localStorage.getItem(WISHLIST_MERGE_MARKER);
      if (mergeMarker === token) return;

      const localWishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]').filter((item) => item?.idsp);
      const localIds = [...new Set(localWishlistItems.map((item) => String(item.idsp)))];

      if (!localIds.length) {
        localStorage.setItem(WISHLIST_MERGE_MARKER, token);
        return;
      }

      const serverRes = await WishlistServices.getMyWishlist(token);
      const serverIds = (serverRes?.data?.productIds || [])
        .map((item) => {
          if (typeof item === 'string') return item;
          return item?._id || item?.id || item?.productId || '';
        })
        .filter(Boolean)
        .map((id) => String(id));

      const serverSet = new Set(serverIds);
      const missingIds = localIds.filter((id) => !serverSet.has(id));

      if (missingIds.length) {
        await Promise.all(missingIds.map((id) => WishlistServices.addWishlistItem(id, token).catch(() => null)));
      }

      localStorage.setItem('wishlistItems', JSON.stringify(localWishlistItems));
      localStorage.setItem(WISHLIST_MERGE_MARKER, token);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      // Giữ local wishlist để tránh mất dữ liệu nếu merge thất bại
    }
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const { storageData, decoded } = handleDecoded();
        const currentTime = new Date().getTime() / 1000;

        if (decoded?.id && decoded?.exp > currentTime && storageData) {
          await mergeGuestCartAfterLogin(storageData);
          await mergeGuestWishlistAfterLogin(storageData);
          await handleGetDetailsUser(decoded.id, storageData);
        } else if (storageData) {
          const data = await UserServices.refreshToken();
          const newAccessToken = data?.access_token;
          if (!newAccessToken) throw new Error('Không thể làm mới phiên đăng nhập');

          localStorage.setItem('access_token', JSON.stringify(newAccessToken));
          const refreshedDecoded = jwtDecode(newAccessToken);
          if (refreshedDecoded?.id) {
            await mergeGuestCartAfterLogin(newAccessToken);
            await mergeGuestWishlistAfterLogin(newAccessToken);
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
  }, [handleDecoded, handleGetDetailsUser, mergeGuestCartAfterLogin, mergeGuestWishlistAfterLogin]);

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
