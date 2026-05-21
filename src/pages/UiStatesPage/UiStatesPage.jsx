import React from "react";
import "./UiStatesPage.css";

const UiStatesPage = () => {
  return (
    <div className="uistates-view">
      <main className="container page">
        <div className="breadcrumb"><span>petshop</span><span>›</span><strong>UI States</strong></div>
        <h1 className="page-title">UI States</h1>
        <p className="sub">Các trạng thái dùng khi chuyển landingpage sang ReactJS.</p>
        <div className="grid">
          <div className="card"><h2>Loading</h2><div className="skeleton short" /><div className="skeleton tall" /></div>
          <div className="card"><h2>Empty</h2><div className="alert warning">Chưa có dữ liệu để hiển thị.</div></div>
          <div className="card"><h2>Error</h2><div className="alert error">Có lỗi xảy ra. Vui lòng thử lại.</div></div>
          <div className="card"><h2>Success</h2><div className="alert success">Thao tác đã hoàn tất thành công.</div></div>
          <div className="card"><h2>Modal</h2><button className="btn danger">Mở xác nhận xóa</button></div>
          <div className="card"><h2>Toast</h2><button className="btn">Hiện toast</button></div>
        </div>
      </main>
    </div>
  );
};

export default UiStatesPage;
