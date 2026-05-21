import React from "react";
import { Empty } from "antd";
import PetshopButton from "../form/PetshopButton";

const EmptyState = ({ description = "Không có dữ liệu", actionText, onAction }) => (
  <div className="petshop-state-wrap">
    <Empty description={description} />
    {actionText && onAction ? <PetshopButton onClick={onAction}>{actionText}</PetshopButton> : null}
  </div>
);

export default EmptyState;
