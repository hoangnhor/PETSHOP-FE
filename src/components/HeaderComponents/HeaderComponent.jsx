import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { Form, Input, Modal, Tabs, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import { resetUser, updateUser } from "../../redux/slides/userSlider";
import * as UserServices from "../../services/UserServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import "./headerRedesign.css";

const readCount = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch (error) {
    return 0;
  }
};

const HeaderComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [keyword, setKeyword] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [cartCount, setCartCount] = useState(() => readCount("cartItems"));
  const [wishlistCount, setWishlistCount] = useState(() => readCount("wishlistItems"));
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotForm] = Form.useForm();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const auth = params.get("auth");
    if (auth === "login" || auth === "register" || auth === "forgot") {
      setAuthOpen(true);
      setActiveAuthTab(auth);
      const nextParams = new URLSearchParams(location.search);
      nextParams.delete("auth");
      const nextSearch = nextParams.toString();
      navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ""}${location.hash || ""}`, { replace: true });
    }
  }, [location.search, location.pathname, location.hash, navigate]);

  useEffect(() => {
    const sync = () => {
      setCartCount(readCount("cartItems"));
      setWishlistCount(readCount("wishlistItems"));
    };

    window.addEventListener("storage", sync);
    window.addEventListener("cart-updated", sync);
    window.addEventListener("wishlist-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("wishlist-updated", sync);
    };
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnOutside = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".profile-menu-wrap")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", closeOnOutside);
    return () => document.removeEventListener("click", closeOnOutside);
  }, []);

  const goSearch = () => {
    const value = keyword.trim();
    navigate(value ? `/search?keyword=${encodeURIComponent(value)}` : "/products");
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      goSearch();
    }
  };

  const handleProfileKeyDown = (event) => {
    if (event.key === "Escape") setProfileOpen(false);
  };

  const handleNavTarget = (targetId) => {
    if (location.pathname === "/") {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(`/#${targetId}`);
  };

  const handleLogout = async () => {
    try {
      await UserServices.logoutUser();
    } catch (error) {
      // reset local state even if API logout failed to keep UI consistent
    } finally {
      localStorage.removeItem("access_token");
      dispatch(resetUser());
      setProfileOpen(false);
      message.success("Đã đăng xuất");
      navigate("/");
    }
  };

  const profileName = user?.name ? String(user.name).trim() : "Tài khoản";
  const avatarLetter = profileName.charAt(0).toUpperCase();
  const isHome = location.pathname === "/";
  const isProducts = location.pathname.startsWith("/products") || location.pathname.startsWith("/product-detail");
  const isServices = location.pathname.startsWith("/services");
  const isContact = location.pathname.startsWith("/contact");
  const isLoggedIn = Boolean(user?.access_token);
  const cartQuery = useQuery({
    queryKey: ["header-cart-count", user?.access_token],
    queryFn: () => CartServices.getMyCart(user.access_token),
    enabled: isLoggedIn,
    refetchOnWindowFocus: true,
  });
  const wishlistQuery = useQuery({
    queryKey: ["header-wishlist-count", user?.access_token],
    queryFn: () => WishlistServices.getMyWishlist(user.access_token),
    enabled: isLoggedIn,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    const serverCartCount = (cartQuery.data?.data?.items || []).length;
    const serverWishlistCount = (wishlistQuery.data?.data?.productIds || []).length;
    setCartCount(serverCartCount);
    setWishlistCount(serverWishlistCount);
  }, [isLoggedIn, cartQuery.data, wishlistQuery.data]);
  const isFeaturedHash = location.pathname === "/" && activeHash === "#featured";
  const isFlashHash = location.pathname === "/" && activeHash === "#flash-sale";
  const isContactHash = location.pathname === "/" && activeHash === "#contact";

  const hydrateUserFromToken = async (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded?.id) {
        const details = await UserServices.getDetailsUser(decoded.id, token);
        dispatch(updateUser({ ...details?.data, access_token: token }));
        return;
      }
      dispatch(updateUser({ access_token: token, name: "Tài khoản", isAdmin: Boolean(decoded?.isAdmin) }));
    } catch (error) {
      dispatch(updateUser({ access_token: token }));
    }
  };

  const onLogin = async (values) => {
    setSubmitting(true);
    try {
      const res = await UserServices.loginUser(values);
      const token = res?.access_token;
      if (!token) throw new Error(res?.message || "Đăng nhập thất bại");
      localStorage.setItem("access_token", JSON.stringify(token));
      await hydrateUserFromToken(token);
      setAuthOpen(false);
      loginForm.resetFields();
      message.success("Đăng nhập thành công");
    } catch (error) {
      message.error(error?.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = async (values) => {
    setSubmitting(true);
    try {
      const res = await UserServices.SignupUser(values);
      if (res?.status && res.status !== "OK") {
        throw new Error(res?.message || "Đăng ký thất bại");
      }
      registerForm.resetFields();
      setActiveAuthTab("login");
      message.success("Đăng ký thành công, vui lòng đăng nhập");
    } catch (error) {
      message.error(error?.message || "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const onForgotPassword = async (values) => {
    setSubmitting(true);
    try {
      if (!values?.email) throw new Error("Nhập email");
      await new Promise((resolve) => setTimeout(resolve, 500));
      forgotForm.resetFields();
      setActiveAuthTab("login");
      message.success("Đã gửi yêu cầu khôi phục mật khẩu");
    } catch (error) {
      message.error(error?.message || "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <header className="site-header">
      <div className="header">
        <div className="container header-main">
          <button type="button" className="logo" onClick={() => navigate("/")}>pet<span>shop</span></button>

          <div className="search">
            <input
              type="search"
              placeholder="Tìm thức ăn, phụ kiện, dịch vụ chăm sóc..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button type="button" className="search-btn" aria-label="Tìm kiếm" onClick={goSearch}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="search-icon">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.2-3.2" />
              </svg>
            </button>
          </div>

          <div className="actions">
            <button type="button" className="hbtn" onClick={() => navigate("/wishlist")}>
              <svg viewBox="0 0 24 24" className="hicon" aria-hidden="true">
                <path d="M12 20s-7-4.4-9-8.5C1.5 8.2 3.5 5 7 5c2 0 3.2 1.1 5 3 1.8-1.9 3-3 5-3 3.5 0 5.5 3.2 4 6.5C19 15.6 12 20 12 20Z" />
              </svg>
              <span className="hbtn-label">Yêu thích</span>
              <span className="badge">{wishlistCount}</span>
            </button>

            <button type="button" className="hbtn" onClick={() => navigate("/cart")}>
              <svg viewBox="0 0 24 24" className="hicon" aria-hidden="true">
                <circle cx="9" cy="20" r="1.7" />
                <circle cx="17" cy="20" r="1.7" />
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7" />
                <path d="M9 11h8" />
              </svg>
              <span className="hbtn-label">Giỏ hàng</span>
              <span className="badge">{cartCount}</span>
            </button>

            <div className="profile-menu-wrap">
              <button
                type="button"
                className="hbtn profile"
                aria-haspopup="menu"
                aria-expanded={isLoggedIn && profileOpen}
                onClick={() => {
                  if (!isLoggedIn) {
                    setAuthOpen(true);
                    return;
                  }
                  setProfileOpen((prev) => !prev);
                }}
                onKeyDown={handleProfileKeyDown}
              >
              <span className="avatar" aria-hidden="true">{avatarLetter}</span>
              <span className="profile-name">{profileName}</span>
              <svg viewBox="0 0 24 24" className="hicon profile-caret" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
              </button>
              {isLoggedIn && profileOpen ? (
                <div className="profile-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>Hồ sơ của tôi</button>
                  <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/order-history"); }}>Lịch sử đơn hàng</button>
                  {user?.isAdmin ? <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/admin"); }}>Quản trị</button> : null}
                  <button type="button" role="menuitem" onClick={handleLogout}>Đăng xuất</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="nav-wrap">
          <nav className="container nav">
            <button type="button" className={isFeaturedHash ? "active" : ""} onClick={() => handleNavTarget("featured")}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 20s-7-4.4-9-8.5C1.5 8.2 3.5 5 7 5c2 0 3.2 1.1 5 3 1.8-1.9 3-3 5-3 3.5 0 5.5 3.2 4 6.5C19 15.6 12 20 12 20Z" />
                </svg>
              </span>
              Bộ sưu tập nổi bật
            </button>
            <button type="button" className={isFlashHash ? "active" : ""} onClick={() => handleNavTarget("flash-sale")}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M20 13l-7 7L4 11V4h7l9 9z" />
                  <circle cx="8.5" cy="8.5" r="1.4" />
                </svg>
              </span>
              Giảm giá
            </button>
            <button type="button" className={isHome ? "active" : ""} onClick={() => navigate("/")}>Trang chủ</button>
            <button type="button" className={isProducts ? "active" : ""} onClick={() => navigate("/products")}>Sản phẩm</button>
            <button type="button" className={isServices ? "active" : ""} onClick={() => navigate("/services")}>Dịch vụ</button>
            <button type="button" className={isContact || isContactHash ? "active" : ""} onClick={() => navigate("/contact")}>Liên hệ</button>
          </nav>
        </div>
      </div>

      <Modal
        open={authOpen}
        onCancel={() => setAuthOpen(false)}
        keyboard
        maskClosable={!submitting}
        footer={null}
        centered
        width={460}
        title="Tài khoản petshop"
        className="auth-modal"
      >
        <Tabs activeKey={activeAuthTab} onChange={setActiveAuthTab} items={[
          {
            key: "login",
            label: "Đăng nhập",
            children: (
              <Form form={loginForm} layout="vertical" onFinish={onLogin}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                  <Input placeholder="you@example.com" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <button className="auth-text-link" type="button" onClick={() => setActiveAuthTab("forgot")}>
                  Quên mật khẩu?
                </button>
                <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Đang xử lý..." : "Đăng nhập"}</button>
              </Form>
            ),
          },
          {
            key: "register",
            label: "Đăng ký",
            children: (
              <Form form={registerForm} layout="vertical" onFinish={onRegister}>
                <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                  <Input placeholder="you@example.com" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6, message: "Tối thiểu 6 ký tự" }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Nhập lại mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) return Promise.resolve();
                        return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Đang xử lý..." : "Đăng ký"}</button>
              </Form>
            ),
          },
          {
            key: "forgot",
            label: "Quên mật khẩu",
            children: (
              <Form form={forgotForm} layout="vertical" onFinish={onForgotPassword}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                  <Input placeholder="you@example.com" />
                </Form.Item>
                <button className="auth-text-link" type="button" onClick={() => setActiveAuthTab("login")}>
                  Quay lại đăng nhập
                </button>
                <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Đang xử lý..." : "Gửi yêu cầu"}</button>
              </Form>
            ),
          },
        ]} />
      </Modal>
    </header>
  );
};

export default HeaderComponent;
