"use client";

import "./CatSprite.css";

export default function CatSprite({
  animation = "walk",
  scale = 3,
  row = null,
  className = ""
}) {
  const classes = `cat-sprite cat-${animation} ${className}`.trim();
  const frameStyle = {
    "--cat-scale": scale,
    ...(row !== null ? { "--cat-row": `${-32 * row}px` } : {})
  };

  return (
    <div
      className="cat-sprite-wrapper"
      style={{ width: `${32 * scale}px`, height: `${32 * scale}px` }}
    >
      <div className={classes} style={frameStyle} />
    </div>
  );
}
