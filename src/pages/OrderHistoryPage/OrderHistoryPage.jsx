import React from "react";
import { Card, Table, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as BillServices from "../../services/BillServices";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const orderStatusMap = {
    pending: { text: "Pending", color: "gold" },
    confirmed: { text: "Confirmed", color: "blue" },
    shipping: { text: "Shipping", color: "cyan" },
    delivered: { text: "Delivered", color: "green" },
    cancelled: { text: "Cancelled", color: "red" },
};

const OrderHistoryPage = () => {
    const user = useSelector((state) => state.user);
    const ordersQuery = useQuery({
        queryKey: ["order-history", user.access_token],
        queryFn: () => BillServices.getAllBill(user.access_token),
        enabled: Boolean(user.access_token),
    });

    const columns = [
        { title: "Order", dataIndex: "_id", render: (id) => id?.slice(-8).toUpperCase() },
        { title: "Total", dataIndex: "tongtien", render: (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ` },
        { title: "Payment", dataIndex: "paymentMethod" },
        {
            title: "Status",
            dataIndex: "orderStatus",
            render: (status) => <Tag color={orderStatusMap[status]?.color || "default"}>{orderStatusMap[status]?.text || status}</Tag>,
        },
        { title: "Created At", dataIndex: "createdAt", render: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "") },
    ];

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "30px 0 40px" }}>
                <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 48 }}>Order History</h2>
                <p style={{ margin: "8px 0 18px", color: "#555" }}>Theo dõi lịch sử đơn hàng và trạng thái xử lý</p>
                <Card style={{ borderRadius: 18 }}>
                    <Table rowKey="_id" loading={ordersQuery.isLoading} columns={columns} dataSource={ordersQuery.data?.data || []} />
                </Card>
            </div>
            <FooterComponent />
        </div>
    );
};

export default OrderHistoryPage;
