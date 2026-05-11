import { Card } from "antd";
import styled from "styled-components";

export const WrapperCardStyle=styled(Card)`
    width:100%;
    border-radius: 18px;
    overflow: hidden;
    border:1px solid rgba(198, 169, 105, 0.2);
    box-shadow:0 14px 34px rgba(26, 26, 26, 0.08);
    transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease;
    background:rgba(255,255,255,0.86);

    &:hover {
        transform:translateY(-6px);
        border-color:#C6A969;
        box-shadow:0 20px 45px rgba(26, 26, 26, 0.14);
    }

    & img{
        height:220px;
        width:100%;
    }

`
export const StyledNameProduct =styled.div`
   margin: 0;
    min-height: 50px;
    overflow: hidden;
    margin-bottom: 8px;
    font-size: 22px;
    color: #1A1A1A;
    line-height: 1.35;
    font-weight:700;
    font-family: "Cormorant Garamond", serif;
`

export const WrapperPriceText=styled.div`
    font-size: 24px;
    color: #A67C52;
    font-weight: 700;
    margin:6px 0 4px;
`
export const WrapperDiscountText=styled.span`
    color:#777;
    font-size:12px;
    font-weight:600;
    
`
