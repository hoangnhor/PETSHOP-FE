import { Col, Image } from "antd";
import styled from "styled-components";

export const WrapperStyleImageSmall = styled(Image)`
    height:64px;
    width:64px
`
export const WrapperStyleColImage = styled(Col)`
    flex-basics: unset;
    display:flex;
 `
export const WrapperStyleNameProduct = styled.h1`
    color: #1A1A1A;
  font-size: 46px; 
  font-weight: 700;
  margin: 0 0 12px; 
  line-height:1.25;
 `
export const WrapperPriceProduct = styled.div`
    background: linear-gradient(125deg, rgba(255,255,255,.9), rgba(231,215,190,.55));
    border:1px solid rgba(198,169,105,.35);
    border-radius:14px;
    padding:14px 16px;
    display:flex;
    align-items:center;
    flex-wrap:wrap;
`
export const WeightWrapper = styled.div`
     display: flex;
  align-items: center;
  gap: 15px; 
  margin: 20px 0;
  font-size: 18px; 
`
export const WrapperPriceTextProduct = styled.div`
    color: #A67C52;
  font-size: 38px;
  font-weight: 700;
  margin: 0;
 `
export const PromotionList = styled.div`
      margin-top: 24px;
        padding:18px;
        border:1px solid rgba(198,169,105,.3);
        border-radius:14px;
        background:rgba(255,255,255,.78);
  `
export const WrapperFeatureItem = styled.div`
    margin: 10px 0;
  font-size: 15px;
  color: #555555;
  font-weight:600;
  &:before {
    content: "• ";
    color: #C6A969;
    font-weight: bold;
  }
`
export const QuantityWrapper = styled.div`
     display: flex;
  align-items: center;
  gap: 10px; 
  margin: 20px 0;
  font-size: 18px;
`
export const WrapperQualityProduct = styled.div`
  display: flex;
  align-items: center;
  gap:14px;
  margin: 12px 0;
  font-size: 15px;
  color: #555555;
  font-weight:600;
`
