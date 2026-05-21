import React from "react";
import { StyledNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperPriceText } from "./style";
import { useLocation, useNavigate } from "react-router-dom";
import { HeartOutlined, HeartFilled, ShoppingCartOutlined } from "@ant-design/icons";
import * as message from "../Message/Message";

const CardComponent = (props) => {
    const { id, image, name, price, discount = 0, countInStock = 0, category = "" } = props;
    const navigate = useNavigate();
    const location = useLocation();
    const finalPrice = Math.round(Number(price || 0) * (1 - Number(discount || 0) / 100));
    const wishlistItems = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
    const isFavorite = wishlistItems.some((item) => item.idsp === id);

    const toggleWishlist = (event) => {
        event.stopPropagation();
        const nextItems = isFavorite
            ? wishlistItems.filter((item) => item.idsp !== id)
            : [...wishlistItems, { idsp: id, name, image, price, discount, countInStock, category }];
        localStorage.setItem("wishlistItems", JSON.stringify(nextItems));
        window.dispatchEvent(new Event("wishlist-updated"));
        message.success(isFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
    };

    const handleAddToCart = (event) => {
        event.stopPropagation();
        if (!countInStock) {
            message.error("Sản phẩm hiện đang hết hàng");
            return;
        }
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const existed = cartItems.find((item) => item.idsp === id);
        const nextItems = existed
            ? cartItems.map((item) => (item.idsp === id ? { ...item, quantity: Math.min((item.quantity || 1) + 1, countInStock) } : item))
            : [...cartItems, { idsp: id, name, image, price, discount, countInStock, quantity: 1, category }];
        localStorage.setItem("cartItems", JSON.stringify(nextItems));
        window.dispatchEvent(new Event("cart-updated"));
        message.success("Đã thêm vào giỏ hàng");
    };

    return (
        <WrapperCardStyle
            hoverable
            onClick={() => id && navigate(`/product-detail/${id}`, { state: { from: `${location.pathname}${location.search}` } })}
            styles={{ body: { padding: "16px" } }}
            cover={
                <div style={{ position: "relative", lineHeight: 0 }}>
                    {Number(discount) > 0 ? (
                        <span
                            style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                zIndex: 1,
                                padding: "5px 9px",
                                borderRadius: 999,
                                background: "#1A1A1A",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 12,
                            }}
                        >
                            -{discount}%
                        </span>
                    ) : null}
                    <button
                        onClick={toggleWishlist}
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            zIndex: 2,
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            border: "1px solid rgba(198,169,105,.35)",
                            background: "rgba(255,255,255,.85)",
                            display: "grid",
                            placeItems: "center",
                            color: isFavorite ? "#A67C52" : "#555",
                            cursor: "pointer",
                        }}
                        aria-label="wishlist"
                    >
                        {isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                    <img
                        alt={name || "Product"}
                        src={image || "https://via.placeholder.com/300"}
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            transition: "transform .45s ease",
                        }}
                    />
                    <button className="quick-add-btn" onClick={handleAddToCart} aria-label="add-to-cart">
                        <ShoppingCartOutlined /> Thêm giỏ hàng
                    </button>
                </div>
            }
        >
            <div style={{ display: "grid", gap: 6 }}>
                <StyledNameProduct>{name}</StyledNameProduct>
                <WrapperPriceText>
                    <span>{finalPrice.toLocaleString("vi-VN")}đ</span>
                </WrapperPriceText>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <WrapperDiscountText>Giao hàng tiêu chuẩn</WrapperDiscountText>
                    <WrapperDiscountText style={{ color: countInStock > 0 ? "#A67C52" : "#7f1d1d" }}>
                        {countInStock > 0 ? "Còn hàng" : "Hết hàng"}
                    </WrapperDiscountText>
                </div>
            </div>
        </WrapperCardStyle>
    );
};

export default CardComponent;
