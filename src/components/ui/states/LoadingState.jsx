import React from "react";
import { Spin } from "antd";

const LoadingState = ({ text = "Đang tải dữ liệu. Nếu server đang khởi động, vui lòng đợi vài giây..." }) => (
  <div className="petshop-state-wrap">
    <Spin size="large" />
    <p style={{ marginTop: 12, color: "var(--petshop-color-muted)" }}>{text}</p>
  </div>
);

export default LoadingState;
