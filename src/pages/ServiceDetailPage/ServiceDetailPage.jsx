import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { serviceCatalog } from "../../data/serviceCatalog";
import * as ServiceServices from "../../services/ServiceServices";
import { EmptyState, ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import * as message from "../../components/Message/Message";
import "./ServiceDetailPage.css";

const defaultSteps = [
  { title: "Kiểm tra tình trạng da lông", text: "Kỹ thuật viên quan sát tình trạng lông, da và ghi nhận yêu cầu riêng." },
  { title: "Tắm gội và làm sạch", text: "Sử dụng quy trình nhẹ nhàng, phù hợp với chó/mèo theo từng tình trạng." },
  { title: "Sấy khô và vệ sinh cơ bản", text: "Sấy khô, vệ sinh tai cơ bản và kiểm tra lại trước khi bàn giao." },
  { title: "Tư vấn sau dịch vụ", text: "Gợi ý lịch chăm sóc, sản phẩm phù hợp và lưu ý tại nhà." },
];

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const detailQuery = useQuery({
    queryKey: ["service-detail", slug],
    queryFn: () => ServiceServices.getServiceBySlug(slug),
    enabled: Boolean(slug),
  });

  const service = useMemo(() => {
    const apiService = detailQuery?.data?.data;
    const localService = serviceCatalog.find((item) => item.slug === slug);
    if (!apiService) return localService;
    return {
      slug: apiService.slug,
      title: apiService.name,
      price: `Từ ${Number(apiService.salePrice > 0 ? apiService.salePrice : apiService.price || 0).toLocaleString("vi-VN")}đ`,
      image: apiService.image || localService?.image || "/service-images/service-spa-thu-cung.jpg",
      shortDescription: apiService.description || localService?.shortDescription || "",
      description: apiService.description || localService?.description || "",
      duration: `${Number(apiService.durationMin || 60)} phút`,
      species: apiService.species === "dog" ? "Chó" : apiService.species === "cat" ? "Mèo" : "Chó / Mèo",
      includes: Array.isArray(apiService.includes) ? apiService.includes : localService?.includes || [],
    };
  }, [detailQuery?.data?.data, slug]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    petType: "dog",
    petSize: "small",
    date: "",
    note: "",
  });

  const includes = useMemo(() => service?.includes || [], [service]);

  if (detailQuery.isLoading && !service) {
    return (
      <div className="service-detail-view">
        <main className="container page">
          <LoadingState text="Đang tải chi tiết dịch vụ..." />
        </main>
      </div>
    );
  }

  if (detailQuery.isError && !service) {
    return (
      <div className="service-detail-view">
        <main className="container page">
          <ErrorState message="Không thể tải chi tiết dịch vụ." onRetry={() => detailQuery.refetch()} />
        </main>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-view">
        <main className="container page">
          <EmptyState description="Không tìm thấy dịch vụ" actionText="Quay lại danh sách dịch vụ" onAction={() => navigate("/services")} />
        </main>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.date) {
      message.error("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Ngày đặt lịch");
      return;
    }
    message.success("Đặt lịch thành công. petshop sẽ liên hệ xác nhận trong 30 phút.");
    navigate(`/contact?service=${encodeURIComponent(service.title)}&date=${encodeURIComponent(formData.date)}`);
  };

  return (
    <div className="service-detail-view">
      <main className="container page">
        <div className="breadcrumb">
          <button type="button" onClick={() => navigate("/")}>petshop</button>
          <svg viewBox="0 0 24 24" className="breadcrumb-arrow"><path d="M9 18l6-6-6-6" /></svg>
          <button type="button" onClick={() => navigate("/services")}>Dịch vụ</button>
          <svg viewBox="0 0 24 24" className="breadcrumb-arrow"><path d="M9 18l6-6-6-6" /></svg>
          <strong>{service.title}</strong>
        </div>

        <div className="layout">
          <section className="card">
            <div className="service-image-box">
              <span className="service-tag"><PetshopIcon name="tag" size={13} />Chăm sóc</span>
              <img className="service-image" src={service.image} alt={service.title} />
            </div>

            <div className="headline">
              <h1>{service.title}</h1>
              <span className="rating"><PetshopIcon name="star" size={13} />4.9/5</span>
            </div>

            <div className="price-box">
              <div className="price">{service.price}</div>
              <div className="duration"><PetshopIcon name="clock" size={13} />{service.duration}</div>
            </div>

            <p className="desc">{service.description}</p>

            <div className="info-grid">
              <div className="info-box">
                <PetshopIcon name="heart" size={18} />
                <strong>Đối tượng</strong>
                <span>{service.species}</span>
              </div>
              <div className="info-box">
                <PetshopIcon name="check" size={18} />
                <strong>Tình trạng</strong>
                <span>Còn slot hôm nay</span>
              </div>
              <div className="info-box">
                <PetshopIcon name="star" size={18} />
                <strong>Cam kết</strong>
                <span>An toàn, nhẹ nhàng</span>
              </div>
            </div>

            <h2 className="section-title">Dịch vụ bao gồm</h2>
            <div className="list">
              {includes.length ? includes.map((item) => (
                <p key={item}><PetshopIcon name="check" size={13} />{item}</p>
              )) : <p><PetshopIcon name="check" size={13} />Nội dung gói dịch vụ đang cập nhật.</p>}
            </div>

            <h2 className="section-title">Quy trình thực hiện</h2>
            <div className="timeline">
              {defaultSteps.map((step, index) => (
                <div className="timeline-item" key={step.title}>
                  <div className="timeline-num">{index + 1}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card booking">
            <h2 className="form-title">Đặt lịch ngay</h2>
            <p className="form-sub">Điền thông tin cơ bản, petshop sẽ liên hệ xác nhận lịch trong 30 phút làm việc.</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>* Họ tên</label>
                <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Nhập họ tên" />
              </div>

              <div className="field">
                <label>* Số điện thoại</label>
                <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Nhập số điện thoại" />
              </div>

              <div className="form-row">
                <div className="field">
                  <label>* Loại thú cưng</label>
                  <select name="petType" value={formData.petType} onChange={handleChange}>
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                  </select>
                </div>

                <div className="field">
                  <label>Kích thước</label>
                  <select name="petSize" value={formData.petSize} onChange={handleChange}>
                    <option value="small">Nhỏ</option>
                    <option value="medium">Vừa</option>
                    <option value="large">Lớn</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>* Ngày đặt lịch</label>
                <input name="date" value={formData.date} onChange={handleChange} type="datetime-local" />
              </div>

              <div className="field">
                <label>Ghi chú</label>
                <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Tình trạng thú cưng hoặc yêu cầu thêm" />
              </div>

              <button className="btn" type="submit"><PetshopIcon name="check" size={13} />Xác nhận đặt lịch</button>
            </form>

            <div className="support-box">
              <strong>Cần tư vấn trước?</strong>
              Gọi hotline 0900 000 000 hoặc gửi ghi chú chi tiết, nhân viên sẽ hỗ trợ chọn gói phù hợp.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetailPage;
