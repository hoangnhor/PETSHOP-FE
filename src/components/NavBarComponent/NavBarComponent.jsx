import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as TypeServices from "../../services/TypeServices";
import { WrapperContent, WrapperLableText, WrapperTextValue } from "./style";

const NavBarComponent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedType = searchParams.get("type") || "";

    const typesQuery = useQuery({
        queryKey: ["types"],
        queryFn: TypeServices.getAllType,
    });

    return (
        <div>
            <WrapperLableText>Danh Mục Sản Phẩm</WrapperLableText>
            <WrapperContent>
                <WrapperTextValue
                    onClick={() => navigate("/products")}
                    isSelected={!selectedType}
                >
                    Tất cả sản phẩm
                </WrapperTextValue>
                {typesQuery.data?.data?.map((type) => (
                    <WrapperTextValue
                        key={type._id}
                        onClick={() => navigate(`/products?type=${type._id}`)}
                        isSelected={selectedType === type._id}
                    >
                        {type.name}
                    </WrapperTextValue>
                ))}
            </WrapperContent>
        </div>
    );
};

export default NavBarComponent;
