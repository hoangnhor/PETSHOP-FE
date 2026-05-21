import React from "react";
import { Modal } from "antd";

const ConfirmDialog = ({ open, title = "Xác nhận", content = "Bạn có chắc chắn?", onOk, onCancel, confirmLoading = false }) => (
  <Modal open={open} title={title} onOk={onOk} onCancel={onCancel} confirmLoading={confirmLoading} okText="Xác nhận" cancelText="Hủy" destroyOnClose>
    {content}
  </Modal>
);

export default ConfirmDialog;
