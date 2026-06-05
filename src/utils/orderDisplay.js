export const getOrderDisplayCode = (order = {}) => {
  const code = String(order?.orderCode || "").trim();
  if (code) return code;
  const id = String(order?._id || "").trim();
  return id ? `#${id.slice(-8).toUpperCase()}` : "#";
};
