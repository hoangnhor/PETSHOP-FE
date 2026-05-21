import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as UserServices from "../../services/UserServices";
import * as BillServices from "../../services/BillServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import { updateUser } from "../../redux/slides/userSlider";
import * as message from "../../components/Message/Message";
import { getBase64 } from "../../utils";
import "./ProfilePage.css";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const userId = user?.id || user?._id || "";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const ordersQuery = useQuery({
    queryKey: ["profile-order-count", user?.access_token],
    queryFn: () => BillServices.getAllBill(user?.access_token),
    enabled: Boolean(user?.access_token),
  });

  const cartQuery = useQuery({
    queryKey: ["profile-cart-count", user?.access_token],
    queryFn: () => CartServices.getMyCart(user?.access_token),
    enabled: Boolean(user?.access_token),
  });

  const wishlistQuery = useQuery({
    queryKey: ["profile-wishlist-count", user?.access_token],
    queryFn: () => WishlistServices.getMyWishlist(user?.access_token),
    enabled: Boolean(user?.access_token),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => UserServices.updateUser(userId, payload, user?.access_token),
    onSuccess: async () => {
      message.success("Cập nhật thông tin thành công");
      const detail = await UserServices.getDetailsUser(userId, user?.access_token);
      dispatch(updateUser({ ...detail?.data, access_token: user?.access_token }));
    },
    onError: () => message.error("Cập nhật thông tin thất bại"),
  });

  useEffect(() => {
    setFormData({
      email: user?.email || "",
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setAvatar(user?.avatar || "");
  }, [user]);

  const orderCount = useMemo(() => ordersQuery.data?.data?.length || 0, [ordersQuery.data?.data]);
  const wishlistCount = useMemo(() => wishlistQuery.data?.data?.productIds?.length || 0, [wishlistQuery.data?.data?.productIds]);
  const cartCount = useMemo(() => cartQuery.data?.data?.items?.length || 0, [cartQuery.data?.data?.items]);

  const onInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onAvatarChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64 = await getBase64(file);
    setAvatar(base64);
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!user?.access_token || !userId) {
      message.error("Phiên đăng nhập không hợp lệ");
      navigate("/login");
      return;
    }
    if (!formData.name.trim()) {
      message.error("Vui lòng nhập họ tên");
      return;
    }
    if (!formData.email.trim()) {
      message.error("Vui lòng nhập email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      message.error("Email không hợp lệ");
      return;
    }
    if (formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 9 || phoneDigits.length > 11) {
        message.error("Số điện thoại không hợp lệ");
        return;
      }
    }
    updateMutation.mutate({ ...formData, avatar });
  };

  return (
    <div className="profile-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
          <strong>Hồ sơ của tôi</strong>
        </div>

        <div className="page-head">
          <div>
            <h1 className="page-title">Hồ sơ của tôi</h1>
            <p className="sub">Quản lý thông tin tài khoản, địa chỉ và ảnh đại diện của bạn.</p>
          </div>
        </div>

        <section className="profile-layout">
          <aside className="sidebar-card">
            <div className="profile-preview">
              <div className="big-avatar">
                {avatar ? <img src={avatar} alt="avatar" className="avatar-image" /> : <svg className="icon-lg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.6-4.2 14.4-4.2 16 0"></path></svg>}
              </div>
              <h2>{user?.name || "Người dùng"}</h2>
              <p className="id">ID tài khoản: {user?.id?.slice(-8)?.toUpperCase() || "N/A"}</p>
            </div>
            <div className="side-menu">
              <button className="side-link active" type="button"><svg className="icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.6-4.2 14.4-4.2 16 0"></path></svg>Thông tin cá nhân</button>
              <button className="side-link" type="button" onClick={() => navigate("/my-pets")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M8.5 9.5c1.1 0 2-1.2 2-2.7S9.6 4 8.5 4s-2 1.2-2 2.8.9 2.7 2 2.7z"></path><path d="M15.5 9.5c1.1 0 2-1.2 2-2.7S16.6 4 15.5 4s-2 1.2-2 2.8.9 2.7 2 2.7z"></path><path d="M5.2 13.2c.9.5 2.2 0 2.9-1.2.7-1.2.5-2.6-.4-3.1-.9-.5-2.2 0-2.9 1.2-.7 1.2-.5 2.6.4 3.1z"></path><path d="M18.8 13.2c-.9.5-2.2 0-2.9-1.2-.7-1.2-.5-2.6.4-3.1.9-.5 2.2 0 2.9 1.2.7 1.2.5 2.6-.4 3.1z"></path><path d="M8.2 18.2c.3-2.7 1.9-4.6 3.8-4.6s3.5 1.9 3.8 4.6c.2 1.6-1 2.8-2.4 2.1-.8-.4-2-.4-2.8 0-1.4.7-2.6-.5-2.4-2.1z"></path></svg>Thú cưng của tôi</button>
              <button className="side-link" type="button" onClick={() => navigate("/my-appointments")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 9h18"></path><path d="M5 5h14v16H5z"></path></svg>Lịch hẹn của tôi</button>
              <button className="side-link" type="button" onClick={() => navigate("/order-history")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M6 3h12v18H6z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path></svg>Lịch sử đơn</button>
              <button className="side-link" type="button" onClick={() => navigate("/wishlist")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9.2C1.5 7.1 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.4 0 5.7 3.1 4.2 6.8C19 15.6 12 20 12 20z"></path></svg>Yêu thích</button>
              <button className="side-link" type="button" onClick={() => navigate("/cart")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 7h15l-1.4 8.2a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.6L4.6 4H2"></path><circle cx="9" cy="20" r="1.2"></circle><circle cx="17" cy="20" r="1.2"></circle></svg>Giỏ hàng</button>
            </div>
          </aside>

          <section className="profile-card">
            <div className="account-head">
              <div>
                <h2>Thông tin tài khoản</h2>
                <p>Cập nhật thông tin cá nhân để petshop hỗ trợ đơn hàng và dịch vụ tốt hơn.</p>
              </div>
              <div className="head-actions">
                <button className="small-btn" type="button" onClick={() => navigate("/order-history")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M6 3h12v18H6z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path></svg>Lịch sử đơn</button>
                <button className="small-btn" type="button" onClick={() => navigate("/my-pets")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M8.5 9.5c1.1 0 2-1.2 2-2.7S9.6 4 8.5 4s-2 1.2-2 2.8.9 2.7 2 2.7z"></path><path d="M15.5 9.5c1.1 0 2-1.2 2-2.7S16.6 4 15.5 4s-2 1.2-2 2.8.9 2.7 2 2.7z"></path><path d="M5.2 13.2c.9.5 2.2 0 2.9-1.2.7-1.2.5-2.6-.4-3.1-.9-.5-2.2 0-2.9 1.2-.7 1.2-.5 2.6.4 3.1z"></path><path d="M18.8 13.2c-.9.5-2.2 0-2.9-1.2-.7-1.2-.5-2.6.4-3.1.9-.5 2.2 0 2.9 1.2.7 1.2.5 2.6-.4 3.1z"></path><path d="M8.2 18.2c.3-2.7 1.9-4.6 3.8-4.6s3.5 1.9 3.8 4.6c.2 1.6-1 2.8-2.4 2.1-.8-.4-2-.4-2.8 0-1.4.7-2.6-.5-2.4-2.1z"></path></svg>Thú cưng</button>
                <button className="small-btn" type="button" onClick={() => navigate("/my-appointments")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 9h18"></path><path d="M5 5h14v16H5z"></path></svg>Lịch hẹn</button>
                <button className="small-btn" type="button" onClick={() => navigate("/wishlist")}><svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9.2C1.5 7.1 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.4 0 5.7 3.1 4.2 6.8C19 15.6 12 20 12 20z"></path></svg>Yêu thích</button>
              </div>
            </div>

            <hr className="divider" />

            <div className="stats">
              <div className="stat"><div><small>Đơn hàng</small><h3>{orderCount}</h3></div><div className="stat-icon"><svg className="icon-sm" viewBox="0 0 24 24"><path d="M6 3h12v18H6z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path></svg></div></div>
              <div className="stat"><div><small>Yêu thích</small><h3>{wishlistCount}</h3></div><div className="stat-icon"><svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9.2C1.5 7.1 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.4 0 5.7 3.1 4.2 6.8C19 15.6 12 20 12 20z"></path></svg></div></div>
              <div className="stat"><div><small>Giỏ hàng</small><h3>{cartCount}</h3></div><div className="stat-icon"><svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 7h15l-1.4 8.2a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.6L4.6 4H2"></path><circle cx="9" cy="20" r="1.2"></circle><circle cx="17" cy="20" r="1.2"></circle></svg></div></div>
            </div>

            <form onSubmit={onSubmit}>
              <h2 className="section-title">Thông tin cá nhân</h2>
              <div className="form-grid">
                <div className="field"><label>Họ tên</label><input name="name" value={formData.name} onChange={onInputChange} /></div>
                <div className="field"><label>Email</label><input name="email" value={formData.email} onChange={onInputChange} type="email" /></div>
                <div className="field"><label>Số điện thoại</label><input name="phone" value={formData.phone} onChange={onInputChange} /></div>
                <div className="field"><label>Ngày tham gia</label><input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"} readOnly /></div>
              </div>

              <h2 className="section-title">Địa chỉ & ảnh đại diện</h2>
              <div className="form-grid">
                <div className="field full"><label>Địa chỉ</label><input name="address" value={formData.address} onChange={onInputChange} /></div>
                <div className="field full"><label>Ảnh đại diện</label><input className="file-input" type="file" accept="image/*" onChange={onAvatarChange} /></div>
              </div>

              <div className="save-row">
                <button className="cancel-btn" type="button" onClick={() => setFormData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", address: user?.address || "" })}>
                  <svg className="icon-sm" viewBox="0 0 24 24"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>Hủy
                </button>
                <button className="save-btn" type="submit" disabled={updateMutation.isPending}>
                  <svg className="icon-sm" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
