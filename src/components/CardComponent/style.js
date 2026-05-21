import { Card } from "antd";
import styled from "styled-components";

export const WrapperCardStyle=styled(Card)`
    width:100%;
    min-height:436px;
    border-radius: 16px;
    overflow: hidden;
    border:1px solid rgba(198, 169, 105, 0.2);
    box-shadow:0 10px 25px rgba(0, 0, 0, 0.05);
    transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease;
    background:rgba(255,255,255,0.86);

    &:hover {
        transform:translateY(-5px);
        border-color:#C6A969;
        box-shadow:0 18px 38px rgba(0, 0, 0, 0.1);
    }

    .quick-add-btn {
        position:absolute;
        left:50%;
        top:50%;
        transform:translate(-50%, -44%);
        border:1px solid rgba(198,169,105,.35);
        border-radius:999px;
        background:rgba(26,26,26,.92);
        color:#fff;
        font-weight:700;
        font-size:12px;
        height:34px;
        padding:0 14px;
        z-index:2;
        cursor:pointer;
        white-space:nowrap;
        opacity:0;
        pointer-events:none;
        transition:all .22s ease;
    }

    &:hover .quick-add-btn {
        opacity:1;
        pointer-events:auto;
        transform:translate(-50%, -50%);
    }

    & img{
        width:100%;
        height:250px;
        object-fit:cover;
    }

    @media (max-width: 768px) {
        min-height:378px;
    }

`
export const StyledNameProduct =styled.div`
    margin: 0;
    min-height: 0;
    overflow: hidden;
    font-size: 21px;
    color: #1A1A1A;
    line-height: 1.35;
    font-weight:700;
    font-family: "Playfair Display", serif;
`

export const WrapperPriceText=styled.div`
    font-size: 24px;
    color: #A67C52;
    font-weight: 700;
    margin:0;
`
export const WrapperDiscountText=styled.span`
    color:#777;
    font-size:12px;
    font-weight:600;
    
`
