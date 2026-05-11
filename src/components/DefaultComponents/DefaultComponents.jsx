import React from "react";
import HeaderComponent from "../HeaderComponents/HeaderComponent";

const DefaultComponents=({children})=>{
    return (
        <div style={{ minHeight: "100vh", background: "transparent" }}>
            <HeaderComponent/>
            <main style={{ animation: "fadeIn .45s ease" }}>{children}</main>
        </div>
    )
}
export default DefaultComponents;
