import { Avatar, Button, Empty, InputNumber, Tabs, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import * as message from "../Message/Message";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as ProductServices from "../../services/ProductServices";
import CardComponent from "../CardComponent/CardComponent";
import { getMappedProductImage } from "../../utils/productImageMap";

const ProductDetailsComponenet = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const navigate = useNavigate();
    const displayImage = getMappedProductImage(product?.name, product?.image);

    const gallery = useMemo(() => {
        const base = [displayImage, ...(String(product?.image || "").split(",").map((item) => item.trim()).filter(Boolean))];
        return [...new Set(base.filter(Boolean))];
    }, [displayImage, product?.image]);

    const productTypeId = product?.type?._id || product?.type;
    const canFilterByType = Boolean(productTypeId && /^[a-f\d]{24}$/i.test(String(productTypeId)));
    const relatedQuery = useQuery({
        queryKey: ["related-products", product?._id, productTypeId],
        queryFn: () => (canFilterByType ? ProductServices.getAllProduct({ limit: 8, type: productTypeId }) : ProductServices.getAllProduct({ limit: 8 })),
        enabled: Boolean(product?._id),
    });

    if (!product) return <Empty description="Không tìm thấy sản phẩm" style={{ background: "#fff", padding: 80, borderRadius: 16 }} />;

    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);
    const priceAfterDiscount = Math.round(price * (1 - discount / 100));

    const addToCart = (goToOrder = false) => {
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const existedItem = cartItems.find((item) => item.idsp === product._id);
        const nextQuantity = Number(quantity);
        const stock = Number(product.countInStock || 0);
        const currentQuantity = Number(existedItem?.quantity || 0);

        if (nextQuantity < 1 || currentQuantity + nextQuantity > stock) {
            message.error("Số lượng vượt quá tồn kho");
            return;
        }

        const nextCartItems = existedItem
            ? cartItems.map((item) => (item.idsp === product._id ? { ...item, quantity: currentQuantity + nextQuantity } : item))
            : [...cartItems, { idsp: product._id, name: product.name, image: displayImage, price: product.price, discount: product.discount || 0, countInStock: product.countInStock, quantity: nextQuantity }];

        localStorage.setItem("cartItems", JSON.stringify(nextCartItems));
        window.dispatchEvent(new Event("cart-updated"));
        message.success("Đã thêm vào giỏ hàng");
        if (goToOrder) navigate("/checkout");
    };

    const reviewItems = [
        { name: "Hà My", date: "12/05/2026", text: "Mèo nhà mình rất thích món này, giao nhanh và đóng gói kỹ.", stars: 5 },
        { name: "Trúc Linh", date: "08/05/2026", text: "Chất lượng ổn định, dùng đều đặn thấy hiệu quả tốt.", stars: 5 },
    ];

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start", background: "rgba(255,255,255,.88)", border: "1px solid rgba(0,0,0,.08)", borderRadius: 14, padding: 18 }}>
                <div>
                    <div style={{ background: "#EDE8E0", borderRadius: 14, height: 360, border: "1px solid rgba(0,0,0,.07)", overflow: "hidden", display: "grid", placeItems: "center", position: "relative" }}>
                        {discount > 0 && <span style={{ position: "absolute", top: 12, left: 12, background: "#D85A30", color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>-{discount}%</span>}
                        {gallery.length ? <img src={gallery[activeImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : "Không có ảnh"}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        {gallery.slice(0, 5).map((img, idx) => (
                            <button key={`${img}-${idx}`} onClick={() => setActiveImage(idx)} style={{ width: 66, height: 66, padding: 0, borderRadius: 8, overflow: "hidden", border: idx === activeImage ? "1.5px solid #D85A30" : "1px solid rgba(0,0,0,.12)", cursor: "pointer", background: "#EDE8E0" }}>
                                <img src={img} alt={`thumb-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Tag color="green">Dành cho thú cưng</Tag>
                        <Tag color="gold">{product.type?.name || product.type || "Chưa phân loại"}</Tag>
                    </div>
                    <h1 style={{ margin: 0, fontSize: 34, color: "#2C2C2A", lineHeight: 1.2 }}>{product.name}</h1>
                    <div style={{ color: "#888780", fontSize: 13 }}>★★★★★ 4.8 · 126 đánh giá · Đã bán {product.selled || 0}+</div>
                    <div style={{ background: "#FFF8F5", border: "1px solid rgba(216,90,48,.2)", borderRadius: 10, padding: "10px 14px" }}>
                        <span style={{ fontSize: 32, color: "#D85A30", fontWeight: 700 }}>{priceAfterDiscount.toLocaleString("vi-VN")}đ</span>
                        {discount > 0 && <span style={{ marginLeft: 10, color: "#B4B2A9", textDecoration: "line-through" }}>{price.toLocaleString("vi-VN")}đ</span>}
                    </div>
                    <p style={{ margin: 0, color: "#5F5E5A", lineHeight: 1.7 }}>{product.description || "Sản phẩm chăm sóc thú cưng chất lượng cao."}</p>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 13 }}>Số lượng</strong>
                        <InputNumber min={1} max={product.countInStock || 1} value={quantity} onChange={(value) => setQuantity(value || 1)} />
                        <span style={{ fontSize: 12, color: "#3B6D11" }}>Còn {product.countInStock || 0} sản phẩm</span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <Button type="primary" onClick={() => addToCart(true)} style={{ background: "#2C2C2A", borderColor: "#2C2C2A", borderRadius: 9, height: 42, paddingInline: 20 }}>
                            Mua ngay
                        </Button>
                        <Button onClick={() => addToCart(false)} icon={<ShoppingCartOutlined />} style={{ borderRadius: 9, height: 42, paddingInline: 20 }}>
                            Thêm vào giỏ
                        </Button>
                        <Button icon={<HeartOutlined />} style={{ borderRadius: 9, width: 42, height: 42 }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                            ["Giao hàng toàn quốc", "2-3 ngày"],
                            ["Đổi trả 7 ngày", "Không cần lý do"],
                            ["Chính hãng 100%", "Có tem kiểm định"],
                            ["Tư vấn 24/7", "Hotline hỗ trợ"],
                        ].map((item) => (
                            <div key={item[0]} style={{ background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 8, padding: "8px 10px" }}>
                                <strong style={{ display: "block", fontSize: 12, color: "#2C2C2A" }}>{item[0]}</strong>
                                <span style={{ fontSize: 11, color: "#5F5E5A" }}>{item[1]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16, background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 12, padding: 14 }}>
                <Tabs
                    items={[
                        { key: "desc", label: "Thành phần & dinh dưỡng", children: <div style={{ lineHeight: 1.7, color: "#444" }}><p><strong>Thành phần:</strong> {product.material || "Thông tin đang cập nhật"}</p><p><strong>Lợi ích:</strong> {product.description || "An toàn, dễ sử dụng."}</p></div> },
                        { key: "usage", label: "Hướng dẫn sử dụng", children: <div style={{ lineHeight: 1.7, color: "#444" }}>Dùng theo khuyến nghị, theo dõi phản ứng thú cưng 24-48 giờ đầu.</div> },
                        { key: "shipping", label: "Vận chuyển", children: <div style={{ lineHeight: 1.7, color: "#444" }}>Giao hàng toàn quốc, đóng gói cẩn thận.</div> },
                        { key: "storage", label: "Bảo quản", children: <div style={{ lineHeight: 1.7, color: "#444" }}>Bảo quản nơi khô ráo, tránh nắng trực tiếp.</div> },
                    ]}
                />
            </div>

            <div style={{ marginTop: 16, background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderRadius: 12, padding: 14 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 22, color: "#2C2C2A" }}>Đánh giá khách hàng</h3>
                {reviewItems.map((rv) => (
                    <div key={`${rv.name}-${rv.date}`} style={{ background: "#F9F7F4", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <Avatar>{rv.name.charAt(0)}</Avatar>
                            <div>
                                <strong style={{ fontSize: 13 }}>{rv.name}</strong>
                                <div style={{ fontSize: 11, color: "#B4B2A9" }}>{rv.date}</div>
                            </div>
                        </div>
                        <div style={{ color: "#EF9F27", fontSize: 12, marginBottom: 5 }}>{"★".repeat(rv.stars)}</div>
                        <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.6 }}>{rv.text}</div>
                    </div>
                ))}
            </div>

            {relatedQuery.data?.data?.filter((item) => item._id !== product._id).length > 0 && (
                <div style={{ marginTop: 18 }}>
                    <h3 style={{ margin: "0 0 10px", color: "#1A1A1A", fontSize: 30 }}>Sản phẩm liên quan</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
                        {relatedQuery.data.data
                            .filter((item) => item._id !== product._id)
                            .slice(0, 4)
                            .map((item) => (
                                <CardComponent key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} discount={item.discount} countInStock={item.countInStock} category={item.type?.name} />
                            ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetailsComponenet;
