import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccessPage.css";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("orderId");

  return (
    <div className="order-success-view">
      <main className="container page">
        <div className="order-success-wrap">
          <section className="card order-success-card">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
            <h1>Đặt hàng thành công</h1>
            <p className="sub">
              {orderId ? `Cảm ơn bạn đã mua hàng tại petshop. Đơn hàng #${orderId.slice(-8).toUpperCase()} đã được ghi nhận.` : "Cảm ơn bạn đã mua hàng tại petshop."}
            </p>
            <div className="actions">
              <button className="btn" type="button" onClick={() => navigate(orderId ? `/order-detail/${orderId}` : "/order-history")}>
                Xem đơn hàng
              </button>
              <button className="btn" type="button" onClick={() => navigate("/products")}>
                Tiếp tục mua sắm
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccessPage;
