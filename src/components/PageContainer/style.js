import styled from "styled-components";

export const PageShell = styled.div`
  width: 100%;
  background: transparent;
`;

export const PageInner = styled.div`
  width: min(1320px, calc(100% - 40px));
  margin: 0 auto;
  min-height: 420px;
  padding: 30px 0 40px;

  @media (max-width: 768px) {
    width: min(1240px, calc(100% - 24px));
    min-height: 320px;
    padding: 20px 0 26px;
  }
`;

export const PageHeader = styled.div`
  margin-bottom: 18px;

  h1 {
    margin: 0;
    color: #1A1A1A;
    font-size: clamp(38px, 5vw, 52px);
    line-height: 1.05;
  }

  p {
    margin: 8px 0 0;
    color: #555;
    font-size: 16px;
  }
`;

export const SurfaceCard = styled.div`
  border: 1px solid rgba(198, 169, 105, 0.24);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 36px rgba(26, 26, 26, 0.1);
  padding: 22px;

  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 16px;
  }
`;
