import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { message } from "antd";
import * as ProductServices from "../../services/ProductServices";
import * as TypeServices from "../../services/TypeServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import { findCatalogNodeBySlugs } from "../../utils/catalogRouting";
import { Breadcrumb, EmptyState, ErrorState, LoadingState, PetshopIcon } from "../../components/ui";
import "./ProductsPage.css";

const PRODUCTS_PER_PAGE = 12;

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const detectSpeciesFromTypeName = (typeName = "", fallbackText = "") => {
  const normalized = normalizeText(typeName);
  if (normalized.includes(" cho ") || normalized.startsWith("cho ") || normalized.endsWith(" cho") || normalized.includes("dog") || normalized.includes("cun")) return "dog";
  if (normalized.includes(" meo ") || normalized.startsWith("meo ") || normalized.endsWith(" meo") || normalized.includes("cat")) return "cat";

  const byName = normalizeText(fallbackText);
  if (byName.includes("meo") || byName.includes("cat")) return "cat";
  if (byName.includes("cho") || byName.includes("dog") || byName.includes("cun")) return "dog";
  return "other";
};

const normalizeSpecies = (value = "") => {
  const normalized = normalizeText(value);
  if (normalized === "dog" || normalized === "cho") return "dog";
  if (normalized === "cat" || normalized === "meo") return "cat";
  return "other";
};

const isCareGroupProduct = (item = {}) => {
  const text = normalizeText(`${item?.name || ""} ${item?.type?.name || ""} ${item?.category || ""}`);
  return text.includes("cham soc") || text.includes("groom") || text.includes("ve sinh") || text.includes("sua tam") || text.includes("luoc");
};

const isHealthGroupProduct = (item = {}) => {
  const text = normalizeText(`${item?.name || ""} ${item?.type?.name || ""} ${item?.category || ""}`);
  return text.includes("suc khoe") || text.includes("vitamin") || text.includes("thu y") || text.includes("y te") || text.includes("bo sung");
};

const getProductTypeId = (product) => String(product?.type?._id || product?.type || "");

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
  return (hash % 11) / 10; // 0.0 -> 1.0 step 0.1
};
const getProductRating = (product = {}) => {
  const value = Number(product?.rating);
  if (Number.isFinite(value) && value > 0) return Math.min(5, Math.max(0, value));
  const base = 4 + seededScore(product?._id || product?.name || "");
  return Number(base.toFixed(1));
};

const firstImage = (image = "") =>
  String(image)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";

const readLocalArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const pageTokens = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user?.access_token);
  const location = useLocation();
  const { speciesSlug, typeSlug, subSlug } = useParams();
  const [searchParams] = useSearchParams();

  const isSearchPage = location.pathname === "/search";
  const routeKeyword = (searchParams.get("keyword") || "").trim();
  const typeFromQuery = searchParams.get("type") || "";
  const speciesFromQuery = searchParams.get("species") || "";
  const groupFromQuery = searchParams.get("group") || "";

  const catalogNode = useMemo(() => {
    if (!speciesSlug || !typeSlug || !subSlug) return null;
    return findCatalogNodeBySlugs(speciesSlug, typeSlug, subSlug);
  }, [speciesSlug, typeSlug, subSlug]);

  const [currentPage, setCurrentPage] = useState(1);
  const [speciesFilter, setSpeciesFilter] = useState(
    speciesFromQuery === "dog" || speciesFromQuery === "cat" ? speciesFromQuery : "all"
  );
  const [selectedTypeId, setSelectedTypeId] = useState(typeFromQuery || "all");
  const [priceRange, setPriceRange] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [wideKeyword, setWideKeyword] = useState(routeKeyword);
  const [sortBy, setSortBy] = useState("newest");
  const [wishlistIds, setWishlistIds] = useState([]);

  const productsQuery = useQuery({
    queryKey: ["products-page", isSearchPage ? routeKeyword : ""],
    queryFn: () => ProductServices.getAllProduct({ limit: 300, keyword: isSearchPage ? routeKeyword : "" }),
    retry: 1,
  });

  const typesQuery = useQuery({
    queryKey: ["types"],
    queryFn: TypeServices.getAllType,
  });
  const wishlistQuery = useQuery({
    queryKey: ["products-wishlist", user?.access_token],
    queryFn: () => WishlistServices.getMyWishlist(user.access_token),
    enabled: isLoggedIn,
  });

  const products = useMemo(() => productsQuery?.data?.data || [], [productsQuery?.data?.data]);
  const types = useMemo(() => typesQuery?.data?.data || [], [typesQuery?.data?.data]);

  const typeById = useMemo(() => {
    const map = new Map();
    types.forEach((type) => map.set(String(type._id), type));
    return map;
  }, [types]);

  const typeCounts = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const typeId = getProductTypeId(product);
      if (!typeId) return;
      map.set(typeId, (map.get(typeId) || 0) + 1);
    });
    return map;
  }, [products]);

  const typeIdToSpecies = useMemo(() => {
    const map = new Map();
    types.forEach((type) => {
      const typeId = String(type._id);
      const speciesFromField = normalizeSpecies(type?.species || "");
      const species = speciesFromField !== "other"
        ? speciesFromField
        : detectSpeciesFromTypeName(type?.name || "", "");
      if (species !== "other") map.set(typeId, species);
    });
    return map;
  }, [types]);

  const selectedTypeScopeIds = useMemo(() => {
    if (!selectedTypeId || selectedTypeId === "all") return null;
    const rootId = String(selectedTypeId);
    if (!typeById.has(rootId)) return null;

    const scope = new Set([rootId]);
    const queue = [rootId];
    while (queue.length > 0) {
      const current = queue.shift();
      types.forEach((type) => {
        const typeId = String(type._id);
        const parentId = type.parentId ? String(type.parentId) : "";
        if (parentId === current && !scope.has(typeId)) {
          scope.add(typeId);
          queue.push(typeId);
        }
      });
    }
    return scope;
  }, [selectedTypeId, typeById, types]);

  const typeOptions = useMemo(() => {
    const fromTypes = types
      .filter((type) => {
        const id = String(type._id);
        if (!typeCounts.has(id)) return false;
        if (type.level !== 3) return false;
        if (speciesFilter === "all") return true;
        return (typeIdToSpecies.get(id) || detectSpeciesFromTypeName(type?.name || "")) === speciesFilter;
      })
      .sort((a, b) => {
        const orderA = Number(a?.sortOrder || 0);
        const orderB = Number(b?.sortOrder || 0);
        if (orderA !== orderB) return orderA - orderB;
        return String(a?.name || "").localeCompare(String(b?.name || ""), "vi");
      });

    if (fromTypes.length > 0 || !typesQuery.isError) return fromTypes;

    const fallbackMap = new Map();
    products.forEach((product) => {
      const typeId = getProductTypeId(product);
      const typeName = String(product?.type?.name || product?.category || "").trim();
      if (!typeId || !typeName) return;
      const species = detectSpeciesFromTypeName(typeName, product?.name || "");
      if (speciesFilter !== "all" && species !== speciesFilter) return;
      if (!fallbackMap.has(typeId)) {
        fallbackMap.set(typeId, { _id: typeId, name: typeName, sortOrder: 0, level: 3 });
      }
    });

    return Array.from(fallbackMap.values()).sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""), "vi")
    );
  }, [types, typeCounts, speciesFilter, typeIdToSpecies, typesQuery.isError, products]);

  useEffect(() => {
    setSelectedTypeId(typeFromQuery || "all");
  }, [typeFromQuery]);

  useEffect(() => {
    if (speciesFromQuery === "dog" || speciesFromQuery === "cat") {
      setSpeciesFilter(speciesFromQuery);
      return;
    }
    setSpeciesFilter("all");
  }, [speciesFromQuery]);

  useEffect(() => {
    setWideKeyword(routeKeyword);
  }, [routeKeyword]);

  useEffect(() => {
    const syncWishlist = () => {
      const items = readLocalArray("wishlistItems");
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
    if (!wishlistQuery.isSuccess) return;
    if (wishlistQuery?.data?.status && wishlistQuery.data.status !== "OK") return;
    const serverItems = wishlistQuery.data?.data?.productIds || [];
    const mappedIds = serverItems
      .map((item) => (typeof item === "string" ? item : String(item?._id || "")))
      .filter(Boolean);
    setWishlistIds(mappedIds);
    const currentLocal = readLocalArray("wishlistItems");
    const localMappedFromObjects = serverItems
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        idsp: item._id,
        name: item.name,
        image: firstImage(item.image),
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
  }, [isLoggedIn, wishlistQuery.isSuccess, wishlistQuery.data]);

  useEffect(() => {
    if (!catalogNode) return;
    const targetTypeName = normalizeText(catalogNode.item.typeName);
    const matchedType = types.find((type) => {
      const normalized = normalizeText(type?.name || "");
      return normalized.includes(targetTypeName) || targetTypeName.includes(normalized);
    });
    if (matchedType?._id) setSelectedTypeId(String(matchedType._id));
  }, [catalogNode, types]);

  useEffect(() => {
    if (selectedTypeId === "all") return;
    if (!typeById.has(String(selectedTypeId))) setSelectedTypeId("all");
  }, [selectedTypeId, typeById]);

  const filteredProducts = useMemo(() => {
    let working = [...products];

    if (selectedTypeId !== "all") {
      if (selectedTypeScopeIds?.size) {
        working = working.filter((item) => selectedTypeScopeIds.has(getProductTypeId(item)));
      } else {
        working = working.filter((item) => getProductTypeId(item) === String(selectedTypeId));
      }
    }

    if (catalogNode?.subItem?.keyword) {
      const keyword = normalizeText(catalogNode.subItem.keyword);
      working = working.filter((item) => normalizeText(item?.name || "").includes(keyword));
    }

    if (speciesFilter !== "all") {
      working = working.filter((item) => {
        const typeId = getProductTypeId(item);
        const fromTypeMap = typeIdToSpecies.get(typeId);
        if (fromTypeMap && fromTypeMap !== "other") return fromTypeMap === speciesFilter;

        const directSpecies = normalizeSpecies(item?.species || item?.type?.species || "");
        if (directSpecies !== "other") return directSpecies === speciesFilter;

        return detectSpeciesFromTypeName(
          item?.type?.name || "",
          `${item?.name || ""} ${item?.description || ""}`
        ) === speciesFilter;
      });
    }

    if (groupFromQuery === "care") {
      working = working.filter((item) => isCareGroupProduct(item));
    } else if (groupFromQuery === "health") {
      working = working.filter((item) => isHealthGroupProduct(item));
    }

    if (priceRange !== "all") {
      working = working.filter((item) => {
        const price = getFinalPrice(item);
        if (priceRange === "under-100") return price < 100000;
        if (priceRange === "100-200") return price >= 100000 && price <= 200000;
        return price > 200000;
      });
    }

    if (onlyInStock) {
      working = working.filter((item) => Number(item?.countInStock || 0) > 0);
    }

    if (onlySale) {
      working = working.filter((item) => Number(item?.discount || 0) > 0);
    }

    const normalizedKeyword = normalizeText(wideKeyword);
    if (normalizedKeyword) {
      working = working.filter((item) => {
        const text = normalizeText(`${item?.name || ""} ${item?.type?.name || ""}`);
        return text.includes(normalizedKeyword);
      });
    }

    if (sortBy === "price-asc") {
      working.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    } else if (sortBy === "price-desc") {
      working.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    } else if (sortBy === "discount") {
      working.sort((a, b) => Number(b?.discount || 0) - Number(a?.discount || 0));
    } else {
      working.sort((a, b) => {
        const aDate = new Date(a?.createdAt || 0).getTime();
        const bDate = new Date(b?.createdAt || 0).getTime();
        return bDate - aDate;
      });
    }

    return working;
  }, [
    products,
    selectedTypeId,
    selectedTypeScopeIds,
    catalogNode,
    speciesFilter,
    priceRange,
    onlyInStock,
    onlySale,
    typeIdToSpecies,
    wideKeyword,
    sortBy,
    groupFromQuery,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (speciesFilter !== "all") count += 1;
    if (selectedTypeId !== "all") count += 1;
    if (priceRange !== "all") count += 1;
    if (onlyInStock) count += 1;
    if (onlySale) count += 1;
    if (wideKeyword.trim()) count += 1;
    return count;
  }, [speciesFilter, selectedTypeId, priceRange, onlyInStock, onlySale, wideKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTypeId, speciesFilter, priceRange, onlyInStock, onlySale, wideKeyword, routeKeyword, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleChangeType = (event) => {
    const nextId = event.target.value;
    setSelectedTypeId(nextId);

    const params = new URLSearchParams(searchParams);
    params.delete("group");
    if (nextId === "all") params.delete("type");
    else params.set("type", nextId);

    const search = params.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ""}`);
  };

  const handleSpeciesFilterChange = (nextSpecies) => {
    setSpeciesFilter(nextSpecies);
    const params = new URLSearchParams(searchParams);
    params.delete("group");
    if (nextSpecies === "all") params.delete("species");
    else params.set("species", nextSpecies);
    const search = params.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ""}`);
  };

  const handleToggleWishlist = async (event, product) => {
    event.stopPropagation();
    if (!product?._id) {
      message.error("Không thể thao tác với sản phẩm này");
      return;
    }
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

  const handleAddCart = async (event, product) => {
    event.stopPropagation();
    if (!product?._id) {
      message.error("Không thể thêm sản phẩm này vào giỏ");
      return;
    }
    const stock = Number(product?.countInStock || 0);
    if (stock <= 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }
    const items = readLocalArray("cartItems");
    const existed = items.find((item) => item.idsp === product._id);
    const currentQuantity = Number(existed?.quantity || 0);
    if (currentQuantity >= stock) {
      message.warning("Số lượng trong giỏ đã đạt tồn kho tối đa");
      return;
    }
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

  const resetFilters = () => {
    setSpeciesFilter("all");
    setPriceRange("all");
    setOnlyInStock(false);
    setOnlySale(false);
    setWideKeyword(routeKeyword);
    setSelectedTypeId("all");
    setSortBy("newest");

    const params = new URLSearchParams(searchParams);
    params.delete("type");
    params.delete("species");
    params.delete("group");
    const search = params.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ""}`);
  };

  return (
    <div className="products-view">
      <main className={`container page ${isSearchPage ? "search-only" : ""}`}>
        {!isSearchPage ? (
        <aside className="sidebar">
          <div className="side-head">
            <h2>Bộ lọc</h2>
            <span className="filter-count">{activeFilterCount}</span>
          </div>
          <div className="filter">
            <div className="filter-title">
              <PetshopIcon name="heart" size={14} />
              Loại
            </div>

            <button type="button" className="radio-line" onClick={() => handleSpeciesFilterChange("all")}>
              <span className={`radio ${speciesFilter === "all" ? "active" : ""}`} />
              Tất cả
            </button>
            <button type="button" className="radio-line" onClick={() => handleSpeciesFilterChange("dog")}>
              <span className={`radio ${speciesFilter === "dog" ? "active" : ""}`} />
              Chó
            </button>
            <button type="button" className="radio-line" onClick={() => handleSpeciesFilterChange("cat")}>
              <span className={`radio ${speciesFilter === "cat" ? "active" : ""}`} />
              Mèo
            </button>
          </div>

          <div className="filter">
            <div className="filter-title">
              <PetshopIcon name="tag" size={14} />
              Danh mục
            </div>
            <select className="select" value={selectedTypeId} onChange={handleChangeType}>
              <option value="all">Tất cả danh mục</option>
              {typeOptions.map((type) => {
                const id = String(type._id);
                return (
                  <option key={id} value={id}>
                    {type.name} ({typeCounts.get(id) || 0})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter">
            <div className="filter-title">
              <PetshopIcon name="cart" size={14} />
              Khoảng giá
            </div>
            <select className="select" value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
              <option value="all">Tất cả</option>
              <option value="under-100">Dưới 100.000đ</option>
              <option value="100-200">100.000đ - 200.000đ</option>
              <option value="over-200">Trên 200.000đ</option>
            </select>
          </div>

          <div className="filter">
            <div className="filter-title">
              <PetshopIcon name="filter" size={14} />
              Tùy chọn nhanh
            </div>
            <button type="button" className={`quick-btn ${onlyInStock ? "active" : ""}`} onClick={() => setOnlyInStock((prev) => !prev)}>
              Còn hàng
            </button>
            <button type="button" className={`quick-btn ${onlySale ? "active" : ""}`} onClick={() => setOnlySale((prev) => !prev)}>
              Đang giảm giá
            </button>
            <button type="button" className="quick-btn" onClick={() => setSortBy("discount")}>
              Bán chạy
            </button>
          </div>

          <div className="filter">
            <div className="filter-title">
              <PetshopIcon name="truck" size={14} />
              Tình trạng
            </div>
            <label className="check-line">
              <span className="check active" />
              Giao hàng tiêu chuẩn
            </label>
            <label className="check-line">
              <span className="check" />
              Trong ngày
            </label>
          </div>

          <button type="button" className="clear-btn" onClick={resetFilters}>Xóa bộ lọc</button>
        </aside>
        ) : null}

        <section className="content">
          {!isSearchPage ? (
          <div className="product-head">
            <div className="product-head-left">
              <div className="products-breadcrumb-wrap">
                <Breadcrumb items={[{ label: "petshop", to: "/" }, { label: "Sản phẩm" }]} />
              </div>
              <p>Hiển thị {filteredProducts.length} sản phẩm cho chó, mèo và phụ kiện chăm sóc.</p>
            </div>

            <select className="sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="discount">Bán chạy nhất</option>
            </select>
          </div>
          ) : null}

          {productsQuery.isLoading || typesQuery.isLoading ? <LoadingState text="Đang tải sản phẩm..." /> : null}

          {!productsQuery.isLoading && productsQuery.isError ? <ErrorState message="Không thể tải danh sách sản phẩm." onRetry={() => productsQuery.refetch()} /> : null}

          {!productsQuery.isLoading && !productsQuery.isError ? (
            <>
              {currentProducts.length > 0 ? (
                <div className="grid">
                  {currentProducts.map((product, index) => {
                    const discount = Number(product?.discount || 0);
                    const finalPrice = getFinalPrice(product);
                    const basePrice = Number(product?.price || 0);
                    const inStock = Number(product?.countInStock || 0) > 0;
                    const isFavorite = wishlistIds.includes(product?._id);
                    const rating = getProductRating(product);
                    const filledStars = Math.round(rating);

                    return (
                      <article className="product" key={product._id || `product-${index}`}>
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
                            <span className="stock-inline">{inStock ? "Còn hàng" : "Hết hàng"}</span>
                          </div>
                          <div className="card-actions">
                            <button className="add-cart" type="button" disabled={!inStock} onClick={(event) => handleAddCart(event, product)}>
                              <PetshopIcon name="cart" size={16} />
                              {inStock ? "Thêm vào giỏ" : "Hết hàng"}
                            </button>
                            <button className="quick" type="button" aria-label="Xem chi tiết" onClick={(event) => { event.stopPropagation(); if (!product?._id) return; navigate(`/product-detail/${product._id}`); }}>
                              <PetshopIcon name="eye" size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState description="Không tìm thấy sản phẩm phù hợp." />
              )}

              {filteredProducts.length > PRODUCTS_PER_PAGE ? (
                <div className="pagination">
                  <button
                    type="button"
                    className="page-arrow"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>

                  {pageTokens(currentPage, totalPages).map((token, index) => {
                    if (token === "...") return <span key={`dots-${index}`}>...</span>;
                    return (
                      <button
                        type="button"
                        key={token}
                        className={`page-btn ${currentPage === token ? "active" : ""}`}
                        onClick={() => setCurrentPage(token)}
                      >
                        {token}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="page-arrow"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default ProductsPage;
