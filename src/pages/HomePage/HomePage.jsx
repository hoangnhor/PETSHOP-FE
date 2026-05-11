import React from "react";
import { Button, Col, Empty, Row, Statistic } from "antd";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import heroImage from "../../assets/images/sp.webp";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as ProductServices from "../../services/ProductServices";
import * as TypeServices from "../../services/TypeServices";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import Loading from "../../components/LoadingComponent/Loading";
import { HeroBlock, HeroContent, HeroImage, HomeContainer, HomeShell, SectionHeader, WrapperProducts } from "./style";

const HomePage = () => {
    const navigate = useNavigate();
    const productsQuery = useQuery({
        queryKey: ["home-products"],
        queryFn: () => ProductServices.getAllProduct({ limit: 8 }),
    });

    const typesQuery = useQuery({
        queryKey: ["types"],
        queryFn: TypeServices.getAllType,
    });

    const flashDeadline = Date.now() + 1000 * 60 * 60 * 24;

    return (
        <HomeShell>
            <HomeContainer>
                <HeroBlock>
                    <HeroContent>
                        <span>Luxury Pet Lifestyle</span>
                        <h1>Luxury Care For Your Beloved Pets</h1>
                        <p>
                            Premium accessories and essentials designed with elegance and love.
                        </p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <Button type="primary" onClick={() => navigate("/products")} style={{ height: 48, borderRadius: 999, padding: "0 24px", background: "#1A1A1A", borderColor: "#1A1A1A", fontWeight: 600 }}>
                                Explore Collection
                            </Button>
                            <Button onClick={() => navigate("/order")} style={{ height: 48, borderRadius: 999, padding: "0 24px", fontWeight: 600, borderColor: "rgba(198,169,105,.5)", color: "#1A1A1A", background: "rgba(255,255,255,.86)" }}>
                                Shop Now
                            </Button>
                        </div>
                    </HeroContent>
                    <HeroImage>
                        <img src={heroImage} alt="petshop Hero" />
                    </HeroImage>
                </HeroBlock>

                <SectionHeader>
                    <div>
                        <h2>Danh mục nổi bật</h2>
                        <p>Curated collections theo nhu cầu chăm sóc cao cấp</p>
                    </div>
                </SectionHeader>

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {(typesQuery.data?.data || []).slice(0, 6).map((type) => (
                        <Col xs={24} md={8} key={type._id}>
                            <div onClick={() => navigate(`/products?type=${type._id}`)} style={{ cursor: "pointer", borderRadius: 22, border: "1px solid rgba(198,169,105,.26)", background: "rgba(255,255,255,.86)", padding: "18px 20px", boxShadow: "0 12px 24px rgba(26,26,26,.08)" }}>
                                <h3 style={{ margin: 0, fontSize: 30, color: "#1A1A1A" }}>{type.name}</h3>
                                <p style={{ margin: "4px 0 0", color: "#555" }}>Premium collection</p>
                            </div>
                        </Col>
                    ))}
                </Row>

                <div style={{ borderRadius: 24, background: "linear-gradient(145deg,#1A1A1A,#2a2a2a)", border: "1px solid rgba(198,169,105,.4)", boxShadow: "0 20px 40px rgba(26,26,26,.2)", padding: "26px 24px", marginBottom: 20 }}>
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col>
                            <h2 style={{ margin: 0, color: "#F8F5F0", fontSize: 42 }}>Flash Sale</h2>
                            <p style={{ margin: "6px 0 0", color: "#D9C7A2" }}>Ưu đãi giới hạn cho bộ sưu tập cao cấp</p>
                        </Col>
                        <Col>
                            <Statistic.Countdown value={flashDeadline} valueStyle={{ color: "#C6A969", fontSize: 30, fontWeight: 700 }} />
                        </Col>
                    </Row>
                </div>

                <SectionHeader>
                    <div>
                        <h2>Signature Products</h2>
                        <p>Những lựa chọn nổi bật từ petshop</p>
                    </div>
                    <Button onClick={() => navigate("/products")} style={{ borderRadius: 8, fontWeight: 800 }}>
                        Xem tất cả
                    </Button>
                </SectionHeader>
                <Loading isPending={productsQuery.isLoading}>
                    {productsQuery.data?.data?.length ? (
                        <WrapperProducts>
                            {productsQuery.data.data.map((product) => (
                                <CardComponent
                                    key={product._id}
                                    id={product._id}
                                    countInStock={product.countInStock}
                                    image={product.image}
                                    name={product.name}
                                    price={product.price}
                                    discount={product.discount}
                                    category={product.type?.name}
                                />
                            ))}
                        </WrapperProducts>
                    ) : (
                        <Empty description="Chưa có sản phẩm" style={{ padding: 80 }} />
                    )}
                </Loading>
            </HomeContainer>
            <FooterComponent />
        </HomeShell>
    );
};

export default HomePage;
