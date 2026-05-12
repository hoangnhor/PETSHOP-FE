import React, { useState } from "react";
import { getItem } from "../../utils";
import { ProductOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from "antd";
import HeaderComponent from "../../components/HeaderComponents/HeaderComponent";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminOrder/AdminOrder";

const AdminPage = () => {
    const items = [
        getItem('Người Dùng', 'user', <UserOutlined />),
        getItem('Sản Phẩm', 'product', <ProductOutlined />),
        getItem('Đơn Hàng', 'order', <ShoppingCartOutlined />),
    ];

    const [keySelected, setKeySelected] = useState('product');

    const renderPage = (key) => {
        switch (key) {
            case 'user':
                return <AdminUser />;
            case 'product':
                return <AdminProduct />;
            case 'order':
                return <AdminOrder />;
            default:
                return <></>;
        }
    };

    return (
        <>
            <HeaderComponent isHiddenSearch isHiddenCart />
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <h3 className="admin-title">Admin Console</h3>
                    <Menu
                        mode="inline"
                        selectedKeys={[keySelected]}
                        style={{ borderInlineEnd: 'none', background: 'transparent', fontSize: 15, fontWeight: 600 }}
                        items={items}
                        onClick={({ key }) => setKeySelected(key)}
                    />
                </aside>
                <section className="admin-content" aria-label="Admin content area">
                    {renderPage(keySelected)}
                </section>
            </div>
        </>
    );
};

export default AdminPage;
