import React from "react";
import { Button, Empty, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as TypeServices from "../../services/TypeServices";
import Loading from "../../components/LoadingComponent/Loading";
import { TYPE_GROUPING } from "../../constants/typeGrouping";
import PageContainer from "../../components/PageContainer/PageContainer";
import { SurfaceCard } from "../../components/PageContainer/style";

const TypeProductPage = () => {
    const navigate = useNavigate();
    const typesQuery = useQuery({
        queryKey: ["types"],
        queryFn: TypeServices.getAllType,
    });
    const typeMapByName = new Map((typesQuery.data?.data || []).map((type) => [type.name, type]));

    return (
        <>
            <PageContainer title="Danh mục petshop" subtitle="Khám phá các bộ sưu tập theo nhu cầu thú cưng.">
                <Loading isPending={typesQuery.isLoading}>
                    {typesQuery.data?.data?.length ? (
                        <div style={{ display: "grid", gap: 18 }}>
                            {TYPE_GROUPING.map((group) => (
                                <SurfaceCard key={group.key}>
                                    <h3 style={{ margin: "0 0 12px", color: "#1A1A1A", fontSize: 30 }}>{group.title}</h3>
                                    <Space wrap>
                                        {group.items.map((item) => {
                                            const type = typeMapByName.get(item.typeName);
                                            if (!type) return null;
                                            return (
                                                <Button key={type._id} size="large" onClick={() => navigate(`/products?type=${type._id}`)} style={{ borderRadius: 999, height: 42, borderColor: "rgba(198,169,105,.3)", color: "#1A1A1A", fontWeight: 600, background: "rgba(255,255,255,.92)" }}>
                                                    {item.title}
                                                </Button>
                                            );
                                        })}
                                    </Space>
                                </SurfaceCard>
                            ))}
                        </div>
                    ) : (
                        <SurfaceCard>
                            <Empty description="Chưa có danh mục" />
                        </SurfaceCard>
                    )}
                </Loading>
            </PageContainer>
</>
    );
};

export default TypeProductPage;

