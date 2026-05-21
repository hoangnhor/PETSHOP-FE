import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import * as UserServices from "../../services/UserServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import { updateUser } from "../../redux/slides/userSlider";
import * as message from "../../components/Message/Message";
import "../AuthPages/AuthPages.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const mergeGuestCartOnLogin = async (token) => {
    const localItems = JSON.parse(localStorage.getItem("cartItems") || "[]")
      .filter((item) => item?.idsp && Number(item?.quantity || 0) > 0);
    if (!localItems.length) return;

    const serverRes = await CartServices.getMyCart(token);
    const serverItems = (serverRes?.data?.items || []).map((item) => ({
      idsp: item.productId,
      quantity: Number(item.quantity || 1),
    }));

    const merged = new Map();
    serverItems.forEach((item) => merged.set(item.idsp, Number(item.quantity || 0)));
    localItems.forEach((item) => merged.set(item.idsp, Number(merged.get(item.idsp) || 0) + Number(item.quantity || 0)));

    const mergedItems = Array.from(merged.entries()).map(([idsp, quantity]) => ({ idsp, quantity }));
    await CartServices.updateMyCart(
      { items: mergedItems.map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) })) },
      token
    );
    const localMerged = localItems.map((item) => {
      const qty = Number(merged.get(item.idsp) || item.quantity || 1);
      return { ...item, quantity: qty };
    });
    localStorage.setItem("cartItems", JSON.stringify(localMerged));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const mergeGuestWishlistOnLogin = async (token) => {
    const localWishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]").filter((item) => item?.idsp);
    const localIds = [...new Set(localWishlistItems.map((item) => String(item.idsp)))];
    if (!localIds.length) return;

    const serverRes = await WishlistServices.getMyWishlist(token);
    const serverIds = (serverRes?.data?.productIds || [])
      .map((item) => (typeof item === "string" ? item : item?._id || item?.id || item?.productId || ""))
      .filter(Boolean)
      .map((id) => String(id));
    const serverSet = new Set(serverIds);
    const missingIds = localIds.filter((id) => !serverSet.has(id));

    if (missingIds.length) {
      await Promise.all(missingIds.map((id) => WishlistServices.addWishlistItem(id, token).catch(() => null)));
    }

    localStorage.setItem("wishlistItems", JSON.stringify(localWishlistItems));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      message.error("Vui lòng nhập email và mật khẩu");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      message.error("Email không hợp lệ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await UserServices.loginUser(formData);
      const token = res?.access_token;
      if (!token) throw new Error(res?.message || "Đăng nhập thất bại");
      localStorage.setItem("access_token", JSON.stringify(token));
      await mergeGuestCartOnLogin(token);
      await mergeGuestWishlistOnLogin(token);
      await hydrateUserFromToken(token);
      message.success("Đăng nhập thành công");
      navigate("/profile");
    } catch (error) {
      message.error(error?.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
          <strong>Đăng nhập</strong>
        </div>
        <section className="auth-wrap">
          <div className="card auth-card">
            <h1>Đăng nhập</h1>
            <p className="sub">Truy cập tài khoản để quản lý đơn hàng, yêu thích và giỏ hàng.</p>
            <form onSubmit={onSubmit}>
              <div className="field"><label>Email</label><input name="email" type="email" placeholder="Nhập email" value={formData.email} onChange={onChange} /></div>
              <div className="field"><label>Mật khẩu</label><input name="password" type="password" placeholder="Nhập mật khẩu" value={formData.password} onChange={onChange} /></div>
              <button className="btn" type="submit" disabled={submitting}>
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>
                {submitting ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
            <div className="auth-links">
              <button className="auth-link" type="button" onClick={() => navigate("/forgot-password")}>Quên mật khẩu?</button>
              <button className="auth-link" type="button" onClick={() => navigate("/register")}>Tạo tài khoản</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
