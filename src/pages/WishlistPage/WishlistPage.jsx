import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ProductServices from "../../services/ProductServices";
import * as WishlistServices from "../../services/WishlistServices";
import * as CartServices from "../../services/CartServices";
import * as message from "../../components/Message/Message";
import { ConfirmDialog, EmptyState, PetshopIcon } from "../../components/ui";
import "./WishlistPage.css";

const formatMoney = (value) => `${Math.round(Number(value || 0)).toLocaleString("vi-VN")}đ`;

const WishlistPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("wishlistItems") || "[]"));
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const suggestQuery = useQuery({ queryKey: ["wishlist-suggest"], queryFn: () => ProductServices.getAllProduct({ limit: 12 }) });
  const serverWishlistQuery = useQuery({
    queryKey: ["my-wishlist", user?.access_token],
    queryFn: () => WishlistServices.getMyWishlist(user.access_token),
    enabled: isLoggedIn,
  });

  const syncCartMutation = useMutation({
    mutationFn: (cartItems) =>
      CartServices.updateMyCart(
        {
          items: cartItems.map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) })),
        },
        user.access_token
      ),
  });

  const syncItems = (nextItems) => {
    localStorage.setItem("wishlistItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("wishlist-updated"));
    setItems(nextItems);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const serverItems = serverWishlistQuery.data?.data?.productIds || [];
    const mapped = serverItems.map((item) => ({
      idsp: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      discount: item.discount || 0,
      countInStock: item.countInStock || 0,
      category: item?.type?.name || "Sản phẩm",
      rating: item.rating || 4.8,
    }));
    syncItems(mapped);
  }, [isLoggedIn, serverWishlistQuery.data]);

  useEffect(() => {
    const sync = () => setItems(JSON.parse(localStorage.getItem("wishlistItems") || "[]"));
    window.addEventListener("wishlist-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlist-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const clearWishlist = () => {
    syncItems([]);
    if (isLoggedIn) WishlistServices.clearMyWishlist(user.access_token).catch(() => {});
    setIsConfirmClearOpen(false);
    message.success("Đã xóa toàn bộ danh sách yêu thích");
  };

  const removeItem = (idsp) => {
    syncItems(items.filter((item) => item.idsp !== idsp));
    if (isLoggedIn) WishlistServices.removeWishlistItem(idsp, user.access_token).catch(() => {});
    message.success("Đã xóa khỏi yêu thích");
  };

  const getLocalCartItems = () => JSON.parse(localStorage.getItem("cartItems") || "[]");
  const addToCart = (item) => {
    const cartItems = getLocalCartItems();
    const existed = cartItems.find((cartItem) => cartItem.idsp === item.idsp);
    const currentQty = Number(existed?.quantity || 0);
    const stock = Number(item?.countInStock || 0);
    if (currentQty + 1 > stock) {
      message.error("Số lượng vượt quá tồn kho");
      return;
    }
    const nextItems = existed
      ? cartItems.map((cartItem) => (cartItem.idsp === item.idsp ? { ...cartItem, quantity: currentQty + 1 } : cartItem))
      : [...cartItems, { ...item, quantity: 1 }];
    localStorage.setItem("cartItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
    if (isLoggedIn) syncCartMutation.mutate(nextItems);
    message.success("Đã thêm vào giỏ hàng");
  };

  const addAllToCart = () => {
    if (!items.length) return;
    const cartItems = getLocalCartItems();
    let nextCart = [...cartItems];
    items.forEach((item) => {
      const existed = nextCart.find((cartItem) => cartItem.idsp === item.idsp);
      if (!existed) nextCart.push({ ...item, quantity: 1 });
    });
    localStorage.setItem("cartItems", JSON.stringify(nextCart));
    window.dispatchEvent(new Event("cart-updated"));
    if (isLoggedIn) syncCartMutation.mutate(nextCart);
    message.success("Đã thêm toàn bộ vào giỏ");
  };

  const inStockCount = items.filter((item) => Number(item.countInStock || 0) > 0).length;
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);

  const suggestions = (suggestQuery.data?.data || []).filter((product) => !items.find((item) => item.idsp === product._id)).slice(0, 4);

  const renderCard = (item, wished = true) => {
    const id = item.idsp || item._id;
    const rating = item.rating || 4.8;
    const price = Math.round(Number(item.price || 0) * (1 - Number(item.discount || 0) / 100));
    const category = item.category || item?.type?.name || "Sản phẩm";
    const stockText = Number(item.countInStock || 0) > 0 ? "Còn hàng" : "Hết hàng";
    return (
      <article className="product" key={id}>
        <button className={`heart ${wished ? "active" : ""}`} type="button" aria-label="Yêu thích">
          <PetshopIcon name="heart" size={16} />
        </button>
        {wished ? <span className="label"><PetshopIcon name="heart" size={12} />Đã lưu</span> : null}
        <div className="image-wrap" onClick={() => navigate(`/product-detail/${id}`)}>
          <img src={item.image} alt={item.name} />
        </div>
        <div className="body">
          <h3 className="title">{item.name}</h3>
          <div className="price-row">
            <div className="price">{formatMoney(price)}</div>
            <div className="rating"><PetshopIcon name="star" size={12} />{rating}</div>
          </div>
          <div className="meta"><span>{category}</span><span>{stockText}</span></div>
          <div className="card-actions">
            <button className="add-cart" type="button" onClick={() => addToCart({ ...item, idsp: id, category })}><PetshopIcon name="cart" size={14} />Thêm giỏ</button>
            <button className="remove-btn" type="button" onClick={() => (wished ? removeItem(id) : null)}>
              {wished ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>
                </svg>
              ) : (
                <PetshopIcon name="eye" size={14} />
              )}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="wishlist-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
          <strong>Yêu thích</strong>
        </div>

        <div className="page-head">
          <div>
            <h1 className="page-title">Yêu thích</h1>
            <p className="sub">Danh sách sản phẩm bạn đã lưu để mua sau hoặc so sánh nhanh.</p>
          </div>
          <div className="head-actions">
            <button className="head-btn" type="button" disabled={!items.length} onClick={() => setIsConfirmClearOpen(true)}><PetshopIcon name="trash" size={14} />Xóa tất cả</button>
            <button className="head-btn dark" type="button" disabled={!items.length} onClick={addAllToCart}><PetshopIcon name="cart" size={14} />Thêm tất cả vào giỏ</button>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div><small>Sản phẩm yêu thích</small><h3>{items.length}</h3></div><div className="stat-icon"><PetshopIcon name="heart" size={18} /></div></div>
          <div className="stat"><div><small>Có sẵn để mua</small><h3>{inStockCount}</h3></div><div className="stat-icon"><PetshopIcon name="check" size={18} /></div></div>
          <div className="stat"><div><small>Tổng tạm tính</small><h3>{Math.round(totalPrice / 1000)}K</h3></div><div className="stat-icon"><PetshopIcon name="tag" size={18} /></div></div>
        </div>

        <section>
          <div className="section-head">
            <div>
              <h2 className="section-title">Sản phẩm yêu thích</h2>
              <p>Những sản phẩm bạn đã lưu trong danh sách yêu thích</p>
            </div>
          </div>
          {items.length ? <div className="grid">{items.map((item) => renderCard(item, true))}</div> : <div className="empty-wrap"><EmptyState description="Bạn chưa có sản phẩm yêu thích" actionText="Khám phá sản phẩm" onAction={() => navigate("/products")} /></div>}
        </section>

        {suggestions.length ? (
          <>
            <hr className="divider" />
            <section>
              <div className="section-head">
                <div>
                  <h2 className="section-title">Gợi ý cho bạn</h2>
                  <p>Sản phẩm tương tự dựa trên danh sách yêu thích hiện tại</p>
                </div>
              </div>
              <div className="grid">{suggestions.map((item) => renderCard(item, false))}</div>
            </section>
          </>
        ) : null}
      </main>

      <ConfirmDialog
        open={isConfirmClearOpen}
        title="Xóa toàn bộ yêu thích"
        content="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm yêu thích không?"
        onCancel={() => setIsConfirmClearOpen(false)}
        onOk={clearWishlist}
      />
    </div>
  );
};

export default WishlistPage;
