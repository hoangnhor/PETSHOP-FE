import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ProductServices from "../../services/ProductServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import * as message from "../../components/Message/Message";
import { getMappedProductImage } from "../../utils/productImageMap";
import { readLocalArray } from "../../utils/localStorage";
import { EmptyState, ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import "./ProductDetailsPage.css";

const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const getMainImage = (product) => {
  const fallback = String(product?.image || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)[0];
  return getMappedProductImage(product?.name, fallback);
};

const getGallery = (product) => {
  const mapped = getMainImage(product);
  const fromDb = String(product?.image || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([mapped, ...fromDb].filter(Boolean))];
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const location = useLocation();
  const backLink = location.state?.from || "/products";

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedWishlistIds, setRelatedWishlistIds] = useState([]);

  const productQuery = useQuery({
    queryKey: ["product-detail", id],
    queryFn: () => ProductServices.getDetailsProduct(id),
    enabled: Boolean(id),
  });
  const wishlistQuery = useQuery({
    queryKey: ["product-detail-wishlist", user?.access_token],
    queryFn: () => WishlistServices.getMyWishlist(user.access_token),
    enabled: isLoggedIn,
  });

  const product = productQuery?.data?.data;
  const gallery = useMemo(() => getGallery(product), [product]);
  const imageSrc = gallery[activeImage] || gallery[0] || "";

  const typeId = product?.type?._id || product?.type;
  const canFilterByType = Boolean(typeId && /^[a-f\d]{24}$/i.test(String(typeId)));

  const relatedQuery = useQuery({
    queryKey: ["product-related", product?._id, typeId],
    queryFn: () =>
      canFilterByType
        ? ProductServices.getAllProduct({ limit: 8, type: typeId })
        : ProductServices.getAllProduct({ limit: 8 }),
    enabled: Boolean(product?._id),
  });

  const relatedProducts = useMemo(
    () => (relatedQuery?.data?.data || []).filter((item) => item?._id !== product?._id).slice(0, 4),
    [relatedQuery?.data?.data, product?._id]
  );
  const relatedDisplayItems = useMemo(() => {
    const items = [...relatedProducts];
    while (items.length < 4) items.push(null);
    return items;
  }, [relatedProducts]);

  const currentPrice = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);
  const finalPrice = Math.round(currentPrice * (1 - discount / 100));
  const countInStock = Number(product?.countInStock || 0);
  const typeName = product?.type?.name || product?.type || "Đang cập nhật";
  const rating = Number(product?.rating || 4.8);
  const reviewCount = Math.max(0, Number(product?.reviewCount || product?.numReviews || 0));
  const selled = Math.max(1, Number(product?.selled || 520));

  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    setActiveTab("description");
    const wishlistItems = readLocalArray("wishlistItems");
    setIsFavorite(wishlistItems.some((item) => item.idsp === product?._id));
    setRelatedWishlistIds(wishlistItems.map((item) => item.idsp));
  }, [product?._id]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!wishlistQuery.isSuccess) return;
    if (wishlistQuery?.data?.status && wishlistQuery.data.status !== "OK") return;
    const serverItems = wishlistQuery.data?.data?.productIds || [];
    const mappedIds = serverItems
      .map((item) =>
        typeof item === "string"
          ? item
          : String(item?._id || "")
      )
      .filter(Boolean);
    setRelatedWishlistIds(mappedIds);
    setIsFavorite(mappedIds.includes(String(product?._id || "")));
    const currentLocal = readLocalArray("wishlistItems");
    const localMappedFromObjects = serverItems
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        idsp: item._id,
        name: item.name,
        image: getMainImage(item),
        price: item.price,
        discount: item.discount || 0,
        countInStock: item.countInStock,
        category: item?.type?.name || "Sản phẩm",
      }));
    const localMapped = localMappedFromObjects.length
      ? localMappedFromObjects
      : currentLocal.filter((item) => mappedIds.includes(String(item?.idsp || "")));
    localStorage.setItem("wishlistItems", JSON.stringify(localMapped));
    window.dispatchEvent(new Event("wishlist-updated"));
  }, [isLoggedIn, wishlistQuery.isSuccess, wishlistQuery.data, product?._id]);

  const toggleWishlist = async () => {
    if (!product?._id) return;
    const wishlistItems = readLocalArray("wishlistItems");
    const existed = wishlistItems.some((item) => item.idsp === product._id);
    const nextItems = existed
      ? wishlistItems.filter((item) => item.idsp !== product._id)
      : [...wishlistItems, { idsp: product._id, name: product.name, image: imageSrc || "", price: product.price, discount: product.discount || 0, countInStock: product.countInStock, category: typeName }];
    const previousItems = wishlistItems;
    localStorage.setItem("wishlistItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("wishlist-updated"));
    if (isLoggedIn) {
      try {
        const action = existed
          ? WishlistServices.removeWishlistItem(product._id, user.access_token)
          : WishlistServices.addWishlistItem({ productId: product._id }, user.access_token);
        const res = await action;
        if (res?.status !== "OK") throw new Error(res?.message || "Không thể cập nhật yêu thích");
      } catch (error) {
        localStorage.setItem("wishlistItems", JSON.stringify(previousItems));
        window.dispatchEvent(new Event("wishlist-updated"));
        message.error(error?.message || "Không thể cập nhật yêu thích");
        return;
      }
    }
    setIsFavorite(!existed);
    setRelatedWishlistIds(nextItems.map((item) => item.idsp));
    message.success(existed ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const toggleRelatedWishlist = async (event, item) => {
    event.stopPropagation();
    if (!item?._id) return;
    const wishlistItems = readLocalArray("wishlistItems");
    const existed = wishlistItems.some((wishlistItem) => wishlistItem.idsp === item._id);
    const nextItems = existed
      ? wishlistItems.filter((wishlistItem) => wishlistItem.idsp !== item._id)
      : [
          ...wishlistItems,
          {
            idsp: item._id,
            name: item.name,
            image: getMainImage(item),
            price: item.price,
            discount: item.discount || 0,
            countInStock: item.countInStock,
            category: item?.type?.name || typeName,
          },
        ];
    const previousItems = wishlistItems;
    localStorage.setItem("wishlistItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("wishlist-updated"));
    if (isLoggedIn) {
      try {
        const action = existed
          ? WishlistServices.removeWishlistItem(item._id, user.access_token)
          : WishlistServices.addWishlistItem({ productId: item._id }, user.access_token);
        const res = await action;
        if (res?.status !== "OK") throw new Error(res?.message || "Không thể cập nhật yêu thích");
      } catch (error) {
        localStorage.setItem("wishlistItems", JSON.stringify(previousItems));
        window.dispatchEvent(new Event("wishlist-updated"));
        message.error(error?.message || "Không thể cập nhật yêu thích");
        return;
      }
    }
    setRelatedWishlistIds(nextItems.map((wishlistItem) => wishlistItem.idsp));
    message.success(existed ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const addToCart = async (goToCheckout = false) => {
    if (!product?._id) return;
    if (countInStock <= 0) {
      message.error("Sản phẩm đã hết hàng");
      return;
    }

    const nextQuantity = Math.max(1, Number(quantity || 1));
    const cartItems = readLocalArray("cartItems");
    const existed = cartItems.find((item) => item.idsp === product._id);
    const currentQuantity = Number(existed?.quantity || 0);

    if (nextQuantity + currentQuantity > countInStock) {
      message.error("Số lượng vượt quá tồn kho");
      return;
    }

    const nextItems = existed
      ? cartItems.map((item) =>
          item.idsp === product._id
            ? { ...item, quantity: currentQuantity + nextQuantity }
            : item
        )
      : [
          ...cartItems,
          {
            idsp: product._id,
            name: product.name,
            image: imageSrc || "",
            price: product.price,
            discount: product.discount || 0,
            countInStock: product.countInStock,
            quantity: nextQuantity,
            category: typeName,
          },
        ];
    const previousItems = cartItems;

    localStorage.setItem("cartItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
    if (isLoggedIn) {
      try {
        const res = await CartServices.updateMyCart(
          {
            items: nextItems.map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) })),
          },
          user.access_token
        );
        if (res?.status !== "OK") throw new Error(res?.message || "Không thể cập nhật giỏ hàng");
      } catch (error) {
        localStorage.setItem("cartItems", JSON.stringify(previousItems));
        window.dispatchEvent(new Event("cart-updated"));
        message.error(error?.message || "Không thể cập nhật giỏ hàng");
        return;
      }
    }
    message.success("Đã thêm vào giỏ hàng");

    if (goToCheckout) {
      navigate("/checkout");
    }
  };

  const tabContent = useMemo(() => {
    if (activeTab === "usage") {
      return (
        <>
          <p>
            <strong>Hướng dẫn sử dụng:</strong> Dùng đúng liều lượng theo khuyến nghị của nhà sản xuất và tình trạng thú cưng.
          </p>
          <p>Luôn theo dõi phản ứng trong lần dùng đầu tiên.</p>
        </>
      );
    }

    if (activeTab === "shipping") {
      return (
        <>
          <p>
            <strong>Vận chuyển:</strong> Giao hàng tiêu chuẩn toàn quốc. Miễn phí vận chuyển cho đơn từ 499.000đ.
          </p>
          <p>Đơn hàng được đóng gói kỹ trước khi bàn giao cho đơn vị vận chuyển.</p>
        </>
      );
    }

    if (activeTab === "storage") {
      return (
        <>
          <p>
            <strong>Bảo quản:</strong> Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.
          </p>
          <p>Đậy kín sau khi mở để giữ chất lượng tốt nhất.</p>
        </>
      );
    }

    return (
      <>
        <p>
          <strong>Thành phần/Chất liệu:</strong> Thông tin đang cập nhật theo lô hàng.
        </p>
        <p>
          <strong>Đối tượng phù hợp:</strong> Chó/mèo theo đúng nhóm sản phẩm, phù hợp dùng hằng ngày.
        </p>
        <p>
          <strong>Lợi ích chính:</strong>{" "}
          {product?.description || "Sản phẩm hỗ trợ chăm sóc sức khỏe và sinh hoạt thú cưng mỗi ngày."}
        </p>
      </>
    );
  }, [activeTab, product?.description]);

  if (productQuery.isLoading) {
    return (
      <div className="product-detail-view">
        <main className="container">
          <LoadingState text="Đang tải chi tiết sản phẩm..." />
        </main>
      </div>
    );
  }

  if (productQuery.isError) {
    return (
      <div className="product-detail-view">
        <main className="container">
          <ErrorState message="Không thể tải thông tin sản phẩm." onRetry={() => productQuery.refetch()} />
        </main>
      </div>
    );
  }

  if (!product || productQuery?.data?.status !== "OK") {
    return (
      <div className="product-detail-view">
        <main className="container">
          <EmptyState description="Không tìm thấy sản phẩm." actionText="Quay lại sản phẩm" onAction={() => navigate("/products")} />
        </main>
      </div>
    );
  }

  return (
    <div className="product-detail-view">
      <main className="container">
        <div className="breadcrumb-pill">
          <button type="button" onClick={() => navigate("/")}>petshop</button>
          <svg viewBox="0 0 24 24" className="breadcrumb-arrow"><path d="M9 18l6-6-6-6" /></svg>
          <button type="button" onClick={() => navigate(backLink)}>Sản phẩm</button>
          <svg viewBox="0 0 24 24" className="breadcrumb-arrow"><path d="M9 18l6-6-6-6" /></svg>
          <strong>{product.name}</strong>
        </div>

        <section className="detail">
          <div className="gallery">
            {imageSrc ? (
              <img className="main-img" src={imageSrc} alt={product.name} />
            ) : (
              <div className="main-img placeholder">Không có ảnh sản phẩm</div>
            )}

            <div className="thumbs">
              {gallery.slice(0, 4).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  className={`thumb ${index === activeImage ? "active" : ""}`}
                  src={image}
                  alt={`thumb-${index}`}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          </div>

          <div className="info">
            <h1>{product.name}</h1>
            <div className="subline">
              <span className="rating">
                <svg viewBox="0 0 24 24" className="rating-star"><path d="M12 2l2.7 6.3L21 9l-4.8 4.2L17.6 20 12 16.5 6.4 20l1.4-6.8L3 9l6.3-.7L12 2z" /></svg>
                {rating.toFixed(1)}
              </span>
              <span className="divider-dot" />
              <span>{reviewCount} đánh giá</span>
              <span className="divider-dot" />
              <span>Đã bán {selled}+</span>
            </div>

            <div className="price-box">
              <div>
                <div className="price">{formatPrice(finalPrice)}</div>
                {discount > 0 ? <div className="old-price">{formatPrice(currentPrice)}</div> : null}
              </div>
              {discount > 0 ? <span className="sale-pill"><PetshopIcon name="tag" size={14} />Giảm {discount}%</span> : null}
            </div>

            <div className="line">
              <span className="label">Loại sản phẩm:</span>
              <span className="pill">{typeName}</span>
            </div>

            <div className="line">
              <span className="stock"><PetshopIcon name="check" size={14} />Còn hàng: {countInStock}</span>
            </div>

            <p className="desc">{product.description || "Thông tin mô tả đang được cập nhật."}</p>

            <div className="quantity-row">
              <span className="label">Số lượng</span>
              <span className="qty-control">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  onClick={() => setQuantity((prev) => Math.max(1, Number(prev || 1) - 1))}
                >
                  -
                </button>
                <input
                  className="qty-input"
                  type="text"
                  min={1}
                  max={Math.max(1, countInStock)}
                  value={quantity}
                  onChange={(event) => {
                    const value = Math.floor(Number(event.target.value || 1));
                    if (!Number.isFinite(value)) return;
                    setQuantity(Math.min(Math.max(1, value), Math.max(1, countInStock)));
                  }}
                />
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => setQuantity((prev) => Math.min(Math.max(1, countInStock), Number(prev || 1) + 1))}
                >
                  +
                </button>
              </span>
            </div>

            <div className="btns">
              <button type="button" className="btn black" onClick={() => addToCart(true)}>
                <svg viewBox="0 0 24 24" className="petshop-icon" style={{ width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                </svg>
                Mua ngay
              </button>
              <button type="button" className="btn brown" onClick={() => addToCart(false)}>
                <PetshopIcon name="cart" size={14} />
                Thêm giỏ hàng
              </button>
              <button type="button" className="btn ghost" onClick={toggleWishlist} aria-label="Yêu thích">
                <PetshopIcon name="heart" size={14} />
                {isFavorite ? "Đã yêu thích" : "Yêu thích"}
              </button>
            </div>

            <div className="benefits">
              <h3>Quyền lợi khi mua online</h3>
              <div className="benefit-grid">
                <div className="benefit"><svg viewBox="0 0 24 24" className="benefit-icon"><path d="M20 6L9 17l-5-5"></path></svg><span>Giữ hàng tại shop cho khách đặt online</span></div>
                <div className="benefit"><svg viewBox="0 0 24 24" className="benefit-icon"><path d="M3 7h11v10H3z"></path><path d="M14 10h4l3 3v4h-7"></path><circle cx="7" cy="19" r="1.7"></circle><circle cx="18" cy="19" r="1.7"></circle></svg><span>Giao hàng toàn quốc</span></div>
                <div className="benefit"><svg viewBox="0 0 24 24" className="benefit-icon"><path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1.1L3 21l1.6-5.1A8.5 8.5 0 1 1 21 12z"></path></svg><span>Tư vấn miễn phí 24/7</span></div>
                <div className="benefit"><svg viewBox="0 0 24 24" className="benefit-icon"><path d="M4 7h16"></path><path d="M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"></path><path d="M9 7a3 3 0 0 1 6 0"></path></svg><span>Đổi trả linh hoạt trong 7 ngày</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="tabs-card">
          <div className="tabs">
            <button type="button" className={activeTab === "description" ? "active" : ""} onClick={() => setActiveTab("description")}>Mô tả</button>
            <button type="button" className={activeTab === "usage" ? "active" : ""} onClick={() => setActiveTab("usage")}>Hướng dẫn sử dụng</button>
            <button type="button" className={activeTab === "shipping" ? "active" : ""} onClick={() => setActiveTab("shipping")}>Vận chuyển</button>
            <button type="button" className={activeTab === "storage" ? "active" : ""} onClick={() => setActiveTab("storage")}>Bảo quản</button>
          </div>

          <div className="tab-text">{tabContent}</div>
        </section>

        <section className="related">
          <div className="section-head">
            <div>
              <h2>Sản phẩm liên quan</h2>
              <p>Các sản phẩm cùng nhóm dinh dưỡng và chăm sóc hằng ngày</p>
            </div>
            <button type="button" className="view-all" onClick={() => navigate("/products")}>
              <PetshopIcon name="eye" size={16} className="petshop-icon" />
              Xem tất cả
            </button>
          </div>

          <div className="grid">
            {relatedDisplayItems.map((item, index) => {
              if (!item) {
                return (
                  <article key={`placeholder-${index}`} className="product placeholder-card" aria-hidden="true">
                    <div className="image-wrap placeholder-block" />
                    <div className="body">
                      <div className="placeholder-line title-line" />
                      <div className="placeholder-line price-line" />
                      <div className="placeholder-line meta-line" />
                      <div className="placeholder-btn" />
                    </div>
                  </article>
                );
              }
              return (
                <article key={item._id || `related-${index}`} className="product">
                  <button className="heart" type="button" aria-label="Thêm vào yêu thích" onClick={(event) => toggleRelatedWishlist(event, item)}>
                    <PetshopIcon name="heart" size={16} className={relatedWishlistIds.includes(item._id) ? "is-favorite" : ""} />
                  </button>
                  <div className="image-wrap"><img src={getMainImage(item)} alt={item?.name} /></div>
                  <div className="body">
                    <h3 className="title">{item?.name}</h3>
                    <div className="product-price">{formatPrice(Math.round(Number(item?.price || 0) * (1 - Number(item?.discount || 0) / 100)))}</div>
                    <div className="card-actions">
                      <button
                        className="add-cart"
                        type="button"
                        onClick={async (event) => {
                          event.stopPropagation();
                          if (!item?._id) {
                            message.error("Không thể thêm sản phẩm này vào giỏ");
                            return;
                          }
                          const stock = Number(item?.countInStock || 0);
                          if (stock <= 0) {
                            message.error("Sản phẩm đã hết hàng");
                            return;
                          }
                          const cartItems = readLocalArray("cartItems");
                          const existed = cartItems.find((cartItem) => cartItem.idsp === item._id);
                          const currentQuantity = Number(existed?.quantity || 0);
                          if (currentQuantity + 1 > stock) {
                            message.error("Số lượng vượt quá tồn kho");
                            return;
                          }
                          const nextItems = existed
                            ? cartItems.map((cartItem) =>
                                cartItem.idsp === item._id ? { ...cartItem, quantity: currentQuantity + 1 } : cartItem
                              )
                            : [
                                ...cartItems,
                                {
                                  idsp: item._id,
                                  name: item.name,
                                  image: getMainImage(item),
                                  price: item.price,
                                  discount: item.discount || 0,
                                  countInStock: item.countInStock,
                                  quantity: 1,
                                  category: item?.type?.name || typeName,
                                },
                              ];
                          localStorage.setItem("cartItems", JSON.stringify(nextItems));
                          window.dispatchEvent(new Event("cart-updated"));
                          if (isLoggedIn) {
                            const previousItems = cartItems;
                            try {
                              const res = await CartServices.updateMyCart(
                                {
                                  items: nextItems.map((cartItem) => ({
                                    productId: cartItem.idsp,
                                    quantity: Number(cartItem.quantity || 1),
                                  })),
                                },
                                user.access_token
                              );
                              if (res?.status !== "OK") throw new Error(res?.message || "Không thể cập nhật giỏ hàng");
                            } catch (error) {
                              localStorage.setItem("cartItems", JSON.stringify(previousItems));
                              window.dispatchEvent(new Event("cart-updated"));
                              message.error(error?.message || "Không thể cập nhật giỏ hàng");
                              return;
                            }
                          }
                          message.success("Đã thêm vào giỏ hàng");
                        }}
                      >
                        <PetshopIcon name="cart" size={16} className="petshop-icon" />
                        <span className="related-btn-label">Thêm vào giỏ</span>
                      </button>
                      <button
                        className="quick-view"
                        type="button"
                        aria-label="Xem chi tiết"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!item?._id) return;
                          navigate(`/product-detail/${item._id}`);
                        }}
                      >
                        <PetshopIcon name="eye" size={16} className="petshop-icon" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetailsPage;
