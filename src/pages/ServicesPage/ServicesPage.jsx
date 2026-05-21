import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { serviceCatalog } from "../../data/serviceCatalog";
import * as ServiceServices from "../../services/ServiceServices";
import { ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import "./ServicesPage.css";

const steps = [
  {
    title: "Chọn dịch vụ",
    text: "Chọn gói phù hợp theo nhu cầu chăm sóc, kích thước và tình trạng thú cưng.",
  },
  {
    title: "Gửi thông tin",
    text: "Để lại số điện thoại, ngày giờ mong muốn và ghi chú riêng nếu có.",
  },
  {
    title: "Xác nhận lịch",
    text: "petshop liên hệ xác nhận trong 30 phút làm việc để chốt khung giờ.",
  },
  {
    title: "Sử dụng dịch vụ",
    text: "Đưa thú cưng đến cửa hàng hoặc dùng dịch vụ đón trả nếu có hỗ trợ.",
  },
];

const whyItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="why-icon">
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
      </svg>
    ),
    title: "An toàn là ưu tiên",
    text: "Quy trình chăm sóc nhẹ nhàng, theo dõi phản ứng của thú cưng trong suốt buổi dịch vụ.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="why-icon">
        <path d="M12 2l2.7 6.3L21 9l-4.8 4.2L17.6 20 12 16.5 6.4 20l1.4-6.8L3 9l6.3-.7L12 2z" />
      </svg>
    ),
    title: "Kỹ thuật viên rõ quy trình",
    text: "Đội ngũ nắm tiêu chuẩn grooming cơ bản và tư vấn dễ hiểu cho chủ nuôi.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="why-icon">
        <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1.1L3 21l1.6-5.1A8.5 8.5 0 1 1 21 12z" />
      </svg>
    ),
    title: "Hỗ trợ sau dịch vụ",
    text: "petshop có thể nhắc lịch chăm sóc tiếp theo và tư vấn sản phẩm phù hợp.",
  },
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const servicesQuery = useQuery({
    queryKey: ["services-page"],
    queryFn: () => ServiceServices.getAllServices({ limit: 100 }),
  });

  const apiServices = servicesQuery?.data?.data || [];

  const services = (Array.isArray(apiServices) && apiServices.length > 0
    ? apiServices.map((service) => ({
        slug: service.slug,
        title: service.name,
        price: `Từ ${Number(service.salePrice > 0 ? service.salePrice : service.price || 0).toLocaleString("vi-VN")}đ`,
        image: service.image || "/service-images/service-spa-thu-cung.jpg",
        shortDescription: service.description || "Dịch vụ chăm sóc thú cưng.",
        duration: `${Number(service.durationMin || 60)} phút`,
      }))
    : serviceCatalog).slice(0, 4) || [];

  if (servicesQuery.isLoading) {
    return (
      <div className="services-view">
        <main className="container page">
          <LoadingState text="Đang tải danh sách dịch vụ..." />
        </main>
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <div className="services-view">
        <main className="container page">
          <ErrorState message="Không thể tải danh sách dịch vụ." onRetry={() => servicesQuery.refetch()} />
        </main>
      </div>
    );
  }

  return (
    <div className="services-view">
      <main className="container page">
        <div className="breadcrumb">
          <button type="button" onClick={() => navigate("/")}>petshop</button>
          <svg viewBox="0 0 24 24" className="breadcrumb-arrow"><path d="M9 18l6-6-6-6" /></svg>
          <strong>Dịch vụ</strong>
        </div>

        <section className="hero-box">
          <div className="eyebrow">
            <PetshopIcon name="star" size={14} />
            Pet care services
          </div>
          <h1>Dịch vụ chăm sóc thú cưng theo nhu cầu thực tế</h1>
          <p>Đội ngũ kỹ thuật viên hỗ trợ theo tình trạng thú cưng, lịch trình của bạn và tiêu chuẩn chăm sóc an toàn tại petshop.</p>

          <div className="chips">
            <span className="chip"><PetshopIcon name="star" size={14} />4.9/5 đánh giá dịch vụ</span>
            <span className="chip"><PetshopIcon name="clock" size={14} />Xác nhận lịch trong 30 phút</span>
            <span className="chip"><svg viewBox="0 0 24 24" className="chip-icon"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"></path></svg>Kỹ thuật viên chứng chỉ grooming</span>
          </div>
        </section>

        <section>
          <div className="section-head">
            <div>
              <h2>Gói dịch vụ nổi bật</h2>
              <p>Chọn nhanh dịch vụ phù hợp cho thú cưng của bạn</p>
            </div>
            <button type="button" className="view" onClick={() => navigate("/contact")}>
              <svg viewBox="0 0 24 24" className="view-icon"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 9h18"></path><path d="M5 5h14v16H5z"></path></svg>
              Xem lịch trống
            </button>
          </div>

          <div className="services">
            {services.map((service, index) => (
              <article className="service-card" key={service.slug || `${service.title}-${index}`}>
                <span className="service-tag">Dịch vụ</span>
                <div className="service-img"><img src={service.image} alt={service.title} /></div>
                <div className="service-body">
                  <h3>{service.title}</h3>
                  <div className="price">{service.price}</div>
                  <p className="desc">{service.shortDescription}</p>
                  <p className="note"><PetshopIcon name="clock" size={13} />{service.duration} · Còn slot hôm nay</p>
                  <button type="button" className="btn" onClick={() => navigate(`/services/${service.slug}`)} disabled={!service.slug}>
                    <PetshopIcon name="eye" size={14} />
                    Xem chi tiết & đặt lịch
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="booking-wrap">
          <div className="process">
            <h2>Quy trình đặt lịch</h2>
            <div className="steps">
              {steps.map((step, index) => (
                <div className="step" key={step.title}>
                  <div className="step-icon">{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="booking-card">
            <h2>Đặt lịch nhanh</h2>

            <form className="mini-form" onSubmit={(event) => event.preventDefault()}>
              <input type="text" placeholder="Tên của bạn" />
              <input type="tel" placeholder="Số điện thoại" />
              <select defaultValue="">
                <option value="" disabled>Chọn dịch vụ</option>
                {services.map((service) => (
                  <option key={service.slug || service.title} value={service.slug || ""}>{service.title}</option>
                ))}
              </select>
              <input type="datetime-local" />
              <textarea placeholder="Ghi chú về thú cưng" />
              <button className="btn" type="submit">
                <svg viewBox="0 0 24 24" className="send-icon"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                Gửi yêu cầu đặt lịch
              </button>
            </form>
          </aside>
        </section>

        <section className="why">
          {whyItems.map((item) => (
            <div className="why-card" key={item.title}>
              {item.icon}
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ServicesPage;
