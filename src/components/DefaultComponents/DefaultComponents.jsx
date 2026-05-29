import React from "react";
import HeaderComponent from "../HeaderComponents/HeaderComponent";
import FooterComponent from "../FooterComponent/FooterComponent";

const DefaultComponents = ({ children }) => {
    return (
        <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
            <HeaderComponent />
            <main style={{ animation: "fadeIn .45s ease", flex: 1, paddingTop: "var(--site-header-offset, 128px)" }}>{children}</main>
            <FooterComponent />
        </div>
    );
};

export default DefaultComponents;
