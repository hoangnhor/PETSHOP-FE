import React from "react";

const FooterComponent = () => {
    return (
        <div
            style={{
                width: "100%",
                background: "linear-gradient(180deg, #1A1A1A 0%, #101010 100%)",
                color: "#e7d7be",
                padding: "54px 0 44px",
                marginTop: 22,
            }}
        >
            <div
                style={{
                    width: "min(1240px, calc(100% - 40px))",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    alignItems: "flex-start",
                    gap: "28px",
                }}
            >
                <div>
                    <h2 style={{ margin: "0 0 10px", color: "#F8F5F0", fontSize: 36, letterSpacing: ".04em" }}>petshop</h2>
                    <p style={{ margin: 0, lineHeight: 1.7, color: "#c7b293" }}>
                        Cửa hàng thương mại điện tử cho thú cưng, tập trung vào sản phẩm chính hãng,
                        tư vấn dễ hiểu và trải nghiệm mua sắm nhanh.
                    </p>
                </div>

                <div>
                    <h3 style={{ color: "#F8F5F0", marginTop: 0, fontSize: 30 }}>Bản đồ</h3>
                    <iframe
                        title="petshop Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954410426466!2d106.67525181062004!3d10.737997189364297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f62a90e5dbd%3A0x674d5126513db295!2zVHLGsOG7nW5nIMSQ4bqhaS ho4buNYyBDw7RuZy buZ2jhu4cgU8OgaSBHw7Ju!5e0!3m2!1svi!2s!4v1745177879295!5m2!1svi!2s"
                        width="100%"
                        height="190"
                        style={{ border: "1px solid rgba(198, 169, 105, 0.26)", borderRadius: 12 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                <div>
                    <h3 style={{ color: "#F8F5F0", marginTop: 0, fontSize: 30 }}>Liên hệ</h3>
                    <p>
                        Email: <a style={{ color: "#C6A969" }} href="mailto:contact@petshop.com">contact@petshop.com</a>
                    </p>
                    <p>
                        Hotline: <a style={{ color: "#C6A969" }} href="tel:+0123456789">0123 456 789</a>
                    </p>
                    <p>
                        Facebook:{" "}
                        <a
                            style={{ color: "#C6A969" }}
                            href="https://facebook.com/petshop"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            petshop
                        </a>
                    </p>
                </div>
                <div>
                    <h3 style={{ color: "#F8F5F0", marginTop: 0, fontSize: 30 }}>Chính sách & Newsletter</h3>
                    <p style={{ color: "#c7b293" }}>Chính sách đổi trả</p>
                    <p style={{ color: "#c7b293" }}>Vận chuyển & thanh toán</p>
                    <input
                        placeholder="Nhập email nhận ưu đãi"
                        style={{
                            marginTop: 8,
                            width: "100%",
                            height: 42,
                            borderRadius: 999,
                            border: "1px solid rgba(198,169,105,.35)",
                            background: "rgba(255,255,255,.08)",
                            color: "#F8F5F0",
                            padding: "0 16px",
                            outline: "none",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FooterComponent;
