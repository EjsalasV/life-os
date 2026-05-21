"use client";

import "./CatSprite.css";

export default function CatSprite({
  animation = "walk",
  scale = 3,
  row = null,
  className = ""
}) {
  const classes = `cat-sprite cat-${animation} ${className}`.trim();
  const style = {
    "--cat-scale": scale,
    ...(row !== null ? { "--cat-row": `${-32 * row}px` } : {})
  };

  return <div className={classes} style={style} />;
}
