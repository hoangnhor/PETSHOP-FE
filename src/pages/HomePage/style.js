import styled from "styled-components";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

export const WrapperTyperProduct = styled.div``;
export const WrapperButtonMore = styled(ButtonComponent)``;
export const WrapperProducts = styled.div`
    display:grid;
    grid-template-columns:repeat(4, minmax(0, 1fr));
    gap:24px;
    margin-top:28px;

    @media (max-width: 1100px) {
        grid-template-columns:repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 760px) {
        grid-template-columns:repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 480px) {
        grid-template-columns:1fr;
    }

`

export const HomeShell = styled.div`
    width:100%;
    background:transparent;
`

export const HomeContainer = styled.div`
    min-height:720px;
    width:min(1240px, calc(100% - 40px));
    margin:0 auto;
    padding:24px 0 46px;
`
export const HeroBlock = styled.section`
    display:grid;
    grid-template-columns:1.1fr .9fr;
    gap:28px;
    min-height:520px;
    background:linear-gradient(120deg, rgba(255,255,255,.88), rgba(231,215,190,.68));
    border:1px solid rgba(198,169,105,.24);
    border-radius:28px;
    box-shadow:0 26px 46px rgba(26,26,26,.1);
    overflow:hidden;
    padding:34px;

    @media (max-width: 980px) {
        grid-template-columns:1fr;
    }
`;

export const HeroContent = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:center;

    span {
        color:#A67C52;
        font-weight:600;
        letter-spacing:.08em;
        text-transform:uppercase;
        font-size:12px;
    }

    h1 {
        margin:14px 0 0;
        color:#1A1A1A;
        font-size:60px;
        line-height:.95;
        font-weight:700;
    }

    p {
        margin:16px 0 26px;
        color:#555;
        max-width:560px;
        font-size:16px;
        line-height:1.8;
    }

    @media (max-width: 980px) {
        h1 {
            font-size:44px;
        }
    }
`;

export const HeroImage = styled.div`
    border-radius:22px;
    overflow:hidden;
    min-height:320px;
    border:1px solid rgba(198,169,105,.28);
    box-shadow:0 18px 30px rgba(26,26,26,.12);

    img {
        width:100%;
        height:100%;
        object-fit:cover;
        transform:scale(1);
        transition:transform .45s ease;
    }

    &:hover img {
        transform:scale(1.04);
    }
`;

export const SectionHeader = styled.div`
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap:16px;
    margin-top:42px;

    h2 {
        margin:0;
        color:#1A1A1A;
        font-size:42px;
        font-weight:700;
        letter-spacing:0.02em;
    }

    p {
        margin:10px 0 0;
        color:#555555;
        font-size:15px;
    }
`

export const CategoryBar = styled.div`
    display:flex;
    gap:12px;
    overflow-x:auto;
    padding:22px 0 6px;

    .ant-btn {
        height:40px;
        border-radius:999px;
        border-color:rgba(198, 169, 105, 0.3);
        font-weight:600;
        color:#555555;
        background:rgba(255,255,255,0.72);
        flex:0 0 auto;
    }

    .ant-btn:hover {
        color:#1A1A1A !important;
        border-color:#C6A969 !important;
        background:#FFFFFF !important;
    }
`
