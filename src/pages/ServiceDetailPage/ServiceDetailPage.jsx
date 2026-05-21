import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { serviceCatalog } from "../../data/serviceCatalog";
import * as ServiceServices from "../../services/ServiceServices";
import * as AppointmentServices from "../../services/AppointmentServices";
import * as PetServices from "../../services/PetServices";
import { EmptyState, ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import * as message from "../../components/Message/Message";
import "./ServiceDetailPage.css";

const defaultSteps = [
  { title: "Kiểm tra tình trạng da lông", text: "Kỹ thuật viên quan sát tình trạng lông, da và ghi nhận yêu cầu riêng." },
  { title: "Tắm gội và làm sạch", text: "Sử dụng quy trình nhẹ nhàng, phù hợp với chó/mèo theo từng tình trạng." },
  { title: "Sấy khô và vệ sinh cơ bản", text: "Sấy khô, vệ sinh tai cơ bản và kiểm tra lại trước khi bàn giao." },
  { title: "Tư vấn sau dịch vụ", text: "Gợi ý lịch chăm sóc, sản phẩm phù hợp và lưu ý tại nhà." },
];

const toDateTimeLocalMin = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const getServiceTag = (service = {}) => {
  const slug = String(service?.slug || "").toLowerCase();
  if (slug.includes("khach-san")) return "Lưu trú";
  if (slug.includes("kham") || slug.includes("thu-y")) return "Thú y";
  if (slug.includes("groom")) return "Grooming";
  if (slug.includes("spa")) return "Spa";
  return "Dịch vụ";
};

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.user);

  const detailQuery = useQuery({
    queryKey: ["service-detail", slug],
    queryFn: () => ServiceServices.getServiceBySlug(slug),
    enabled: Boolean(slug),
  });
  const petsQuery = useQuery({
    queryKey: ["service-booking-pets", user?.access_token],
    queryFn: () => PetServices.getMyPets(user.access_token),
    enabled: Boolean(user?.access_token),
  });

  const service = useMemo(() => {
    const apiService = detailQuery?.data?.data;
    const localService = serviceCatalog.find((item) => item.slug === slug);
    if (!apiService) return localService;
    const speciesRaw = String(apiService.species || "").toLowerCase();
    const speciesLabel = speciesRaw === "dog"
      ? "Chó"
      : speciesRaw === "cat"
        ? "Mèo"
        : localService?.species || "Chó / Mèo";
    const resolvedPrice = Number(apiService.salePrice > 0 ? apiService.salePrice : apiService.price || 0);
    const localPriceSuffix = String(localService?.price || "").includes("/ đêm") ? " / đêm" : "";
    const priceLabel = resolvedPrice > 0
      ? `Từ ${resolvedPrice.toLocaleString("vi-VN")}đ${localPriceSuffix}`
      : localService?.price || "Liên hệ";
    const durationLabel = Number(apiService.durationMin || 0) > 0
      ? `${Number(apiService.durationMin)} phút`
      : localService?.duration || "Đang cập nhật";
    const resolvedIncludes = Array.isArray(apiService.includes)
      ? apiService.includes
          .map((item) => (typeof item === "string" ? item.trim() : String(item?.name || "").trim()))
          .filter(Boolean)
      : localService?.includes || [];
    const resolvedSubServices = Array.isArray(apiService.subServices) && apiService.subServices.length > 0
      ? apiService.subServices
          .map((item) => ({
            name: String(item?.name || "").trim(),
            price: String(item?.price || "").trim(),
            duration: String(item?.duration || "").trim(),
          }))
          .filter((item) => item.name)
      : localService?.subServices || [];

    return {
      _id: apiService._id || "",
      slug: apiService.slug || localService?.slug || slug,
      title: apiService.name || localService?.title || "Dịch vụ",
      price: priceLabel,
      image: apiService.image || localService?.image || "/service-images/service-spa-thu-cung.jpg",
      shortDescription: apiService.description || localService?.shortDescription || "",
      description: apiService.description || localService?.description || "",
      duration: durationLabel,
      species: speciesLabel,
      includes: resolvedIncludes,
      subServices: resolvedSubServices,
    };
  }, [detailQuery?.data?.data, slug]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    petType: "dog",
    petName: "",
    petSize: "small",
    date: "",
    note: "",
  });
  const [selectedPetId, setSelectedPetId] = useState("");

  const createAppointmentMutation = useMutation({
    mutationFn: ({ payload, accessToken }) => AppointmentServices.createAppointment(payload, accessToken),
  });

  const includes = useMemo(() => service?.includes || [], [service]);
  const subServices = useMemo(() => service?.subServices || [], [service]);
  const myPets = useMemo(() => petsQuery.data?.data || [], [petsQuery.data?.data]);

  useEffect(() => {
    const prefillPetId = searchParams.get("petId");
    const prefillPetName = searchParams.get("petName");
    const prefillPetType = searchParams.get("petType");
    if (prefillPetId) {
      setSelectedPetId(prefillPetId);
    }
    if (prefillPetName || prefillPetType) {
      setFormData((prev) => ({
        ...prev,
        petName: prefillPetName || prev.petName,
        petType: prefillPetType === "cat" ? "cat" : prefillPetType === "dog" ? "dog" : prev.petType,
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedPetId || !myPets.length) return;
    const pet = myPets.find((item) => item._id === selectedPetId);
    if (!pet) return;
    setFormData((prev) => ({
      ...prev,
      petName: pet.name || prev.petName,
      petType: pet.species === "cat" ? "cat" : pet.species === "dog" ? "dog" : prev.petType,
      note: prev.note || pet.notes || "",
    }));
  }, [selectedPetId, myPets]);

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

  const handlePetSelect = (event) => {
    const nextPetId = event.target.value;
    setSelectedPetId(nextPetId);
    if (!nextPetId) {
      setFormData((prev) => ({ ...prev, petName: "", petType: "dog" }));
      return;
    }
    const pet = myPets.find((item) => item._id === nextPetId);
    if (!pet) return;
    setFormData((prev) => ({
      ...prev,
      petName: pet.name || prev.petName,
      petType: pet.species === "cat" ? "cat" : pet.species === "dog" ? "dog" : prev.petType,
      note: prev.note || pet.notes || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.date) {
      message.error("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Ngày đặt lịch");
      return;
    }
    if (!selectedPetId && !formData.petName.trim()) {
      message.error("Vui lòng chọn thú cưng hoặc nhập tên thú cưng mới");
      return;
    }
    const normalizedPhone = formData.phone.replace(/\D/g, "");
    if (normalizedPhone.length < 9 || normalizedPhone.length > 11) {
      message.error("Số điện thoại không hợp lệ");
      return;
    }
    const selectedDate = new Date(formData.date);
    if (!Number.isFinite(selectedDate.getTime()) || selectedDate.getTime() < Date.now()) {
      message.error("Vui lòng chọn ngày giờ trong tương lai");
      return;
    }
    if (!user?.access_token || !user?.id) {
      message.error("Vui lòng đăng nhập để đặt lịch dịch vụ");
      navigate("/sign-in");
      return;
    }
    if (!service?._id) {
      message.error("Dịch vụ này chưa đồng bộ DB, chuyển sang trang liên hệ để xác nhận thủ công");
      const params = new URLSearchParams({
        service: service.title,
        date: formData.date,
        petType: formData.petType,
        petSize: formData.petSize,
        note: formData.note || "",
      });
      navigate(`/contact?${params.toString()}`);
      return;
    }
    try {
      const payload = {
        petId: selectedPetId || undefined,
        petName: selectedPetId ? undefined : formData.petName.trim(),
        petSpecies: selectedPetId ? undefined : formData.petType,
        serviceIds: [service._id],
        scheduleAt: selectedDate.toISOString(),
        customerNote: formData.note?.trim() || `Kích thước: ${formData.petSize}`,
      };
      const res = await createAppointmentMutation.mutateAsync({ payload, accessToken: user.access_token });
      if (res?.status !== "OK") {
        throw new Error(res?.message || "Không thể đặt lịch");
      }
      message.success("Đặt lịch thành công. petshop sẽ liên hệ xác nhận sớm.");
      setFormData({
        name: "",
        phone: "",
        petType: "dog",
        petName: "",
        petSize: "small",
        date: "",
        note: "",
      });
      setSelectedPetId("");
      navigate("/my-appointments", {
        state: {
          highlightAppointmentId: res?.data?._id || "",
        },
      });
      return;
    } catch (error) {
      message.error(error?.message || "Không thể đặt lịch");
    }
    const params = new URLSearchParams({
      service: service.title,
      date: formData.date,
      petType: formData.petType,
      petSize: formData.petSize,
      note: formData.note || "",
    });
    navigate(`/contact?${params.toString()}`);
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
              <span className="service-tag"><PetshopIcon name="tag" size={13} />{getServiceTag(service)}</span>
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

            <h2 className="section-title">Gói dịch vụ chi tiết</h2>
            <div className="subservice-list">
              {subServices.length ? subServices.map((item, index) => (
                <div className="subservice-item" key={`${item.name}-${index}`}>
                  <div>
                    <h3>{item.name}</h3>
                    <p><PetshopIcon name="clock" size={13} />{item.duration}</p>
                  </div>
                  <strong>{item.price}</strong>
                </div>
              )) : (
                <div className="subservice-item">
                  <div>
                    <h3>Đang cập nhật</h3>
                    <p><PetshopIcon name="clock" size={13} />Thông tin gói nhỏ sẽ được cập nhật sớm.</p>
                  </div>
                  <strong>Liên hệ</strong>
                </div>
              )}
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
                  <select name="petType" value={formData.petType} onChange={handleChange} disabled={Boolean(selectedPetId)}>
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

              {myPets.length > 0 ? (
                <div className="field">
                  <label>Chọn thú cưng đã lưu</label>
                  <select value={selectedPetId} onChange={handlePetSelect}>
                    <option value="">Thêm thú cưng mới</option>
                    {myPets.map((pet) => (
                      <option key={pet._id} value={pet._id}>
                        {pet.name} ({pet.species === "cat" ? "Mèo" : pet.species === "dog" ? "Chó" : "Khác"})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="field">
                <label>{selectedPetId ? "Tên thú cưng" : "* Tên thú cưng"}</label>
                <input
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nhập tên thú cưng"
                  disabled={Boolean(selectedPetId)}
                />
              </div>

              <div className="field">
                <label>* Ngày đặt lịch</label>
                <input name="date" value={formData.date} onChange={handleChange} type="datetime-local" min={toDateTimeLocalMin()} />
              </div>

              <div className="field">
                <label>Ghi chú</label>
                <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Tình trạng thú cưng hoặc yêu cầu thêm" />
              </div>

              <button className="btn" type="submit" disabled={createAppointmentMutation.isPending}>
                <PetshopIcon name="check" size={13} />
                {createAppointmentMutation.isPending ? "Đang gửi lịch..." : "Xác nhận đặt lịch"}
              </button>
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
