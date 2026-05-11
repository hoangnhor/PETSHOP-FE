import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Empty, Pagination, Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import NavBarComponent from "../../components/NavBarComponent/NavBarComponent";
import CardComponent from "../../components/CardComponent/CardComponent";
import Loading from "../../components/LoadingComponent/Loading";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import * as ProductServices from "../../services/ProductServices";
import { ProductsContainer, ProductsLayout, ProductsShell, ProductsToolbar, WrapperNavbar, WrapperProducts } from "./style";

const ProductsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortMode, setSortMode] = useState("newest");
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    const type = searchParams.get("type") || "";
    const productsPerPage = 9;

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, type]);

    const productsQuery = useQuery({
        queryKey: ["products", keyword, type],
        queryFn: () => ProductServices.getAllProduct({ limit: 1000, keyword, type }),
        retry: 1,
    });

    const sortedProducts = useMemo(() => {
        const list = productsQuery.data?.data ? [...productsQuery.data.data] : [];
        if (sortMode === "price-asc") return list.sort((a, b) => a.price - b.price);
        if (sortMode === "price-desc") return list.sort((a, b) => b.price - a.price);
        return list;
    }, [productsQuery.data, sortMode]);

    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    return (
        <Fragment>
            <ProductsShell>
                <ProductsContainer>
                    <ProductsLayout>
                        <WrapperNavbar>
                            <NavBarComponent />
                        </WrapperNavbar>
                        <div>
                            <ProductsToolbar>
                                <div>
                                    <h2>{keyword ? `Search: ${keyword}` : "All Collections"}</h2>
                                    <p>{sortedProducts.length} sản phẩm trong bộ sưu tập</p>
                                </div>
                                <Select
                                    value={sortMode}
                                    style={{ width: 180 }}
                                    onChange={setSortMode}
                                    options={[
                                        { value: "newest", label: "Newest" },
                                        { value: "price-asc", label: "Price: Low to High" },
                                        { value: "price-desc", label: "Price: High to Low" },
                                    ]}
                                />
                            </ProductsToolbar>
                            <Loading isPending={productsQuery.isLoading}>
                                {currentProducts.length ? (
                                    <WrapperProducts>
                                        {currentProducts.map((product) => (
                                            <CardComponent
                                                key={product._id}
                                                id={product._id}
                                                countInStock={product.countInStock}
                                                image={product.image}
                                                name={product.name}
                                                price={product.price}
                                                discount={product.discount}
                                            />
                                        ))}
                                    </WrapperProducts>
                                ) : (
                                    <Empty description="Không tìm thấy sản phẩm" style={{ padding: 80 }} />
                                )}
                            </Loading>
                            <Pagination
                                current={currentPage}
                                total={sortedProducts.length}
                                pageSize={productsPerPage}
                                onChange={setCurrentPage}
                                hideOnSinglePage
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "10px",
                                    marginBottom: "20px",
                                }}
                            />
                        </div>
                    </ProductsLayout>
                </ProductsContainer>
                <FooterComponent />
            </ProductsShell>
        </Fragment>
    );
};

export default ProductsPage;
