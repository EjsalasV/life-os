"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./PetSprite.css";

const SPRITE = {
  frameWidth: 16,
  frameHeight: 16,
};

const CAT_SPRITES = {
  gatoNaranja: "/sprites/cat 1.9.png",
  gatoGris: "/sprites/cat 1.6.png",
  gatoBlanco: "/sprites/cat 1.png",
  conejo: "/sprites/bunny 1 16x16 animation.png",
  default: "/sprites/cat 16x16 with text.png",
};

const defaultAnimations = {
  idle: { row: 0, frames: 4, speed: "1s", loop: true },
  walkRight: { row: 7, frames: 8, speed: "0.8s", loop: true },
  walkLeft: { row: 8, frames: 8, speed: "0.8s", loop: true },
  sleep: { row: 17, frames: 2, speed: "1.4s", loop: true },
  eat: { row: 25, frames: 8, speed: "1s", loop: true },
  meow: { row: 34, frames: 3, speed: "0.7s", loop: false },
  wash: { row: 42, frames: 8, speed: "1.2s", loop: true },
  scratch: { row: 45, frames: 10, speed: "1s", loop: false },
};

const bunnyAnimations = {
  idle: { row: 2, frames: 6, speed: "1s", loop: true },
  walkRight: { row: 8, frames: 6, speed: "0.8s", loop: true },
  walkLeft: { row: 9, frames: 6, speed: "0.8s", loop: true },
  sleep: { row: 1, frames: 6, speed: "1.4s", loop: true },
  eat: { row: 6, frames: 6, speed: "1s", loop: true },
  meow: { row: 3, frames: 6, speed: "0.7s", loop: false },
  wash: { row: 7, frames: 6, speed: "1.2s", loop: true },
  scratch: { row: 4, frames: 6, speed: "1s", loop: false },
};

const behavior = {
  idle: ["idle", "idle", "walkRight", "walkLeft", "sleep", "eat", "meow", "wash"],
  walkRight: ["idle", "idle", "eat", "meow"],
  walkLeft: ["idle", "idle", "sleep", "wash"],
  sleep: ["idle", "meow"],
  eat: ["idle", "wash"],
  meow: ["idle"],
  wash: ["idle", "sleep"],
  scratch: ["idle"],
};

const triggerToAction = {
  run: "walkRight",
  walk: "walkRight",
  idle: "idle",
  sleep: "sleep",
};

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function durationForAction(action) {
  if (action === "idle") return randomBetween(2500, 6000);
  if (action === "walkRight" || action === "walkLeft") return randomBetween(900, 1800);
  if (action === "sleep") return randomBetween(5000, 12000);
  if (action === "eat") return randomBetween(3000, 7000);
  if (action === "wash") return randomBetween(3000, 8000);
  if (action === "meow" || action === "scratch") return randomBetween(1000, 2000);
  return 2000;
}

export default function PetSprite({
  type = "gatoNaranja",
  triggerAction,
  triggerKey,
  embedded = true,
  roam = 70,
  step = 36,
  scale = 3,
}) {
  const [action, setAction] = useState("idle");
  const [x, setX] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const nextAction = (currentAction) => {
      const possibleActions = behavior[currentAction] || ["idle"];
      const newAction = randomFrom(possibleActions);
      setAction(newAction);

      if (newAction === "walkRight") {
        setX((currentX) => {
          const maxBound = embedded ? roam : Math.max(40, (window?.innerWidth || 1024) - 120);
          return Math.min(currentX + step, maxBound);
        });
      }

      if (newAction === "walkLeft") {
        setX((currentX) => {
          const minBound = embedded ? -roam : 20;
          return Math.max(currentX - step, minBound);
        });
      }

      timeoutRef.current = setTimeout(() => {
        nextAction(newAction);
      }, durationForAction(newAction));
    };

    timeoutRef.current = setTimeout(() => {
      nextAction("idle");
    }, 2000);

    return () => clearTimer();
  }, [embedded, roam, step]);

  useEffect(() => {
    if (!triggerAction) return;

    const mapped = triggerToAction[triggerAction] || "idle";
    setAction(mapped);

    if (mapped === "walkRight") {
      setX((currentX) => Math.min(currentX + step, roam));
    }
  }, [triggerAction, triggerKey, roam, step]);

  const animationSet = type === "conejo" ? bunnyAnimations : defaultAnimations;
  const current = useMemo(
    () => animationSet[action] || animationSet.idle,
    [action, animationSet]
  );
  const spritePath = CAT_SPRITES[type] || CAT_SPRITES.default;
  const wrapperTransform = embedded
    ? `translateX(calc(-50% + ${x}px))`
    : `translateX(${x}px)`;

  return (
    <div
      className={embedded ? "pet-sprite-wrapper pet-sprite-wrapper-embedded" : "pet-sprite-wrapper"}
      style={{ transform: wrapperTransform }}
    >
      <div
        className="pet-sprite"
        style={{
          "--frame-width": `${SPRITE.frameWidth}px`,
          "--frame-height": `${SPRITE.frameHeight}px`,
          "--row": current.row,
          "--frames": current.frames,
          "--speed": current.speed,
          "--loop": current.loop ? "infinite" : "1",
          "--cat-scale": scale,
          "--cat-sprite-url": `url(\"${spritePath}\")`,
        }}
      />
    </div>
  );
}
