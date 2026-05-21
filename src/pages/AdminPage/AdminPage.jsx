import React, { useState } from "react";
import { getItem } from "../../utils";
import { AppstoreOutlined, ProductOutlined, ShoppingCartOutlined, TagsOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from "antd";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminOrder/AdminOrder";
import AdminDashboard from "../../components/AdminDashboard/AdminDashboard";
import AdminCategory from "../../components/AdminCategory/AdminCategory";
import { AdminLayout, AdminSidebar } from "../../components/ui";
import "./AdminPage.css";

const AdminPage = () => {
    const items = [
        getItem('Tổng Quan', 'dashboard', <AppstoreOutlined />),
        getItem('Người Dùng', 'user', <UserOutlined />),
        getItem('Sản Phẩm', 'product', <ProductOutlined />),
        getItem('Danh Mục', 'category', <TagsOutlined />),
        getItem('Đơn Hàng', 'order', <ShoppingCartOutlined />),
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
            default:
                return <></>;
        }
    };

    return (
        <div className="admin-parity">
            <AdminLayout
                sidebar={(
                    <AdminSidebar title="Bảng điều khiển quản trị">
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

