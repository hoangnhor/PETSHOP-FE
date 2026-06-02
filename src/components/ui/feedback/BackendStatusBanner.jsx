import React from "react";
import PetshopButton from "../form/PetshopButton";

const variants = {
  warming: {
    title: "Backend đang khởi động",
    message: "Render free tier có thể đang sleep. Dữ liệu sẽ tự cập nhật khi server sẵn sàng.",
    background: "linear-gradient(90deg, rgba(212,180,131,.18), rgba(255,248,232,.92))",
    borderColor: "rgba(198,169,105,.35)",
    color: "#5d4328",
  },
  degraded: {
    title: "Backend phản hồi chậm",
    message: "Ứng dụng đang dùng dữ liệu đã lưu trước đó và sẽ thử kết nối lại tự động.",
    background: "linear-gradient(90deg, rgba(138,61,61,.12), rgba(255,245,245,.95))",
    borderColor: "rgba(138,61,61,.28)",
    color: "#6b2f2f",
  },
};

const BackendStatusBanner = ({ status = "warming", onRetry, onDismiss }) => {
  const variant = variants[status];
  if (!variant) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: "10px 16px",
        borderBottom: `1px solid ${variant.borderColor}`,
        background: variant.background,
        color: variant.color,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ minWidth: 240, flex: "1 1 auto" }}>
          <strong style={{ display: "block", fontSize: 14, lineHeight: 1.3 }}>{variant.title}</strong>
          <span style={{ display: "block", fontSize: 13, opacity: 0.9, lineHeight: 1.4 }}>{variant.message}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {onRetry ? (
            <PetshopButton
              onClick={onRetry}
              style={{ minHeight: 34, paddingInline: 12, fontSize: 13 }}
            >
              Thử lại
            </PetshopButton>
          ) : null}
          {onDismiss ? (
            <PetshopButton
              variant="secondary"
              onClick={onDismiss}
              style={{ minHeight: 34, paddingInline: 12, fontSize: 13 }}
            >
              Ẩn
            </PetshopButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
