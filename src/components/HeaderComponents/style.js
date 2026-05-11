import { Row } from "antd";
import styled from "styled-components"

export const WrapperHeader = styled(Row)`
    align-items: center;
    gap:16px;
    width:100%;
    max-width:1240px;
    padding:12px 20px 12px;
    margin:0 auto;
    flex-direction:column;

    @media (max-width: 768px) {
        padding:12px;
    }
`
export const WrapperTextHeader = styled.span`
    font-family:"Cormorant Garamond", serif;
    font-size:40px;
    color:#1A1A1A;
    font-weight:700;
    text-align:left;
    cursor:pointer;
    letter-spacing:0.04em;
    white-space:nowrap;

    strong {
        color:#C6A969;
    }

    @media (max-width: 768px) {
        font-size:32px;
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
    box-shadow:0 12px 34px rgba(26, 26, 26, 0.08);
    backdrop-filter:blur(16px);
`

export const HeaderTop = styled.div`
    width:100%;
    display:grid;
    grid-template-columns:280px minmax(260px, 1fr) auto;
    align-items:center;
    gap:18px;

    @media (max-width: 900px) {
        grid-template-columns:1fr auto;
    }

    @media (max-width: 640px) {
        grid-template-columns:1fr;
        gap:12px;
    }
`

export const HeaderActions = styled.div`
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:12px;

    @media (max-width: 640px) {
        justify-content:space-between;
    }
`

export const HeaderActionButton = styled.div`
    min-height:44px;
    display:flex;
    align-items:center;
    gap:10px;
    padding:8px 12px;
    border:1px solid rgba(198, 169, 105, 0.24);
    border-radius:14px;
    background:rgba(255,255,255,0.78);
    cursor:pointer;
    transition:all .28s ease;

    &:hover {
        border-color:#C6A969;
        background:#FFFFFF;
        transform:translateY(-1px);
        box-shadow:0 10px 24px rgba(166, 124, 82, 0.14);
    }
`

export const NavigationBar = styled.nav`
    width:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    overflow-x:auto;
    padding-top:2px;

    a {
        padding:9px 16px;
        border-radius:999px;
        color:#555555;
        font-size:14px;
        font-weight:600;
        text-decoration:none;
        white-space:nowrap;
        transition:all .25s ease;
        border:1px solid transparent;
    }

    a:hover {
        color:#1A1A1A;
        border-color:rgba(198, 169, 105, 0.34);
        background:rgba(255,255,255,0.68);
    }
`

