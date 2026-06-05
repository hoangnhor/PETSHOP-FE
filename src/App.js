import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { App as AntdApp, ConfigProvider } from "antd";
import DefaultComponents from "./components/DefaultComponents/DefaultComponents";
import Loading from "./components/LoadingComponent/Loading";
import { routes } from "./routes";
import ToastProvider from "./components/ui/feedback/ToastProvider";
import { warmupBackend } from "./services/backendWarmup";
import { useBootstrapAuth } from "./hooks/useBootstrapAuth";

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
      const target = document.getElementById(hash.replace("#", ""));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

function App() {
  const { isPending, authReady } = useBootstrapAuth();

  useEffect(() => {
    void warmupBackend({ attempts: 6, timeoutMs: 2500, baseDelayMs: 1800 });
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1A1A1A",
          colorInfo: "#1A1A1A",
          colorSuccess: "#A67C52",
          colorWarning: "#D4B483",
          colorError: "#8a3d3d",
          borderRadius: 12,
          colorBgContainer: "#ffffff",
          colorBorder: "rgba(198,169,105,.28)",
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <AntdApp>
        <ToastProvider />
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
