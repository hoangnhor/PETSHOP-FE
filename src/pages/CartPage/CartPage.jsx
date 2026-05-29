import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ProductServices from "../../services/ProductServices";
import * as CartServices from "../../services/CartServices";
import * as CouponServices from "../../services/CouponServices";
import * as message from "../../components/Message/Message";
import { ConfirmDialog, EmptyState, PetshopIcon } from "../../components/ui";
import { readLocalArray } from "../../utils/localStorage";
import "./CartPage.css";

const FREE_SHIP_THRESHOLD = 499000;

const formatMoney = (value) => `${Math.round(Number(value || 0)).toLocaleString("vi-VN")}đ`;
const resolveStock = (item, fallbackQuantity = 1) => {
  const raw = Number(item?.countInStock);
  if (Number.isFinite(raw) && raw >= 0) return raw;
  return Math.max(1, Number(fallbackQuantity || 1));
};
const getStock = (item) => resolveStock(item, item?.quantity);
const firstImage = (image) => (Array.isArray(image) ? image[0] || "" : image || "");
const toServerCartItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => item?.idsp && Number(item?.quantity || 0) > 0)
    .map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) }));
const normalizeCartItems = (items = []) =>
  (Array.isArray(items) ? items : []).filter((item) => item?.idsp).map((item) => {
    const rawQuantity = Number(item?.quantity || 1);
    const stock = resolveStock(item, rawQuantity);
    const quantity = stock > 0 ? Math.min(Math.max(1, rawQuantity), stock) : 0;
    return {
      ...item,
      image: firstImage(item?.image),
      quantity,
      countInStock: stock,
    };
  });

const CartPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const [cartItems, setCartItems] = useState(() => normalizeCartItems(readLocalArray("cartItems")));
  const [discountCode, setDiscountCode] = useState(() => localStorage.getItem("cart_coupon_code") || "");
  const [appliedCoupon, setAppliedCoupon] = useState(() => localStorage.getItem("cart_coupon_code") || "");
  const [validatedCoupon, setValidatedCoupon] = useState(null);
  const [pendingRemoveId, setPendingRemoveId] = useState("");
  const syncWarningShownRef = useRef(false);

  const suggestQuery = useQuery({ queryKey: ["cart-suggest"], queryFn: () => ProductServices.getAllProduct({ limit: 8 }) });
  const serverCartQuery = useQuery({
    queryKey: ["my-cart", user?.access_token],
    queryFn: () => CartServices.getMyCart(user.access_token),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    const serverItems = serverCartQuery.data?.data?.items || [];
    const localItems = normalizeCartItems(readLocalArray("cartItems"));

    if (!serverItems.length && localItems.length) {
      CartServices.updateMyCart(
        {
          items: localItems
            .filter((item) => item?.idsp && Number(item?.quantity || 0) > 0)
            .map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) })),
          couponCode: appliedCoupon || "",
        },
        user.access_token
      ).catch((error) => {
        if (!syncWarningShownRef.current) {
          syncWarningShownRef.current = true;
          message.warning(error?.message || "Không thể đồng bộ giỏ hàng, đang dùng dữ liệu trên máy");
        }
      });
      return;
    }

    const mapped = serverItems.map((item) => ({
      idsp: item.productId,
      name: item.name,
      image: firstImage(item.image),
      price: item.price,
      discount: item.discount || 0,
      countInStock: resolveStock(item, item.quantity || 1),
      quantity: item.quantity || 1,
      category: item.category || "Sản phẩm",
    }));
    const normalized = normalizeCartItems(mapped);
    setCartItems(normalized);
    localStorage.setItem("cartItems", JSON.stringify(normalized));
    window.dispatchEvent(new Event("cart-updated"));
  }, [isLoggedIn, serverCartQuery.data, user.access_token, appliedCoupon]);

  const syncCart = (items) => {
    const normalized = normalizeCartItems(items);
    setCartItems(normalized);
    localStorage.setItem("cartItems", JSON.stringify(normalized));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const syncCartMutation = useMutation({
    mutationFn: (items) =>
      CartServices.updateMyCart(
        {
          items: toServerCartItems(items),
          couponCode: appliedCoupon || "",
        },
        user.access_token
      ),
  });

  const subTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * (1 - Number(item.discount || 0) / 100) * Number(item.quantity || 0), 0),
    [cartItems]
  );

  const discountAmount = Number(validatedCoupon?.discountAmount || 0);

  const totalAfterDiscount = Math.max(subTotal - discountAmount, 0);
  const shippingFee = totalAfterDiscount >= FREE_SHIP_THRESHOLD || totalAfterDiscount === 0 ? 0 : 30000;
  const orderTotal = totalAfterDiscount + shippingFee;
  const freeShipProgress = Math.min((totalAfterDiscount / FREE_SHIP_THRESHOLD) * 100, 100);

  const applyCoupon = () => {
    const normalized = discountCode.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon("");
      setValidatedCoupon(null);
      localStorage.removeItem("cart_coupon_code");
      message.success("Đã bỏ mã giảm giá");
      return;
    }
    CouponServices.validateCoupon({ code: normalized, orderValue: subTotal })
      .then((res) => {
        if (res?.status !== "OK") throw new Error(res?.message || "Mã giảm giá không hợp lệ");
        setAppliedCoupon(normalized);
        setValidatedCoupon(res?.data || null);
        localStorage.setItem("cart_coupon_code", normalized);
        message.success("Áp dụng mã giảm giá thành công");
      })
      .catch((error) => {
        setAppliedCoupon("");
        setValidatedCoupon(null);
        localStorage.removeItem("cart_coupon_code");
        message.error(error?.message || "Mã giảm giá không hợp lệ");
      });
  };

  useEffect(() => {
    if (!appliedCoupon) {
      setValidatedCoupon(null);
      return;
    }
    if (subTotal <= 0) {
      setValidatedCoupon(null);
      return;
    }
    let cancelled = false;
    CouponServices.validateCoupon({ code: appliedCoupon, orderValue: subTotal })
      .then((res) => {
        if (cancelled) return;
        if (res?.status === "OK") {
          setValidatedCoupon(res?.data || null);
          return;
        }
        setAppliedCoupon("");
        setValidatedCoupon(null);
        localStorage.removeItem("cart_coupon_code");
      })
      .catch(() => {
        if (cancelled) return;
        setAppliedCoupon("");
        setValidatedCoupon(null);
        localStorage.removeItem("cart_coupon_code");
      });
    return () => {
      cancelled = true;
    };
  }, [appliedCoupon, subTotal]);

  const updateQuantity = (record, nextQuantity) => {
    const maxStock = getStock(record);
    if (maxStock <= 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }
    const safeQuantity = Math.min(Math.max(1, Number(nextQuantity || 1)), maxStock);
    const nextItems = cartItems.map((item) => (item.idsp === record.idsp ? { ...item, quantity: safeQuantity } : item));
    syncCart(nextItems);
    if (isLoggedIn) syncCartMutation.mutate(nextItems);
  };

  const removeItem = () => {
    if (!pendingRemoveId) return;
    const removingId = pendingRemoveId;
    const previousItems = cartItems;
    const nextItems = cartItems.filter((item) => item.idsp !== pendingRemoveId);
    syncCart(nextItems);
    setPendingRemoveId("");
    if (!isLoggedIn) {
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
      return;
    }
    CartServices.removeCartItem(removingId, user.access_token)
      .then((response) => {
        if (response?.status !== "OK") {
          throw new Error(response?.message || "Không thể đồng bộ xóa sản phẩm");
        }
        message.success("Đã xóa sản phẩm khỏi giỏ hàng");
      })
      .catch((error) => {
        syncCart(previousItems);
        message.error(error?.message || "Không thể đồng bộ xóa sản phẩm");
      });
  };

  const addSuggestedToCart = (event, item) => {
    event.stopPropagation();
    const existed = cartItems.find((cartItem) => cartItem.idsp === item._id);
    const currentQuantity = Number(existed?.quantity || 0);
    const countInStock = Number(item?.countInStock || 0);
    if (currentQuantity + 1 > countInStock) {
      message.error("Số lượng vượt quá tồn kho");
      return;
    }
    const nextItems = existed
      ? cartItems.map((cartItem) => (cartItem.idsp === item._id ? { ...cartItem, quantity: currentQuantity + 1 } : cartItem))
      : [
          ...cartItems,
          {
            idsp: item._id,
            name: item.name,
            image: firstImage(item.image),
            price: item.price,
            discount: item.discount || 0,
            countInStock: item.countInStock,
            quantity: 1,
            category: item?.type?.name || "Sản phẩm",
          },
        ];
    syncCart(nextItems);
    if (isLoggedIn) syncCartMutation.mutate(nextItems);
    message.success("Đã thêm vào giỏ hàng");
  };

  const clearCart = () => {
    const previousItems = cartItems;
    const previousAppliedCoupon = appliedCoupon;
    const previousDiscountCode = discountCode;
    const previousValidatedCoupon = validatedCoupon;

    syncCart([]);
    setAppliedCoupon("");
    setValidatedCoupon(null);
    setDiscountCode("");
    localStorage.removeItem("cart_coupon_code");
    if (!isLoggedIn) {
      message.success("Đã xóa giỏ hàng");
      return;
    }
    CartServices.clearMyCart(user.access_token)
      .then((response) => {
        if (response?.status !== "OK") {
          throw new Error(response?.message || "Không thể đồng bộ xóa giỏ hàng");
        }
        message.success("Đã xóa giỏ hàng");
      })
      .catch((error) => {
        syncCart(previousItems);
        setAppliedCoupon(previousAppliedCoupon);
        setValidatedCoupon(previousValidatedCoupon);
        setDiscountCode(previousDiscountCode);
        if (previousAppliedCoupon) {
          localStorage.setItem("cart_coupon_code", previousAppliedCoupon);
        }
        message.error(error?.message || "Không thể đồng bộ xóa giỏ hàng");
      });
  };

  const canCheckout = cartItems.length > 0 && cartItems.every((item) => getStock(item) > 0 && Number(item.quantity || 0) <= getStock(item));

  const suggestions = (suggestQuery.data?.data || [])
    .filter((item) => item?._id && !cartItems.find((c) => c.idsp === item._id))
    .slice(0, 4);

  return (
    <div className="cart-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg viewBox="0 0 24 24" className="arrow"><path d="M9 18l6-6-6-6"></path></svg>
          <strong>Giỏ hàng</strong>
        </div>

        <div className="page-head">
          <div>
            <h1 className="page-title">Giỏ hàng</h1>
            <p className="sub">Kiểm tra sản phẩm, số lượng và ưu đãi trước khi thanh toán.</p>
          </div>
          <div className="head-badge">
            <PetshopIcon name="cart" size={14} />
            {cartItems.length} sản phẩm trong giỏ
          </div>
        </div>

        {cartItems.length ? (
          <section className="cart-layout">
            <div className="card table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const price = Number(item.price || 0) * (1 - Number(item.discount || 0) / 100);
                      const total = price * Number(item.quantity || 0);
                      const stock = getStock(item);
                      const canIncrease = Number(item.quantity || 1) < stock;
                      const outOfStock = stock <= 0;
                      return (
                        <tr key={item.idsp}>
                          <td>
                            <div className="cart-product">
                              {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-image">No image</div>}
                              <div>
                                <strong>{item.name}</strong>
                                <span>{item.category || "Sản phẩm"} · {!outOfStock ? "Còn hàng" : "Hết hàng"}</span>
                              </div>
                            </div>
                          </td>
                          <td>{formatMoney(price)}</td>
                          <td>
                            <span className="qty">
                              <button type="button" onClick={() => updateQuantity(item, Math.max(1, Number(item.quantity || 1) - 1))} disabled={outOfStock}>-</button>
                              <span>{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(item, Number(item.quantity || 1) + 1)} disabled={!canIncrease}>+</button>
                            </span>
                          </td>
                          <td><b>{formatMoney(total)}</b></td>
                          <td><button className="remove" type="button" onClick={() => setPendingRemoveId(item.idsp)}><PetshopIcon name="trash" size={14} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="cart-actions">
                <button className="btn light" type="button" onClick={() => navigate("/products")}><svg viewBox="0 0 24 24" className="mini"><path d="M15 18l-6-6 6-6"></path></svg>Tiếp tục mua sắm</button>
                <button className="btn light" type="button" onClick={clearCart}><PetshopIcon name="trash" size={14} />Xóa giỏ hàng</button>
              </div>
            </div>

            <aside className="side">
              <div className="card coupon">
                <h3>Ưu đãi vận chuyển</h3>
                <p>{totalAfterDiscount < FREE_SHIP_THRESHOLD ? `Mua thêm ${formatMoney(FREE_SHIP_THRESHOLD - totalAfterDiscount)} để được freeship` : "Bạn đã đạt điều kiện miễn phí vận chuyển từ 499.000đ."}</p>
                <div className="progress-wrap"><div className="progress" style={{ width: `${freeShipProgress}%` }} /></div>
                <div className="coupon-form">
                  <input placeholder="Nhập mã giảm giá" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} />
                  <button className="btn light" type="button" onClick={applyCoupon}>Áp dụng</button>
                </div>
              </div>

              <div className="card summary">
                <h3>Tóm tắt đơn hàng</h3>
                <div className="summary-row"><span>Tạm tính</span><b>{formatMoney(subTotal)}</b></div>
                <div className="summary-row"><span>Giảm giá</span><b>-{formatMoney(discountAmount)}</b></div>
                <div className="summary-row"><span>Phí vận chuyển</span><b>{formatMoney(shippingFee)}</b></div>
                <div className="summary-row total"><span>Tổng cộng</span><b>{formatMoney(orderTotal)}</b></div>
                <button
                  className="checkout"
                  type="button"
                  disabled={!canCheckout}
                  onClick={() => {
                    if (!isLoggedIn) {
                      message.error("Vui lòng đăng nhập để thanh toán");
                      navigate("/login");
                      return;
                    }
                    if (!canCheckout) {
                      message.error("Giỏ hàng có sản phẩm vượt tồn kho hoặc đã hết hàng. Vui lòng cập nhật lại trước khi thanh toán.");
                      return;
                    }
                    navigate("/checkout");
                  }}
                ><PetshopIcon name="check" size={14} />Tiến hành thanh toán</button>
                <div className="secure-note">
                  <svg className="secure-note-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"></path>
                  </svg>
                  <span>Thông tin đơn hàng sẽ được xác nhận lại trước khi thanh toán chính thức.</span>
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <div className="card table-card">
            <EmptyState description="Giỏ hàng trống" actionText="Mua sắm ngay" onAction={() => navigate("/products")} />
          </div>
        )}

        {suggestions.length > 0 ? (
          <section>
            <div className="section-head">
              <div>
                <h2 className="section-title">Khách hàng thường mua cùng</h2>
                <p>Gợi ý thêm sản phẩm chăm sóc thú cưng phù hợp với giỏ hàng hiện tại</p>
              </div>
            </div>
            <div className="grid">
              {suggestions.map((item) => {
                const finalPrice = Math.round(Number(item?.price || 0) * (1 - Number(item?.discount || 0) / 100));
                const inStock = Number(item?.countInStock || 0) > 0;
                return (
                  <article key={item._id} className="product" onClick={() => navigate(`/product-detail/${item._id}`)}>
                    <button className="heart" type="button" aria-label="Yêu thích" onClick={(event) => event.stopPropagation()}><PetshopIcon name="heart" size={16} /></button>
                    <div className="image-wrap"><img src={firstImage(item.image)} alt={item.name} /></div>
                    <div className="body">
                      <h3 className="title">{item.name}</h3>
                      <div className="price">{formatMoney(finalPrice)}</div>
                      <div className="meta"><span>Giao hàng tiêu chuẩn</span><span>{inStock ? "Còn hàng" : "Hết hàng"}</span></div>
                      <div className="card-actions">
                        <button className="add-cart" type="button" onClick={(event) => addSuggestedToCart(event, item)} disabled={!inStock}><PetshopIcon name="cart" size={14} />Thêm vào giỏ</button>
                        <button className="quick-view" type="button" aria-label="Xem chi tiết" onClick={(event) => { event.stopPropagation(); navigate(`/product-detail/${item._id}`); }}><PetshopIcon name="eye" size={16} /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      <ConfirmDialog
        open={Boolean(pendingRemoveId)}
        title="Xóa sản phẩm"
        content="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
        onCancel={() => setPendingRemoveId("")}
        onOk={removeItem}
      />
    </div>
  );
};

export default CartPage;
