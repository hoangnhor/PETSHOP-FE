import { Button, Col, Empty, Image, Input, InputNumber, Row, Tabs } from "antd";
import React, { useState } from "react";
import {
    PromotionList,
    QuantityWrapper,
    WeightWrapper,
    WrapperFeatureItem,
    WrapperPriceProduct,
    WrapperPriceTextProduct,
    WrapperQualityProduct,
    WrapperStyleNameProduct,
} from "./style";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import * as message from "../Message/Message";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as ProductServices from "../../services/ProductServices";
import CardComponent from "../CardComponent/CardComponent";

const ProductDetailsComponenet = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const relatedQuery = useQuery({
        queryKey: ["related-products", product?._id, product?.type?._id || product?.type],
        queryFn: () => ProductServices.getAllProduct({ limit: 4, type: product?.type?._id || product?.type }),
        enabled: Boolean(product?._id),
    });

    if (!product) {
        return <Empty description="Không tìm thấy sản phẩm" style={{ background: "#fff", padding: "80px", borderRadius: 16 }} />;
    }

    const priceAfterDiscount = Math.round(
        Number(product.price || 0) * (1 - Number(product.discount || 0) / 100)
    );
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

        let nextCartItems;
        if (existedItem) {
            nextCartItems = cartItems.map((item) =>
                item.idsp === product._id
                    ? { ...item, quantity: currentQuantity + nextQuantity }
                    : item
            );
        } else {
            nextCartItems = [
                ...cartItems,
                {
                    idsp: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    discount: product.discount || 0,
                    countInStock: product.countInStock,
                    quantity: nextQuantity,
                },
            ];
        }

        localStorage.setItem("cartItems", JSON.stringify(nextCartItems));
        window.dispatchEvent(new Event("cart-updated"));
        message.success("Đã thêm vào giỏ hàng");
        if (goToOrder) navigate("/checkout");
    };

    return (
        <>
        <Row gutter={[28, 28]} style={{ padding: "28px", background: "rgba(255,255,255,.85)", borderRadius: "20px", border: "1px solid rgba(198,169,105,.24)", boxShadow: "0 20px 40px rgba(26,26,26,.1)" }}>
            <Col xs={24} md={10}>
                <Image
                    src={product.image || "https://via.placeholder.com/500"}
                    alt={product.name}
                    preview={false}
                    style={{ width: "100%", maxHeight: "520px", objectFit: "cover", borderRadius: 14, background: "#f8f5f0" }}
                />
            </Col>
            <Col xs={24} md={14}>
                <WrapperStyleNameProduct>{product.name}</WrapperStyleNameProduct>
                <WrapperPriceProduct>
                    <WrapperPriceTextProduct>
                        {priceAfterDiscount.toLocaleString("vi-VN")}đ
                    </WrapperPriceTextProduct>
                    {product.discount ? (
                        <span style={{ marginLeft: "12px", fontSize: "18px", color: "#777" }}>
                            Giảm {product.discount}%
                        </span>
                    ) : null}
                </WrapperPriceProduct>
                <WeightWrapper>
                    <strong>Loại sản phẩm:</strong>
                    <Input
                        value={product.type?.name || product.type || "Chưa phân loại"}
                        style={{ width: "220px", borderRadius: 12, fontWeight: 600, borderColor: "rgba(198,169,105,.25)" }}
                        readOnly
                    />
                </WeightWrapper>
                <WrapperQualityProduct>
                    <span>Còn hàng: {product.countInStock || 0}</span>
                    <span>Đã bán: {product.selled || 0}</span>
                </WrapperQualityProduct>
                <p style={{ fontSize: "16px", marginTop: "16px", color: "#555555", lineHeight: 1.8 }}>
                    {product.description || "Sản phẩm chăm sóc thú cưng chất lượng."}
                </p>
                <QuantityWrapper>
                    <strong>Số lượng</strong>
                    <InputNumber
                        min={1}
                        max={product.countInStock || 1}
                        value={quantity}
                        onChange={(value) => setQuantity(value || 1)}
                        style={{ width: "100px", marginLeft: "12px" }}
                    />
                </QuantityWrapper>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <ButtonComponent
                        size={30}
                        type="primary"
                        disabled={!product.countInStock}
                        onClick={() => addToCart(true)}
                        styleButton={{
                            height: "45px",
                            width: "180px",
                            border: "none",
                            borderRadius: "12px",
                            background: "#1A1A1A",
                            fontWeight: 600,
                        }}
                        textButton={"Mua ngay"}
                        styleTextButton={{ color: "#fff" }}
                    />
                    <Button
                        type="primary"
                        disabled={!product.countInStock}
                        onClick={() => addToCart(false)}
                        style={{
                            backgroundColor: "#111827",
                            height: "45px",
                            width: "180px",
                            border: "1px solid rgba(198,169,105,.4)",
                            borderRadius: "12px",
                            fontWeight: 600,
                            color: "#F8F5F0"
                        }}
                    >
                        Thêm vào giỏ hàng
                    </Button>
                </div>
                <PromotionList>
                    <strong style={{ fontWeight: 700, fontSize: "24px", color: "#1A1A1A" }}>
                        Quyền lợi khi mua online
                    </strong>
                    <WrapperFeatureItem>Giữ hàng tại Shop cho khách đặt hàng online</WrapperFeatureItem>
                    <WrapperFeatureItem>Giao hàng toàn quốc</WrapperFeatureItem>
                    <WrapperFeatureItem>Tư vấn miễn phí 24/7</WrapperFeatureItem>
                    <WrapperFeatureItem>Bảo hành nhanh chóng</WrapperFeatureItem>
                </PromotionList>
            </Col>
        </Row>
        <div style={{ marginTop: 20, borderRadius: 18, border: "1px solid rgba(198,169,105,.22)", background: "rgba(255,255,255,.84)", padding: 16, boxShadow: "0 12px 24px rgba(26,26,26,.08)" }}>
            <Tabs
                items={[
                    { key: "desc", label: "Description", children: <p style={{ color: "#555", lineHeight: 1.8 }}>{product.description || "Sản phẩm cao cấp dành cho thú cưng, tiêu chuẩn chất lượng petshop."}</p> },
                    { key: "review", label: "Reviews", children: <p style={{ color: "#555", lineHeight: 1.8 }}>Đánh giá sẽ sớm được cập nhật cho sản phẩm này.</p> },
                    { key: "shipping", label: "Shipping", children: <p style={{ color: "#555", lineHeight: 1.8 }}>Giao hàng toàn quốc, đóng gói bảo quản chuẩn premium.</p> },
                    { key: "care", label: "Care Guide", children: <p style={{ color: "#555", lineHeight: 1.8 }}>Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp, đọc kỹ hướng dẫn trước khi dùng.</p> },
                ]}
            />
        </div>
        {(relatedQuery.data?.data || []).length > 1 && (
            <div style={{ marginTop: 22 }}>
                <h3 style={{ margin: "0 0 10px", color: "#1A1A1A", fontSize: 36 }}>Related Products</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
                    {relatedQuery.data.data
                        .filter((item) => item._id !== product._id)
                        .slice(0, 4)
                        .map((item) => (
                            <CardComponent
                                key={item._id}
                                id={item._id}
                                image={item.image}
                                name={item.name}
                                price={item.price}
                                discount={item.discount}
                                countInStock={item.countInStock}
                                category={item.type?.name}
                            />
                        ))}
                </div>
            </div>
        )}
        </>
    );
};

export default ProductDetailsComponenet;
