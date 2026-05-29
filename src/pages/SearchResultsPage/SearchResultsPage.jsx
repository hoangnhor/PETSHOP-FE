import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ProductServices from "../../services/ProductServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import * as message from "../../components/Message/Message";
import { EmptyState, ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import { readLocalArray } from "../../utils/localStorage";
import "./SearchResultsPage.css";

const firstImage = (image = "") =>
  String(image)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";

const getFinalPrice = (product) => {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
};

const seededScore = (seed = "") => {
  const source = String(seed || "petshop");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 1000003;
  }
  return (hash % 11) / 10;
};

const getProductRating = (product = {}) => {
  const value = Number(product?.rating);
  if (Number.isFinite(value) && value > 0) return Math.min(5, Math.max(0, value));
  const base = 4 + seededScore(product?._id || product?.name || "");
  return Number(base.toFixed(1));
};

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const [searchParams] = useSearchParams();
  const keyword = (searchParams.get("keyword") || "").trim();
  const [wishlistIds, setWishlistIds] = useState(() =>
    readLocalArray("wishlistItems").map((item) => item?.idsp).filter(Boolean)
  );

  const resultQuery = useQuery({
    queryKey: ["search-results", keyword],
    queryFn: () => ProductServices.searchProduct(keyword),
    enabled: Boolean(keyword),
  });

  const results = useMemo(() => resultQuery.data?.data || [], [resultQuery.data?.data]);
  useEffect(() => {
    const syncWishlist = () => {
      setWishlistIds(readLocalArray("wishlistItems").map((item) => item?.idsp).filter(Boolean));
    };
    syncWishlist();
    window.addEventListener("storage", syncWishlist);
    window.addEventListener("wishlist-updated", syncWishlist);
    return () => {
      window.removeEventListener("storage", syncWishlist);
      window.removeEventListener("wishlist-updated", syncWishlist);
    };
  }, []);

  const handleToggleWishlist = async (event, product) => {
    event.stopPropagation();
    const items = readLocalArray("wishlistItems");
    const existed = items.some((item) => item.idsp === product._id);
    const nextItems = existed
      ? items.filter((item) => item.idsp !== product._id)
      : [
          ...items,
          {
            idsp: product._id,
            name: product.name,
            image: firstImage(product.image),
            price: product.price,
            discount: product.discount || 0,
            countInStock: product.countInStock,
            category: product?.type?.name,
          },
        ];
    const previousItems = items;
    localStorage.setItem("wishlistItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("wishlist-updated"));
    if (isLoggedIn) {
      try {
        const action = existed
          ? WishlistServices.removeWishlistItem(product._id, user.access_token)
          : WishlistServices.addWishlistItem({ productId: product._id }, user.access_token);
        await action;
      } catch (error) {
        localStorage.setItem("wishlistItems", JSON.stringify(previousItems));
        window.dispatchEvent(new Event("wishlist-updated"));
        message.error(error?.message || "Không thể đồng bộ yêu thích");
        return;
      }
    }
    message.success(existed ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const handleAddCart = async (event, product) => {
    event.stopPropagation();
    const stock = Number(product?.countInStock || 0);
    if (stock <= 0) return;
    const items = readLocalArray("cartItems");
    const existed = items.find((item) => item.idsp === product._id);
    const nextItems = existed
      ? items.map((item) =>
          item.idsp === product._id
            ? { ...item, quantity: Math.min(Number(item.quantity || 1) + 1, stock) }
            : item
        )
      : [
          ...items,
          {
            idsp: product._id,
            name: product.name,
            image: firstImage(product.image),
            price: product.price,
            discount: product.discount || 0,
            countInStock: stock,
            quantity: 1,
            category: product?.type?.name,
          },
        ];
    const previousItems = items;
    localStorage.setItem("cartItems", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
    if (isLoggedIn) {
      try {
        await CartServices.updateMyCart(
          {
            items: nextItems.map((item) => ({ productId: item.idsp, quantity: Number(item.quantity || 1) })),
          },
          user.access_token
        );
      } catch (error) {
        localStorage.setItem("cartItems", JSON.stringify(previousItems));
        window.dispatchEvent(new Event("cart-updated"));
        message.error(error?.message || "Không thể đồng bộ giỏ hàng");
        return;
      }
    }
    message.success("Đã thêm vào giỏ hàng");
  };

  return (
    <div className="search-results-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <span>›</span>
          <strong>Kết quả tìm kiếm</strong>
        </div>
        <h1 className="page-title">Kết quả tìm kiếm</h1>
        <p className="sub">Từ khóa: “{keyword || "..."}” · {results.length} kết quả phù hợp.</p>

        {resultQuery.isLoading ? <LoadingState text="Đang tìm kiếm..." /> : null}
        {resultQuery.isError ? <ErrorState message="Không thể tìm kiếm sản phẩm" onRetry={() => resultQuery.refetch()} /> : null}
        {!resultQuery.isLoading && !resultQuery.isError && keyword && results.length === 0 ? <div className="card"><EmptyState description="Không có sản phẩm phù hợp" actionText="Xem tất cả sản phẩm" onAction={() => navigate("/products")} /></div> : null}

        {results.length > 0 ? (
          <section className="results-grid">
            {results.map((product) => {
              const discount = Number(product?.discount || 0);
              const finalPrice = getFinalPrice(product);
              const basePrice = Number(product?.price || 0);
              const inStock = Number(product?.countInStock || 0) > 0;
              const isFavorite = wishlistIds.includes(product?._id);
              const rating = getProductRating(product);
              const filledStars = Math.round(rating);
              return (
                <article className="product" key={product._id}>
                  <button className="heart" type="button" aria-label="Thêm vào yêu thích" onClick={(event) => handleToggleWishlist(event, product)}>
                    <PetshopIcon name="heart" size={16} className={isFavorite ? "is-favorite" : ""} />
                  </button>
                  {discount > 0 ? (
                    <span className="label sale">
                      <PetshopIcon name="tag" size={13} />
                      -{discount}%
                    </span>
                  ) : null}
                  <div className="product-media">
                    <img src={firstImage(product?.image)} alt={product?.name || "Sản phẩm"} />
                  </div>
                  <div className="body">
                    <h3 className="title">{product?.name || "Sản phẩm"}</h3>
                    <div className="price-row">
                      <div className="price">{`${Number(finalPrice || 0).toLocaleString("vi-VN")}đ`}</div>
                      {discount > 0 ? <div className="old-price">{`${Number(basePrice || 0).toLocaleString("vi-VN")}đ`}</div> : null}
                    </div>
                    <div className="rating-stock-row">
                      <span className="rating-row">
                        <span className="rating-value">{rating.toFixed(1)}</span>
                        <span className="rating-stars">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <PetshopIcon key={`star-${index}`} name="star" size={13} className={`petshop-icon ${index < filledStars ? "star active" : "star"}`} />
                          ))}
                        </span>
                      </span>
                      <span className="stock-inline">{inStock ? "Còn hàng" : "Hết hàng"}</span>
                    </div>
                    <div className="card-actions">
                      <button className="add-cart" type="button" disabled={!inStock} onClick={(event) => handleAddCart(event, product)}>
                        <PetshopIcon name="cart" size={16} />
                        {inStock ? "Thêm vào giỏ" : "Hết hàng"}
                      </button>
                      <button className="quick" type="button" aria-label="Xem chi tiết" onClick={(event) => { event.stopPropagation(); navigate(`/product-detail/${product._id}`); }}>
                        <PetshopIcon name="eye" size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default SearchResultsPage;
