import React from "react";
import { PageHeader, PageInner, PageShell } from "./style";

const PageContainer = ({ title, subtitle, children }) => {
  return (
    <PageShell>
      <PageInner>
        {(title || subtitle) && (
          <PageHeader>
            {title ? <h1>{title}</h1> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </PageHeader>
        )}
        {children}
      </PageInner>
    </PageShell>
  );
};

export default PageContainer;

