import React from "react";
import { Input } from "antd";

const PetshopInput = ({ className, ...props }) => (
  <Input className={["petshop-field", className].filter(Boolean).join(" ")} {...props} />
);

export default PetshopInput;
