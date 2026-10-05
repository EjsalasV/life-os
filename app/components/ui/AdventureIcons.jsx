"use client";

import React from "react";

const paths = {
  energy: "M9 1h2v4h3v2l-4 8H8l2-5H7V7h2V1z",
  coin: "M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2zm2 3v6h2V5H7z",
  star: "M7 1h2v3h3v2h2v2h-2v2h2v2h-3v3H9v-2H7v2H4v-3H1v-2h2V8H1V6h2V4h3V1h1z",
  heart: "M2 3h4v2H2zM10 3h4v2h-4zM1 5h14v3H1zM2 8h12v2H2zM4 10h8v2H4zM6 12h4v2H6zM7 14h2v1H7z",
  home: "M7 1h2v2h2v2h2v2h1v8H2V7h1V5h2V3h2V1zm-1 8v5h4V9H6z",
  calendar: "M3 2h10v2h1v10H2V4h1V2zm2 4v2h2V6H5zm4 0v2h2V6H9zm-4 4v2h2v-2H5zm4 0v2h2v-2H9z",
  focus: "M7 1h2v3h-2V1zm0 11h2v3h-2v-3zM1 7h3v2H1V7zm11 0h3v2h-3V7zm-6-2h4v1H6V5zm-1 2h6v2H5V7zm1 3h4v1H6v-1z",
  progress: "M2 13h12v2H2v-2zm9-9h3v8h-3V4zM7 7h3v5H7V7zM3 9h3v3H3V9z",
  profile: "M5 2h6v2h2v5h-1v5H4V9H3V4h2V2zm2 4v2h2V6H7zm-1 4v1h4v-1H6z",
  finance: "M9 3h6v2h2v8h-2v2H7v-2H5V7h2V5h2V3zm0 5v3h3V8H9z",
  business: "M11 2h2v3h2v2h-2v3h-2V7H9V5h2V2zM5 11h4v2H5v2H3v-4h2z",
  health: "M5 5h3v2h2V5h3v3h2v3h-2v2h-2v2H7v-2H5v-2H3V8h2V5z",
  income: "M5 6h8v7H5zM7 4h4v2H7zM14 3h5v5h-2V6h-3V3zM16 5h2v2h-2z",
  expense: "M5 6h8v7H5zM7 4h4v2H7zM14 3h5v5h-2V6h-3V3zM16 5h2v2h-2z",
  sale: "M4 4h12v3H4zM6 7h8v8H6zM8 9h4v2H8z",
  food: "M5 3h2v6H5zM9 3h2v6H9zM13 3h2v12h-2zM4 9h4v2H4z",
  plus: "M7 2h2v5h5v2H9v5H7V9H2V7h5V2z",
  target: "M6 2h4v2H6v2H4v4H2V6h2V4h2V2zm4 4h4v2h2v4h-2v2h-4v-2h-2V8h2v4h4V8h-4V6zm4 8h2v2h-2v2h-4v-2h4v-2z",
  search: "M6 2h4v1h2v2h1v4h-2V6H9v-2H6v1H4v2H3v3h2v2h3v-1h3v2H8v1H5v-1H3v-2H1V7h1V4h2V2h2zm7 9h2v2h2v2h2v2h-3v-2h-2v-2h-1v-2z",
  habit: "M3 2h10v2h1v10H2V4h1V2zm2 3v2h2V5H5zm4 0v2h2V5H9zM5 9v2h2V9H5zm4 0v2h2V9H9z",
  check: "M2 8h3v3h2v2h2v-2h2V9h2V7h2v4h-2v2h-2v2H8v-2H6v-2H4V10H2z",
  trash: "M4 4h2V2h6v2h2v2h2v2h-2v7h-2v2H6v-2H4V8H2V6h2V4zm4 0h2V3H8v1zm-2 4v7h1V8H6zm3 0v7h1V8H9z",
  water: "M8 1h2v2h2v3h2v4h-1v3h-2v2H6v-2H4v-3H3V6h2V3h3V1zm1 4H7v2H5v3h2v2h3v-2h2V7H9V5z",
  activity: "M1 9h3V7h2v4h2V5h2v6h2V8h2v3h3v2h-5V9h-2v4H7v-5H6v5H4v-2H1V9z",
  sleep: "M4 3h6v2H7v2h3v2H4V7h3V5H4V3zm7 6h5v2h-2v2h2v2h-5v-2h2v-2h-2V9z",
};

