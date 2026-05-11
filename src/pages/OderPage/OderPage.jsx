import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Empty, Form, Input, InputNumber, Popconfirm, Row, Select, Table, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as BillServices from "../../services/BillServices";
import * as message from "../../components/Message/Message";
import Loading from "../../components/LoadingComponent/Loading";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const orderStatusMap = {
    pending: { text: "Chờ xác nhận", color: "gold" },
    confirmed: { text: "Đã xác nhận", color: "blue" },
    shipping: { text: "Đang giao", color: "cyan" },
    delivered: { text: "Đã giao", color: "green" },
    cancelled: { text: "Đã hủy", color: "red" },
};

const OderPage = () => {
    const user = useSelector((state) => state.user);
    const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("cartItems") || "[]"));
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            shippingAddress: {
                fullName: user.name,
                phone: user.phone,
                address: user.address,
            },
        });
    }, [form, user.name, user.phone, user.address]);

    const totalPrice = useMemo(
        () =>
            cartItems.reduce((total, item) => {
                const priceAfterDiscount = Number(item.price || 0) * (1 - Number(item.discount || 0) / 100);
                return total + priceAfterDiscount * Number(item.quantity || 0);
            }, 0),
        [cartItems]
    );

    const syncCart = (items) => {
        setCartItems(items);
        localStorage.setItem("cartItems", JSON.stringify(items));
        window.dispatchEvent(new Event("cart-updated"));
    };

    const ordersQuery = useQuery({
        queryKey: ["my-orders", user.access_token],
        queryFn: () => BillServices.getAllBill(user.access_token),
        enabled: Boolean(user.access_token),
    });

    const createOrderMutation = useMutation({
        mutationFn: (values) =>
            BillServices.createBill(
                {
                    items: cartItems.map((item) => ({
                        idsp: item.idsp,
                        quantity: Number(item.quantity),
                    })),
                    shippingAddress: values.shippingAddress,
                    paymentMethod: values.paymentMethod,
                    note: values.note,
                },
                user.access_token
            ),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Đặt hàng thành công");
                syncCart([]);
                form.resetFields();
                ordersQuery.refetch();
            } else {
                message.error(res?.message || "Đặt hàng thất bại");
            }
        },
        onError: (error) => {
            message.error(error?.message || "Đặt hàng thất bại");
        },
    });

    const cancelOrderMutation = useMutation({
        mutationFn: (id) => BillServices.cancelBill(id, { cancelReason: "Khách hàng hủy đơn" }, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Đã hủy đơn hàng");
                ordersQuery.refetch();
            } else {
                message.error(res?.message || "Hủy đơn thất bại");
            }
        },
    });

    const cartColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (name, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                        src={record.image || "https://via.placeholder.com/80"}
                        alt={name}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                    />
                    <span>{name}</span>
                </div>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: (price, record) =>
                Math.round(Number(price || 0) * (1 - Number(record.discount || 0) / 100)).toLocaleString("vi-VN") + "đ",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    max={record.countInStock || 1}
                    value={quantity}
                    onChange={(value) =>
                        syncCart(
                            cartItems.map((item) =>
                                item.idsp === record.idsp ? { ...item, quantity: value || 1 } : item
                            )
                        )
                    }
                />
            ),
        },
        {
            title: "Thành tiền",
            render: (_, record) => {
                const price = Number(record.price || 0) * (1 - Number(record.discount || 0) / 100);
                return Math.round(price * record.quantity).toLocaleString("vi-VN") + "đ";
            },
        },
        {
            title: "",
            render: (_, record) => (
                <Button
                    icon={<DeleteOutlined />}
                    style={{ borderColor: "rgba(138,61,61,.35)", color: "#8a3d3d" }}
                    onClick={() => syncCart(cartItems.filter((item) => item.idsp !== record.idsp))}
                />
            ),
        },
    ];

    const orderColumns = [
        {
            title: "Mã đơn",
            dataIndex: "_id",
            render: (id) => <span>{id?.slice(-8).toUpperCase()}</span>,
        },
        {
            title: "Tổng tiền",
            dataIndex: "tongtien",
            render: (value) => Number(value || 0).toLocaleString("vi-VN") + "đ",
        },
        {
            title: "Thanh toán",
            dataIndex: "paymentMethod",
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
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (value) => (value ? new Date(value).toLocaleString("vi-VN") : ""),
        },
        {
            title: "",
            render: (_, record) =>
                ["pending", "confirmed"].includes(record.orderStatus) ? (
                    <Popconfirm
                        title="Hủy đơn hàng này?"
                        okText="Hủy đơn"
                        cancelText="Không"
                        onConfirm={() => cancelOrderMutation.mutate(record._id)}
                    >
                        <Button style={{ borderColor: "rgba(138,61,61,.35)", color: "#8a3d3d" }}>Hủy</Button>
                    </Popconfirm>
                ) : null,
        },
    ];

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1320px, calc(100% - 40px))", margin: "0 auto", padding: "24px 0 36px", minHeight: "700px" }}>
                <div style={{ marginBottom: 16 }}>
                    <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 46 }}>Checkout</h2>
                    <p style={{ margin: "6px 0 0", color: "#555" }}>Hoàn tất đơn hàng với trải nghiệm premium từ petshop</p>
                </div>
                <Row gutter={20}>
                    <Col span={15}>
                        <Card title="Giỏ hàng" style={{ borderRadius: 18, borderColor: "rgba(198,169,105,.24)", boxShadow: "0 16px 30px rgba(26,26,26,.08)" }}>
                            {cartItems.length ? (
                                <>
                                    <Table
                                        rowKey="idsp"
                                        columns={cartColumns}
                                        dataSource={cartItems}
                                        pagination={false}
                                    />
                                    <div style={{ textAlign: "right", marginTop: 16, fontSize: 22, fontWeight: 700 }}>
                                        Tổng tiền: {Math.round(totalPrice).toLocaleString("vi-VN")}đ
                                    </div>
                                </>
                            ) : (
                                <Empty description="Giỏ hàng đang trống" />
                            )}
                        </Card>
                    </Col>
                    <Col span={9}>
                        <Card title="Thông tin nhận hàng" style={{ borderRadius: 18, borderColor: "rgba(198,169,105,.24)", boxShadow: "0 16px 30px rgba(26,26,26,.08)" }}>
                            <Loading isPending={createOrderMutation.isPending}>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={(values) => createOrderMutation.mutate(values)}
                                    initialValues={{
                                        paymentMethod: "COD",
                                        shippingAddress: {
                                            fullName: user.name,
                                            phone: user.phone,
                                            address: user.address,
                                        },
                                    }}
                                >
                                    <Form.Item
                                        label="Họ tên"
                                        name={["shippingAddress", "fullName"]}
                                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Số điện thoại"
                                        name={["shippingAddress", "phone"]}
                                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Địa chỉ"
                                        name={["shippingAddress", "address"]}
                                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                                    >
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                    <Form.Item label="Thành phố" name={["shippingAddress", "city"]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Phương thức thanh toán" name="paymentMethod">
                                        <Select
                                            options={[
                                                { value: "COD", label: "Thanh toán khi nhận hàng" },
                                                { value: "BANKING", label: "Chuyển khoản" },
                                            ]}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Ghi chú" name="note">
                                        <Input.TextArea rows={2} />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        disabled={!cartItems.length}
                                        style={{ height: 44, fontWeight: 600, background: "#1A1A1A", borderColor: "#1A1A1A", borderRadius: 12 }}
                                    >
                                        Đặt hàng
                                    </Button>
                                </Form>
                            </Loading>
                        </Card>
                    </Col>
                </Row>
                <Card title="Đơn hàng của tôi" style={{ marginTop: 20, borderRadius: 18, borderColor: "rgba(198,169,105,.24)", boxShadow: "0 16px 30px rgba(26,26,26,.08)" }}>
                    <Table
                        rowKey="_id"
                        loading={ordersQuery.isLoading}
                        columns={orderColumns}
                        dataSource={ordersQuery.data?.data || []}
                    />
                </Card>
            </div>
            <FooterComponent />
        </div>
    );
};

export default OderPage;
