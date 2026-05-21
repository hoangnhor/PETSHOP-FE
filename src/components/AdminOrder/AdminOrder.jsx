import React, { useMemo, useState } from "react";
import { Tag } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as BillServices from "../../services/BillServices";
import * as message from "../Message/Message";
import { WrapperHeader } from "../AdminProduct/style";
import { ConfirmDialog, ErrorState, PetshopButton, PetshopSelect, PetshopTable, StatsCard } from "../ui";
import DrawerComponent from "../../DrawerComponent/DrawerComponent";

const orderStatusOptions = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
];

const orderStatusMap = {
    pending: { text: "Chờ xác nhận", color: "gold" },
    confirmed: { text: "Đã xác nhận", color: "blue" },
    shipping: { text: "Đang giao", color: "cyan" },
    delivered: { text: "Đã giao", color: "green" },
    cancelled: { text: "Đã hủy", color: "red" },
};

const paymentStatusMap = {
    unpaid: { text: "Chưa thanh toán", color: "orange" },
    paid: { text: "Đã thanh toán", color: "green" },
    refunded: { text: "Đã hoàn tiền", color: "purple" },
};

const AdminOrder = () => {
    const user = useSelector((state) => state.user);
    const [statusFilter, setStatusFilter] = useState("all");
    const [pendingDeleteOrder, setPendingDeleteOrder] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const ordersQuery = useQuery({
        queryKey: ["admin-orders", user.access_token, currentPage, pageSize],
        queryFn: () => BillServices.getAllBill(user.access_token, { page: currentPage - 1, limit: pageSize }),
        enabled: Boolean(user.access_token),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, orderStatus }) => BillServices.updateBillStatus(id, { orderStatus }, user.access_token),
        onSuccess: (res) => { if (res?.status === "OK") { message.success("Cập nhật đơn hàng thành công"); ordersQuery.refetch(); } else message.error(res?.message || "Cập nhật thất bại"); },
        onError: (error) => message.error(error?.message || "Cập nhật thất bại"),
    });
    const deleteOrderMutation = useMutation({
        mutationFn: (id) => BillServices.deleteBill(id, user.access_token),
        onSuccess: (res) => { if (res?.status === "OK") { message.success("Xóa đơn hàng thành công"); ordersQuery.refetch(); } else message.error(res?.message || "Xóa đơn hàng thất bại"); },
        onError: (error) => message.error(error?.message || "Xóa đơn hàng thất bại"),
    });

    const rows = useMemo(() => {
        const clean = (ordersQuery.data?.data || []).filter((o) => Number(o?.tongtien || 0) > 0 && o?.orderStatus);
        if (statusFilter === "all") return clean;
        return clean.filter((o) => o.orderStatus === statusFilter);
    }, [ordersQuery.data?.data, statusFilter]);

    const columns = [
        { title: "Mã đơn", dataIndex: "_id", render: (id) => <span>{id?.slice(-8).toUpperCase()}</span> },
        { title: "Khách hàng", dataIndex: "iduser", render: (customer, record) => <div><div>{customer?.name || record.shippingAddress?.fullName || "-"}</div><div style={{ color: "#777" }}>{customer?.email || record.shippingAddress?.phone || "-"}</div></div> },
        { title: "Sản phẩm", dataIndex: "items", render: (items) => <div>{items?.slice(0, 2).map((item) => <div key={item._id || item.idsp}>{item.name} x {item.quantity}</div>)}{items?.length > 2 ? <span>+{items.length - 2} sản phẩm</span> : null}</div> },
        { title: "Tổng tiền", dataIndex: "tongtien", render: (value) => Number(value || 0).toLocaleString("vi-VN") + "đ" },
        { title: "Thanh toán", render: (_, record) => <div><div>{record.paymentMethod}</div><Tag color={paymentStatusMap[record.paymentStatus]?.color || "default"}>{paymentStatusMap[record.paymentStatus]?.text || record.paymentStatus}</Tag></div> },
        { title: "Trạng thái", dataIndex: "orderStatus", render: (status) => <Tag color={orderStatusMap[status]?.color || "default"}>{orderStatusMap[status]?.text || status}</Tag> },
        { title: "Ngày tạo", dataIndex: "createdAt", render: (value) => (value ? new Date(value).toLocaleString("vi-VN") : "") },
        {
            title: "Cập nhật",
            render: (_, record) => (
                <PetshopSelect
                    value={record.orderStatus}
                    style={{ width: 150 }}
                    options={orderStatusOptions}
                    disabled={record.orderStatus === "cancelled" || updateStatusMutation.isPending}
                    onChange={(orderStatus) => updateStatusMutation.mutate({ id: record._id, orderStatus })}
                />
            )
        },
        {
            title: "", render: (_, record) => (
                <div className="admin-actions">
                    <PetshopButton variant="secondary" onClick={() => setSelectedOrder(record)}>Chi tiết</PetshopButton>
                    <PetshopButton variant="secondary" onClick={() => setPendingDeleteOrder(record)}>Xóa</PetshopButton>
                </div>
            )
        },
    ];

    return (
        <div>
            <WrapperHeader className="admin-panel-title">Quản Lý Đơn Hàng</WrapperHeader>
            {ordersQuery.isError ? <ErrorState message="Không thể tải danh sách đơn hàng." onRetry={() => ordersQuery.refetch()} /> : null}
            <div className="admin-stats-grid">
                <StatsCard label="Đơn hợp lệ" value={rows.length} />
                <StatsCard label="Chờ xác nhận" value={rows.filter((o) => o.orderStatus === "pending").length} />
                <StatsCard label="Đang giao" value={rows.filter((o) => o.orderStatus === "shipping").length} />
            </div>
            <div className="admin-filters">
                <span>Lọc trạng thái:</span>
                <PetshopSelect value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }} options={[{ value: "all", label: "Tất cả" }, ...orderStatusOptions]} />
            </div>
            <div className="admin-table-wrap">
                <PetshopTable
                    rowKey="_id"
                    isPending={ordersQuery.isLoading || updateStatusMutation.isPending || deleteOrderMutation.isPending}
                    columns={columns}
                    data={rows}
                    scroll={{ x: 1280 }}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: ordersQuery.data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                        onChange: (page, nextSize) => {
                            if (nextSize !== pageSize) {
                                setPageSize(nextSize);
                                setCurrentPage(1);
                                return;
                            }
                            setCurrentPage(page);
                        },
                    }}
                />
            </div>

            <ConfirmDialog
                open={Boolean(pendingDeleteOrder)}
                title="Xóa đơn hàng"
                content={`Bạn có chắc chắn muốn xóa đơn ${pendingDeleteOrder?._id?.slice(-8)?.toUpperCase() || ""}?`}
                confirmLoading={deleteOrderMutation.isPending}
                onCancel={() => setPendingDeleteOrder(null)}
                onOk={() => {
                    if (!pendingDeleteOrder?._id) return;
                    deleteOrderMutation.mutate(pendingDeleteOrder._id);
                    setPendingDeleteOrder(null);
                }}
            />

            <DrawerComponent title={`Chi tiết đơn #${selectedOrder?._id?.slice(-8)?.toUpperCase() || ""}`} isOpen={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} width="45%">
                {selectedOrder ? (
                    <div className="admin-order-detail">
                        <div className="admin-order-detail-grid">
                            <article className="admin-order-detail-card">
                                <h4>Khách hàng</h4>
                                <p>{selectedOrder.iduser?.name || selectedOrder.shippingAddress?.fullName || "-"}</p>
                                <p>{selectedOrder.iduser?.email || "-"}</p>
                                <p>{selectedOrder.shippingAddress?.phone || "-"}</p>
                            </article>
                            <article className="admin-order-detail-card">
                                <h4>Thanh toán</h4>
                                <p>{selectedOrder.paymentMethod || "-"}</p>
                                <p>{Number(selectedOrder.tongtien || 0).toLocaleString("vi-VN")}đ</p>
                                <p>{paymentStatusMap[selectedOrder.paymentStatus]?.text || selectedOrder.paymentStatus || "-"}</p>
                            </article>
                        </div>
                        <div className="admin-order-detail-products">
                            <h4>Sản phẩm trong đơn</h4>
                            {(selectedOrder.items || []).map((item) => (
                                <div key={item._id || item.idsp} className="admin-order-item-row">
                                    <span>{item.name}</span>
                                    <span>x{item.quantity}</span>
                                    <span>{Number(item.price || 0).toLocaleString("vi-VN")}đ</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </DrawerComponent>
        </div>
    );
};

export default AdminOrder;
