import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as UserServices from "../../services/UserServices";
import * as message from "../../components/Message/Message";
import "../AuthPages/AuthPages.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      message.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    setSubmitting(true);
    try {
      const res = await UserServices.SignupUser(formData);
      if (res?.status && res.status !== "OK") throw new Error(res?.message || "Đăng ký thất bại");
      message.success("Đăng ký thành công, vui lòng đăng nhập");
      navigate("/login");
    } catch (error) {
      message.error(error?.message || "Đăng ký thất bại");
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
          <strong>Đăng ký</strong>
        </div>
        <section className="auth-wrap">
          <div className="card auth-card">
            <h1>Tạo tài khoản</h1>
            <p className="sub">Tạo tài khoản để mua hàng nhanh hơn và lưu thông tin giao hàng.</p>
            <form onSubmit={onSubmit}>
              <div className="field"><label>Họ tên</label><input name="name" placeholder="Nhập họ tên" value={formData.name} onChange={onChange} /></div>
              <div className="field"><label>Email</label><input name="email" type="email" placeholder="Nhập email" value={formData.email} onChange={onChange} /></div>
              <div className="field"><label>Số điện thoại</label><input name="phone" placeholder="Nhập số điện thoại" value={formData.phone} onChange={onChange} /></div>
              <div className="field"><label>Mật khẩu</label><input name="password" type="password" placeholder="Tạo mật khẩu" value={formData.password} onChange={onChange} /></div>
              <button className="btn" type="submit" disabled={submitting}>
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>
                {submitting ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>
            <div className="auth-links">
              <button className="auth-link" type="button" onClick={() => navigate("/login")}>Đã có tài khoản? Đăng nhập</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
