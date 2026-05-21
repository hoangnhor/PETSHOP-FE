import { Col } from "antd";
import styled from "styled-components";

export const WrapperProducts = styled.div`
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:10px;
    margin-top:0;

    @media (max-width: 1200px) {
        grid-template-columns:repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 1050px) {
        grid-template-columns:repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 620px) {
        grid-template-columns:repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 420px) {
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
    background:transparent;
`

export const ProductsContainer = styled.div`
    width:min(1320px, calc(100% - 40px));
    margin:0 auto;
    min-height:720px;
    padding:30px 0 40px;
`

export const ProductsLayout = styled.div`
    display:grid;
    grid-template-columns:200px minmax(0, 1fr);
    gap:16px;
    position:relative;

    @media (max-width: 980px) {
        grid-template-columns:1fr;
        gap:12px;
    }
`

export const ProductsToolbar = styled.div`
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    padding:0;
    background:transparent;
    border:none;
    border-radius:0;
    box-shadow:none;

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

        h2 {
            font-size:32px;
        }
    }
`

export const BreadcrumbWrap = styled.div`
    margin-bottom:12px;
`

export const FilterPanel = styled.div`
    background:#fff;
    border:1px solid rgba(0,0,0,.08);
    border-radius:12px;
    box-shadow:none;
    padding:16px;
    height:fit-content;
    position:static;
    width:100%;

    h4 {
        margin:0 0 10px;
        color:#1A1A1A;
        font-size:18px;
    }
`

export const FilterGroup = styled.div`
    margin-bottom:14px;

    p {
        margin:0 0 8px;
        color:#555;
        font-size:13px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:.04em;
    }
`

export const FilterChips = styled.div`
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin-top:8px;
`
