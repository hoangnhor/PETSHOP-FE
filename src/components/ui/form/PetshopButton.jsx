import React from "react";
import { Button } from "antd";

const PetshopButton = ({ variant = "primary", loading = false, disabled = false, style, className, ...rest }) => {
  const isPrimary = variant === "primary";
  const mergedClassName = ["petshop-btn", className].filter(Boolean).join(" ");
  return (
    <Button
      type={isPrimary ? "primary" : "default"}
      loading={loading}
      disabled={disabled || loading}
      style={{
        borderRadius: 13,
        minHeight: 42,
        background: isPrimary ? "var(--petshop-color-primary)" : undefined,
        borderColor: isPrimary ? "var(--petshop-color-primary)" : undefined,
        ...style,
      }}
      className={mergedClassName}
      {...rest}
    />
  );
};

export default PetshopButton;
