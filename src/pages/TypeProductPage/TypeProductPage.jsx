import React from "react";
import { Button, Empty, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as TypeServices from "../../services/TypeServices";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import Loading from "../../components/LoadingComponent/Loading";

const TypeProductPage = () => {
    const navigate = useNavigate();
    const typesQuery = useQuery({
        queryKey: ["types"],
        queryFn: TypeServices.getAllType,
    });

    return (
        <div style={{ width: "100%", background: "transparent" }}>
            <div style={{ width: "min(1240px, calc(100% - 40px))", margin: "0 auto", minHeight: 620, padding: "30px 0 40px" }}>
                <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 52 }}>Danh mục MaisonPet</h2>
                <p style={{ margin: "8px 0 0", color: "#555", fontSize: 16 }}>Khám phá các bộ sưu tập theo nhu cầu thú cưng.</p>
                <Loading isPending={typesQuery.isLoading}>
                    {typesQuery.data?.data?.length ? (
                        <Space wrap style={{ marginTop: 26 }}>
                            {typesQuery.data.data.map((type) => (
                                <Button key={type._id} size="large" onClick={() => navigate(`/products?type=${type._id}`)} style={{ borderRadius: 999, height: 42, borderColor: "rgba(198,169,105,.3)", color: "#1A1A1A", fontWeight: 600, background: "rgba(255,255,255,.85)" }}>
                                    {type.name}
                                </Button>
                            ))}
                        </Space>
                    ) : (
                        <Empty description="Chưa có danh mục" />
                    )}
                </Loading>
            </div>
            <FooterComponent />
        </div>
    );
};

export default TypeProductPage;
