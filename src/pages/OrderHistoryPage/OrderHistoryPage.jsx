import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as BillServices from "../../services/BillServices";
import { EmptyState, ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import "./OrderHistoryPage.css";

const statusTextMap = {
  pending: "Đang xử lý",
  confirmed: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const statusClassMap = {
  pending: "pending",
  confirmed: "pending",
  shipping: "shipping",
  delivered: "done",
  cancelled: "cancelled",
};

const formatMoney = (value) => `${Math.round(Number(value || 0)).toLocaleString("vi-VN")}đ`;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
};

const OrderHistoryPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const ordersQuery = useQuery({
    queryKey: ["order-history", user.access_token],
    queryFn: () => BillServices.getAllBill(user.access_token),
    enabled: Boolean(user.access_token),
  });

  const allOrders = useMemo(() => (ordersQuery.data?.data || []).filter((order) => Number(order?.tongtien || 0) > 0), [ordersQuery.data?.data]);
  const rows = useMemo(() => (filter === "all" ? allOrders : allOrders.filter((order) => order.orderStatus === filter)), [allOrders, filter]);

  const stats = useMemo(
    () => ({
      total: allOrders.length,
      processing: allOrders.filter((item) => ["pending", "confirmed"].includes(item.orderStatus)).length,
      shipping: allOrders.filter((item) => item.orderStatus === "shipping").length,
      delivered: allOrders.filter((item) => item.orderStatus === "delivered").length,
    }),
    [allOrders]
  );

  return (
    <div className="order-history-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm arrow" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
          <strong>Lịch sử đơn hàng</strong>
        </div>

        <div className="page-head">
          <div>
            <h1 className="page-title">Lịch sử đơn hàng</h1>
            <p className="sub">Theo dõi đơn hàng, trạng thái xử lý và thông tin thanh toán của bạn.</p>
          </div>
          <div className="head-actions">
            <select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang xử lý</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
            </select>
            <button className="head-btn dark" type="button" onClick={() => navigate("/products")}>
              <svg className="icon-sm" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
              Tiếp tục mua sắm
            </button>
          </div>
        </div>

        <section className="stats">
          <div className="stat">
            <div>
              <small>Tổng đơn hợp lệ</small>
              <h3>{stats.total}</h3>
            </div>
            <div className="stat-icon">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M6 3h12v18H6z"></path>
                <path d="M9 7h6"></path>
                <path d="M9 11h6"></path>
                <path d="M9 15h4"></path>
              </svg>
            </div>
          </div>
          <div className="stat">
            <div>
              <small>Đang xử lý</small>
              <h3>{stats.processing}</h3>
            </div>
            <div className="stat-icon"><PetshopIcon name="clock" size={19} /></div>
          </div>
          <div className="stat">
            <div>
              <small>Đang giao</small>
              <h3>{stats.shipping}</h3>
            </div>
            <div className="stat-icon"><PetshopIcon name="truck" size={19} /></div>
          </div>
          <div className="stat">
            <div>
              <small>Đã giao</small>
              <h3>{stats.delivered}</h3>
            </div>
            <div className="stat-icon"><PetshopIcon name="check" size={19} /></div>
          </div>
        </section>

        <section className="card">
          <div className="table-head">
            <div>
              <h2>Danh sách đơn hàng</h2>
            </div>
          </div>

          {ordersQuery.isLoading ? <LoadingState text="Đang tải danh sách đơn hàng..." /> : null}
          {ordersQuery.isError ? <ErrorState message="Không thể tải lịch sử đơn hàng" onRetry={() => ordersQuery.refetch()} /> : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && rows.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="order-code">
                          <svg className="icon-sm" viewBox="0 0 24 24">
                            <path d="M6 3h12v18H6z"></path>
                            <path d="M9 7h6"></path>
                            <path d="M9 11h6"></path>
                            <path d="M9 15h4"></path>
                          </svg>
                          #{order?._id?.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td>{formatMoney(order.tongtien)}</td>
                      <td>{order.paymentMethod || "COD"}</td>
                      <td>
                        <span className={`status ${statusClassMap[order.orderStatus] || "pending"}`}>
                          <PetshopIcon name={order.orderStatus === "shipping" ? "truck" : order.orderStatus === "delivered" ? "check" : "clock"} size={14} />
                          {statusTextMap[order.orderStatus] || order.orderStatus}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <button className="action-btn" type="button" onClick={() => navigate(`/order-detail/${order._id}`)}>
                          <PetshopIcon name="eye" size={14} />
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && rows.length === 0 ? (
            <div className="empty-wrap">
              <EmptyState description="Bạn chưa có đơn hàng hợp lệ" actionText="Mua sắm ngay" onAction={() => navigate("/products")} />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default OrderHistoryPage;
