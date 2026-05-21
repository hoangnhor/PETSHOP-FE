import React from "react";
import { Input } from "antd";

const PetshopTextarea = ({ className, ...props }) => (
  <Input.TextArea className={["petshop-textarea", className].filter(Boolean).join(" ")} {...props} />
);

export default PetshopTextarea;
