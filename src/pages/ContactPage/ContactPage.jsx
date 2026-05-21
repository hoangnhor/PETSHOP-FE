import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import * as ContactServices from "../../services/ContactServices";
import * as message from "../../components/Message/Message";
import "./ContactPage.css";

const faqItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="faq-svg">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="1.7" />
        <circle cx="18" cy="19" r="1.7" />
      </svg>
    ),
    title: "petshop có giao hàng toàn quốc không?",
    text: "Có. Chúng tôi hỗ trợ giao hàng toàn quốc với nhiều đơn vị vận chuyển.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="faq-svg">
        <path d="M4 7h16" />
        <path d="M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
    ),
    title: "Tôi có thể đổi trả sản phẩm không?",
    text: "Bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm lỗi hoặc giao sai đơn.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="faq-svg">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 9h18" />
        <path d="M5 5h14v16H5z" />
      </svg>
    ),
    title: "Dịch vụ grooming có cần đặt lịch trước không?",
    text: "Có. Bạn nên đặt lịch trước để petshop chuẩn bị kỹ thuật viên và khung giờ phù hợp.",
  },
];

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    content: "",
  });

  const createContactMutation = useMutation({
    mutationFn: (payload) => ContactServices.createContact(payload),
  });

  useEffect(() => {
    const service = searchParams.get("service");
    if (service) {
      setFormData((prev) => ({ ...prev, content: `Tôi muốn đặt lịch dịch vụ: ${service}` }));
    }
  }, [searchParams]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.content.trim()) {
      message.error("Vui lòng nhập Họ tên, Số điện thoại và Nội dung");
      return;
    }
    try {
      const res = await createContactMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        content: formData.content.trim(),
      });
      if (res?.status !== "OK") {
        throw new Error(res?.message || "Không thể gửi liên hệ");
      }
      message.success("Cảm ơn bạn, petshop sẽ liên hệ lại sớm");
      setFormData({ name: "", email: "", phone: "", content: "" });
    } catch (error) {
      message.error(error?.message || "Không thể gửi liên hệ");
    }
  };

  return (
    <div className="contact-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg viewBox="0 0 24 24" className="contact-icon-sm breadcrumb-arrow"><path d="M9 18l6-6-6-6" /></svg>
          <strong>Liên hệ</strong>
        </div>

        <section className="hero">
          <div className="eyebrow"><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1.1L3 21l1.6-5.1A8.5 8.5 0 1 1 21 12z" /></svg>Contact petshop</div>
          <h1>Liên hệ với petshop</h1>
          <p>Cần hỗ trợ về sản phẩm, đơn hàng, dịch vụ spa/grooming hoặc hợp tác cùng petshop? Gửi thông tin cho chúng tôi, đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.</p>
          <div className="quick-contact">
            <span className="quick-pill"><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M4 4h16v16H4z" /><path d="M4 7l8 6 8-6" /></svg>contact@petshop.com</span>
            <span className="quick-pill"><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M6 3h5l2 5-3 2c1.4 2.8 3.2 4.6 6 6l2-3 5 2v5c0 1-1 2-2 2C10.5 22 2 13.5 2 5c0-1 1-2 2-2h2z" /></svg>0900 000 000</span>
            <span className="quick-pill"><svg viewBox="0 0 24 24" className="contact-icon-sm"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>08:00 - 21:00 mỗi ngày</span>
          </div>
        </section>

        <section className="layout">
          <div className="card contact-form-card">
            <h2>Thông tin liên hệ</h2>
            <div className="info-grid">
              <div className="info">
                <div className="info-icon"><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M4 4h16v16H4z" /><path d="M4 7l8 6 8-6" /></svg></div>
                <div><small>Email hỗ trợ</small><p>contact@petshop.com</p></div>
              </div>
              <div className="info">
                <div className="info-icon"><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M6 3h5l2 5-3 2c1.4 2.8 3.2 4.6 6 6l2-3 5 2v5c0 1-1 2-2 2C10.5 22 2 13.5 2 5c0-1 1-2 2-2h2z" /></svg></div>
                <div><small>Hotline</small><p>0900 000 000</p></div>
              </div>
              <div className="info">
                <div className="info-icon"><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></div>
                <div><small>Địa chỉ cửa hàng</small><p>123 Pet Street, Quận 1, TP.HCM</p></div>
              </div>
              <div className="info">
                <div className="info-icon"><svg viewBox="0 0 24 24" className="contact-icon-sm"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></div>
                <div><small>Thời gian hoạt động</small><p>08:00 - 21:00 mỗi ngày</p></div>
              </div>
            </div>
            <img className="map" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop" alt="Bản đồ petshop" />
          </div>

          <div className="card">
            <h2>Gửi tin nhắn</h2>
            <form onSubmit={onSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Họ tên</label>
                  <input name="name" value={formData.name} onChange={onChange} type="text" placeholder="Nhập họ tên" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input name="email" value={formData.email} onChange={onChange} type="email" placeholder="Nhập email" />
                </div>
                <div className="field full">
                  <label>Số điện thoại</label>
                  <input name="phone" value={formData.phone} onChange={onChange} type="text" placeholder="Nhập số điện thoại" />
                </div>
                <div className="field full">
                  <label>Nội dung</label>
                  <textarea name="content" value={formData.content} onChange={onChange} placeholder="Nhập nội dung liên hệ..." />
                </div>
              </div>

              <button className="submit" type="submit" disabled={createContactMutation.isPending}><svg viewBox="0 0 24 24" className="contact-icon-sm"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>{createContactMutation.isPending ? "Đang gửi..." : "Gửi liên hệ"}</button>
            </form>
          </div>
        </section>

        <section className="faq">
          <div className="section-head">
            <div>
              <h2>Câu hỏi thường gặp</h2>
              <p>Một số thắc mắc phổ biến về mua hàng và dịch vụ tại petshop</p>
            </div>
          </div>

          <div className="faq-list">
            {faqItems.map((item) => (
              <div className="faq-item" key={item.title}>
                <div className="faq-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
