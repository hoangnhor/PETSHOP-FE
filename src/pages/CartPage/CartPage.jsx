import React, { useMemo, useState } from "react";
import { Button, Card, Empty, InputNumber, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("cartItems") || "[]"));

    const syncCart = (items) => {
        setCartItems(items);
        localStorage.setItem("cartItems", JSON.stringify(items));
        window.dispatchEvent(new Event("cart-updated"));
    };

    const totalPrice = useMemo(
        () =>
            cartItems.reduce((total, item) => {
                const priceAfterDiscount = Number(item.price || 0) * (1 - Number(item.discount || 0) / 100);
                return total + priceAfterDiscount * Number(item.quantity || 0);
            }, 0),
        [cartItems]
    );

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (name, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={record.image || "https://via.placeholder.com/80"} alt={name} style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 10 }} />
                    <span>{name}</span>
                </div>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: (price, record) => Math.round(Number(price || 0) * (1 - Number(record.discount || 0) / 100)).toLocaleString("vi-VN") + "đ",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    max={record.countInStock || 1}
                    value={quantity}
                    onChange={(value) => syncCart(cartItems.map((item) => (item.idsp === record.idsp ? { ...item, quantity: value || 1 } : item)))}
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
                <Button icon={<DeleteOutlined />} style={{ borderColor: "rgba(138,61,61,.35)", color: "#8a3d3d" }} onClick={() => syncCart(cartItems.filter((item) => item.idsp !== record.idsp))} />
            ),
        },
    ];

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "30px 0 40px" }}>
                <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 48 }}>Shopping Cart</h2>
                <p style={{ margin: "8px 0 18px", color: "#555" }}>Kiểm tra sản phẩm trước khi thanh toán</p>
                <Card style={{ borderRadius: 18 }}>
                    {cartItems.length ? (
                        <>
                            <Table rowKey="idsp" columns={columns} dataSource={cartItems} pagination={false} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                                <strong style={{ fontSize: 24, color: "#1A1A1A" }}>Tổng tiền: {Math.round(totalPrice).toLocaleString("vi-VN")}đ</strong>
                                <Button type="primary" onClick={() => navigate("/checkout")} style={{ height: 44, borderRadius: 999, background: "#1A1A1A", borderColor: "#1A1A1A" }}>
                                    Tiến hành thanh toán
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Empty description="Giỏ hàng trống" />
                    )}
                </Card>
            </div>
            <FooterComponent />
        </div>
    );
};

export default CartPage;
