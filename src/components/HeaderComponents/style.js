import { Row } from "antd";
import styled from "styled-components"

export const WrapperHeader = styled(Row)`
    align-items: center;
    gap:10px;
    width:100%;
    max-width:1320px;
    padding:16px 20px 16px;
    margin:0 auto;
    flex-direction:column;

    @media (max-width: 768px) {
        padding:12px;
    }
`
export const WrapperTextHeader = styled.span`
    font-family:"Cormorant Garamond", serif;
    font-size:54px;
    color:#111111;
    font-weight:800;
    text-align:left;
    cursor:pointer;
    letter-spacing:0.04em;
    white-space:nowrap;
    text-shadow:0 2px 8px rgba(26,26,26,.12);

    strong {
        color:#C6A969;
    }

    @media (max-width: 768px) {
        font-size:40px;
    }
`
export const WrapperHeaderAccout = styled.div`
    display:flex;
    align-items:center;
    color:#111827;
    gap: 10px;
`
export const WrapperTextHeaderSmail = styled.span`
    font-size:13px;
    color:#555555;
    white-space:nowrap;
    font-weight:600;
`

export const WrapperAccountMeta = styled.div`
    @media (max-width: 640px) {
        display:none;
    }
`

export const WrapperActionLabel = styled.span`
    font-size:13px;
    color:#555555;
    white-space:nowrap;
    font-weight:600;

    @media (max-width: 640px) {
        display:none;
    }
`

export const MobileMenuButton = styled.button`
    display:none;
    height:40px;
    min-width:40px;
    border:1px solid rgba(198, 169, 105, 0.28);
    border-radius:12px;
    background:rgba(255,255,255,0.85);
    cursor:pointer;
    color:#1A1A1A;
    font-weight:700;

    align-items:center;
    justify-content:center;

    @media (max-width: 640px) {
        display:inline-flex;
    }
`
export const WrapperContentPopup = styled.p`
    font-size:14px;
    cursor:pointer;
    margin:0;
    padding:10px 14px;
    border-radius:10px;
    &:hover{
        color:#1A1A1A;
        background:#F8F5F0;
    }
`

export const HeaderShell = styled.header`
    width:100%;
    position:sticky;
    top:0;
    z-index:100;
    background:rgba(255,255,255,0.72);
    border-bottom:1px solid rgba(198, 169, 105, 0.18);
    box-shadow:0 6px 18px rgba(26, 26, 26, 0.06);
    backdrop-filter:blur(16px);
`

export const HeaderTop = styled.div`
    width:100%;
    display:grid;
    grid-template-columns:auto minmax(300px, 520px) auto;
    grid-template-areas:
        "brand search actions";
    align-items:center;
    justify-content:center;
    gap:12px;

    & > div:nth-child(1) {
        grid-area: brand;
    }

    & > div:nth-child(2) {
        grid-area: search;
        width:100%;
    }

    & > div:nth-child(3) {
        grid-area: actions;
    }

    @media (max-width: 900px) {
        grid-template-columns:minmax(0, 1fr) auto;
        grid-template-areas:
            "brand actions"
            "search search";
        gap:12px;
    }

    @media (max-width: 640px) {
        grid-template-columns:minmax(0, 1fr) auto;
        grid-template-areas:
            "brand actions"
            "search search";
        gap:8px;
    }
`

export const HeaderActions = styled.div`
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:12px;
    flex-wrap:nowrap;
    order: 3;

    @media (max-width: 900px) {
        justify-content:flex-end;
    }

    @media (max-width: 640px) {
        gap:12px;
        justify-content:flex-end;
        overflow-x:auto;
        scrollbar-width:none;
        padding-bottom:0;
    }

    @media (max-width: 640px) {
        &::-webkit-scrollbar {
            display:none;
        }
    }
`

export const HeaderActionButton = styled.div`
    min-height:42px;
    display:flex;
    align-items:center;
    gap:10px;
    padding:7px 10px;
    border:1px solid rgba(198, 169, 105, 0.24);
    border-radius:12px;
    background:rgba(255,255,255,0.78);
    cursor:pointer;
    transition:all .28s ease;

    &:hover {
        border-color:#C6A969;
        background:#FFFFFF;
        transform:translateY(-1px);
        box-shadow:0 10px 24px rgba(166, 124, 82, 0.14);
    }

    @media (max-width: 640px) {
        min-height:38px;
        padding:6px 10px;
    }
`

