import React from "react";
import { StyledNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperPriceText } from "./style";
import { useNavigate } from "react-router-dom";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const CardComponent = (props) => {
    const { id, image, name, price, discount = 0, countInStock = 0, category = "" } = props;
    const navigate = useNavigate();
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
    };

    return (
        <WrapperCardStyle
            hoverable
            onClick={() => id && navigate(`/product-detail/${id}`)}
            styles={{ body: { padding: "14px" } }}
            cover={
                <div style={{ position: "relative", background: "#f8fafc" }}>
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
                            height: "250px",
                            objectFit: "cover",
                            transition: "transform .45s ease",
                        }}
                    />
                </div>
            }
        >
            <StyledNameProduct>{name}</StyledNameProduct>
            <WrapperDiscountText style={{ display: "block", marginBottom: 5 }}>{category || "Luxury Collection"}</WrapperDiscountText>
            <WrapperPriceText>
                <span>{finalPrice.toLocaleString("vi-VN")}đ</span>
            </WrapperPriceText>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <WrapperDiscountText>Premium Delivery</WrapperDiscountText>
                <WrapperDiscountText style={{ color: countInStock > 0 ? "#A67C52" : "#7f1d1d" }}>
                    {countInStock > 0 ? `Còn ${countInStock}` : "Hết hàng"}
                </WrapperDiscountText>
            </div>
        </WrapperCardStyle>
    );
};

export default CardComponent;
