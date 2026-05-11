import React, { useEffect, useState } from "react";
import { Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import CardComponent from "../../components/CardComponent/CardComponent";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const WishlistPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("wishlistItems") || "[]"));

    useEffect(() => {
        const sync = () => setItems(JSON.parse(localStorage.getItem("wishlistItems") || "[]"));
        window.addEventListener("wishlist-updated", sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("wishlist-updated", sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "30px 0 40px" }}>
                <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 48 }}>Wishlist</h2>
                <p style={{ margin: "8px 0 18px", color: "#555" }}>Danh sách sản phẩm yêu thích của bạn</p>
                {items.length ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
                        {items.map((item) => (
                            <CardComponent
                                key={item.idsp}
                                id={item.idsp}
                                image={item.image}
                                name={item.name}
                                price={item.price}
                                discount={item.discount}
                                countInStock={item.countInStock}
                                category={item.category}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ borderRadius: 20, border: "1px solid rgba(198,169,105,.24)", background: "rgba(255,255,255,.86)", padding: 30 }}>
                        <Empty description="Bạn chưa có sản phẩm yêu thích" />
                        <div style={{ textAlign: "center", marginTop: 10 }}>
                            <Button type="primary" onClick={() => navigate("/products")} style={{ borderRadius: 999, background: "#1A1A1A", borderColor: "#1A1A1A" }}>
                                Khám phá sản phẩm
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <FooterComponent />
        </div>
    );
};

export default WishlistPage;
