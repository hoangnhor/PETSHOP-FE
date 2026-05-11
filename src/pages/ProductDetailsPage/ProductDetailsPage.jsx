import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProductDetailsComponenet from "../../components/ProductDetailsComponent/ProductDetailsComponenet";
import * as ProductServices from "../../services/ProductServices";
import Loading from "../../components/LoadingComponent/Loading";

const ProductDetailsPage = () => {
    const { id } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ["product-detail", id],
        queryFn: () => ProductServices.getDetailsProduct(id),
        enabled: Boolean(id),
    });

    return (
        <div style={{ background: "transparent", minHeight: "800px", padding: "24px 0 40px" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto" }}>
            <h5 style={{ margin: "0 0 16px", color: "#888", fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase" }}>Home / Product Detail</h5>
            <Loading isPending={isLoading}>
                <ProductDetailsComponenet product={data?.data} />
            </Loading>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
