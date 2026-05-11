import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, Popover } from 'antd';
import {
    HeaderActionButton,
    HeaderActions,
    HeaderShell,
    HeaderTop,
    NavigationBar,
    WrapperContentPopup,
    WrapperHeader,
    WrapperHeaderAccout,
    WrapperTextHeader,
    WrapperTextHeaderSmail
} from './style';
import ButtonInputSearch from '../ButtonInputSearch/ButtonInputSearch';
import {
    UserOutlined,
    ShoppingCartOutlined,
    HeartOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as UserSevices from '../../services/UserServices';
import { resetUser } from "../../redux/slides/userSlider";
import Loading from "../LoadingComponent/Loading";

const HeaderComponent = ({ isHiddenSearch = false, isHiddenCart = false }) => {
    const dispatch = useDispatch();
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(() => JSON.parse(localStorage.getItem('cartItems') || '[]').length);
    const [wishlistCount, setWishlistCount] = useState(() => JSON.parse(localStorage.getItem('wishlistItems') || '[]').length);

    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    const handleNavigateLogin = () => {
        navigate('/sign-in');
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await UserSevices.logoutUser();
            dispatch(resetUser());
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        setUserName(user?.name);
        setUserAvatar(user?.avatar);
        setLoading(false);
    }, [user?.name, user?.avatar]);

    useEffect(() => {
        const syncCartCount = () => {
            setCartCount(JSON.parse(localStorage.getItem('cartItems') || '[]').length);
        };
        window.addEventListener('storage', syncCartCount);
        window.addEventListener('cart-updated', syncCartCount);
        const syncWishlistCount = () => {
            setWishlistCount(JSON.parse(localStorage.getItem('wishlistItems') || '[]').length);
        };
        window.addEventListener('wishlist-updated', syncWishlistCount);
        return () => {
            window.removeEventListener('storage', syncCartCount);
            window.removeEventListener('cart-updated', syncCartCount);
            window.removeEventListener('wishlist-updated', syncWishlistCount);
        };
    }, []);

    const content = (
        <div>
            <WrapperContentPopup onClick={() => navigate('/profile')}>Thông tin người dùng</WrapperContentPopup>
            <WrapperContentPopup onClick={() => navigate('/order-history')}>Lịch sử đơn hàng</WrapperContentPopup>
            <WrapperContentPopup onClick={() => navigate('/wishlist')}>Wishlist</WrapperContentPopup>
            {user?.isAdmin && (
                <WrapperContentPopup onClick={() => navigate('/admin')}>Quản Lý Hệ Thống</WrapperContentPopup>
            )}
            <WrapperContentPopup onClick={handleLogout}>Đăng Xuất</WrapperContentPopup>
        </div>
    );

    const navItems = useMemo(() => [
        { name: "Trang chủ", path: "/" },
        { name: "Sản phẩm", path: "/products" },
        { name: "Dịch vụ", path: "/services" },
        { name: "Liên hệ", path: "/contact" },
    ], []);

    return (
        <HeaderShell>
            <WrapperHeader>
                <HeaderTop>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(145deg,#C6A969,#A67C52)" }} />
                        <WrapperTextHeader onClick={() => navigate('/')}>
                            MAISON<strong>PET</strong>
                        </WrapperTextHeader>
                    </div>
                    {!isHiddenSearch ? (
                        <ButtonInputSearch
                            size="large"
                            placeholder="Tìm vật phẩm cao cấp cho thú cưng..."
                            textButton="Tìm kiếm"
                            onSearch={(keyword) => navigate(`/products?keyword=${encodeURIComponent(keyword)}`)}
                        />
                    ) : <div />}
                    <HeaderActions>
                        <Loading isPending={loading}>
                            {user?.access_token ? (
                                <Popover content={content} trigger="click">
                                    <HeaderActionButton>
                                        <Avatar src={userAvatar} icon={<UserOutlined />} size={32} />
                                        <WrapperHeaderAccout>
                                            <WrapperTextHeaderSmail>{userName?.length ? userName : user?.email}</WrapperTextHeaderSmail>
                                            <DownOutlined style={{ fontSize: 12, color: '#6b7280' }} />
                                        </WrapperHeaderAccout>
                                    </HeaderActionButton>
                                </Popover>
                            ) : (
                                <HeaderActionButton onClick={handleNavigateLogin}>
                                    <UserOutlined style={{ fontSize: 20, color: '#A67C52' }} />
                                    <div>
                                        <WrapperTextHeaderSmail>Tài khoản</WrapperTextHeaderSmail>
                                        <div style={{ color: '#888888', fontSize: 12 }}>Đăng nhập</div>
                                    </div>
                                </HeaderActionButton>
                            )}
                        </Loading>
                        {!isHiddenCart && (
                            <HeaderActionButton onClick={() => navigate('/wishlist')}>
                                <Badge count={wishlistCount} size="small">
                                    <HeartOutlined style={{ fontSize: 20, color: '#A67C52' }} />
                                </Badge>
                                <WrapperTextHeaderSmail>Wishlist</WrapperTextHeaderSmail>
                            </HeaderActionButton>
                        )}
                        {!isHiddenCart && (
                            <HeaderActionButton onClick={() => navigate('/cart')}>
                                <Badge count={cartCount} size="small">
                                    <ShoppingCartOutlined style={{ fontSize: 22, color: '#A67C52' }} />
                                </Badge>
                                <WrapperTextHeaderSmail>Giỏ hàng</WrapperTextHeaderSmail>
                            </HeaderActionButton>
                        )}
                    </HeaderActions>
                </HeaderTop>

                <NavigationBar>
                    <Link to="/products?keyword=thức ăn"><HeartOutlined /> Signature Collection</Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                        >
                            {item.name}
                        </Link>
                    ))}
                </NavigationBar>
            </WrapperHeader>
        </HeaderShell>
    );
};

export default HeaderComponent;
