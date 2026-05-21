import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as message from "../../components/Message/Message";
import "../AuthPages/AuthPages.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      message.error("Vui lòng nhập email tài khoản");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      message.success("Đã gửi yêu cầu khôi phục mật khẩu");
      navigate("/login");
    }, 500);
  };

  return (
    <div className="auth-page-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
          <strong>Quên mật khẩu</strong>
        </div>
        <section className="auth-wrap">
          <div className="card auth-card">
            <h1>Quên mật khẩu</h1>
            <p className="sub">Nhập email để nhận hướng dẫn khôi phục mật khẩu.</p>
            <form onSubmit={onSubmit}>
              <div className="field"><label>Email</label><input type="email" placeholder="Nhập email tài khoản" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <button className="btn" type="submit" disabled={submitting}>
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>
                {submitting ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>
            </form>
            <div className="auth-links">
              <button className="auth-link" type="button" onClick={() => navigate("/login")}>Quay lại đăng nhập</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
