import React from "react";
import { useNavigate } from "react-router-dom";
import "../HeaderComponents/headerRedesign.css";

const FooterComponent = () => {
  const navigate = useNavigate();

  return (
    <div className="site-footer">
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>petshop</h3>
            <p>
              Cửa hàng thương mại điện tử cho thú cưng, tập trung vào sản phẩm chính hãng,
              tư vấn dễ hiểu và trải nghiệm mua sắm nhanh.
            </p>
            <div className="socials">
              <a href="#!" aria-label="Facebook">
                <svg className="ficon" viewBox="0 0 24 24"><path d="M15 8h-2a2 2 0 0 0-2 2v2h4l-.7 4H11v4H7v-4H4v-4h3v-2a6 6 0 0 1 6-6h2v4z" /></svg>
              </a>
              <a href="#!" aria-label="Instagram">
                <svg className="ficon" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r="1" /></svg>
              </a>
              <a href="#!" aria-label="YouTube">
                <svg className="ficon" viewBox="0 0 24 24"><path d="M21 8.5s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C15.4 5.3 12 5.3 12 5.3h0s-3.4 0-6.2.2c-.4.1-1.2.1-2 .9C3.2 7 3 8.5 3 8.5S2.8 10.2 2.8 12s.2 3.5.2 3.5.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 5.8.2 5.8.2s3.4 0 6.2-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5-.2-3.5-.2-3.5z" /><path d="m10 15 5-3-5-3z" /></svg>
              </a>
              <a href="#!" aria-label="TikTok">
                <svg className="ficon" viewBox="0 0 24 24"><path d="M14 4v9.2a3.2 3.2 0 1 1-3-3.2" /><path d="M14 6.5a4.5 4.5 0 0 0 4.5 4.5" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h3>Bản đồ</h3>
            <img
              className="map"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
              alt="Bản đồ cửa hàng"
            />
          </div>

          <div className="footer-contact">
            <h3>Liên hệ</h3>
            <p><svg className="ficon" viewBox="0 0 24 24"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>Email: support@petshop.vn</p>
            <p><svg className="ficon" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.7a13 13 0 0 0 4.8 4.8L15 13l5 2v4a2 2 0 0 1-2.2 2c-7.1-.8-12-5.7-12.8-12.8A2 2 0 0 1 5 4z" /></svg>Hotline: 0909 888 777</p>
            <p><svg className="ficon" viewBox="0 0 24 24"><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>Địa chỉ: 123 Nguyễn Văn Cừ, TP.HCM</p>
            <p><svg className="ficon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></svg>Giờ làm việc: 08:00 - 21:00 mỗi ngày</p>
          </div>

          <div>
            <h3>Chính sách</h3>
            <p>Chính sách đổi trả</p>
            <p>Vận chuyển & thanh toán</p>
            <p>Bảo mật thông tin</p>
            <p><a href="/contact" className="footer-inline-link">Liên hệ hỗ trợ</a></p>

            <div className="footer-btns">
              <button type="button" onClick={() => navigate("/products")}>Mua sắm ngay</button>
              <button type="button" onClick={() => navigate("/services")}>Đặt dịch vụ</button>
            </div>
          </div>
        </div>
        <div className="container copyright">
          <span>© 2026 petshop. All rights reserved.</span>
          <span>Thanh toán: COD · Banking · Ví điện tử</span>
        </div>
      </footer>

      <a className="float" href="/contact" title="Liên hệ nhanh" aria-label="Liên hệ nhanh">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 6h14v9H8l-3 3V6Z" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
        </svg>
      </a>
    </div>
  );
};

export default FooterComponent;
