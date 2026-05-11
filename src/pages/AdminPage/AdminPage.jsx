import React, { useState } from "react";
import { getItem } from "../../utils";
import {ProductOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons'
import { Menu } from "antd";
import HeaderComponent from "../../components/HeaderComponents/HeaderComponent";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminOrder/AdminOrder";
const AdminPage= ()=>{
    //quanly nguoi dung
    const items=[
        getItem('Người Dùng','user',<UserOutlined /> ),
        //quan ly san pham
        getItem('Sản Phẩm','product',<ProductOutlined /> ),
        getItem('Đơn Hàng','order',<ShoppingCartOutlined /> )
    ];
    const [keySelected,setKeySelected] = useState('product')
    //ket noi vs adminuser 
    const renderPage=(key)=>{
        switch(key){
            case 'user':
                return(
                    <AdminUser/>
                )
                case 'product':
                return(
                    <AdminProduct/>
                )
                case 'order':
                return(
                    <AdminOrder/>
                )
                default:
                    return<></>
        }
       
    }

    const handleOnclick=({key})=>{
        setKeySelected(key)
    }
    return (
        <>
            <HeaderComponent isHiddenSearch isHiddenCart />
            <div style={{display:'grid', gridTemplateColumns: '290px minmax(0,1fr)', gap: '20px', width: 'min(1400px, calc(100% - 40px))', margin: '26px auto 36px'}}>
                <div style={{ background: 'rgba(255,255,255,.86)', border: '1px solid rgba(198,169,105,.24)', borderRadius: 18, boxShadow: '0 16px 28px rgba(26,26,26,.08)', padding: 12, height: 'fit-content' }}>
                    <h3 style={{ margin: '6px 10px 10px', fontSize: 32, color: '#1A1A1A' }}>Admin Console</h3>
                    <Menu 
                        mode='inline'
                        selectedKeys={[keySelected]}
                        style={{
                            borderInlineEnd: 'none',
                            background: 'transparent',
                            fontSize:15,
                            fontWeight:600
                        }}
                        items={items}
                        onClick={handleOnclick}
                    /> 
                </div>
                <div style={{flex:1 , padding:'24px', borderRadius: 18, background: 'rgba(255,255,255,.86)', border: '1px solid rgba(198,169,105,.24)', boxShadow: '0 16px 28px rgba(26,26,26,.08)'}}>
                    {renderPage(keySelected)}
                </div>
            </div>
        </>
    )
}
export default AdminPage;
