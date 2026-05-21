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

    @media (max-width: 420px) {
        grid-template-columns:1fr;
    }

`

export const HomeShell = styled.div`
    width:100%;
    background:transparent;
`

export const HomeContainer = styled.div`
    min-height:720px;
    width:min(1320px, calc(100% - 40px));
    margin:0 auto;
    padding:28px 0 56px;
`
export const HeroFullBleed = styled.div`
    width:100vw;
    margin-left:calc(50% - 50vw);
`;
export const HeroBlock = styled.section`
    position:relative;
    display:block;
    height:clamp(300px, 38vw, 500px);
    background:transparent;
    border:0;
    border-radius:0;
    box-shadow:none;
    overflow:hidden;
    padding:0;

    @media (max-width: 768px) {
        height:clamp(260px, 78vw, 380px);
    }
`;

export const HeroImage = styled.div`
    overflow:hidden;
    height:100%;
    background:#f7f2e8;
    position:relative;

    .slick-slider,
    .slick-list,
    .slick-track,
    .slick-slide,
    .slick-slide > div {
        height:100%;
    }

    &::after {
        content:"";
        position:absolute;
        inset:0;
        background:
          linear-gradient(90deg, rgba(10,10,10,.7) 0%, rgba(17,17,17,.28) 48%, rgba(17,17,17,.1) 100%),
          radial-gradient(circle at 78% 50%, rgba(198,169,105,.22), transparent 38%);
        pointer-events:none;
    }
`;

export const HeroContent = styled.div`
    position:absolute;
    top:0;
    left:0;
    z-index:2;
    height:100%;
    width:min(620px, 92%);
    display:flex;
    flex-direction:column;
    justify-content:center;
    gap:12px;
    padding:28px 28px 28px 72px;

    p {
      margin:0;
      color:#E7D7BE;
      letter-spacing:.06em;
      font-size:13px;
      text-transform:uppercase;
      font-weight:700;
    }

    h1 {
      margin:0;
      color:#fff;
      line-height:1.1;
      font-size:clamp(30px, 5vw, 58px);
      max-width:580px;
      text-shadow:0 6px 24px rgba(0,0,0,.25);
    }

    @media (max-width: 900px) {
      padding:22px 20px 22px 54px;
    }

    @media (max-width: 640px) {
      padding:18px 14px 18px 42px;
    }
`;

export const SectionHeader = styled.div`
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap:16px;
    margin-top:54px;

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
`;

export const CategoryFilterBar = styled(CategoryBar)`
    padding-top:16px;
`;

export const CategoryGrid = styled.div`
    display:grid;
    grid-template-columns:repeat(3, minmax(0,1fr));
    gap:20px;
    margin-bottom:32px;

    @media (max-width: 900px) {
      grid-template-columns:1fr 1fr;
    }

    @media (max-width: 640px) {
      grid-template-columns:1fr;
    }
`;

export const CategoryCard = styled.button`
    border:1px solid rgba(198,169,105,.26);
    border-radius:22px;
    background:rgba(255,255,255,.9);
    box-shadow:0 12px 24px rgba(26,26,26,.08);
    padding:14px;
    cursor:pointer;
    display:grid;
    grid-template-columns:72px 1fr;
    gap:12px;
    align-items:center;
    text-align:left;
    transition:all .26s ease;

    &:hover {
      transform:translateY(-2px);
      border-color:#C6A969;
    }

    h3 {
      margin:0;
      font-size:26px;
      color:#1A1A1A;
      line-height:1.2;
    }

    p {
      margin:4px 0 0;
      color:#555;
      font-size:13px;
      line-height:1.4;
    }
`;

export const CategoryThumb = styled.div`
    width:72px;
    height:72px;
    border-radius:14px;
    display:grid;
    place-items:center;
    font-size:24px;
    font-weight:700;
    color:#8b6b3f;
    background:linear-gradient(145deg, #f8f3e8, #efe3cc);
    border:1px solid rgba(198,169,105,.24);
`;

export const ReviewsGrid = styled.div`
    margin-top:22px;
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:16px;

    @media (max-width: 900px) {
      grid-template-columns:1fr;
    }
`;

export const ReviewCard = styled.div`
    border:1px solid rgba(198,169,105,.24);
    border-radius:18px;
    background:rgba(255,255,255,.88);
    box-shadow:0 10px 24px rgba(26,26,26,.06);
    padding:20px;

    strong {
      color:#1A1A1A;
      font-size:20px;
      font-family:"Cormorant Garamond", serif;
    }

    p {
      margin:8px 0;
      color:#555;
      line-height:1.7;
    }

    span {
      color:#A67C52;
      font-weight:700;
      font-size:14px;
    }
`;
