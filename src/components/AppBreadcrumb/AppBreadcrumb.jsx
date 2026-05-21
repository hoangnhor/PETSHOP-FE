import React from "react";
import { Breadcrumb } from "antd";
import { useNavigate } from "react-router-dom";
import { BreadcrumbShell, CrumbCurrent, CrumbLink, CrumbText } from "./style";

const AppBreadcrumb = ({ items = [] }) => {
  const navigate = useNavigate();

  const mappedItems = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (isLast) {
      return { title: <CrumbCurrent>{item?.label}</CrumbCurrent> };
    }
    if (!item?.to) {
      return { title: <CrumbText>{item?.label}</CrumbText> };
    }
    return {
      title: <CrumbLink onClick={() => navigate(item.to)}>{item?.label}</CrumbLink>,
    };
  });

  return (
    <BreadcrumbShell>
      <Breadcrumb separator=">" items={mappedItems} />
    </BreadcrumbShell>
  );
};

export default AppBreadcrumb;
