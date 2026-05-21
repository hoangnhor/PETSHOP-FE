import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as BillServices from "../../services/BillServices";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui";
import "./OrderDetailPage.css";

const statusTextMap = {
  pending: "Đang xử lý",
  confirmed: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const formatMoney = (value) => `${Math.round(Number(value || 0)).toLocaleString("vi-VN")}đ`;
const getSubTotal = (order) => {
  const computed = (order?.items || []).reduce((sum, item) => {
    const subtotal = Number(item?.subtotal);
    if (Number.isFinite(subtotal) && subtotal > 0) return sum + subtotal;
    const price = Number(item?.priceSnapshot || item?.price);
    const qty = Number(item?.quantity || 0);
    if (Number.isFinite(price) && price > 0 && Number.isFinite(qty) && qty > 0) return sum + price * qty;
    return sum;
  }, 0);
  if (computed > 0) return computed;
  const total = Number(order?.totalAmount ?? order?.tongtien ?? 0);
  const shipping = Number(order?.shippingFee ?? 0);
  if (Number.isFinite(total) && total > 0) return Math.max(total - (Number.isFinite(shipping) ? shipping : 0), 0);
  return 0;
};
const getShippingFee = (order) => {
  if (Number.isFinite(Number(order?.shippingFee))) return Number(order.shippingFee);
  return 0;
};
const getOrderTotal = (order) => {
  if (Number.isFinite(Number(order?.totalAmount))) return Number(order.totalAmount);
  if (Number.isFinite(Number(order?.tongtien))) return Number(order.tongtien);
  return getSubTotal(order) + getShippingFee(order);
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const detailQuery = useQuery({
    queryKey: ["order-detail", id, user.access_token],
    queryFn: () => BillServices.getDetailsBill(id, user.access_token),
    enabled: Boolean(id && user.access_token),
  });

  const order = detailQuery?.data?.data;

  return (
    <div className="order-detail-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
          <span>Lịch sử đơn hàng</span>
          <svg className="icon-sm" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
          <strong>Chi tiết đơn hàng</strong>
        </div>
        <h1 className="page-title">Chi tiết đơn hàng</h1>
        <p className="sub">Theo dõi sản phẩm, địa chỉ giao hàng và trạng thái xử lý đơn.</p>

        {detailQuery.isLoading ? <LoadingState text="Đang tải chi tiết đơn hàng..." /> : null}
        {detailQuery.isError ? <ErrorState message="Không thể tải chi tiết đơn hàng." onRetry={() => detailQuery.refetch()} /> : null}
        {!detailQuery.isLoading && !detailQuery.isError && !order ? <EmptyState description="Không tìm thấy đơn hàng." actionText="Quay lại lịch sử đơn" onAction={() => navigate("/order-history")} /> : null}

        {order ? (
          <section className="detail-grid">
            <div className="card">
              <h2>Đơn hàng #{order?._id?.slice(-8).toUpperCase()}</h2>
              <span className="status">
                <svg className="icon-sm" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                {statusTextMap[order.orderStatus] || order.orderStatus}
              </span>

              <div className="timeline">
                <div className="timeline-item">
                  <div className="num">1</div>
                  <div>
                    <strong>Đã tạo đơn</strong>
                    <p className="timeline-sub">Đơn hàng được ghi nhận trong hệ thống.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="num">2</div>
                  <div>
                    <strong>Chờ xác nhận</strong>
                    <p className="timeline-sub">Nhân viên petshop sẽ xác nhận thông tin giao hàng.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="num">3</div>
                  <div>
                    <strong>Đang giao</strong>
                    <p className="timeline-sub">Đơn sẽ được cập nhật khi bàn giao vận chuyển.</p>
                  </div>
                </div>
              </div>

              <div className="items">
                {(order.items || []).map((item) => (
                  <div key={item._id || item.idsp} className="item-row">
                    <span>{item.name} x {item.quantity}</span>
                    <b>{formatMoney(item.subtotal)}</b>
                  </div>
                ))}
              </div>
            </div>

            <aside className="card">
              <h2>Tóm tắt</h2>
              <div className="rows">
                <div className="row"><span>Tạm tính</span><b>{formatMoney(getSubTotal(order))}</b></div>
                <div className="row"><span>Phí vận chuyển</span><b>{formatMoney(getShippingFee(order))}</b></div>
                <div className="row"><span>Tổng cộng</span><b>{formatMoney(getOrderTotal(order))}</b></div>
                <div className="row"><span>Thanh toán</span><b>{order.paymentMethod || "COD"}</b></div>
                <div className="row"><span>Người nhận</span><b>{order?.shippingAddress?.fullName || "-"}</b></div>
                <div className="row"><span>Số điện thoại</span><b>{order?.shippingAddress?.phone || "-"}</b></div>
                <div className="row"><span>Địa chỉ</span><b>{order?.shippingAddress?.address || "-"}</b></div>
              </div>
              <button className="btn" type="button" onClick={() => navigate("/products")}>Mua lại</button>
            </aside>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default OrderDetailPage;
