import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Tag } from "antd";
import * as AppointmentServices from "../../services/AppointmentServices";
import * as message from "../Message/Message";
import { WrapperHeader } from "../AdminProduct/style";
import { ConfirmDialog, EmptyState, ErrorState, PetshopButton, PetshopSelect, PetshopTable, StatsCard } from "../ui";

const statusOptions = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "checked_in", label: "Đã check-in" },
  { value: "in_service", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "no_show", label: "Vắng mặt" },
];

const statusColor = {
  pending: "gold",
  confirmed: "blue",
  checked_in: "cyan",
  in_service: "purple",
  completed: "green",
  cancelled: "red",
  no_show: "volcano",
};

const AdminAppointment = () => {
  const user = useSelector((state) => state.user);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingCancel, setPendingCancel] = useState(null);

  const appointmentsQuery = useQuery({
    queryKey: ["admin-appointments", user.access_token],
    queryFn: () => AppointmentServices.getAllAppointmentsAdmin(user.access_token, { limit: 200 }),
    enabled: Boolean(user.access_token),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => AppointmentServices.updateAppointment(id, payload, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Cập nhật lịch hẹn thành công");
        appointmentsQuery.refetch();
      } else {
        message.error(res?.message || "Cập nhật lịch hẹn thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Cập nhật lịch hẹn thất bại"),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, payload }) => AppointmentServices.cancelAppointment(id, payload, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Hủy lịch hẹn thành công");
        appointmentsQuery.refetch();
      } else {
        message.error(res?.message || "Hủy lịch hẹn thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Hủy lịch hẹn thất bại"),
  });

  const rows = useMemo(() => {
    const all = appointmentsQuery.data?.data || [];
    if (statusFilter === "all") return all;
    return all.filter((item) => item.status === statusFilter);
  }, [appointmentsQuery.data?.data, statusFilter]);

  const columns = [
    { title: "Mã lịch", dataIndex: "appointmentCode", render: (value, record) => value || record?._id?.slice(-8).toUpperCase() },
    { title: "Khách hàng", dataIndex: "userId", render: (userInfo) => userInfo?.name || "-" },
    { title: "Thú cưng", dataIndex: "petId", render: (pet) => pet?.name || "-" },
    { title: "Thời gian", dataIndex: "scheduleAt", render: (value) => (value ? new Date(value).toLocaleString("vi-VN") : "-") },
    { title: "Tổng tiền", dataIndex: "pricing", render: (pricing) => `${Number(pricing?.finalTotal || 0).toLocaleString("vi-VN")}đ` },
    { title: "Trạng thái", dataIndex: "status", render: (status) => <Tag color={statusColor[status] || "default"}>{status}</Tag> },
    {
      title: "Cập nhật",
      render: (_, record) => (
        <PetshopSelect
          value={record.status}
          style={{ width: 160 }}
          options={statusOptions}
          disabled={cancelMutation.isPending || updateMutation.isPending}
          onChange={(nextStatus) => updateMutation.mutate({ id: record._id, payload: { status: nextStatus } })}
        />
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <PetshopButton
          variant="secondary"
          disabled={["cancelled", "completed", "no_show"].includes(record.status)}
          onClick={() => setPendingCancel(record)}
        >
          Hủy lịch
        </PetshopButton>
      ),
    },
  ];

  return (
    <div>
      <WrapperHeader className="admin-panel-title">Quản lý lịch hẹn</WrapperHeader>
      {appointmentsQuery.isError ? <ErrorState message="Không thể tải danh sách lịch hẹn." onRetry={() => appointmentsQuery.refetch()} /> : null}
      <div className="admin-stats-grid">
        <StatsCard label="Tổng lịch hẹn" value={(appointmentsQuery.data?.data || []).length} />
        <StatsCard label="Chờ xác nhận" value={(appointmentsQuery.data?.data || []).filter((item) => item.status === "pending").length} />
        <StatsCard label="Hoàn tất" value={(appointmentsQuery.data?.data || []).filter((item) => item.status === "completed").length} />
      </div>
      <div className="admin-filters">
        <span>Lọc trạng thái:</span>
        <PetshopSelect value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }} options={[{ value: "all", label: "Tất cả" }, ...statusOptions]} />
      </div>

      {!appointmentsQuery.isLoading && !appointmentsQuery.isError && rows.length === 0 ? (
        <EmptyState description="Chưa có lịch hẹn nào." />
      ) : (
        <div className="admin-table-wrap">
          <PetshopTable
            rowKey="_id"
            isPending={appointmentsQuery.isLoading || updateMutation.isPending || cancelMutation.isPending}
            columns={columns}
            data={rows}
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Hủy lịch hẹn"
        content={`Bạn có chắc chắn muốn hủy lịch ${pendingCancel?.appointmentCode || pendingCancel?._id?.slice(-8)?.toUpperCase() || ""}?`}
        confirmLoading={cancelMutation.isPending}
        onCancel={() => setPendingCancel(null)}
        onOk={() => {
          if (!pendingCancel?._id) return;
          cancelMutation.mutate({ id: pendingCancel._id, payload: { cancelReason: "Admin hủy lịch" } });
          setPendingCancel(null);
        }}
      />
    </div>
  );
};

export default AdminAppointment;

