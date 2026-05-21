import React from "react";
import "./StyleGuidePage.css";

const StyleGuidePage = () => {
  return (
    <div className="styleguide-view">
      <main className="container page">
        <div className="breadcrumb"><span>petshop</span><span>›</span><strong>Style Guide</strong></div>
        <h1 className="page-title">Style Guide</h1>
        <p className="sub">Token giao diện để chuyển sang React component nhất quán.</p>
        <div className="grid">
          <div className="card"><h2>Colors</h2><p className="sub">#f6efe4 · #fffdf9 · #151515 · #af7c47 · #dfd0bd</p></div>
          <div className="card"><h2>Radius</h2><p className="sub">Button 12-14px · Card 16-24px · Pill 999px</p></div>
          <div className="card"><h2>Typography</h2><p className="sub">Playfair Display cho heading · Inter cho UI text</p></div>
          <div className="card"><h2>Grid</h2><p className="sub">Container 1180px · Product grid 4/3/2/1 cột</p></div>
          <div className="card"><h2>Icons</h2><p className="sub">Special lineal / outline · không dùng emoji</p></div>
          <div className="card"><h2>Interaction</h2><p className="sub">Hover translateY, toast, modal confirm, focus ring</p></div>
        </div>
      </main>
    </div>
  );
};

export default StyleGuidePage;
