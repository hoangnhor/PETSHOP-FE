import React from "react";

const StatsCard = ({ label, value }) => (
  <div className="ui-stat-card">
    <p style={{ margin: 0, color: "#777", fontSize: 12 }}>{label}</p>
    <strong style={{ fontSize: 26, color: "#1A1A1A" }}>{value}</strong>
  </div>
);

export default StatsCard;
