import React from "react";

const AdminLayout = ({ sidebar, children }) => (
  <div className="admin-layout petshop-admin-layout">
    {sidebar}
    <section className="admin-content" aria-label="Khu vực nội dung quản trị">
      {children}
    </section>
  </div>
);

export default AdminLayout;
