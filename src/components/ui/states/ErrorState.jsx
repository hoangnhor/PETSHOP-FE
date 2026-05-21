import React from "react";
import { Alert } from "antd";
import PetshopButton from "../form/PetshopButton";

const ErrorState = ({ title = "Đã có lỗi", message = "Không thể tải dữ liệu", onRetry }) => (
  <div className="petshop-state-wrap">
    <Alert type="error" showIcon message={title} description={message} />
    {onRetry ? <PetshopButton style={{ marginTop: 12 }} onClick={onRetry}>Thử lại</PetshopButton> : null}
  </div>
);

export default ErrorState;
