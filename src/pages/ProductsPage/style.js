import { Col } from "antd";
import styled from "styled-components";

export const WrapperProducts = styled.div`
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:24px;
    margin-top:24px;

    @media (max-width: 1050px) {
        grid-template-columns:repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 620px) {
        grid-template-columns:1fr;
    }
`
export const WrapperNavbar = styled(Col)`
    background:rgba(255,255,255,.8);
     padding:18px;
     border-radius:16px;
     height:fit-content;
     border:1px solid rgba(198,169,105,.22);
     box-shadow:0 12px 26px rgba(26, 26, 26, 0.08);
`

export const ProductsShell = styled.div`
    width:100%;
    background:#f6f7fb;
`

export const ProductsContainer = styled.div`
    width:min(1240px, calc(100% - 32px));
    margin:0 auto;
    min-height:720px;
    padding:24px 0 36px;
`

export const ProductsLayout = styled.div`
    display:grid;
    grid-template-columns:260px minmax(0, 1fr);
    gap:24px;

    @media (max-width: 880px) {
        grid-template-columns:1fr;
    }
`

export const ProductsToolbar = styled.div`
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    padding:20px;
    background:rgba(255,255,255,.82);
    border:1px solid rgba(198,169,105,.22);
    border-radius:16px;
    box-shadow:0 10px 24px rgba(26, 26, 26, 0.07);

    h2 {
        margin:0;
        font-size:38px;
        color:#1A1A1A;
        font-weight:700;
    }

    p {
        margin:6px 0 0;
        color:#555555;
        font-size:14px;
    }

    @media (max-width: 560px) {
        align-items:flex-start;
        flex-direction:column;
    }
`