export function AdventureIcon({ type, size = 24, className = "", color = "currentColor" }) {
  const path = paths[type] || paths.star;
  const custom = ["finance", "business", "health", "income", "expense", "sale", "food", "water"].includes(type);
  return (
    <svg aria-hidden="true" className={`adventure-pixel-icon ${className}`} width={size} height={size} viewBox={custom ? "0 0 24 24" : "0 0 16 16"} fill={color} shapeRendering="crispEdges">
      {custom ? renderRecognizableIcon(type, color) : <path d={path} />}
    </svg>
  );
}

function renderRecognizableIcon(type, color) {
  const ink = "#161B2A";
  if (type === "finance") {
    return <g>
      <path fill="#43A047" d="M7 5h10v2h3v11h-2v2H6v-2H4V9h3V5z" />
      <rect fill="#66BB6A" x="6" y="8" width="13" height="10" />
      <rect fill="#2E7D32" x="8" y="3" width="8" height="2" />
      <path fill={ink} d="M11 8h2v1h2v2h-2v1h2v2h-2v2h-2v-1H9v-2h2v1h2v-1h-2v-1H9v-2h2V8z" />
    </g>;
  }
  if (type === "business") {
    return <g>
      <rect fill="#E65100" x="3" y="7" width="18" height="4" />
      <rect fill="#FF9800" x="4" y="11" width="16" height="10" />
      <rect fill="#FFF3E0" x="6" y="13" width="4" height="4" />
      <rect fill="#8D3A00" x="14" y="13" width="4" height="8" />
      <rect fill="#FFB74D" x="5" y="5" width="14" height="2" />
      <path fill="#E65100" d="M3 5h18v2H3zM5 3h14v2H5z" />
    </g>;
  }
  if (type === "health") {
    return <path fill={color} d="M5 5h5v2h4V5h5v3h2v6h-2v3h-3v3h-3v2h-2v-2H8v-3H5v-3H3V8h2V5z" />;
  }
  if (type === "income" || type === "expense") {
    return <g>
      <rect fill={ink} x="3" y="7" width="13" height="11" />
      <rect fill={type === "income" ? "#FFD54F" : "#B0BEC5"} x="5" y="9" width="9" height="7" />
      <rect fill={type === "income" ? "#FFB300" : "#78909C"} x="7" y="7" width="5" height="2" />
      <rect fill={ink} x="15" y="3" width="7" height="7" />
      <rect fill={type === "income" ? "#4CD964" : "#FF3B30"} x="16" y="4" width="5" height="5" />
      {type === "income" ? <path fill="#fff" d="M18 5h1v1h1v1h-1v1h-1V7h-1V6h1V5z" /> : <rect fill="#fff" x="17" y="6" width="3" height="1" />}
    </g>;
  }
  if (type === "sale") {
    return <g>
      <path fill={color} d="M4 4h11l6 6-10 10-7-7V4z" />
      <path fill="#FFA726" d="M6 6h8l4 4-7 7-5-5V6z" />
      <rect fill={ink} x="8" y="7" width="3" height="3" />
      <rect fill="#FFF3E0" x="9" y="8" width="1" height="1" />
    </g>;
  }
  if (type === "water") {
    return <path fill={color} d="M10 2h3v3h2v4h2v5h-2v4h-3v2H8v-2H5v-4H3V9h2V5h2V2h3v3h0V2z" />;
  }
  return <g>
    <path fill={color} d="M8 6h3V4h5v2h2v2h2v7h-2v3h-3v2h-6v-2H6v-3H4V9h2V7h2V6z" />
    <rect fill="#E53935" x="6" y="9" width="12" height="8" />
    <rect fill="#FFCDD2" x="8" y="11" width="2" height="2" />
    <path fill="#4CAF50" d="M12 5h5v2h-5zM14 3h3v2h-3z" />
  </g>;
}

export function AdventureFlag({ size = 34 }) {
  return (
    <svg aria-hidden="true" className="adventure-pixel-icon" width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges">
      <rect fill="#8D6E63" height="17" width="2" x="6" y="3" />
      <polygon fill="#FFA726" points="8,4 19,7 8,11" />
      <polygon fill="#FFCC80" points="8,5 16,7 8,9" />
      <rect fill="#78909C" height="3" width="6" x="4" y="19" />
      <rect fill="#546E7A" height="2" width="8" x="3" y="21" />
    </svg>
  );
}
