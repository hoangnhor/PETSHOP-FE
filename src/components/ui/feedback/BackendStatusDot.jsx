import React from "react";
import { Tooltip } from "antd";
import PetshopButton from "../form/PetshopButton";

const variants = {
  warming: {
    label: "Backend đang khởi động",
    hint: "Đang đánh thức server",
    dot: "#D4B483",
    border: "rgba(198,169,105,.36)",
    background: "rgba(255,248,232,.95)",
  },
  degraded: {
    label: "Backend phản hồi chậm",
    hint: "Đang dùng dữ liệu đã lưu, bấm để thử lại",
    dot: "#8a3d3d",
    border: "rgba(138,61,61,.28)",
    background: "rgba(255,245,245,.96)",
  },
  ready: {
    label: "Backend ổn định",
    hint: "Đang hoạt động bình thường",
    dot: "#4b8f5a",
    border: "rgba(75,143,90,.24)",
    background: "rgba(242,251,244,.96)",
  },
};

const BackendStatusDot = ({ status = "warming", onRetry, onShowBanner }) => {
  const variant = variants[status] || variants.warming;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1200,
      }}
    >
      <Tooltip title={variant.hint} placement="left">
        <PetshopButton
          onClick={status === "ready" ? onShowBanner : onRetry}
          variant="secondary"
          style={{
            minHeight: 38,
            paddingInline: 12,
            borderRadius: 999,
            borderColor: variant.border,
            background: variant.background,
            color: "#2f2f2f",
            boxShadow: "0 10px 24px rgba(0,0,0,.08)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: variant.dot,
              boxShadow: `0 0 0 4px ${variant.dot}22`,
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{variant.label}</span>
        </PetshopButton>
      </Tooltip>
    </div>
  );
};

export default BackendStatusDot;
