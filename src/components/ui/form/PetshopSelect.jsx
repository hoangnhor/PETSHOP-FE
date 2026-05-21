import React from "react";
import { Select } from "antd";

const PetshopSelect = ({ className, ...props }) => (
  <Select className={["petshop-field", "petshop-select", className].filter(Boolean).join(" ")} {...props} />
);

export default PetshopSelect;
