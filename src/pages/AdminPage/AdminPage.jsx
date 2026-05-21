import React, { useState } from "react";
import { getItem } from "../../utils";
import { AppstoreOutlined, ProductOutlined, ShoppingCartOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminOrder/AdminOrder";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";
import AdminCategory from "../../components/AdminCategory/AdminCategory";
import AdminAppointment from "../../components/AdminAppointment/AdminAppointment";
import { AdminLayout, AdminSidebar, PetshopButton } from "../../components/ui";
import "./AdminPage.css";

const AdminPage = () => {
    const navigate = useNavigate();
    const items = [
        getItem('Tổng Quan', 'dashboard', <AppstoreOutlined />),
        getItem('Người Dùng', 'user', <UserOutlined />),
        getItem('Sản Phẩm', 'product', <ProductOutlined />),
        getItem('Danh Mục', 'category', <TagsOutlined />),
        getItem('Đơn Hàng', 'order', <ShoppingCartOutlined />),
        getItem('Lịch hẹn', 'appointment', <AppstoreOutlined />),
    ];

    const [keySelected, setKeySelected] = useState('dashboard');

    const renderPage = (key) => {
        switch (key) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'user':
                return <AdminUser />;
            case 'product':
                return <AdminProduct />;
            case 'category':
                return <AdminCategory />;
            case 'order':
                return <AdminOrder />;
            case 'appointment':
                return <AdminAppointment />;
            default:
                return <></>;
        }
    };

    return (
        <div className="admin-parity">
            <AdminLayout
                sidebar={(
                    <AdminSidebar title="Bảng điều khiển quản trị">
                    <PetshopButton
                        variant="secondary"
                        className="admin-back-home"
                        onClick={() => navigate("/")}
                    >
                        ← Quay về trang chủ
                    </PetshopButton>
                    <Menu
                        className="admin-menu"
                        mode="inline"
                        selectedKeys={[keySelected]}
                        style={{ borderInlineEnd: 'none', background: 'transparent', fontSize: 15, fontWeight: 600 }}
                        items={items}
                        onClick={({ key }) => setKeySelected(key)}
                    />
                    </AdminSidebar>
                )}
            >
                {renderPage(keySelected)}
            </AdminLayout>
        </div>
    );
};

export default AdminPage;

