import React from "react";
import { Alert } from "antd";

const SuccessState = ({ message = "Thao tác thành công" }) => (
  <div className="petshop-state-wrap">
    <Alert type="success" showIcon message={message} />
  </div>
);

export default SuccessState;
