import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const NotFoundPage=()=>{
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
            <div style={{ width: "min(1100px, calc(100% - 40px))", margin: "70px auto 40px", flex: 1 }}>
                <div style={{ border: "1px solid rgba(198,169,105,.24)", borderRadius: 26, background: "linear-gradient(135deg, rgba(255,255,255,.88), rgba(231,215,190,.5))", boxShadow: "0 22px 44px rgba(26,26,26,.11)", padding: "50px 38px", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#A67C52", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>MaisonPet</p>
                    <h1 style={{ margin: "12px 0 0", fontSize: 90, color: "#1A1A1A", lineHeight: 1 }}>404</h1>
                    <h2 style={{ margin: "0 0 8px", fontSize: 44, color: "#1A1A1A" }}>Page Not Found</h2>
                    <p style={{ margin: "0 auto 24px", color: "#555", maxWidth: 560, lineHeight: 1.8 }}>
                        Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
                    </p>
                    <Button type="primary" onClick={() => navigate("/")} style={{ height: 46, borderRadius: 999, background: "#1A1A1A", borderColor: "#1A1A1A", padding: "0 24px" }}>
                        Về trang chủ
                    </Button>
                </div>
            </div>
            <FooterComponent />
        </div>
    )
}
export default NotFoundPage;
