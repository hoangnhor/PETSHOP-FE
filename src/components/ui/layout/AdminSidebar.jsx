import React from "react";

const AdminSidebar = ({ title = "Bảng điều khiển quản trị", children }) => (
  <aside className="admin-sidebar" aria-label="Thanh điều hướng quản trị">
    <h3 className="admin-title">{title}</h3>
    <p className="admin-subtitle">Tổng quan vận hành hệ thống.</p>
    {children}
  </aside>
);

export default AdminSidebar;
