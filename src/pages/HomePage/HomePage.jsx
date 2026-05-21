import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { message } from "antd";
import * as ProductServices from "../../services/ProductServices";
import * as TypeServices from "../../services/TypeServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import { serviceCatalog } from "../../data/serviceCatalog";
import { homeFallbackProducts } from "../../data/homeFallbackProducts";
import { LoadingState, PetshopIcon } from "../../components/ui";
import "./HomePage.css";

const HERO_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1100&auto=format&fit=crop";

const reviews = [
  {
    key: "H",
    name: "Hà My",
    date: "12/05/2026 · Đã mua: Pate cá ngừ cho mèo",
    text: "Đóng gói kỹ, giao nhanh, bé mèo ăn hợp ngay từ lần đầu. Mình sẽ mua lại.",
  },
  {
    key: "Q",
    name: "Anh Quân",
    date: "08/05/2026 · Đã mua: Vòng cổ phản quang",
    text: "Chất liệu chắc, đúng size, đi dạo buổi tối rất an toàn. Shop tư vấn nhiệt tình.",
  },
  {
    key: "L",
    name: "Trúc Linh",
    date: "05/05/2026 · Đã đặt: Tắm spa cho chó",
    text: "Nhân viên nhẹ nhàng, bé nhà mình không bị sợ. Lông thơm và mềm hơn rõ.",
  },
];

const firstImage = (image = "") =>
  String(image)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";

const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const seededScore = (seed = "") => {
  const source = String(seed || "petshop");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 1000003;
  }
  return (hash % 11) / 10; // 0.0 -> 1.0 step 0.1
};
const getProductRating = (product = {}) => {
  const value = Number(product?.rating);
  if (Number.isFinite(value) && value > 0) return Math.min(5, Math.max(0, value));
  const base = 4 + seededScore(product?._id || product?.name || "");
  return Number(base.toFixed(1));
};

const buildPrioritizedList = (products = [], take = 0) => {
  const discounted = products.filter((item) => Number(item?.discount || 0) > 0);
  const fallback = products.filter((item) => Number(item?.discount || 0) <= 0);
  return [...discounted, ...fallback].slice(0, take);
};

const pickNonDiscounted = (products = [], take = 0) =>
  products.filter((item) => Number(item?.discount || 0) <= 0).slice(0, take);

const pickBestSellers = (products = [], take = 4) =>
  (() => {
    const nonDiscount = products.filter((item) => Number(item?.discount || 0) <= 0);
    const sortedBySelled = [...nonDiscount].sort((a, b) => Number(b?.selled || 0) - Number(a?.selled || 0));
    const soldProducts = sortedBySelled.filter((item) => Number(item?.selled || 0) > 0);
    if (soldProducts.length >= take) return soldProducts.slice(0, take);
    const selectedIds = new Set(soldProducts.map((item) => String(item?._id || "")));
    const fallback = sortedBySelled.filter((item) => !selectedIds.has(String(item?._id || "")));
    return [...soldProducts, ...fallback].slice(0, take);
  })();

const removeAccent = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hasCatMarkers = (product = {}) => {
  const typeObj = product?.type && typeof product.type === "object" ? product.type : null;
  const speciesRaw = removeAccent(typeObj?.species || "");
  if (speciesRaw === "cat" || speciesRaw === "meo") return true;

  const haystack = [
    typeObj?.slug,
    typeObj?.name,
    product?.name,
    product?.description,
    product?.category,
  ]
    .map((value) => removeAccent(value || ""))
    .join(" ");

  return haystack.includes("cat") || haystack.includes("meo");
};

const hasDogMarkers = (product = {}) => {
  const typeObj = product?.type && typeof product.type === "object" ? product.type : null;
  const speciesRaw = removeAccent(typeObj?.species || "");
  if (speciesRaw === "dog" || speciesRaw === "cho") return true;

  const haystack = [
    typeObj?.slug,
    typeObj?.name,
    product?.name,
    product?.description,
    product?.category,
  ]
    .map((value) => removeAccent(value || ""))
    .join(" ");

  return haystack.includes("dog") || haystack.includes("cho") || haystack.includes("cun");
};

const getProductTypeId = (product = {}) => String(product?.type?._id || product?.type || "");

