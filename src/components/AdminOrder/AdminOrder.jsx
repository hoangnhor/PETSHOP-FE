import React from "react";
import { Button, Popconfirm, Select, Table, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as BillServices from "../../services/BillServices";
import * as message from "../Message/Message";
import { WrapperHeader } from "../AdminProduct/style";

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

    const ordersQuery = useQuery({
        queryKey: ["admin-orders", user.access_token],
        queryFn: () => BillServices.getAllBill(user.access_token),
        enabled: Boolean(user.access_token),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, orderStatus }) =>
            BillServices.updateBillStatus(id, { orderStatus }, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Cập nhật đơn hàng thành công");
                ordersQuery.refetch();
            } else {
                message.error(res?.message || "Cập nhật thất bại");
            }
        },
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (id) => BillServices.deleteBill(id, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Xóa đơn hàng thành công");
                ordersQuery.refetch();
            } else {
                message.error(res?.message || "Xóa đơn hàng thất bại");
            }
        },
    });

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "_id",
            render: (id) => <span>{id?.slice(-8).toUpperCase()}</span>,
        },
        {
            title: "Khách hàng",
            dataIndex: "iduser",
            render: (customer, record) => (
                <div>
                    <div>{customer?.name || record.shippingAddress?.fullName}</div>
                    <div style={{ color: "#777" }}>{customer?.email || record.shippingAddress?.phone}</div>
                </div>
            ),
        },
        {
            title: "Sản phẩm",
            dataIndex: "items",
            render: (items) => (
                <div>
                    {items?.map((item) => (
                        <div key={item._id || item.idsp}>
                            {item.name} x {item.quantity}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: "Tổng tiền",
            dataIndex: "tongtien",
            render: (value) => Number(value || 0).toLocaleString("vi-VN") + "đ",
        },
        {
            title: "Thanh toán",
            render: (_, record) => (
                <div>
                    <div>{record.paymentMethod}</div>
                    <Tag color={paymentStatusMap[record.paymentStatus]?.color || "default"}>
                        {paymentStatusMap[record.paymentStatus]?.text || record.paymentStatus}
                    </Tag>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "orderStatus",
            render: (status) => (
                <Tag color={orderStatusMap[status]?.color || "default"}>
                    {orderStatusMap[status]?.text || status}
                </Tag>
            ),
        },
        {
            title: "Cập nhật",
            render: (_, record) => (
                <Select
                    value={record.orderStatus}
                    style={{ width: 150 }}
                    options={orderStatusOptions}
                    disabled={record.orderStatus === "cancelled"}
                    onChange={(orderStatus) =>
                        updateStatusMutation.mutate({ id: record._id, orderStatus })
                    }
                />
            ),
        },
        {
            title: "",
            render: (_, record) => (
                <Popconfirm
                    title="Xóa đơn hàng này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => deleteOrderMutation.mutate(record._id)}
                >
                    <Button icon={<DeleteOutlined />} style={{ borderColor: "rgba(138,61,61,.35)", color: "#8a3d3d" }} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <WrapperHeader>Quản Lý Đơn Hàng</WrapperHeader>
            <Table
                rowKey="_id"
                loading={ordersQuery.isLoading || updateStatusMutation.isPending || deleteOrderMutation.isPending}
                columns={columns}
                dataSource={ordersQuery.data?.data || []}
            />
        </div>
    );
};

export default AdminOrder;
