import React from "react";
import PetshopButton from "../form/PetshopButton";
import PetshopIcon from "../icons/PetshopIcon";

const ServiceCard = ({ title, description, price, duration, species, onView, image }) => (
  <article className="petshop-ui-surface" style={{ borderRadius: 16, overflow: "hidden" }}>
    {image ? <img src={image} alt={title} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} /> : null}
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ padding: 20, display: "grid", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 25, fontFamily: '"Playfair Display", serif', fontWeight: 500 }}>{title}</h3>
      <p style={{ margin: 0, color: "var(--petshop-color-muted)" }}>{description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{price}</strong>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--petshop-color-muted)" }}><PetshopIcon name="clock" size={16} />{duration}</span>
      </div>
      {species ? <span style={{ color: "var(--petshop-color-muted)", fontSize: 13 }}>Đối tượng: {species}</span> : null}
      <PetshopButton onClick={onView}>Xem chi tiết</PetshopButton>
      </div>
    </div>
  </article>
);

export default ServiceCard;
