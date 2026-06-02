import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as UserServices from "../../services/UserServices";
import { updateUser } from "../../redux/slides/userSlider";
import * as message from "../../components/Message/Message";
import { setAccessToken } from "../../services/authToken";
import {
  syncAuthAfterLogin,
} from "../../services/authMergeServices";
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
      setAccessToken(token);
      const syncResult = await syncAuthAfterLogin(token, (payload) => dispatch(updateUser(payload)));
      if (syncResult.failedCount > 0) {
        message.warning("Đăng nhập thành công, nhưng một phần dữ liệu chưa đồng bộ");
      }
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
