import React from "react";
import { Button, Card, Form, Input, message as antdMessage } from "antd";
import FooterComponent from "../../components/FooterComponent/FooterComponent";

const ContactPage = () => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        antdMessage.success("Cảm ơn bạn, shop sẽ liên hệ lại sớm");
        form.resetFields();
    };

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1000px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "28px 0 40px" }}>
                <Card style={{ borderRadius: 22, borderColor: "rgba(198,169,105,.24)", background: "rgba(255,255,255,.84)", boxShadow: "0 20px 40px rgba(26,26,26,.1)" }}>
                    <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 48 }}>Liên hệ MaisonPet</h2>
                    <p style={{ margin: "8px 0 0", color: "#555", fontSize: 16 }}>Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                    <p style={{ fontSize: 16, marginTop: 18 }}><strong>Hotline:</strong> 0900 000 000</p>
                    <p style={{ fontSize: 16 }}><strong>Địa chỉ:</strong> 123 Pet Street, TP. Hồ Chí Minh</p>
                    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
                        <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" style={{ background: "#1A1A1A", borderColor: "#1A1A1A", borderRadius: 12, height: 44, padding: "0 22px", fontWeight: 600 }}>
                            Gửi liên hệ
                        </Button>
                    </Form>
                </Card>
            </div>
            <FooterComponent />
        </div>
    );
};

export default ContactPage;
