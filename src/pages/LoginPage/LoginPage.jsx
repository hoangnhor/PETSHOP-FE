import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import * as UserServices from "../../services/UserServices";
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

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      message.error("Vui lòng nhập email và mật khẩu");
      return;
    }
    setSubmitting(true);
    try {
      const res = await UserServices.loginUser(formData);
      const token = res?.access_token;
      if (!token) throw new Error(res?.message || "Đăng nhập thất bại");
      localStorage.setItem("access_token", JSON.stringify(token));
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
