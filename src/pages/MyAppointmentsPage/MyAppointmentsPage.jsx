import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as AppointmentServices from "../../services/AppointmentServices";
import { EmptyState, ErrorState, LoadingState, PetshopButton, PetshopIcon } from "../../components/ui";
import "./MyAppointmentsPage.css";

const statusLabelMap = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đã check-in",
  in_service: "Đang thực hiện",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  no_show: "Vắng mặt",
};

const MyAppointmentsPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const appointmentsQuery = useQuery({
    queryKey: ["my-appointments", user.access_token],
    queryFn: () => AppointmentServices.getMyAppointments(user.access_token, { limit: 100 }),
    enabled: Boolean(user.access_token),
  });

  const rows = useMemo(() => appointmentsQuery.data?.data || [], [appointmentsQuery.data?.data]);
  const highlightAppointmentId = location.state?.highlightAppointmentId || "";

  return (
    <div className="appointments-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg viewBox="0 0 24 24" className="arrow"><path d="M9 18l6-6-6-6" /></svg>
          <strong>Lịch hẹn của tôi</strong>
        </div>

        <div className="head">
          <div>
            <h1 className="page-title">Lịch hẹn dịch vụ</h1>
            <p className="sub">Theo dõi lịch hẹn, trạng thái xử lý và chi phí dịch vụ của bạn.</p>
          </div>
          <PetshopButton onClick={() => navigate("/services")}>Đặt thêm dịch vụ</PetshopButton>
        </div>

        {appointmentsQuery.isLoading ? <LoadingState text="Đang tải lịch hẹn..." /> : null}
        {appointmentsQuery.isError ? <ErrorState message="Không thể tải lịch hẹn." onRetry={() => appointmentsQuery.refetch()} /> : null}

        {!appointmentsQuery.isLoading && !appointmentsQuery.isError && rows.length === 0 ? (
          <EmptyState description="Bạn chưa có lịch hẹn nào." actionText="Đặt lịch ngay" onAction={() => navigate("/services")} />
        ) : null}

        {!appointmentsQuery.isLoading && !appointmentsQuery.isError && rows.length > 0 ? (
          <section className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã lịch</th>
                    <th>Thú cưng</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item._id} className={highlightAppointmentId && item._id === highlightAppointmentId ? "row-highlight" : ""}>
                      <td>#{String(item.appointmentCode || item._id || "").slice(-8).toUpperCase()}</td>
                      <td>{item.petId?.name || "-"}</td>
                      <td>{item.scheduleAt ? new Date(item.scheduleAt).toLocaleString("vi-VN") : "-"}</td>
                      <td>
                        <span className={`status status-${item.status || "pending"}`}>
                          <PetshopIcon name="clock" size={12} />
                          {statusLabelMap[item.status] || item.status}
                        </span>
                      </td>
                      <td>{Number(item?.pricing?.finalTotal || 0).toLocaleString("vi-VN")}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default MyAppointmentsPage;
