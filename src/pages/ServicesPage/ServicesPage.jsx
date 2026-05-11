import React from "react";
import { Card, Col, Row, Tag } from "antd";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const services = [
    {
        title: "Signature Grooming",
        description: "Liệu trình grooming cao cấp với sản phẩm an toàn, tạo form lông tinh tế theo giống.",
    },
    {
        title: "Luxury Spa Care",
        description: "Tắm, dưỡng lông, vệ sinh tai và chăm sóc da chuyên sâu cho thú cưng nhạy cảm.",
    },
    {
        title: "Nutrition Concierge",
        description: "Tư vấn thực đơn và sản phẩm theo độ tuổi, thể trạng và nhu cầu vận động.",
    },
];

const ServicesPage = () => {
    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "30px 0 40px" }}>
                <div style={{ padding: "30px", borderRadius: 24, border: "1px solid rgba(198,169,105,.24)", background: "linear-gradient(125deg, rgba(255,255,255,.9), rgba(231,215,190,.5))", boxShadow: "0 20px 38px rgba(26,26,26,.1)" }}>
                    <Tag style={{ borderRadius: 999, background: "#1A1A1A", color: "#F8F5F0", padding: "6px 12px", border: "none", marginBottom: 10 }}>petshop Services</Tag>
                    <h2 style={{ margin: "4px 0 8px", color: "#1A1A1A", fontSize: 52 }}>Dịch vụ chăm sóc thú cưng cao cấp</h2>
                    <p style={{ margin: 0, color: "#555", fontSize: 16 }}>Trải nghiệm chuẩn premium với quy trình chuyên nghiệp và không gian thân thiện.</p>
                </div>
                <Row gutter={[20, 20]}>
                    {services.map((service) => (
                        <Col xs={24} md={8} key={service.title}>
                            <Card title={service.title} style={{ height: "100%", marginTop: 24, borderRadius: 16, borderColor: "rgba(198,169,105,.24)", boxShadow: "0 12px 24px rgba(26,26,26,.08)" }}>
                                <p style={{ fontSize: 16, lineHeight: 1.8, color: "#555" }}>{service.description}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
            <FooterComponent />
        </div>
    );
};

export default ServicesPage;
