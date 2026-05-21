"use client";

import { useEffect, useMemo, useState } from "react";
import "./Cat.css";

const animations = {
  idle: { row: 0, frames: 8, speed: "1s" },
  walk: { row: 1, frames: 8, speed: "0.7s" },
  sit: { row: 2, frames: 4, speed: "1s" },
  sleep: { row: 3, frames: 4, speed: "1.4s" },
  look: { row: 4, frames: 6, speed: "0.9s" },
  run: { row: 1, frames: 8, speed: "0.45s" }
};

const nextActions = {
  idle: ["walk", "sit", "look"],
  walk: ["idle", "sit", "walk", "look"],
  sit: ["idle", "sleep", "look"],
  sleep: ["idle", "look"],
  look: ["idle", "walk"],
  run: ["idle", "walk"]
};

export default function Cat({
  triggerAction,
  triggerKey,
  embedded = true,
  roam = 70,
  step = 36,
  scale = 3
}) {
  const [animation, setAnimation] = useState("idle");
  const [x, setX] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimation((prev) => {
        const possible = nextActions[prev] || ["idle"];
        const randomAction = possible[Math.floor(Math.random() * possible.length)];

        if (randomAction === "walk") {
          const newDirection = Math.random() > 0.5 ? 1 : -1;
          setDirection(newDirection);
          setX((currentX) => {
            const nextX = currentX + newDirection * step;
            if (nextX < -roam) return -roam;
            if (nextX > roam) return roam;
            return nextX;
          });
        }

        return randomAction;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [roam, step]);

  useEffect(() => {
    if (!triggerAction) return;

    setAnimation(triggerAction);

    if (triggerAction === "walk" || triggerAction === "run") {
      const newDirection = Math.random() > 0.5 ? 1 : -1;
      setDirection(newDirection);
      setX((currentX) => {
        const nextX = currentX + newDirection * step;
        if (nextX < -roam) return -roam;
        if (nextX > roam) return roam;
        return nextX;
      });
    }
  }, [triggerAction, triggerKey, roam, step]);

  const current = useMemo(() => animations[animation] || animations.idle, [animation]);

  return (
    <div
      className={embedded ? "cat-container cat-container-embedded" : "cat-container"}
      style={{ transform: `translateX(${x}px) scaleX(${direction})` }}
    >
      <div
        className="cat-sprite"
        style={{
          "--row": current.row,
          "--frames": current.frames,
          "--speed": current.speed,
          "--cat-scale": scale
        }}
      />
    </div>
  );
}
