import styled from "styled-components";

export const BreadcrumbShell = styled.div`
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #dfd0bd;
  background: #fffdf9;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  width: max-content;

  .ant-breadcrumb {
    font-size: 13px;
    line-height: 1.3;
    font-weight: 800;
  }

  .ant-breadcrumb-link {
    color: #6d5840;
    font-weight: 800;
    transition: color 0.2s ease;
  }

  .ant-breadcrumb-link:hover {
    color: #1a1a1a;
  }

  .ant-breadcrumb-separator {
    color: #b7a489;
    margin-inline: 8px;
  }
`;

export const CrumbLink = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

export const CrumbCurrent = styled.span`
  color: #6d5840;
  font-weight: 800;
`;

export const CrumbText = styled.span`
  color: #7a6245;
  font-weight: 500;
`;
