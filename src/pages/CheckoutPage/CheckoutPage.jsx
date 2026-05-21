import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as BillServices from "../../services/BillServices";
import * as CartServices from "../../services/CartServices";
import * as message from "../../components/Message/Message";
import { EmptyState, PetshopIcon } from "../../components/ui";
import "./CheckoutPage.css";

const SHIPPING_FEE = 30000;

const formatMoney = (value) => `${Math.round(Number(value || 0)).toLocaleString("vi-VN")}đ`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("cartItems") || "[]"));
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    note: "",
    saveAddress: true,
  });

  useEffect(() => {
    const savedAddress = JSON.parse(localStorage.getItem("checkout_saved_address") || "null");
    setFormData((prev) => ({
      ...prev,
      fullName: savedAddress?.fullName || user.name || "",
      phone: savedAddress?.phone || user.phone || "",
      address: savedAddress?.address || user.address || "",
      email: savedAddress?.email || user.email || "",
      city: savedAddress?.city || "",
    }));
  }, [user.address, user.email, user.name, user.phone]);

  const serverCartQuery = useQuery({
    queryKey: ["checkout-cart", user?.access_token],
    queryFn: () => CartServices.getMyCart(user.access_token),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    const serverItems = serverCartQuery.data?.data?.items || [];
    const mapped = serverItems.map((item) => ({
      idsp: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      discount: item.discount || 0,
      countInStock: item.countInStock || 9999,
      quantity: item.quantity || 1,
      category: item.category || "Sản phẩm",
    }));
    setCartItems(mapped);
    localStorage.setItem("cartItems", JSON.stringify(mapped));
    window.dispatchEvent(new Event("cart-updated"));
  }, [isLoggedIn, serverCartQuery.data]);

  const subTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * (1 - Number(item.discount || 0) / 100) * Number(item.quantity || 0), 0),
    [cartItems]
  );

  const couponCode = localStorage.getItem("cart_coupon_code") || "";
  const discountAmount = useMemo(() => {
    if (couponCode === "PET5") return Math.round(subTotal * 0.05);
    if (couponCode === "PET30K") return Math.min(30000, subTotal);
    return 0;
  }, [couponCode, subTotal]);

  const afterDiscount = Math.max(subTotal - discountAmount, 0);
  const shippingFee = afterDiscount > 0 ? SHIPPING_FEE : 0;
  const orderTotal = afterDiscount + shippingFee;

  const createOrderMutation = useMutation({
    mutationFn: () =>
      BillServices.createBill(
        {
          items: cartItems.map((item) => ({ idsp: item.idsp, quantity: Number(item.quantity) })),
          shippingAddress: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            address: formData.address.trim(),
          },
          paymentMethod: "COD",
          couponCode: couponCode || "",
          note: formData.note.trim(),
        },
        user.access_token
      ),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        if (formData.saveAddress) {
          localStorage.setItem(
            "checkout_saved_address",
            JSON.stringify({
              fullName: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              city: formData.city.trim(),
              address: formData.address.trim(),
            })
          );
        }
        localStorage.removeItem("cart_coupon_code");
        localStorage.setItem("cartItems", JSON.stringify([]));
        window.dispatchEvent(new Event("cart-updated"));
        setCartItems([]);
        if (isLoggedIn) CartServices.clearMyCart(user.access_token).catch(() => {});
        message.success("Đặt hàng thành công");
        navigate(`/order-success?orderId=${res?.data?._id || ""}`);
        return;
      }
      message.error(res?.message || "Đặt hàng thất bại");
    },
    onError: (error) => message.error(error?.message || "Đặt hàng thất bại"),
  });

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submitOrder = (event) => {
    event.preventDefault();
    if (!formData.fullName.trim()) {
      message.error("Vui lòng nhập họ tên");
      return;
    }
    if (!formData.email.trim()) {
      message.error("Vui lòng nhập email");
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      message.error("Số điện thoại không hợp lệ");
      return;
    }
    if (formData.address.trim().length < 6) {
      message.error("Địa chỉ không hợp lệ");
      return;
    }
    createOrderMutation.mutate();
  };

  return (
    <div className="checkout-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg viewBox="0 0 24 24" className="arrow">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
          <span>Giỏ hàng</span>
          <svg viewBox="0 0 24 24" className="arrow">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
          <strong>Thanh toán</strong>
        </div>

        <div className="page-head">
          <div>
            <h1 className="page-title">Thanh toán</h1>
            <p className="sub">Xác nhận thông tin giao hàng và hoàn tất đơn mua.</p>
          </div>
          <div className="secure-pill">
            <svg viewBox="0 0 24 24" className="icon-sm">
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"></path>
            </svg>
            Thanh toán an toàn
          </div>
        </div>

        {!cartItems.length ? (
          <section className="card empty-card">
            <EmptyState description="Giỏ hàng trống" actionText="Quay lại giỏ hàng" onAction={() => navigate("/cart")} />
          </section>
        ) : (
          <>
            <section className="checkout-steps">
              <div className="step">
                <div className="step-num">1</div>
                <div>
                  <strong>Giỏ hàng</strong>
                  <span>Kiểm tra sản phẩm</span>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div>
                  <strong>Thông tin giao hàng</strong>
                  <span>Nhập địa chỉ nhận hàng</span>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div>
                  <strong>Đặt hàng</strong>
                  <span>Xác nhận đơn mua</span>
                </div>
              </div>
            </section>

            <div className="checkout-layout">
              <section className="card">
                <h2>Giao hàng & Thanh toán</h2>
                <p className="section-sub">Thông tin này sẽ được dùng để xác nhận và giao đơn hàng.</p>
                <form onSubmit={submitOrder}>
                  <div className="form-grid">
                    <div className="field">
                      <label>* Họ tên</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} />
                    </div>
                    <div className="field">
                      <label>* Email</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} type="email" />
                    </div>
                    <div className="field">
                      <label>* Số điện thoại</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
                    </div>
                    <div className="field">
                      <label>Thành phố</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Nhập thành phố" />
                    </div>
                    <div className="field full">
                      <label>* Địa chỉ</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ nhận hàng" />
                    </div>
                  </div>

                  <label className="save">
                    <span>
                      <PetshopIcon name="check" size={12} />
                    </span>
                    <input type="checkbox" name="saveAddress" checked={formData.saveAddress} onChange={handleInputChange} />
                    Lưu địa chỉ giao hàng cho lần sau
                  </label>

                  <h2>Phương thức thanh toán</h2>

                  <div className="payment-box">
                    <div className="payment-option">
                      <span className="radio"></span>
                      <div>
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <p>Thanh toán trực tiếp cho đơn vị giao hàng sau khi nhận sản phẩm.</p>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Ghi chú thêm cho đơn hàng hoặc nhân viên giao hàng"
                    />
                  </div>

                  <button className="btn" type="submit" disabled={createOrderMutation.isPending}>
                    <PetshopIcon name="check" size={14} />
                    {createOrderMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
                  </button>

                </form>
              </section>

              <aside className="card order-card">
                <h2>Tóm tắt đơn hàng</h2>

                <div className="order-list">
                  {cartItems.map((item) => {
                    const itemPrice = Math.round(Number(item.price || 0) * (1 - Number(item.discount || 0) / 100));
                    return (
                      <div className="order-item" key={item.idsp}>
                        <img src={item.image} alt={item.name} />
                        <div>
                          <strong>{item.name}</strong>
                          <span>Số lượng: {item.quantity}</span>
                        </div>
                        <div className="item-price">{formatMoney(itemPrice * Number(item.quantity || 0))}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="coupon-mini">
                  <input value={couponCode} disabled placeholder="Nhập mã giảm giá ở giỏ hàng" />
                  <button className="small-btn" type="button" onClick={() => navigate("/cart")}>
                    Về giỏ hàng
                  </button>
                </div>

                <div className="summary-row">
                  <span>Tạm tính</span>
                  <b>{formatMoney(subTotal)}</b>
                </div>
                <div className="summary-row">
                  <span>Giảm giá</span>
                  <b>-{formatMoney(discountAmount)}</b>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <b>{formatMoney(shippingFee)}</b>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <b>{formatMoney(orderTotal)}</b>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CheckoutPage;