const getSpeciesFromProduct = (product = {}, typeIdToSpecies = new Map()) => {
  const productSpeciesRaw = removeAccent(product?.species || "");
  if (productSpeciesRaw === "dog" || productSpeciesRaw === "cho") return "dog";
  if (productSpeciesRaw === "cat" || productSpeciesRaw === "meo") return "cat";

  const typeObj = product?.type && typeof product.type === "object" ? product.type : null;
  const typeSpeciesRaw = removeAccent(typeObj?.species || "");
  if (typeSpeciesRaw === "dog" || typeSpeciesRaw === "cho") return "dog";
  if (typeSpeciesRaw === "cat" || typeSpeciesRaw === "meo") return "cat";

  const mappedSpecies = typeIdToSpecies.get(getProductTypeId(product));
  if (mappedSpecies === "dog" || mappedSpecies === "cat") return mappedSpecies;

  const hasDog = hasDogMarkers(product);
  const hasCat = hasCatMarkers(product);
  if (hasDog && !hasCat) return "dog";
  if (hasCat && !hasDog) return "cat";
  return "all";
};

const isCareProduct = (product = {}) => {
  const typeName = removeAccent(product?.type?.name || "");
  const name = removeAccent(product?.name || "");
  return (
    typeName.includes("cham soc") ||
    typeName.includes("groom") ||
    name.includes("sua tam") ||
    name.includes("ve sinh") ||
    name.includes("luoc") ||
    name.includes("vong co")
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const getSecondsToEndOfDay = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));
  };
  const [remaining, setRemaining] = useState(getSecondsToEndOfDay);
  const [activeTab, setActiveTab] = useState("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);

  const productsQuery = useQuery({
    queryKey: ["home-products"],
    queryFn: () => ProductServices.getAllProduct({ limit: 120 }),
  });
  const typesQuery = useQuery({
    queryKey: ["home-types"],
    queryFn: TypeServices.getAllType,
  });
  const wishlistQuery = useQuery({
    queryKey: ["home-wishlist", user?.access_token],
    queryFn: () => WishlistServices.getMyWishlist(user.access_token),
    enabled: isLoggedIn,
  });

  const usingFallbackProducts = productsQuery.isError;
  const products = useMemo(
    () => (productsQuery?.data?.data?.length ? productsQuery.data.data : (usingFallbackProducts ? homeFallbackProducts : [])),
    [productsQuery?.data?.data, usingFallbackProducts]
  );
  const types = useMemo(() => typesQuery?.data?.data || [], [typesQuery?.data?.data]);
  const flashProducts = useMemo(() => buildPrioritizedList(products, 4), [products]);
  const collectionProducts = useMemo(() => pickNonDiscounted(products, 24), [products]);
  const bestSellerProducts = useMemo(() => pickBestSellers(products, 4), [products]);
  const previewServices = useMemo(() => serviceCatalog.slice(0, 3), []);
  const heroImage = HERO_FALLBACK_IMAGE;

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getSecondsToEndOfDay());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const typeIdToSpecies = useMemo(() => {
    const map = new Map();
    types.forEach((type) => {
      const id = String(type?._id || "");
      if (!id) return;
      const species = removeAccent(type?.species || "");
      if (species === "dog" || species === "cho") map.set(id, "dog");
      if (species === "cat" || species === "meo") map.set(id, "cat");
    });
    return map;
  }, [types]);

  const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");

  const readLocal = (key) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    const syncWishlist = () => {
      const items = readLocal("wishlistItems");
      setWishlistIds(items.map((item) => item.idsp).filter(Boolean));
    };

    syncWishlist();
    window.addEventListener("storage", syncWishlist);
    window.addEventListener("wishlist-updated", syncWishlist);
    return () => {
      window.removeEventListener("storage", syncWishlist);
      window.removeEventListener("wishlist-updated", syncWishlist);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const serverItems = wishlistQuery.data?.data?.productIds || [];
    const mapped = serverItems.map((item) => String(item?._id || "")).filter(Boolean);
    setWishlistIds(mapped);
    const localMapped = serverItems.map((item) => ({
      idsp: item._id,
      name: item.name,
      image: firstImage(item.image),
      price: item.price,
      discount: item.discount || 0,
      countInStock: item.countInStock,
      category: item?.type?.name || "Sản phẩm",
    }));
    localStorage.setItem("wishlistItems", JSON.stringify(localMapped));
    window.dispatchEvent(new Event("wishlist-updated"));
  }, [isLoggedIn, wishlistQuery.data]);

  const filteredCollectionProducts = useMemo(() => {
    const base = collectionProducts;
    if (activeTab === "all") return base.slice(0, 8);

    const canUseTypesMap = !typesQuery.isError && typeIdToSpecies.size > 0;
    const byTab = base.filter((product) => {
      const species = canUseTypesMap
        ? getSpeciesFromProduct(product, typeIdToSpecies)
        : (() => {
            const hasDog = hasDogMarkers(product);
            const hasCat = hasCatMarkers(product);
            if (hasDog && !hasCat) return "dog";
            if (hasCat && !hasDog) return "cat";
            return "all";
          })();
      if (activeTab === "dog") return species === "dog" || (species === "all" && hasDogMarkers(product));
      if (activeTab === "cat") return species === "cat" || (species === "all" && hasCatMarkers(product));
      if (activeTab === "care") return isCareProduct(product);
      return true;
    });

    return byTab.slice(0, 8);
  }, [activeTab, collectionProducts, typeIdToSpecies, typesQuery.isError]);

  const onToggleWishlist = async (event, product) => {
    event.stopPropagation();
    const wishlistItems = readLocal("wishlistItems");
    const existed = wishlistItems.some((item) => item.idsp === product._id);
    const nextItems = existed
      ? wishlistItems.filter((item) => item.idsp !== product._id)
      : [...wishlistItems, { idsp: product._id, name: product.name, image: firstImage(product.image), price: product.price, discount: product.discount || 0, countInStock: product.countInStock, category: product?.type?.name }];
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
    message.success(existed ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const onAddCart = async (event, product) => {
    event.stopPropagation();
    const stock = Number(product?.countInStock || 0);
    if (stock <= 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }
    const cartItems = readLocal("cartItems");
    const existed = cartItems.find((item) => item.idsp === product._id);
    const nextItems = existed
      ? cartItems.map((item) => (item.idsp === product._id ? { ...item, quantity: Math.min(Number(item.quantity || 1) + 1, stock) } : item))
      : [...cartItems, { idsp: product._id, name: product.name, image: firstImage(product.image), price: product.price, discount: product.discount || 0, countInStock: stock, quantity: 1, category: product?.type?.name }];
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
  };

  const handleCategoryNavigate = (keyword) => {
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const renderProductCard = (product, keyPrefix = "p", options = {}) => {
    const basePrice = Number(product?.price || 0);
    const discount = Number(product?.discount || 0);
    const final = Math.round(basePrice * (1 - discount / 100));
    const rating = getProductRating(product);
    const filledStars = Math.round(rating);
    const showDiscount = Boolean(options?.showDiscount);
    const showBestLabel = Boolean(options?.showBestLabel);
    const showRating = options?.showRating !== false;
    const showSelled = Boolean(options?.showSelled);
    const selledValue = Number(product?.selled || 0);
    const formatSelled = selledValue >= 1000 ? `${(selledValue / 1000).toFixed(1)}K` : `${selledValue}`;
    return (
      <article className="product" key={`${keyPrefix}-${product._id}`}>
        <button className="heart" type="button" aria-label="Yêu thích" onClick={(e) => onToggleWishlist(e, product)}>
          <PetshopIcon name="heart" size={16} className={wishlistIds.includes(product?._id) ? "is-favorite" : ""} />
        </button>
        {showBestLabel ? <span className="label">Nổi bật</span> : null}
        {!showBestLabel && showDiscount && discount > 0 ? <span className="label">-{discount}%</span> : null}
        <div className="product-media"><img src={firstImage(product?.image)} alt={product?.name} /></div>
        <div className="body">
          <h3 className="title">{product?.name}</h3>
          <div className="price-row">
            <div className="price">{formatPrice(final)}</div>
            {showDiscount && discount > 0 ? <div className="old-price">{formatPrice(basePrice)}</div> : null}
          </div>
          {showRating ? (
            <div className="rating-stock-row">
              {showSelled ? (
                <span className="selled-inline">Đã bán {formatSelled}</span>
              ) : (
                <span className="rating-row">
                  <span className="rating-value">{rating.toFixed(1)}</span>
                  <span className="rating-stars" aria-label={`Đánh giá ${rating.toFixed(1)} trên 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <PetshopIcon
                    key={`star-${index}`}
                    name="star"
                    size={13}
                    className={`petshop-icon ${index < filledStars ? "star active" : "star"}`}
                  />
                ))}
              </span>
                </span>
              )}
              <span className="stock-inline">{Number(product?.countInStock || 0) > 0 ? "Còn hàng" : "Hết hàng"}</span>
            </div>
          ) : (
            <div className="meta">
              <span>Giao tiêu chuẩn</span>
              <span>{Number(product?.countInStock || 0) > 0 ? "Còn hàng" : "Hết hàng"}</span>
            </div>
          )}
          <div className="card-actions">
            <button type="button" className="add-cart" onClick={(e) => onAddCart(e, product)} disabled={Number(product?.countInStock || 0) <= 0}>
              <PetshopIcon name="cart" size={16} />
              {Number(product?.countInStock || 0) <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
            </button>
            <button type="button" className="quick" aria-label="Xem chi tiết" onClick={(e) => { e.stopPropagation(); navigate(`/product-detail/${product._id}`); }}><PetshopIcon name="eye" size={16} /></button>
          </div>
        </div>
      </article>
    );
  };
  const renderStars = () => (
    <span className="rating-stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <PetshopIcon key={`review-star-${index}`} name="star" size={13} className="petshop-icon star active" />
      ))}
    </span>
  );

  const submitNewsletter = (event) => {
    event.preventDefault();
    const value = newsletterEmail.trim();
    if (!value) {
      message.warning("Vui lòng nhập email");
      return;
    }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) {
      message.error("Email không hợp lệ");
      return;
    }
    message.success("Đăng ký nhận ưu đãi thành công");
    setNewsletterEmail("");
  };

  return (
    <div className="home-page">
      <main>
        <section className="hero" id="home">
          <div className="container hero-inner">
            <div className="hero-content">
              <div className="eyebrow">CHĂM THÚ CƯNG 2026</div>
              <h1>Chăm thú cưng đúng cách, mua sắm dễ dàng mỗi ngày</h1>
              <p className="hero-desc">petshop cung cấp thức ăn, phụ kiện, sản phẩm chăm sóc và dịch vụ grooming đáng tin cậy cho chó mèo của bạn.</p>

              <div className="hero-actions">
                <button className="btn dark" type="button" onClick={() => navigate("/products")}>Mua ngay <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: 2 }}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg></button>
                <button className="btn light" type="button" onClick={() => navigate("/services")}>Xem dịch vụ chăm sóc</button>
              </div>

              <div className="tags">
                <span>Miễn phí vận chuyển từ 499.000đ</span>
                <span>10.000+ khách hàng tin dùng</span>
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>

            <div className="hero-art" aria-label="Ảnh thú cưng nổi bật">
              <img className="hero-photo" src={heroImage} alt="Hai chú chó vui vẻ" />
              <div className="deal-card">
                <strong>-30%</strong>
                <span>Combo chăm sóc lông cho thú cưng trong tuần này</span>
              </div>
              <div className="hero-note">
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, marginRight: 6, stroke: "currentColor", fill: "none", strokeWidth: 2, verticalAlign: "middle" }}>
                  <path d="M8.5 9.5c1.1 0 2-1.2 2-2.7S9.6 4 8.5 4s-2 1.2-2 2.8.9 2.7 2 2.7z"></path>
                  <path d="M15.5 9.5c1.1 0 2-1.2 2-2.7S16.6 4 15.5 4s-2 1.2-2 2.8.9 2.7 2 2.7z"></path>
                  <path d="M5.2 13.2c.9.5 2.2 0 2.9-1.2.7-1.2.5-2.6-.4-3.1-.9-.5-2.2 0-2.9 1.2-.7 1.2-.5 2.6.4 3.1z"></path>
                  <path d="M18.8 13.2c-.9.5-2.2 0-2.9-1.2-.7-1.2-.5-2.6.4-3.1.9-.5 2.2 0 2.9 1.2.7 1.2.5 2.6-.4 3.1z"></path>
                  <path d="M8.2 18.2c.3-2.7 1.9-4.6 3.8-4.6s3.5 1.9 3.8 4.6c.2 1.6-1 2.8-2.4 2.1-.8-.4-2-.4-2.8 0-1.4.7-2.6-.5-2.4-2.1z"></path>
                </svg>
                Chăm sóc tại petshop
              </div>
            </div>
          </div>
        </section>

        <section className="trust">
          <div className="container trust-grid">
            <div className="trust-item"><div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"></path><path d="M8.5 12l2.2 2.2 4.8-5"></path></svg></div><span>Hàng chính hãng 100%</span></div>
            <div className="trust-item"><div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M3 6h11v10H3z"></path><path d="M14 10h4l3 3v3h-7z"></path><circle cx="7" cy="19" r="2"></circle><circle cx="18" cy="19" r="2"></circle></svg></div><span>Giao nhanh trong ngày</span></div>
            <div className="trust-item"><div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M4 7h10a6 6 0 1 1-4.2 10.2"></path><path d="M4 7l4-4"></path><path d="M4 7l4 4"></path></svg></div><span>Đổi trả trong 7 ngày</span></div>
            <div className="trust-item"><div className="trust-icon"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path></svg></div><span>Tư vấn miễn phí 24/7</span></div>
          </div>
        </section>

        <section className="section container" id="categories">
          <div className="section-head">
            <div>
              <h2>Danh mục nổi bật</h2>
              <p>Lựa chọn nhanh theo nhu cầu chăm sóc chó mèo mỗi ngày</p>
            </div>
            <button className="view" type="button" onClick={() => navigate("/products")}>Xem tất cả</button>
          </div>

          <div className="categories">
            <article className="cat" onClick={() => handleCategoryNavigate("chó")}><div className="cat-icon"><svg viewBox="0 0 24 24"><path d="M7 10.2V8.4c0-2.6 2.1-4.7 5-4.7s5 2.1 5 4.7v1.8"></path><path d="M7 10.2l-2.2 1.3c-.8.5-1.1 1.5-.6 2.3l1.7 3.2c.4.7 1.2 1.1 2 .9l1.4-.3"></path><path d="M17 10.2l2.2 1.3c.8.5 1.1 1.5.6 2.3L18.1 17c-.4.7-1.2 1.1-2 .9l-1.4-.3"></path><path d="M8.6 15.2c.6 2.1 1.8 3.2 3.4 3.2s2.8-1.1 3.4-3.2"></path><path d="M10 10.8h.1M14 10.8h.1"></path><path d="M11 13h2"></path></svg></div><h3>Cho chó</h3><span>Thức ăn, đồ chơi, phụ kiện</span></article>
            <article className="cat" onClick={() => handleCategoryNavigate("mèo")}><div className="cat-icon"><svg viewBox="0 0 24 24"><path d="M5.5 9.2L6.9 4l4.1 3h2l4.1-3 1.4 5.2v3.3a6.5 6.5 0 0 1-13 0V9.2z"></path><path d="M9 12h.1M15 12h.1"></path><path d="M12 14v1.2"></path><path d="M10 16.2c1 .8 3 .8 4 0"></path><path d="M7.2 14.2H4.6M7.5 16h-3"></path><path d="M16.8 14.2h2.6M16.5 16h3"></path></svg></div><h3>Cho mèo</h3><span>Pate, cát vệ sinh, nhà mèo</span></article>
            <article className="cat" onClick={() => handleCategoryNavigate("thức ăn")}><div className="cat-icon"><svg viewBox="0 0 24 24"><path d="M5 11.5h14"></path><path d="M7 8.5h10a3 3 0 0 1 3 3v3.2a3.3 3.3 0 0 1-3.3 3.3H7.3A3.3 3.3 0 0 1 4 14.7v-3.2a3 3 0 0 1 3-3z"></path><path d="M8.5 8.5c.1-1.7 1.5-3 3.5-3s3.4 1.3 3.5 3"></path><path d="M9 14.5h6"></path><path d="M18 8.5l1.4-2.1"></path><path d="M6 8.5L4.6 6.4"></path></svg></div><h3>Thức ăn</h3><span>Hạt, pate, snack thưởng</span></article>
            <article className="cat" onClick={() => handleCategoryNavigate("đồ chơi")}><div className="cat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"></circle><path d="M7.2 6.2c2.3 3.9 5.1 6.9 10.6 7.8"></path><path d="M6.2 16.8c3.9-2.3 6.9-5.1 7.8-10.6"></path><path d="M16.5 18.2c-1.2-2.1-3-3.8-5.2-5"></path></svg></div><h3>Đồ chơi</h3><span>Giải trí và vận động</span></article>
            <article className="cat" onClick={() => handleCategoryNavigate("chăm sóc")}><div className="cat-icon"><svg viewBox="0 0 24 24"><path d="M7 16.5l8.8-8.8 2.5 2.5-8.8 8.8H7v-2.5z"></path><path d="M14.8 8.7l-1.6-1.6"></path><path d="M16.6 6.9l1.6 1.6"></path><path d="M6 6h5"></path><path d="M6 9h4"></path><path d="M6 12h3"></path></svg></div><h3>Chăm sóc</h3><span>Lược, sữa tắm, vệ sinh</span></article>
            <article className="cat" onClick={() => handleCategoryNavigate("sức khỏe")}><div className="cat-icon"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="3"></rect><path d="M9 4.5V4a3 3 0 0 1 6 0v.5"></path><path d="M12 9v6"></path><path d="M9 12h6"></path><path d="M8 17h8"></path></svg></div><h3>Sức khỏe</h3><span>Vitamin và dụng cụ y tế</span></article>
          </div>
        </section>

        <section className="section container" id="flash-sale">
          <div className="flash">
            {!productsQuery.isLoading && productsQuery.isError ? <div className="empty-state dark">Đang dùng dữ liệu tạm thời do mất kết nối máy chủ.</div> : null}
            <div className="flash-top">
              <div>
                <h2>Giảm giá chớp nhoáng</h2>
                <p>Ưu đãi giới hạn cho các sản phẩm được mua nhiều nhất trong tuần</p>
                <br />
            <button className="btn light" type="button" onClick={() => navigate("/products")}>Xem tất cả khuyến mãi</button>
              </div>
              <div className="timer">{`${h}:${m}:${s}`}</div>
            </div>

            {productsQuery.isLoading ? <LoadingState text="Đang tải sản phẩm..." /> : null}
            {!productsQuery.isLoading ? (
              flashProducts.length > 0 ? (
                <div className="grid">
                  {flashProducts.map((product) => renderProductCard(product, "flash", { showDiscount: true, showRating: false }))}
                </div>
              ) : (
                <div className="empty-state dark">Chưa có sản phẩm flash sale.</div>
              )
            ) : null}
          </div>
        </section>

        <section className="section container" id="products">
          <div className="section-head">
            <div>
              <h2>Bộ sưu tập nổi bật</h2>
              <p>Sản phẩm thiết yếu được chọn lọc cho chó và mèo</p>
            </div>
            <button className="view" type="button" onClick={() => navigate("/products")}>Xem tất cả</button>
          </div>
          <div className="tabs" id="featured">
            <button className={activeTab === "all" ? "active" : ""} type="button" onClick={() => setActiveTab("all")}>Tất cả</button>
            <button className={activeTab === "dog" ? "active" : ""} type="button" onClick={() => setActiveTab("dog")}>Cho chó</button>
            <button className={activeTab === "cat" ? "active" : ""} type="button" onClick={() => setActiveTab("cat")}>Cho mèo</button>
            <button className={activeTab === "care" ? "active" : ""} type="button" onClick={() => setActiveTab("care")}>Chăm sóc</button>
          </div>
          {typesQuery.isError ? <div className="empty-state" style={{ marginTop: 8 }}>Đang lọc theo dữ liệu tạm thời do mất kết nối danh mục.</div> : null}

          {productsQuery.isLoading || typesQuery.isLoading ? <LoadingState text="Đang tải sản phẩm..." /> : null}
          {!productsQuery.isLoading && !typesQuery.isLoading ? (
            filteredCollectionProducts.length > 0 ? (
              <div className="grid">
                {filteredCollectionProducts.map((product) => renderProductCard(product, "collection"))}
              </div>
            ) : (
              <div className="empty-state">Chưa có sản phẩm để hiển thị.</div>
            )
          ) : null}
        </section>

        <section className="section container">
          <div className="section-head"><div><h2>Sản phẩm bán chạy</h2><p>Những lựa chọn được khách hàng mua lại nhiều nhất</p></div><button className="view" type="button" onClick={() => navigate("/products")}>Xem tất cả</button></div>
          <div className="grid">
            {(bestSellerProducts.length ? bestSellerProducts : flashProducts).map((product) => renderProductCard(product, "best", { showSelled: true, showBestLabel: true }))}
          </div>
        </section>

        <section className="section container" id="services">
          <div className="section-head"><div><h2>Dịch vụ chăm sóc</h2><p>Đặt lịch grooming, tắm spa và tư vấn sức khỏe cơ bản cho thú cưng</p></div><button className="view" type="button" onClick={() => navigate("/services")}>Đặt lịch ngay</button></div>
          <div className="services">
            <div className="service-main">
              <div>
                <h3>Spa & grooming trọn gói</h3>
                <p>Dịch vụ tắm, sấy, chải lông, vệ sinh tai móng và tư vấn sản phẩm phù hợp theo giống thú cưng.</p>
                <button className="btn brown" type="button" onClick={() => navigate("/contact")}>Tư vấn lịch phù hợp</button>
              </div>
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=900&auto=format&fit=crop" alt="Dịch vụ chăm sóc thú cưng" />
            </div>
            <div className="service-list">
              {previewServices.map((service, idx) => (
                <article className="service-item" key={service.slug} onClick={() => navigate(`/services/${service.slug}`)}>
                  <h4>
                    {idx === 0 ? (
                      <svg viewBox="0 0 24 24" className="service-svg"><path d="M4 14h16"></path><path d="M6 14v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2"></path><path d="M7 10c0-1.1.9-2 2-2"></path><path d="M12 8c0-1.1.9-2 2-2"></path><path d="M15 10c0-1.1.9-2 2-2"></path></svg>
                    ) : idx === 1 ? (
                      <svg viewBox="0 0 24 24" className="service-svg"><circle cx="6" cy="7" r="3"></circle><circle cx="6" cy="17" r="3"></circle><path d="M8.5 8.5L20 20"></path><path d="M8.5 15.5L20 4"></path></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="service-svg"><path d="M4 5h16v11H8l-4 4V5z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path></svg>
                    )}
                    {idx === 0 ? "Tắm spa" : idx === 1 ? "Cắt tỉa lông" : "Tư vấn chăm sóc"}
                  </h4>
                  <p>{idx === 0 ? "Làm sạch, khử mùi, dưỡng lông mềm mượt với sản phẩm dịu nhẹ." : idx === 1 ? "Tạo kiểu gọn gàng, phù hợp thời tiết và giống thú cưng." : "Gợi ý thức ăn, vitamin và phụ kiện theo độ tuổi, cân nặng."}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="reviews-section" id="reviews">
          <div className="container">
            <h2 className="section-title">Khách hàng nói gì</h2>
            <p className="section-desc">Đánh giá thực tế giúp bạn mua sắm và đặt dịch vụ yên tâm hơn</p>
            <div className="reviews">
              {reviews.map((review) => (
                <article className="review" key={review.key}>
                  <div className="review-head">
                    <div className="review-avatar">{review.key}</div>
                    <div>
                      <div className="review-name">{review.name}</div>
                      <div className="review-date">{review.date}</div>
                    </div>
                  </div>
                  <p className="review-text">{review.text}</p>
                  <div className="stars">{renderStars()}</div>
                </article>
              ))}
            </div>
            <div className="stats">
              <div className="stat"><strong>10K+</strong><span>Khách hàng tin dùng</span></div>
              <div className="stat"><strong>25K+</strong><span>Đơn hàng hoàn tất</span></div>
              <div className="stat"><strong>4.9 <PetshopIcon name="star" size={14} className="stat-star petshop-icon star active" /></strong><span>Đánh giá trung bình</span></div>
              <div className="stat"><strong>98%</strong><span>Khách hàng hài lòng</span></div>
            </div>
          </div>
        </section>

        <section className="container newsletter" id="contact">
          <div>
            <h2>Nhận ưu đãi chăm sóc thú cưng</h2>
            <p>Đăng ký để nhận mã giảm giá, lịch flash sale và mẹo chăm sóc chó mèo mỗi tuần.</p>
          </div>
          <form className="subscribe" onSubmit={submitNewsletter}>
            <input type="email" placeholder="Nhập email của bạn" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} />
            <button type="submit">Đăng ký</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
