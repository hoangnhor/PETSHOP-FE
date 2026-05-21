import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="notfound-view">
      <main className="container page">
        <section className="card notfound-card">
          <div className="icon-wrap">
            <svg className="icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M20 20l-4.2-4.2"></path>
            </svg>
          </div>
          <h1 className="page-title">Không tìm thấy trang</h1>
          <p className="sub">Trang bạn đang truy cập không tồn tại hoặc đã được chuyển sang địa chỉ khác.</p>
          <button className="btn" type="button" onClick={() => navigate("/")}>Quay về trang chủ</button>
        </section>
      </main>
    </div>
  );
};

export default NotFoundPage;
