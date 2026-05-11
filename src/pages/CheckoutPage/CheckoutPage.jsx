import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Empty, Form, Input, Row, Select, Table } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as BillServices from "../../services/BillServices";
import * as message from "../../components/Message/Message";
import Loading from "../../components/LoadingComponent/Loading";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("cartItems") || "[]"));
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            shippingAddress: { fullName: user.name, phone: user.phone, address: user.address },
        });
    }, [form, user.name, user.phone, user.address]);

    const totalPrice = useMemo(
        () => cartItems.reduce((total, item) => total + Number(item.price || 0) * (1 - Number(item.discount || 0) / 100) * Number(item.quantity || 0), 0),
        [cartItems]
    );

    const ordersQuery = useQuery({
        queryKey: ["checkout-orders", user.access_token],
        queryFn: () => BillServices.getAllBill(user.access_token),
        enabled: Boolean(user.access_token),
    });

    const createOrderMutation = useMutation({
        mutationFn: (values) =>
            BillServices.createBill(
                {
                    items: cartItems.map((item) => ({ idsp: item.idsp, quantity: Number(item.quantity) })),
                    shippingAddress: values.shippingAddress,
                    paymentMethod: values.paymentMethod,
                    note: values.note,
                },
                user.access_token
            ),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Đặt hàng thành công");
                localStorage.setItem("cartItems", JSON.stringify([]));
                window.dispatchEvent(new Event("cart-updated"));
                setCartItems([]);
                form.resetFields();
                ordersQuery.refetch();
                navigate("/order-history");
            } else {
                message.error(res?.message || "Đặt hàng thất bại");
            }
        },
        onError: (error) => message.error(error?.message || "Đặt hàng thất bại"),
    });

    const columns = [
        { title: "Sản phẩm", dataIndex: "name" },
        { title: "SL", dataIndex: "quantity" },
        { title: "Giá", dataIndex: "price", render: (price, record) => Math.round(Number(price || 0) * (1 - Number(record.discount || 0) / 100)).toLocaleString("vi-VN") + "đ" },
    ];

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "30px 0 40px" }}>
                <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 48 }}>Checkout</h2>
                <p style={{ margin: "8px 0 18px", color: "#555" }}>Xác nhận thông tin giao hàng và hoàn tất đơn mua</p>
                {!cartItems.length ? (
                    <Card><Empty description="Giỏ hàng trống" /></Card>
                ) : (
                    <Row gutter={20}>
                        <Col xs={24} lg={14}>
                            <Card title="Order Summary" style={{ borderRadius: 18 }}>
                                <Table rowKey="idsp" columns={columns} dataSource={cartItems} pagination={false} />
                                <div style={{ textAlign: "right", marginTop: 12, fontWeight: 700, fontSize: 22 }}>
                                    Tổng tiền: {Math.round(totalPrice).toLocaleString("vi-VN")}đ
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={10}>
                            <Card title="Shipping & Payment" style={{ borderRadius: 18 }}>
                                <Loading isPending={createOrderMutation.isPending}>
                                    <Form form={form} layout="vertical" onFinish={(values) => createOrderMutation.mutate(values)} initialValues={{ paymentMethod: "COD" }}>
                                        <Form.Item label="Họ tên" name={["shippingAddress", "fullName"]} rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}><Input /></Form.Item>
                                        <Form.Item label="Số điện thoại" name={["shippingAddress", "phone"]} rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}><Input /></Form.Item>
                                        <Form.Item label="Địa chỉ" name={["shippingAddress", "address"]} rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}><Input.TextArea rows={3} /></Form.Item>
                                        <Form.Item label="Thành phố" name={["shippingAddress", "city"]}><Input /></Form.Item>
                                        <Form.Item label="Thanh toán" name="paymentMethod">
                                            <Select options={[{ value: "COD", label: "Thanh toán khi nhận hàng" }, { value: "BANKING", label: "Chuyển khoản" }]} />
                                        </Form.Item>
                                        <Form.Item label="Ghi chú" name="note"><Input.TextArea rows={2} /></Form.Item>
                                        <Button type="primary" htmlType="submit" block style={{ height: 44, borderRadius: 999, background: "#1A1A1A", borderColor: "#1A1A1A" }}>
                                            Place Order
                                        </Button>
                                    </Form>
                                </Loading>
                            </Card>
                        </Col>
                    </Row>
                )}
            </div>
            <FooterComponent />
        </div>
    );
};

export default CheckoutPage;
