import React from "react";
import { Modal } from "antd";

const PetshopModal = ({ children, ...props }) => <Modal destroyOnClose {...props}>{children}</Modal>;

export default PetshopModal;
