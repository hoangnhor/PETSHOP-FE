import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as UserServices from "../../services/UserServices";
import * as ProductServices from "../../services/ProductServices";
import * as BillServices from "../../services/BillServices";
import { ErrorState, LoadingState, PetshopSelect, StatsCard } from "../ui";
import { WrapperHeader } from "../AdminProduct/style";

const AdminDashboard = () => {
  const user = useSelector((state) => state.user);
  const [period, setPeriod] = useState("30d");
  const usersQuery = useQuery({ queryKey: ["admin-users", user.access_token], queryFn: () => UserServices.getAllUser(user.access_token), enabled: Boolean(user.access_token) });
  const productsQuery = useQuery({ queryKey: ["products-admin-dashboard"], queryFn: () => ProductServices.getAllProduct({ limit: 500 }) });
  const ordersQuery = useQuery({ queryKey: ["admin-orders", user.access_token], queryFn: () => BillServices.getAllBill(user.access_token, { limit: 500 }), enabled: Boolean(user.access_token) });

  const hasError = usersQuery.isError || productsQuery.isError || ordersQuery.isError;
  const isLoading = usersQuery.isLoading || productsQuery.isLoading || ordersQuery.isLoading;
  const orders = useMemo(() => ordersQuery.data?.data || [], [ordersQuery.data?.data]);
  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;
    const now = new Date();
    const start = new Date(now);
    if (period === "7d") {
      start.setDate(now.getDate() - 7);
    } else if (period === "30d") {
      start.setDate(now.getDate() - 30);
    } else if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    return orders.filter((order) => {
      const orderDate = new Date(order?.createdAt || 0);
      return orderDate >= start && orderDate <= now;
    });
  }, [orders, period]);
  const deliveredOrders = useMemo(() => filteredOrders.filter((order) => order?.orderStatus === "delivered"), [filteredOrders]);
  const totalRevenue = useMemo(() => deliveredOrders.reduce((sum, order) => sum + Number(order?.tongtien || 0), 0), [deliveredOrders]);

  return (
    <div className="admin-page-section">
      <WrapperHeader className="admin-panel-title">Tổng Quan Quản Trị</WrapperHeader>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left" />
        <div className="admin-toolbar-end">
          <span>Khoảng thời gian:</span>
          <PetshopSelect
            className="admin-select admin-select--filter"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "7d", label: "7 ngày qua" },
              { value: "30d", label: "30 ngày qua" },
              { value: "month", label: "Tháng này" },
              { value: "all", label: "Toàn thời gian" },
            ]}
          />
        </div>
      </div>
      {isLoading ? <LoadingState text="Đang tải dữ liệu tổng quan..." /> : null}
      {hasError ? <ErrorState message="Không thể tải dữ liệu tổng quan." onRetry={() => { usersQuery.refetch(); productsQuery.refetch(); ordersQuery.refetch(); }} /> : null}
      {!isLoading && !hasError ? (
        <div className="admin-stats-grid admin-stats-grid--4">
          <StatsCard label="Tổng người dùng" value={(usersQuery.data?.data || []).length} />
          <StatsCard label="Tổng sản phẩm" value={productsQuery.data?.total || (productsQuery.data?.data || []).length} />
          <StatsCard label="Đơn hàng trong kỳ" value={filteredOrders.length} />
          <StatsCard label="Doanh thu đã giao" value={`${totalRevenue.toLocaleString("vi-VN")}đ`} />
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