export const NavigationBar = styled.nav`
    width:min(760px, 100%);
    display:flex;
    align-items:center;
    justify-content:flex-start;
    gap:12px;
    overflow-x:auto;
    padding:2px 0 0;
    scrollbar-width:none;

    &::-webkit-scrollbar {
        display:none;
    }

    a, .products-trigger {
        padding:8px 14px;
        border-radius:999px;
        color:#555555;
        font-size:14px;
        font-weight:600;
        text-decoration:none;
        border:1px solid rgba(198, 169, 105, 0.24);
        background:rgba(255,255,255,0.78);
        font-family:inherit;
        cursor:pointer;
        white-space:nowrap;
        transition:all .25s ease;
    }

    a:hover, .products-trigger:hover {
        color:#1A1A1A;
        border-color:#C6A969;
        background:#FFFFFF;
        box-shadow:0 10px 24px rgba(166, 124, 82, 0.14);
    }

    a, a:visited, .products-trigger {
        line-height:1.15;
    }

    @media (max-width: 640px) {
        display:${(props) => (props.$isOpen ? "flex" : "none")};
        padding-top:8px;
        border-top:1px solid rgba(198,169,105,.2);
        a, .products-trigger {
            padding:8px 12px;
            font-size:13px;
        }
    }
`

export const ProductsMegaMenu = styled.div`
    width: min(1040px, 95vw);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;

    @media (max-width: 768px) {
        grid-template-columns:1fr;
        width:min(520px, 92vw);
        max-height:70vh;
        overflow:auto;
    }
`

export const MegaSection = styled.div`
    border: 1px solid rgba(198, 169, 105, 0.22);
    border-radius: 14px;
    padding: 10px;
    background: rgba(255,255,255,.9);
`

export const MegaTypeGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 10px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`

export const MegaSectionTitle = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: #1A1A1A;
    margin-bottom: 8px;
`

export const MegaGroupTitle = styled.div`
    font-size: 12px;
    color: #444;
    font-weight: 600;
    margin-top: 10px;
`

export const MegaChipRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
`

export const MegaChip = styled.button`
    border: 1px solid rgba(198, 169, 105, 0.34);
    background: rgba(255,255,255,.95);
    border-radius: 999px;
    font-size: 11px;
    padding: 4px 9px;
    cursor: pointer;
    color: #2a2a2a;

    &:hover {
        border-color: #C6A969;
        background: #fff;
    }
`

export const MobileNavOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(26,26,26,.35);
    z-index: 1200;
    display: none;

    @media (max-width: 640px) {
        display: ${(props) => (props.$isOpen ? "block" : "none")};
    }
`

export const MobileNavPanel = styled.aside`
    position: fixed;
    top: 0;
    left: 0;
    width: min(360px, 90vw);
    height: 100vh;
    background: rgba(255,255,255,.98);
    z-index: 1201;
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-105%")});
    transition: transform .24s ease;
    border-right: 1px solid rgba(198,169,105,.26);
    box-shadow: 14px 0 36px rgba(26,26,26,.14);
    overflow-y: auto;

    @media (min-width: 641px) {
        display:none;
    }
`

export const MobileNavHeader = styled.div`
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:16px 16px;
    border-bottom:1px solid rgba(198,169,105,.2);
    font-size:24px;
    font-weight:700;
    color:#1A1A1A;
    font-family:"Cormorant Garamond", serif;
`

export const MobileNavClose = styled.button`
    border:0;
    background:transparent;
    color:#6b7280;
    font-size:24px;
    line-height:1;
    cursor:pointer;
`

export const MobileNavList = styled.div`
    padding:8px 0 20px;
`

export const MobileNavItem = styled.button`
    width:100%;
    border:0;
    background:transparent;
    text-align:left;
    padding:13px 16px;
    font-size:15px;
    font-weight:600;
    color:#1a1a1a;
    border-bottom:1px solid rgba(198,169,105,.14);
    display:flex;
    align-items:center;
    justify-content:space-between;
    cursor:pointer;

    &:hover {
        background:rgba(248,245,240,.9);
        color:#1A1A1A;
    }
`

